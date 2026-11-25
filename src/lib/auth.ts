import type { ConfirmationResult, RecaptchaVerifier, Unsubscribe, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import {
  applyAuthPersistence,
  AUTH_PROVIDER_IDS,
  auth,
  createGoogleAuthProvider,
  createPhoneAuthProvider,
  firebaseApp,
  getFirebaseAuth,
  getSessionRememberPreference,
  isFirebaseConfigured,
  REGISTERED_AUTH_PROVIDERS,
  setSessionRememberPreference,
} from "./firebase";
import {
  ACCOUNT_AUTH_STATES,
  canTransitionAuthState,
  isAppAccessAllowedForState,
  maskEmail,
  maskPhone,
  resolveAccountAuthState,
  type AccountAuthState,
} from "./auth-state";
import {
  confirmPhoneOtp,
  createPhoneRecaptcha,
  isUserEligibleForApp,
  refreshVerificationStatus as refreshFirebaseVerificationStatus,
  registerWithEmail,
  resendVerificationEmail,
  resolveUserSignInProvider,
  resolveVerificationTarget,
  sendPasswordReset,
  sendPhoneOtp,
  signInAsAnonymousGuest,
  signInWithEmail,
  signInWithGoogle,
  signOutFirebase,
  subscribeToAuthState,
  userRequiresEmailVerification,
  waitForAuthReady,
  type EmailRegisterResult,
  type EmailSignInResult,
  type RecaptchaLifecycleCallbacks,
} from "./firebase-auth";
import type { Lang } from "./i18n-dict";

export {
  ACCOUNT_AUTH_STATES,
  AUTH_PROVIDER_IDS,
  REGISTERED_AUTH_PROVIDERS,
  canTransitionAuthState,
  createGoogleAuthProvider,
  createPhoneAuthProvider,
  createPhoneRecaptcha,
  getSessionRememberPreference,
  isAppAccessAllowedForState,
  isFirebaseConfigured,
  maskEmail,
  maskPhone,
  resolveAccountAuthState,
  sendPasswordReset,
  setSessionRememberPreference,
};

export type { AccountAuthState };

export interface AuthServiceStatus {
  configured: boolean;
  authenticated: boolean;
  eligible: boolean;
  requiresVerification: boolean;
  isAnonymous: boolean;
  channel: "email" | "phone";
  target: string;
  providers: string[];
  activeSignInProvider: string | null;
  accountState: AccountAuthState;
  user: User | null;
}

export interface AuthSnapshotOptions {
  isInitialized?: boolean;
  loading?: boolean;
  authenticating?: boolean;
  signInProvider?: string | null;
  profileInitialized?: boolean | null;
  profileOnboarded?: boolean | null;
  verificationPendingChannel?: "email" | "phone" | null;
  sessionExpired?: boolean;
  accountDisabled?: boolean;
  accountRestricted?: boolean;
  authError?: string | null;
  verificationError?: string | null;
}

/**
 * Initializes (or returns the singleton) Firebase Auth instance configured with
 * firebase-applet-config.json and confirms Email/Password, Google, and Phone providers.
 */
export function initializeFirebaseAuth() {
  const instance = getFirebaseAuth();
  return {
    app: firebaseApp,
    auth: instance,
    config: firebaseConfig,
    providers: REGISTERED_AUTH_PROVIDERS,
    providerIds: AUTH_PROVIDER_IDS,
  };
}

export function getAuthStatusSnapshot(
  user: User | null = auth.currentUser,
  options: AuthSnapshotOptions = {},
): AuthServiceStatus {
  const providers = user?.providerData?.map((p) => p.providerId).filter(Boolean) ?? [];
  const activeSignInProvider =
    options.signInProvider ?? (user?.isAnonymous ? "anonymous" : (providers[0] ?? null));
  const requiresVerification = userRequiresEmailVerification(user, options.signInProvider);
  const eligible = isUserEligibleForApp(user, options.signInProvider);
  const { channel, target } = resolveVerificationTarget({ user });
  const accountState = resolveAccountAuthState({
    isInitialized: options.isInitialized ?? true,
    loading: options.loading ?? false,
    authenticating: options.authenticating ?? false,
    hasUser: Boolean(user),
    isAnonymous: Boolean(user?.isAnonymous),
    providers,
    signInProvider: options.signInProvider ?? null,
    emailVerified: Boolean(user?.emailVerified),
    profileInitialized: options.profileInitialized ?? null,
    profileOnboarded: options.profileOnboarded ?? null,
    verificationPendingChannel:
      options.verificationPendingChannel ?? (requiresVerification ? "email" : null),
    sessionExpired: options.sessionExpired ?? false,
    accountDisabled: options.accountDisabled ?? false,
    accountRestricted: options.accountRestricted ?? false,
    authError: options.authError ?? null,
    verificationError: options.verificationError ?? null,
  });

  return {
    configured: isFirebaseConfigured,
    authenticated: Boolean(user),
    eligible,
    requiresVerification,
    isAnonymous: Boolean(user?.isAnonymous),
    channel,
    target,
    providers,
    activeSignInProvider,
    accountState,
    user,
  };
}

export async function checkAuthStatus(lang: Lang = "en"): Promise<AuthServiceStatus> {
  const user = await waitForAuthReady(lang);
  const signInProvider = await resolveUserSignInProvider(user);
  return getAuthStatusSnapshot(user, { isInitialized: true, signInProvider });
}

export async function loginWithEmail(params: {
  email: string;
  password: string;
  rememberMe?: boolean;
  lang?: Lang;
}): Promise<EmailSignInResult> {
  const rememberMe = params.rememberMe ?? getSessionRememberPreference();
  return await signInWithEmail({
    email: params.email,
    password: params.password,
    rememberMe,
    lang: params.lang ?? "en",
  });
}

export async function registerWithEmailAccount(params: {
  fullName: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<EmailRegisterResult> {
  const rememberMe = params.rememberMe ?? getSessionRememberPreference();
  return await registerWithEmail({
    fullName: params.fullName,
    email: params.email,
    password: params.password,
    rememberMe,
  });
}

export async function loginWithGoogle(
  lang: Lang = "en",
  rememberMe: boolean = getSessionRememberPreference(),
): Promise<{ user: User | null; redirected: boolean }> {
  return await signInWithGoogle(lang, rememberMe);
}

export async function startPhoneLogin(
  e164Phone: string,
  verifier: RecaptchaVerifier,
  rememberMe: boolean = getSessionRememberPreference(),
): Promise<ConfirmationResult> {
  await applyAuthPersistence(rememberMe);
  return await sendPhoneOtp(e164Phone, verifier);
}

export async function confirmPhoneLogin(
  confirmation: ConfirmationResult,
  code: string,
  lang: Lang = "en",
  rememberMe: boolean = getSessionRememberPreference(),
): Promise<User> {
  await applyAuthPersistence(rememberMe);
  return await confirmPhoneOtp(confirmation, code, lang);
}

export async function loginAsGuest(lang: Lang = "en", rememberMe = true): Promise<User> {
  await applyAuthPersistence(rememberMe);
  return await signInAsAnonymousGuest(lang);
}

export async function refreshVerificationStatus(lang: Lang = "en"): Promise<{
  verified: boolean;
  user: User | null;
}> {
  return await refreshFirebaseVerificationStatus(lang);
}

export async function resendVerification(targetUser?: User | null): Promise<void> {
  await resendVerificationEmail(targetUser);
}

export async function logout(): Promise<void> {
  await signOutFirebase();
}

export function subscribeAuthStatus(callback: (status: AuthServiceStatus) => void): Unsubscribe {
  return subscribeToAuthState((user) => {
    callback(getAuthStatusSnapshot(user));
  });
}

export async function setRememberMePreference(remember: boolean): Promise<void> {
  await applyAuthPersistence(remember);
}

export {
  AuthProvider,
  AuthContext,
  useAuth,
  useOptionalAuth,
  ProtectedRoute,
  type AuthContextValue,
  type AuthProviderProps,
  type ProtectedRouteProps,
} from "./auth.tsx";

export type { ConfirmationResult, RecaptchaLifecycleCallbacks, RecaptchaVerifier, User };
