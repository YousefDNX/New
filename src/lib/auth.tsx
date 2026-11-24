import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { ConfirmationResult, RecaptchaVerifier, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import {
  applyAuthPersistence,
  auth,
  db,
  firebaseApp,
  getSessionRememberPreference,
  isFirebaseConfigured,
  setSessionRememberPreference,
} from "./firebase";
import { resolveUserSignInProvider, userRequiresEmailVerification } from "./firebase-auth";
import {
  getAuthStatusSnapshot,
  loginAsGuest,
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmailAccount,
  sendPasswordReset,
  setRememberMePreference,
  type AccountAuthState,
  type AuthServiceStatus,
} from "./auth";
import { extractFirebaseAuthCode, sanitizeRedirectPath } from "./auth-validation";
import type { Lang } from "./i18n-dict";

export type { AccountAuthState, AuthServiceStatus, ConfirmationResult, RecaptchaVerifier, User };

export interface AuthContextValue {
  user: User | null;
  status: AuthServiceStatus;
  accountState: AccountAuthState;
  loading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  requiresVerification: boolean;
  error: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<User>;
  signUpWithEmail: (params: {
    fullName: string;
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<{
    user: User | null;
    needsVerification: boolean;
    verificationSent: boolean;
    verificationError?: string;
  }>;
  signInWithGoogle: (rememberMe?: boolean) => Promise<{ user: User | null; redirected: boolean }>;
  signInAsGuest: () => Promise<User>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setRememberMe: (remember: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  lang?: Lang;
}

export function AuthProvider({ children, lang = "en" }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [signInProvider, setSignInProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accountDisabled, setAccountDisabled] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const clearError = useCallback(() => {
    setError(null);
    setAccountDisabled(false);
    setSessionExpired(false);
  }, []);

  const captureAuthErrorState = useCallback((err: unknown) => {
    const code = extractFirebaseAuthCode(err);
    if (code === "auth/user-disabled") {
      setAccountDisabled(true);
    }
    if (code === "auth/user-token-expired" || code === "auth/id-token-expired") {
      setSessionExpired(true);
    }
    const msg = err instanceof Error ? err.message : String(err);
    setError(msg);
  }, []);

  useEffect(() => {
    let active = true;

    const applyNextUser = async (nextUser: User | null) => {
      let resolvedProvider: string | null = null;
      try {
        resolvedProvider = await resolveUserSignInProvider(nextUser);
      } catch {
        resolvedProvider = nextUser?.providerData?.[0]?.providerId ?? null;
      }
      if (!active) return;
      setUser(nextUser);
      setSignInProvider(resolvedProvider);
      if (nextUser) {
        setSessionExpired(false);
        setAccountDisabled(false);
      }
      setLoading(false);
      setIsInitialized(true);
    };

    const remember = getSessionRememberPreference();
    void applyAuthPersistence(remember).catch((err) => {
      console.warn("Session persistence initialization:", err);
    });

    const subscribeFn =
      typeof auth.onIdTokenChanged === "function"
        ? auth.onIdTokenChanged.bind(auth)
        : auth.onAuthStateChanged.bind(auth);

    const unsubscribe = subscribeFn((nextUser) => {
      void applyNextUser(nextUser);
    });

    const readyPromise =
      typeof auth.authStateReady === "function" ? auth.authStateReady() : Promise.resolve();
    const timeoutId =
      typeof window !== "undefined"
        ? window.setTimeout(() => {
            if (!active) return;
            void applyNextUser(auth.currentUser);
          }, 1800)
        : undefined;

    void readyPromise
      .then(() => {
        if (!active) return;
        if (typeof window !== "undefined" && timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
        void applyNextUser(auth.currentUser);
      })
      .catch((err) => {
        console.warn("Auth initialization fallback:", err);
      });

    return () => {
      active = false;
      if (typeof window !== "undefined" && timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, []);

  const status = useMemo(
    () =>
      getAuthStatusSnapshot(user, {
        isInitialized,
        loading,
        authenticating,
        signInProvider,
        sessionExpired,
        accountDisabled,
        authError: error,
      }),
    [
      user,
      isInitialized,
      loading,
      authenticating,
      signInProvider,
      sessionExpired,
      accountDisabled,
      error,
    ],
  );

  const handleSignInWithEmail = useCallback(
    async (email: string, pass: string, rememberMe?: boolean): Promise<User> => {
      clearError();
      setAuthenticating(true);
      setLoading(true);
      try {
        const effectiveRemember = rememberMe ?? getSessionRememberPreference();
        const result = await loginWithEmail({
          email,
          password: pass,
          rememberMe: effectiveRemember,
          lang,
        });
        if (result.user) {
          const providerClaim = await resolveUserSignInProvider(result.user);
          setUser(result.user);
          setSignInProvider(providerClaim);
          return result.user;
        }
        throw new Error("Failed to sign in with email");
      } catch (err) {
        captureAuthErrorState(err);
        throw err;
      } finally {
        setAuthenticating(false);
        setLoading(false);
      }
    },
    [captureAuthErrorState, clearError, lang],
  );

  const handleSignUpWithEmail = useCallback(
    async (params: { fullName: string; email: string; password: string; rememberMe?: boolean }) => {
      clearError();
      setAuthenticating(true);
      setLoading(true);
      try {
        const effectiveRemember = params.rememberMe ?? getSessionRememberPreference();
        const result = await registerWithEmailAccount({
          fullName: params.fullName,
          email: params.email,
          password: params.password,
          rememberMe: effectiveRemember,
        });
        if (result.user) {
          const providerClaim = await resolveUserSignInProvider(result.user);
          setUser(result.user);
          setSignInProvider(providerClaim);
          const needsVerification = userRequiresEmailVerification(result.user, providerClaim);
          return {
            user: result.user,
            needsVerification,
            verificationSent: result.verificationSent,
            ...(result.verificationError !== undefined
              ? { verificationError: result.verificationError }
              : {}),
          };
        }
        throw new Error(result.verificationError ?? "Failed to create account");
      } catch (err) {
        captureAuthErrorState(err);
        throw err;
      } finally {
        setAuthenticating(false);
        setLoading(false);
      }
    },
    [captureAuthErrorState, clearError],
  );

  const handleSignInWithGoogle = useCallback(
    async (rememberMe?: boolean) => {
      clearError();
      setAuthenticating(true);
      setLoading(true);
      try {
        const result = await loginWithGoogle(lang, rememberMe ?? getSessionRememberPreference());
        if (result.user) {
          const providerClaim = await resolveUserSignInProvider(result.user);
          setUser(result.user);
          setSignInProvider(providerClaim);
        }
        return result;
      } catch (err) {
        captureAuthErrorState(err);
        throw err;
      } finally {
        setAuthenticating(false);
        setLoading(false);
      }
    },
    [captureAuthErrorState, clearError, lang],
  );

  const handleSignInAsGuest = useCallback(async (): Promise<User> => {
    clearError();
    setAuthenticating(true);
    setLoading(true);
    try {
      const guest = await loginAsGuest(lang);
      setUser(guest);
      setSignInProvider("anonymous");
      return guest;
    } catch (err) {
      captureAuthErrorState(err);
      throw err;
    } finally {
      setAuthenticating(false);
      setLoading(false);
    }
  }, [captureAuthErrorState, clearError, lang]);

  const handleSignOut = useCallback(async (): Promise<void> => {
    clearError();
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setSignInProvider(null);
    } catch (err) {
      captureAuthErrorState(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [captureAuthErrorState, clearError]);

  const handleSendPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      clearError();
      try {
        await sendPasswordReset(email);
      } catch (err) {
        captureAuthErrorState(err);
        throw err;
      }
    },
    [captureAuthErrorState, clearError],
  );

  const handleRefreshUser = useCallback(async (): Promise<void> => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      const providerClaim = await resolveUserSignInProvider(updated);
      setUser(updated);
      setSignInProvider(providerClaim);
    } catch (err) {
      const code = extractFirebaseAuthCode(err);
      if (code === "auth/user-token-expired" || code === "auth/id-token-expired") {
        setSessionExpired(true);
      }
      console.warn("Failed to reload user state:", err);
    }
  }, []);

  const handleSetRememberMe = useCallback(async (remember: boolean): Promise<void> => {
    await setRememberMePreference(remember);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      accountState: status.accountState,
      loading,
      isInitialized,
      isAuthenticated: Boolean(user),
      isAnonymous: Boolean(user?.isAnonymous),
      requiresVerification: status.requiresVerification,
      error,
      clearError,
      signInWithEmail: handleSignInWithEmail,
      signUpWithEmail: handleSignUpWithEmail,
      signInWithGoogle: handleSignInWithGoogle,
      signInAsGuest: handleSignInAsGuest,
      signOut: handleSignOut,
      sendPasswordReset: handleSendPasswordReset,
      refreshUser: handleRefreshUser,
      setRememberMe: handleSetRememberMe,
    }),
    [
      user,
      status,
      loading,
      isInitialized,
      error,
      clearError,
      handleSignInWithEmail,
      handleSignUpWithEmail,
      handleSignInWithGoogle,
      handleSignInAsGuest,
      handleSignOut,
      handleSendPasswordReset,
      handleRefreshUser,
      handleSetRememberMe,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

/**
 * ProtectedRoute Gate
 * Prevents UI flashing during session restoration and redirects unauthenticated users.
 */
export interface ProtectedRouteProps {
  children?: ReactNode;
  fallback?: ReactNode;
  redirectUrl?: string;
}

export function ProtectedRoute({ children, fallback, redirectUrl = "/auth" }: ProtectedRouteProps) {
  const { user, loading, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !loading && !user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/app";
      const target = sanitizeRedirectPath(currentPath);
      void navigate({
        to: redirectUrl,
        search: target && target !== "/app" ? { redirect: target } : {},
        replace: true,
      });
    }
  }, [user, loading, isInitialized, navigate, redirectUrl]);

  if (!isInitialized || loading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center"
        aria-busy="true"
        aria-label="Restoring session"
      >
        <div className="relative flex size-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Loading workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
