import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getRedirectResult,
  linkWithCredential,
  linkWithPhoneNumber,
  linkWithPopup,
  onIdTokenChanged,
  PhoneAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
  updatePhoneNumber,
  updateProfile,
  verifyBeforeUpdateEmail,
  verifyPasswordResetCode,
  type ConfirmationResult,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ensureFirebaseUserBootstrap } from "./auth-bootstrap";
import { resolveProviderVerificationEligibility } from "./auth-state";
import { extractFirebaseAuthCode, normalizeEmail, validateFullName } from "./auth-validation";
import {
  applyAuthPersistence,
  AUTH_PROVIDER_IDS,
  auth,
  createGoogleAuthProvider,
  createPhoneAuthProvider,
  db,
  getPopupRedirectResolver,
  REGISTERED_AUTH_PROVIDERS,
  setSessionRememberPreference,
} from "./firebase";
import type { Lang } from "./i18n-dict";

export { AUTH_PROVIDER_IDS, REGISTERED_AUTH_PROVIDERS };

let _redirectHandledPromise: Promise<User | null> | null = null;
let _lastRedirectError: unknown | null = null;
let _googleSignInInFlight: Promise<{ user: User | null; redirected: boolean }> | null = null;

export function isGoogleSignInInFlight(): boolean {
  return _googleSignInInFlight !== null;
}

export function consumeLastRedirectError(): unknown | null {
  const err = _lastRedirectError;
  _lastRedirectError = null;
  return err;
}

function isInsideIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onIdTokenChanged(auth, callback);
}

export function userHasPasswordProvider(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.providerData.some((p) => p.providerId === AUTH_PROVIDER_IDS.EMAIL_PASSWORD);
}

export function userRequiresEmailVerification(
  user: User | null | undefined,
  signInProvider?: string | null,
): boolean {
  if (!user) return false;
  const providers = user.providerData?.map((p) => p.providerId).filter(Boolean) ?? [];
  return resolveProviderVerificationEligibility({
    isAnonymous: user.isAnonymous,
    providers,
    emailVerified: user.emailVerified,
    signInProvider,
  }).requiresEmailVerification;
}

export function isUserEligibleForApp(
  user: User | null | undefined,
  signInProvider?: string | null,
): boolean {
  if (!user) return false;
  const providers = user.providerData?.map((p) => p.providerId).filter(Boolean) ?? [];
  return resolveProviderVerificationEligibility({
    isAnonymous: user.isAnonymous,
    providers,
    emailVerified: user.emailVerified,
    signInProvider,
  }).eligible;
}

export async function resolveUserSignInProvider(
  user: User | null | undefined,
): Promise<string | null> {
  if (!user) return null;
  if (user.isAnonymous) return "anonymous";
  if (typeof user.getIdTokenResult === "function") {
    try {
      const tokenResult = await user.getIdTokenResult(false);
      if (typeof tokenResult?.signInProvider === "string" && tokenResult.signInProvider) {
        return tokenResult.signInProvider;
      }
    } catch {
      // Ignore transient token lookup failures and fall back to providerData
    }
  }
  return user.providerData?.[0]?.providerId ?? null;
}

export interface VerificationTargetInfo {
  channel: "email" | "phone";
  target: string;
}

export function resolveVerificationTarget(input: {
  user?: User | null | undefined;
  email?: string | null | undefined;
  phoneNumber?: string | null | undefined;
}): VerificationTargetInfo {
  const explicitPhone = input.phoneNumber?.trim();
  const explicitEmail = input.email?.trim();
  const userPhone = input.user?.phoneNumber?.trim();
  const userEmail = input.user?.email?.trim();

  if (explicitPhone) {
    return { channel: "phone", target: explicitPhone };
  }
  if (explicitEmail) {
    return { channel: "email", target: explicitEmail };
  }
  if (userPhone && (!userEmail || userRequiresEmailVerification(input.user) === false)) {
    return { channel: "phone", target: userPhone };
  }
  if (userEmail) {
    return { channel: "email", target: userEmail };
  }
  if (userPhone) {
    return { channel: "phone", target: userPhone };
  }
  return { channel: "email", target: "" };
}

export interface VerificationChecklistState {
  isAnonymous: boolean;
  hasEmail: boolean;
  emailVerified: boolean;
  hasPhone: boolean;
  hasGoogle: boolean;
  hasPassword: boolean;
  isMinorProtected: boolean;
  completedCount: number;
  totalChecks: number;
}

export function computeVerificationChecklist(input: {
  isAnonymous?: boolean | undefined;
  email?: string | null | undefined;
  emailVerified?: boolean | undefined;
  phoneNumber?: string | null | undefined;
  profilePhone?: string | null | undefined;
  providers?: string[] | undefined;
  ageBand?: string | null | undefined;
}): VerificationChecklistState {
  const providers = input.providers ?? [];
  const isAnonymous = Boolean(input.isAnonymous);
  const hasEmail = Boolean(input.email && input.email.trim().length > 0);
  const emailVerified = Boolean(hasEmail && input.emailVerified);
  const hasPhone = Boolean(
    (input.phoneNumber && input.phoneNumber.trim().length > 0) ||
    (input.profilePhone && input.profilePhone.trim().length > 0) ||
    providers.includes("phone"),
  );
  const hasGoogle = providers.includes("google.com");
  const hasPassword = providers.includes("password");
  const isMinorProtected =
    input.ageBand === "13-17" || input.ageBand === "13-15" || input.ageBand === "16-17";

  const completedCount =
    Number(emailVerified) + Number(hasPhone) + Number(hasGoogle) + Number(hasPassword);

  return {
    isAnonymous,
    hasEmail,
    emailVerified,
    hasPhone,
    hasGoogle,
    hasPassword,
    isMinorProtected,
    completedCount,
    totalChecks: 4,
  };
}

async function sendVerificationWithFallback(user: User): Promise<void> {
  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/callback`,
    });
  } catch (err) {
    const code = extractFirebaseAuthCode(err);
    if (
      code === "auth/unauthorized-continue-uri" ||
      code === "auth/invalid-continue-uri" ||
      code === "auth/missing-continue-uri"
    ) {
      await sendEmailVerification(user);
      return;
    }
    throw err;
  }
}

/**
 * Awaits Firebase Auth initial hydration AND resolves any pending OAuth redirect
 * result once per page load before route guards run.
 */
export async function waitForAuthReady(lang: Lang = "en"): Promise<User | null> {
  if (typeof window === "undefined") return null;

  await auth.authStateReady();

  if (!_redirectHandledPromise) {
    _redirectHandledPromise = (async () => {
      try {
        const resolver = getPopupRedirectResolver();
        const result = resolver
          ? await getRedirectResult(auth, resolver)
          : await getRedirectResult(auth);
        if (result?.user) {
          await result.user.getIdToken(true);
          await ensureFirebaseUserBootstrap(result.user, lang);
          return result.user;
        }
      } catch (err) {
        const code = extractFirebaseAuthCode(err);
        if (
          code !== "auth/operation-not-supported-in-this-environment" &&
          code !== "auth/no-current-user"
        ) {
          _lastRedirectError = err;
          console.warn("[FirebaseAuth] getRedirectResult error:", err);
        }
      }
      return auth.currentUser;
    })();
  }

  await _redirectHandledPromise;

  if (_googleSignInInFlight) {
    await _googleSignInInFlight.catch(() => undefined);
  }

  return auth.currentUser;
}

export interface EmailRegisterResult {
  user: User;
  verificationSent: boolean;
  verificationError?: string;
}

export async function registerWithEmail(params: {
  fullName: string;
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<EmailRegisterResult> {
  const cleanEmail = normalizeEmail(params.email);
  const { cleaned: cleanedName } = validateFullName(params.fullName);

  await applyAuthPersistence(params.rememberMe);

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
  await updateProfile(cred.user, { displayName: cleanedName });

  try {
    await sendVerificationWithFallback(cred.user);
    return {
      user: cred.user,
      verificationSent: true,
    };
  } catch (err) {
    return {
      user: cred.user,
      verificationSent: false,
      verificationError: err instanceof Error ? err.message : String(err),
    };
  }
}

export interface EmailSignInResult {
  user: User;
  needsEmailVerification: boolean;
}

export async function signInWithEmail(params: {
  email: string;
  password: string;
  rememberMe: boolean;
  lang: Lang;
}): Promise<EmailSignInResult> {
  const cleanEmail = normalizeEmail(params.email);
  await applyAuthPersistence(params.rememberMe);

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, params.password);
  await cred.user.reload();
  const refreshed = auth.currentUser ?? cred.user;

  if (userRequiresEmailVerification(refreshed, "password")) {
    return { user: refreshed, needsEmailVerification: true };
  }

  await refreshed.getIdToken(true);
  await ensureFirebaseUserBootstrap(refreshed, params.lang);
  return { user: refreshed, needsEmailVerification: false };
}

export async function resendVerificationEmail(targetUser?: User | null): Promise<void> {
  const user = targetUser ?? auth.currentUser;
  if (!user) {
    throw new Error("No signed-in user to verify.");
  }
  await sendVerificationWithFallback(user);
}

export async function refreshEmailVerificationStatus(lang: Lang): Promise<{
  verified: boolean;
  user: User | null;
}> {
  const user = auth.currentUser;
  if (!user) return { verified: false, user: null };

  await user.reload();
  const updated = auth.currentUser;
  if (!updated) return { verified: false, user: null };

  if (isUserEligibleForApp(updated)) {
    await updated.getIdToken(true);
    await ensureFirebaseUserBootstrap(updated, lang);
    return { verified: true, user: updated };
  }
  return { verified: false, user: updated };
}

export async function refreshVerificationStatus(lang: Lang): Promise<{
  verified: boolean;
  user: User | null;
}> {
  return await refreshEmailVerificationStatus(lang);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = normalizeEmail(email);
  try {
    await sendPasswordResetEmail(auth, cleanEmail, {
      url: `${window.location.origin}/auth`,
    });
  } catch (err) {
    const code = extractFirebaseAuthCode(err);
    if (
      code === "auth/unauthorized-continue-uri" ||
      code === "auth/invalid-continue-uri" ||
      code === "auth/missing-continue-uri"
    ) {
      await sendPasswordResetEmail(auth, cleanEmail);
      return;
    }
    throw err;
  }
}

export async function completeEmailVerificationCode(oobCode: string, lang: Lang): Promise<void> {
  await applyActionCode(auth, oobCode);
  if (auth.currentUser) {
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    if (isUserEligibleForApp(auth.currentUser)) {
      await ensureFirebaseUserBootstrap(auth.currentUser, lang);
    }
  }
}

export async function verifyResetActionCode(oobCode: string): Promise<string> {
  return await verifyPasswordResetCode(auth, oobCode);
}

export async function confirmResetActionCode(oobCode: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

export async function updateSignedInPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to update your password.");
  await updatePassword(user, newPassword);
}

export async function linkEmailPasswordToCurrentUser(params: {
  email: string;
  password: string;
  lang: Lang;
}): Promise<{ user: User; verificationSent: boolean }> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to link an email.");
  const cleanEmail = normalizeEmail(params.email);
  const credential = EmailAuthProvider.credential(cleanEmail, params.password);
  const result = await linkWithCredential(user, credential);
  await result.user.reload();
  await result.user.getIdToken(true);
  await ensureFirebaseUserBootstrap(result.user, params.lang);

  let verificationSent = false;
  try {
    await sendVerificationWithFallback(result.user);
    verificationSent = true;
  } catch {
    verificationSent = false;
  }
  return { user: result.user, verificationSent };
}

export async function linkPasswordToCurrentUser(params: {
  password: string;
  lang: Lang;
}): Promise<User> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("A verified email address is required before adding a password.");
  }
  const credential = EmailAuthProvider.credential(user.email, params.password);
  const result = await linkWithCredential(user, credential);
  await result.user.reload();
  await result.user.getIdToken(true);
  await ensureFirebaseUserBootstrap(result.user, params.lang);
  return result.user;
}

export async function requestEmailChangeVerification(newEmail: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to update your email.");
  const cleanEmail = normalizeEmail(newEmail);
  try {
    await verifyBeforeUpdateEmail(user, cleanEmail, {
      url: `${window.location.origin}/auth/callback`,
    });
  } catch (err) {
    const code = extractFirebaseAuthCode(err);
    if (
      code === "auth/unauthorized-continue-uri" ||
      code === "auth/invalid-continue-uri" ||
      code === "auth/missing-continue-uri"
    ) {
      await verifyBeforeUpdateEmail(user, cleanEmail);
      return;
    }
    throw err;
  }
}

export async function linkGoogleToCurrentUser(lang: Lang): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to link Google.");
  const provider = createGoogleAuthProvider();
  const resolver = getPopupRedirectResolver();

  const result = resolver
    ? await linkWithPopup(user, provider, resolver)
    : await linkWithPopup(user, provider);
  await result.user.reload();
  await result.user.getIdToken(true);
  await ensureFirebaseUserBootstrap(result.user, lang);
  return result.user;
}

export async function reauthenticateWithPassword(currentPassword: string): Promise<User> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("Password re-authentication requires an account email.");
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  const res = await reauthenticateWithCredential(user, credential);
  await res.user.getIdToken(true);
  return res.user;
}

export async function reauthenticateWithGoogle(): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");
  const provider = createGoogleAuthProvider();
  const resolver = getPopupRedirectResolver();
  const res = resolver
    ? await reauthenticateWithPopup(user, provider, resolver)
    : await reauthenticateWithPopup(user, provider);
  await res.user.getIdToken(true);
  return res.user;
}

export async function signInWithGoogle(
  lang: Lang,
  rememberMe = true,
): Promise<{ user: User | null; redirected: boolean }> {
  if (_googleSignInInFlight) {
    return _googleSignInInFlight;
  }

  // Synchronously record preference & build provider BEFORE calling signInWithPopup
  // so no async IndexedDB/storage await consumes Chrome/Safari user-gesture activation.
  setSessionRememberPreference(rememberMe);
  try {
    auth.languageCode = lang;
  } catch {
    // Ignore non-writable auth mock properties
  }

  const provider = createGoogleAuthProvider();
  const resolver = getPopupRedirectResolver();

  const run = (async (): Promise<{ user: User | null; redirected: boolean }> => {
    try {
      const cred = resolver
        ? await signInWithPopup(auth, provider, resolver)
        : await signInWithPopup(auth, provider);
      await applyAuthPersistence(rememberMe).catch(() => undefined);
      await cred.user.getIdToken(true).catch(() => undefined);
      try {
        await ensureFirebaseUserBootstrap(cred.user, lang);
      } catch (bootstrapErr) {
        const errCode = extractFirebaseAuthCode(bootstrapErr);
        const errMsg =
          bootstrapErr instanceof Error
            ? bootstrapErr.message.toLowerCase()
            : String(bootstrapErr).toLowerCase();
        if (
          errCode.includes("permission-denied") ||
          errMsg.includes("permission-denied") ||
          errMsg.includes("missing or insufficient permissions")
        ) {
          throw bootstrapErr;
        }
        console.warn(
          "[FirebaseAuth] Deferred post-Google bootstrap after transient error:",
          bootstrapErr,
        );
      }
      return { user: cred.user, redirected: false };
    } catch (err) {
      const code = extractFirebaseAuthCode(err);
      if (
        (code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment") &&
        !isInsideIframe()
      ) {
        await applyAuthPersistence(rememberMe).catch(() => undefined);
        if (resolver) {
          await signInWithRedirect(auth, provider, resolver);
        } else {
          await signInWithRedirect(auth, provider);
        }
        return { user: null, redirected: true };
      }
      throw err;
    } finally {
      _googleSignInInFlight = null;
    }
  })();

  _googleSignInInFlight = run;
  return run;
}

export interface RecaptchaLifecycleCallbacks {
  onSolved?: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
}

export function createPhoneRecaptcha(
  container: string | HTMLElement,
  callbacks: RecaptchaLifecycleCallbacks = {},
): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, container, {
    size: "normal",
    callback: (token: string) => {
      callbacks.onSolved?.(token);
    },
    "expired-callback": () => {
      callbacks.onExpired?.();
    },
    "error-callback": () => {
      callbacks.onError?.();
    },
  });
}

export async function sendPhoneOtp(
  e164Phone: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, e164Phone, verifier);
}

export async function linkPhoneOtp(
  e164Phone: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to link a phone number.");
  return await linkWithPhoneNumber(user, e164Phone, verifier);
}

export async function sendPhoneVerificationViaProvider(
  e164Phone: string,
  verifier: RecaptchaVerifier,
): Promise<string> {
  const provider = createPhoneAuthProvider(auth);
  return await provider.verifyPhoneNumber(e164Phone, verifier);
}

export async function confirmPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
  lang: Lang,
): Promise<User> {
  const cred = await confirmation.confirm(code.trim());
  await ensureFirebaseUserBootstrap(cred.user, lang);
  return cred.user;
}

export async function confirmLinkedPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
  lang: Lang,
): Promise<User> {
  const cred = await confirmation.confirm(code.trim());
  await cred.user.reload();
  await cred.user.getIdToken(true);
  await ensureFirebaseUserBootstrap(cred.user, lang);
  return cred.user;
}

export async function confirmUpdatedPhoneCode(
  verificationId: string,
  code: string,
  lang: Lang,
): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to update your phone number.");
  const credential = PhoneAuthProvider.credential(verificationId, code.trim());
  await updatePhoneNumber(user, credential);
  await user.reload();
  await user.getIdToken(true);
  await ensureFirebaseUserBootstrap(user, lang);
  return auth.currentUser ?? user;
}

export async function signInAsAnonymousGuest(lang: Lang): Promise<User> {
  await applyAuthPersistence(true);
  const cred = await signInAnonymously(auth);
  await ensureFirebaseUserBootstrap(cred.user, lang);
  return cred.user;
}

export async function upgradeAnonymousWithEmail(params: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ user: User; verificationSent: boolean; verificationError?: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error("No active guest session found.");

  const cleanEmail = normalizeEmail(params.email);
  const { cleaned: cleanedName } = validateFullName(params.fullName);
  const credential = EmailAuthProvider.credential(cleanEmail, params.password);

  const result = await linkWithCredential(user, credential);
  await updateProfile(result.user, { displayName: cleanedName });
  await result.user.getIdToken(true);

  let verificationSent = false;
  let verificationError: string | undefined;
  try {
    await sendVerificationWithFallback(result.user);
    verificationSent = true;
  } catch (err) {
    verificationError = err instanceof Error ? err.message : String(err);
  }

  return verificationError !== undefined
    ? { user: result.user, verificationSent, verificationError }
    : { user: result.user, verificationSent };
}

export async function upgradeAnonymousWithGoogle(lang: Lang): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error("No active guest session found.");

  const provider = createGoogleAuthProvider();
  const resolver = getPopupRedirectResolver();

  const result = resolver
    ? await linkWithPopup(user, provider, resolver)
    : await linkWithPopup(user, provider);
  await result.user.reload();
  await result.user.getIdToken(true);
  await ensureFirebaseUserBootstrap(result.user, lang);
  return result.user;
}

export async function upgradeAnonymousWithPhone(
  confirmation: ConfirmationResult,
  code: string,
  lang: Lang,
): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error("No active guest session found.");

  const credential = PhoneAuthProvider.credential(confirmation.verificationId, code.trim());
  const result = await linkWithCredential(user, credential);
  await result.user.reload();
  await result.user.getIdToken(true);
  await ensureFirebaseUserBootstrap(result.user, lang);
  return result.user;
}

export async function deleteCurrentUserAndData(uid: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) {
    throw new Error("No matching signed-in account found.");
  }

  // Delete all single-owner collections first while auth token is still valid
  const ownedCollections = [
    "tasks",
    "goals",
    "time_blocks",
    "activity_events",
    "study_items",
    "quiz_attempts",
    "focus_sessions",
    "care_entries",
    "journals",
    "journal_entries",
    "future_plans",
    "opportunities",
    "ai_conversations",
  ] as const;

  for (const colName of ownedCollections) {
    try {
      const snap = await getDocs(query(collection(db, colName), where("user_id", "==", uid)));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch (err) {
      if (colName !== "journal_entries" && colName !== "time_blocks") {
        throw err;
      }
    }
  }

  // Delete Knowledge Circle community posts authored by this guest & private saved posts
  try {
    const myPostsSnap = await getDocs(
      query(collection(db, "community_posts"), where("author_id", "==", uid)),
    );
    await Promise.all(myPostsSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    // Ignore if collection is empty or unavailable
  }

  try {
    const savedSnap = await getDocs(collection(db, "users", uid, "saved_posts"));
    await Promise.all(savedSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    // Ignore if empty
  }

  // Leave or clean up legacy circle memberships/teams if present
  try {
    const circleSnap = await getDocs(
      query(collection(db, "circles"), where("member_uids", "array-contains", uid)),
    );
    const nowIso = new Date().toISOString();
    for (const cDoc of circleSnap.docs) {
      const data = cDoc.data() as { owner_id?: string; invite_code?: string };
      if (data.owner_id === uid) {
        const [postsSnap, membersSnap] = await Promise.all([
          getDocs(collection(db, "circles", cDoc.id, "posts")),
          getDocs(collection(db, "circles", cDoc.id, "members")),
        ]);
        await Promise.all(postsSnap.docs.map((p) => deleteDoc(p.ref)));
        await Promise.all(membersSnap.docs.map((m) => deleteDoc(m.ref)));
        if (data.invite_code) {
          await deleteDoc(doc(db, "circle_invites", data.invite_code)).catch(() => undefined);
        }
        await deleteDoc(cDoc.ref);
      } else {
        await deleteDoc(doc(db, "circles", cDoc.id, "members", uid)).catch(() => undefined);
        await updateDoc(cDoc.ref, {
          member_uids: arrayRemove(uid),
          updated_at: nowIso,
        }).catch(() => undefined);
      }
    }
  } catch {
    // Ignore legacy circle cleanup failures
  }

  // Delete 1:1 user docs (ignore missing docs)
  await Promise.all([
    deleteDoc(doc(db, "user_settings", uid)).catch(() => undefined),
    deleteDoc(doc(db, "user_stats", uid)).catch(() => undefined),
    deleteDoc(doc(db, "profiles", uid)).catch(() => undefined),
  ]);

  await deleteUser(user);
}

export async function resetGuestSession(uid?: string): Promise<void> {
  const activeUser = auth.currentUser;
  const targetUid = uid ?? activeUser?.uid;

  if (targetUid && activeUser && activeUser.uid === targetUid) {
    try {
      await deleteCurrentUserAndData(targetUid);
    } catch {
      await signOut(auth).catch(() => undefined);
    }
  } else {
    await signOut(auth).catch(() => undefined);
  }

  if (typeof window !== "undefined") {
    try {
      if (targetUid) {
        localStorage.removeItem(`nexora.prefs.${targetUid}`);
        localStorage.removeItem(`btc_continue_${targetUid}`);
        localStorage.removeItem(`btc_skills_progress_${targetUid}`);
        localStorage.removeItem(`btc_english_progress_${targetUid}`);
        localStorage.removeItem(`btc_study_progress_${targetUid}`);
      }
      localStorage.removeItem("nexora.prefs");
      localStorage.removeItem("btc-visual-theme");
      localStorage.removeItem("btc-nav-layout");
    } catch {
      // Ignore storage cleanup errors
    }
  }
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}
