import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { User } from "firebase/auth";
import { describe, expect, it } from "vitest";
import firebaseConfig from "../../firebase-applet-config.json";
import { deriveDisplayName, resolveProviderId } from "@/lib/auth-bootstrap";
import {
  COUNTRY_CODES,
  evaluatePasswordStrength,
  mapAuthError,
  normalizeEmail,
  sanitizeRedirectPath,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "@/lib/auth-validation";
import {
  AUTH_PROVIDER_IDS as AUTH_SERVICE_PROVIDER_IDS,
  checkAuthStatus,
  confirmPhoneLogin,
  getAuthStatusSnapshot,
  initializeFirebaseAuth,
  loginAsGuest,
  loginWithEmail,
  loginWithGoogle,
  logout,
  refreshVerificationStatus,
  REGISTERED_AUTH_PROVIDERS as AUTH_SERVICE_PROVIDERS,
  registerWithEmailAccount,
  resendVerification,
  setRememberMePreference,
  startPhoneLogin,
} from "@/lib/auth";
import {
  AUTH_PROVIDER_IDS,
  createGoogleAuthProvider,
  createPhoneAuthProvider,
  firebaseProjectMeta,
  isFirebaseConfigured,
  REGISTERED_AUTH_PROVIDERS,
} from "@/lib/firebase";
import {
  computeVerificationChecklist,
  isUserEligibleForApp,
  resolveVerificationTarget,
  userRequiresEmailVerification,
} from "@/lib/firebase-auth";

function makeMockFirebaseUser(overrides: Partial<User>): User {
  return {
    uid: "uid_test_123",
    email: null,
    emailVerified: false,
    displayName: null,
    photoURL: null,
    phoneNumber: null,
    isAnonymous: false,
    providerData: [],
    ...overrides,
  } as unknown as User;
}

describe("Firebase Project & SDK Configuration", () => {
  it("loads provisioned Firebase config targeting the named Firestore database", () => {
    expect(isFirebaseConfigured).toBe(true);
    expect(firebaseProjectMeta.projectId).toBe(firebaseConfig.projectId);
    expect(firebaseProjectMeta.authDomain).toBe(firebaseConfig.authDomain);
    expect(firebaseProjectMeta.firestoreDatabaseId).toBe(firebaseConfig.firestoreDatabaseId);
    expect(typeof firebaseConfig.oAuthClientId).toBe("string");
  });

  it("registers Email/Password, Google, and Phone authentication providers cleanly", () => {
    expect(AUTH_PROVIDER_IDS).toEqual({
      EMAIL_PASSWORD: "password",
      GOOGLE: "google.com",
      PHONE: "phone",
    });
    expect(REGISTERED_AUTH_PROVIDERS.emailPassword.id).toBe("password");
    expect(REGISTERED_AUTH_PROVIDERS.google.id).toBe("google.com");
    expect(REGISTERED_AUTH_PROVIDERS.phone.id).toBe("phone");
    expect(typeof REGISTERED_AUTH_PROVIDERS.google.create).toBe("function");
    expect(typeof REGISTERED_AUTH_PROVIDERS.phone.create).toBe("function");

    const googleProvider = createGoogleAuthProvider();
    expect(googleProvider.providerId).toBe("google.com");
    expect(createPhoneAuthProvider).toBe(REGISTERED_AUTH_PROVIDERS.phone.create);
  });

  it("initializes Firebase Auth via src/lib/auth.ts using firebase-applet-config.json and exposes standard auth methods", () => {
    const initialized = initializeFirebaseAuth();
    expect(initialized.config.projectId).toBe(firebaseConfig.projectId);
    expect(initialized.config.authDomain).toBe(firebaseConfig.authDomain);
    expect(initialized.config.firestoreDatabaseId).toBe(firebaseConfig.firestoreDatabaseId);
    expect(initialized.auth).toBeTruthy();
    expect(initialized.providers).toBe(AUTH_SERVICE_PROVIDERS);
    expect(initialized.providerIds).toBe(AUTH_SERVICE_PROVIDER_IDS);

    expect(typeof loginWithEmail).toBe("function");
    expect(typeof registerWithEmailAccount).toBe("function");
    expect(typeof loginWithGoogle).toBe("function");
    expect(typeof startPhoneLogin).toBe("function");
    expect(typeof confirmPhoneLogin).toBe("function");
    expect(typeof loginAsGuest).toBe("function");
    expect(typeof checkAuthStatus).toBe("function");
    expect(typeof refreshVerificationStatus).toBe("function");
    expect(typeof resendVerification).toBe("function");
    expect(typeof logout).toBe("function");
    expect(typeof setRememberMePreference).toBe("function");

    const unverifiedEmailUser = makeMockFirebaseUser({
      email: "verifyme@nexora.school",
      emailVerified: false,
      providerData: [{ providerId: "password" } as User["providerData"][number]],
    });
    expect(
      getAuthStatusSnapshot(unverifiedEmailUser, { signInProvider: "password" }),
    ).toMatchObject({
      configured: true,
      authenticated: true,
      eligible: false,
      requiresVerification: true,
      isAnonymous: false,
      channel: "email",
      target: "verifyme@nexora.school",
      providers: ["password"],
      activeSignInProvider: "password",
      accountState: "EMAIL_VERIFICATION_PENDING",
    });

    const verifiedGoogleUser = makeMockFirebaseUser({
      email: "student@gmail.com",
      emailVerified: true,
      providerData: [{ providerId: "google.com" } as User["providerData"][number]],
    });
    expect(
      getAuthStatusSnapshot(verifiedGoogleUser, { signInProvider: "google.com" }),
    ).toMatchObject({
      authenticated: true,
      eligible: true,
      requiresVerification: false,
      providers: ["google.com"],
      activeSignInProvider: "google.com",
      accountState: "AUTHENTICATED",
    });

    expect(getAuthStatusSnapshot(null)).toMatchObject({
      authenticated: false,
      eligible: false,
      accountState: "NOT_AUTHENTICATED",
    });
  });

  it("resolves verification pending target for email vs phone users accurately", () => {
    expect(
      resolveVerificationTarget({
        email: "student@nexora.school",
      }),
    ).toEqual({ channel: "email", target: "student@nexora.school" });

    expect(
      resolveVerificationTarget({
        phoneNumber: "+96550001234",
      }),
    ).toEqual({ channel: "phone", target: "+96550001234" });

    const unverifiedEmailUser = makeMockFirebaseUser({
      email: "pending@nexora.school",
      emailVerified: false,
      providerData: [{ providerId: "password" } as User["providerData"][number]],
    });
    expect(resolveVerificationTarget({ user: unverifiedEmailUser })).toEqual({
      channel: "email",
      target: "pending@nexora.school",
    });

    const phoneUser = makeMockFirebaseUser({
      phoneNumber: "+96555551111",
      providerData: [{ providerId: "phone" } as User["providerData"][number]],
    });
    expect(resolveVerificationTarget({ user: phoneUser })).toEqual({
      channel: "phone",
      target: "+96555551111",
    });
  });

  it("includes hardened firestore.rules covering all required collections and owner checks", () => {
    const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");
    expect(rules).toContain("rules_version = '2';");
    expect(rules).toContain("allow read, write: if false;");
    expect(rules).toContain("match /profiles/{userId}");
    expect(rules).toContain("match /user_settings/{userId}");
    expect(rules).toContain("match /user_stats/{userId}");
    expect(rules).toContain("match /tasks/{taskId}");
    expect(rules).toContain("match /goals/{goalId}");
    expect(rules).toContain("match /activity_events/{eventId}");
    expect(rules).toContain("request.auth.token.email_verified == true");
    expect(rules).toContain("request.auth.token.firebase.sign_in_provider == 'google.com'");
    expect(rules).toContain("request.auth.token.firebase.sign_in_provider == 'anonymous'");
    expect(rules).toContain("request.auth.token.firebase.sign_in_provider == 'phone'");
    expect(rules).toContain("'ui_mode'");
    expect(rules).toContain("'theme_preset_id'");
    expect(rules).toContain("'layout_mode'");
  });
});

describe("Auth Validation & Anti-Open-Redirect", () => {
  it("validates and normalizes student emails", () => {
    expect(normalizeEmail("  Student@NEXORA.school ")).toBe("student@nexora.school");
    expect(validateEmail("student@nexora.school")).toBe(true);
    expect(validateEmail("bad-email")).toBe(false);
    expect(validateEmail("missing@domain")).toBe(false);
  });

  it("validates full names and strong password requirements", () => {
    expect(validateFullName("  A ")).toEqual({ valid: false, cleaned: "A" });
    expect(validateFullName("  Sara   Al-Sabah  ")).toEqual({
      valid: true,
      cleaned: "Sara Al-Sabah",
    });

    expect(evaluatePasswordStrength("weak").valid).toBe(false);
    expect(evaluatePasswordStrength("alllowercase123").valid).toBe(false);
    expect(evaluatePasswordStrength("NoNumbersHere").valid).toBe(false);
    expect(evaluatePasswordStrength("StrongPass123").valid).toBe(true);
  });

  it("validates and formats international E.164 phone numbers", () => {
    expect(COUNTRY_CODES.some((c) => c.dial === "+965")).toBe(true);
    expect(validatePhoneNumber("+965", "5000 1234")).toEqual({
      valid: true,
      e164: "+96550001234",
    });
    expect(validatePhoneNumber("+20", "01012345678")).toEqual({
      valid: true,
      e164: "+201012345678",
    });
    expect(validatePhoneNumber("+1", "123")).toEqual({
      valid: false,
      e164: "+1123",
    });
  });

  it("prevents open redirects and auth loops", () => {
    expect(sanitizeRedirectPath("/app/tasks")).toBe("/app/tasks");
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/app");
    expect(sanitizeRedirectPath("//evil.com")).toBe("/app");
    expect(sanitizeRedirectPath("/auth?mode=signin")).toBe("/app");
    expect(sanitizeRedirectPath("/reset-password")).toBe("/app");
  });
});

describe("Firebase Error Mapping (7 languages)", () => {
  it("maps core Firebase error codes clearly without leaking raw internals", () => {
    expect(mapAuthError({ code: "auth/email-already-in-use" }, "en")).toContain("already exists");
    expect(mapAuthError({ code: "auth/invalid-credential" }, "en")).toContain(
      "Incorrect email or password",
    );
    expect(mapAuthError({ code: "auth/operation-not-allowed" }, "en")).toContain(
      "Firebase Console",
    );
    expect(mapAuthError({ code: "auth/admin-restricted-operation" }, "en")).toContain(
      "Firebase Console",
    );
    expect(mapAuthError({ code: "auth/unauthorized-domain" }, "en")).toContain(
      "Authorized domains",
    );
    expect(mapAuthError({ code: "auth/invalid-verification-code" }, "en")).toContain(
      "6-digit SMS verification code",
    );
    expect(mapAuthError({ code: "auth/credential-already-in-use" }, "en")).toContain(
      "already linked",
    );
    expect(mapAuthError({ code: "auth/missing-client-identifier" }, "en")).toContain("reCAPTCHA");
    expect(mapAuthError({ code: "auth/invalid-app-credential" }, "en")).toContain("reCAPTCHA");
    expect(mapAuthError({ code: "auth/internal-error" }, "en")).toContain("Google sign-in");
    expect(mapAuthError({ code: "auth/argument-error" }, "en")).toContain("Google sign-in");
    expect(mapAuthError({ code: "auth/web-storage-unsupported" }, "en")).toContain("storage");
    expect(
      mapAuthError(
        new Error(
          JSON.stringify({
            error: "Missing or insufficient permissions.",
            operationType: "update",
            path: "user_settings/123",
          }),
        ),
        "en",
      ),
    ).not.toContain("operationType");
    expect(mapAuthError({ code: "auth/popup-closed-by-user" }, "ar")).toContain("تم إلغاء");
    expect(mapAuthError({ code: "auth/popup-closed-by-user" }, "ja").length).toBeGreaterThan(4);
    expect(mapAuthError({ code: "auth/popup-closed-by-user" }, "fr").length).toBeGreaterThan(4);
    expect(mapAuthError({ code: "auth/popup-closed-by-user" }, "de").length).toBeGreaterThan(4);
    expect(mapAuthError({ code: "auth/popup-closed-by-user" }, "zh-CN").length).toBeGreaterThan(3);
    expect(mapAuthError({ code: "auth/popup-closed-by-user" }, "ko").length).toBeGreaterThan(3);
  });
});

describe("Verification Gates & Provider Eligibility", () => {
  it("requires email verification ONLY for unverified password accounts", () => {
    const unverifiedPasswordUser = makeMockFirebaseUser({
      email: "unverified@nexora.school",
      emailVerified: false,
      providerData: [{ providerId: "password" } as User["providerData"][number]],
    });
    expect(userRequiresEmailVerification(unverifiedPasswordUser)).toBe(true);
    expect(isUserEligibleForApp(unverifiedPasswordUser)).toBe(false);

    const verifiedPasswordUser = makeMockFirebaseUser({
      email: "verified@nexora.school",
      emailVerified: true,
      providerData: [{ providerId: "password" } as User["providerData"][number]],
    });
    expect(userRequiresEmailVerification(verifiedPasswordUser)).toBe(false);
    expect(isUserEligibleForApp(verifiedPasswordUser)).toBe(true);
  });

  it("allows Google, Phone, and Anonymous guest users into app and derives provider/display names cleanly", () => {
    const googleUser = makeMockFirebaseUser({
      displayName: "Yousef",
      email: "yousef@gmail.com",
      emailVerified: true,
      providerData: [{ providerId: "google.com" } as User["providerData"][number]],
    });
    expect(isUserEligibleForApp(googleUser)).toBe(true);
    expect(resolveProviderId(googleUser)).toBe("google.com");
    expect(deriveDisplayName(googleUser)).toBe("Yousef");

    const phoneUser = makeMockFirebaseUser({
      phoneNumber: "+96550001234",
      providerData: [{ providerId: "phone" } as User["providerData"][number]],
    });
    expect(isUserEligibleForApp(phoneUser)).toBe(true);
    expect(resolveProviderId(phoneUser)).toBe("phone");
    expect(deriveDisplayName(phoneUser)).toBe("+96550001234");

    const guestUser = makeMockFirebaseUser({
      isAnonymous: true,
    });
    expect(isUserEligibleForApp(guestUser)).toBe(true);
    expect(resolveProviderId(guestUser)).toBe("anonymous");
    expect(deriveDisplayName(guestUser)).toBe("Guest Student");
  });

  it("computes the Account Verification Checklist accurately across provider combinations and minor bands", () => {
    const verifiedPasswordAdult = computeVerificationChecklist({
      isAnonymous: false,
      email: "student@nexora.school",
      emailVerified: true,
      providers: ["password"],
      ageBand: "18+",
    });
    expect(verifiedPasswordAdult).toMatchObject({
      isAnonymous: false,
      hasEmail: true,
      emailVerified: true,
      hasPhone: false,
      hasGoogle: false,
      hasPassword: true,
      isMinorProtected: false,
      completedCount: 2,
      totalChecks: 4,
    });

    const unverifiedPasswordMinor = computeVerificationChecklist({
      isAnonymous: false,
      email: "teen@nexora.school",
      emailVerified: false,
      providers: ["password"],
      ageBand: "13-15",
    });
    expect(unverifiedPasswordMinor.hasEmail).toBe(true);
    expect(unverifiedPasswordMinor.emailVerified).toBe(false);
    expect(unverifiedPasswordMinor.isMinorProtected).toBe(true);
    expect(unverifiedPasswordMinor.completedCount).toBe(1);

    const phoneWithUnverifiedRecoveryEmail = computeVerificationChecklist({
      isAnonymous: false,
      email: "recovery@nexora.school",
      emailVerified: false,
      phoneNumber: "+96550001234",
      providers: ["phone"],
      ageBand: "16-17",
    });
    expect(phoneWithUnverifiedRecoveryEmail.hasPhone).toBe(true);
    expect(phoneWithUnverifiedRecoveryEmail.emailVerified).toBe(false);
    expect(phoneWithUnverifiedRecoveryEmail.isMinorProtected).toBe(true);
    expect(phoneWithUnverifiedRecoveryEmail.completedCount).toBe(1);

    const googleAndPhoneLinked = computeVerificationChecklist({
      isAnonymous: false,
      email: "sara@gmail.com",
      emailVerified: true,
      profilePhone: "+96555551111",
      providers: ["google.com"],
      ageBand: "13-17",
    });
    expect(googleAndPhoneLinked).toMatchObject({
      emailVerified: true,
      hasPhone: true,
      hasGoogle: true,
      hasPassword: false,
      isMinorProtected: true,
      completedCount: 3,
      totalChecks: 4,
    });

    const guestUser = computeVerificationChecklist({
      isAnonymous: true,
      providers: [],
    });
    expect(guestUser.isAnonymous).toBe(true);
    expect(guestUser.completedCount).toBe(0);
  });

  it("exports AuthProvider, AuthContext, useAuth, and ProtectedRoute from src/lib/auth.tsx", async () => {
    const authModule = await import("@/lib/auth");
    expect(authModule.AuthProvider).toBeDefined();
    expect(typeof authModule.AuthProvider).toBe("function");
    expect(authModule.AuthContext).toBeDefined();
    expect(authModule.useAuth).toBeDefined();
    expect(typeof authModule.useAuth).toBe("function");
    expect(authModule.ProtectedRoute).toBeDefined();
    expect(typeof authModule.ProtectedRoute).toBe("function");
  });
});
