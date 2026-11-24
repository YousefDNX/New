import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCOUNT_AUTH_STATES,
  canTransitionAuthState,
  isAppAccessAllowedForState,
  maskEmail,
  maskPhone,
  resolveAccountAuthState,
  resolveProviderVerificationEligibility,
} from "../lib/auth-state.ts";

test("ACCOUNT_AUTH_STATES contains all 17 canonical lifecycle states", () => {
  assert.equal(ACCOUNT_AUTH_STATES.length, 17);
  assert.deepEqual(
    [...ACCOUNT_AUTH_STATES],
    [
      "NOT_AUTHENTICATED",
      "SESSION_RESTORING",
      "AUTHENTICATING",
      "EMAIL_VERIFICATION_REQUIRED",
      "EMAIL_VERIFICATION_PENDING",
      "EMAIL_VERIFIED",
      "PHONE_VERIFICATION_REQUIRED",
      "PHONE_VERIFICATION_PENDING",
      "PHONE_VERIFIED",
      "ACCOUNT_INITIALIZATION_PENDING",
      "PROFILE_COMPLETION_REQUIRED",
      "AUTHENTICATED",
      "SESSION_EXPIRED",
      "ACCOUNT_RESTRICTED",
      "ACCOUNT_DISABLED",
      "AUTHENTICATION_ERROR",
      "VERIFICATION_ERROR",
    ],
  );
});

test("canTransitionAuthState enforces valid lifecycle transitions and rejects contradictory jumps", () => {
  assert.equal(canTransitionAuthState("NOT_AUTHENTICATED", "AUTHENTICATING"), true);
  assert.equal(canTransitionAuthState("AUTHENTICATING", "EMAIL_VERIFICATION_PENDING"), true);
  assert.equal(canTransitionAuthState("EMAIL_VERIFICATION_PENDING", "EMAIL_VERIFIED"), true);
  assert.equal(canTransitionAuthState("EMAIL_VERIFIED", "ACCOUNT_INITIALIZATION_PENDING"), true);
  assert.equal(
    canTransitionAuthState("ACCOUNT_INITIALIZATION_PENDING", "PROFILE_COMPLETION_REQUIRED"),
    true,
  );
  assert.equal(canTransitionAuthState("PROFILE_COMPLETION_REQUIRED", "AUTHENTICATED"), true);
  assert.equal(canTransitionAuthState("AUTHENTICATED", "SESSION_EXPIRED"), true);
  assert.equal(canTransitionAuthState("ACCOUNT_DISABLED", "NOT_AUTHENTICATED"), true);

  // Disallowed direct jumps
  assert.equal(canTransitionAuthState("ACCOUNT_DISABLED", "AUTHENTICATED"), false);
  assert.equal(canTransitionAuthState("NOT_AUTHENTICATED", "AUTHENTICATED"), false);
  assert.equal(canTransitionAuthState("SESSION_EXPIRED", "AUTHENTICATED"), false);
});

test("resolveAccountAuthState resolves states in strict precedence order", () => {
  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      accountDisabled: true,
      sessionExpired: true,
    }),
    "ACCOUNT_DISABLED",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      accountRestricted: true,
    }),
    "ACCOUNT_RESTRICTED",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      sessionExpired: true,
    }),
    "SESSION_EXPIRED",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: false,
      hasUser: false,
    }),
    "SESSION_RESTORING",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      authenticating: true,
      hasUser: false,
    }),
    "AUTHENTICATING",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: false,
      authError: "Invalid credentials",
    }),
    "AUTHENTICATION_ERROR",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: false,
    }),
    "NOT_AUTHENTICATED",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      providers: ["password"],
      signInProvider: "password",
      emailVerified: false,
    }),
    "EMAIL_VERIFICATION_REQUIRED",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      providers: ["password"],
      signInProvider: "password",
      emailVerified: false,
      verificationPendingChannel: "email",
    }),
    "EMAIL_VERIFICATION_PENDING",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      providers: ["phone"],
      signInProvider: "phone",
      verificationPendingChannel: "phone",
    }),
    "PHONE_VERIFICATION_PENDING",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      providers: ["google.com"],
      signInProvider: "google.com",
      emailVerified: true,
      profileInitialized: false,
    }),
    "ACCOUNT_INITIALIZATION_PENDING",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      providers: ["google.com"],
      signInProvider: "google.com",
      emailVerified: true,
      profileInitialized: true,
      profileOnboarded: false,
    }),
    "PROFILE_COMPLETION_REQUIRED",
  );

  assert.equal(
    resolveAccountAuthState({
      isInitialized: true,
      hasUser: true,
      providers: ["google.com"],
      signInProvider: "google.com",
      emailVerified: true,
      profileInitialized: true,
      profileOnboarded: true,
    }),
    "AUTHENTICATED",
  );
});

test("resolveProviderVerificationEligibility mirrors Firestore isEligibleUser() rules across providers", () => {
  // Password login with unverified email MUST be blocked even if phone/google are linked
  assert.deepEqual(
    resolveProviderVerificationEligibility({
      isAnonymous: false,
      providers: ["password", "phone"],
      emailVerified: false,
      signInProvider: "password",
    }),
    { eligible: false, requiresEmailVerification: true },
  );

  // Active phone sign-in is eligible even if a recovery email is unverified
  assert.deepEqual(
    resolveProviderVerificationEligibility({
      isAnonymous: false,
      providers: ["password", "phone"],
      emailVerified: false,
      signInProvider: "phone",
    }),
    { eligible: true, requiresEmailVerification: false },
  );

  // Google sign-in is eligible immediately (mirrors firestore.rules sign_in_provider == 'google.com')
  assert.deepEqual(
    resolveProviderVerificationEligibility({
      isAnonymous: false,
      providers: ["google.com"],
      emailVerified: false,
      signInProvider: "google.com",
    }),
    { eligible: true, requiresEmailVerification: false },
  );

  // Anonymous guest session is eligible immediately
  assert.deepEqual(
    resolveProviderVerificationEligibility({
      isAnonymous: true,
      providers: [],
      emailVerified: false,
      signInProvider: "anonymous",
    }),
    { eligible: true, requiresEmailVerification: false },
  );
});

test("isAppAccessAllowedForState gates non-eligible states strictly", () => {
  assert.equal(isAppAccessAllowedForState("AUTHENTICATED"), true);
  assert.equal(isAppAccessAllowedForState("PROFILE_COMPLETION_REQUIRED"), true);
  assert.equal(isAppAccessAllowedForState("NOT_AUTHENTICATED"), false);
  assert.equal(isAppAccessAllowedForState("EMAIL_VERIFICATION_PENDING"), false);
  assert.equal(isAppAccessAllowedForState("SESSION_EXPIRED"), false);
  assert.equal(isAppAccessAllowedForState("ACCOUNT_DISABLED"), false);
});

test("maskEmail and maskPhone obscure PII cleanly while preserving verification hints", () => {
  assert.equal(maskEmail("student@nexora.school"), "st***@nexora.school");
  assert.equal(maskEmail("a@b.co"), "a***@b.co");
  assert.equal(maskEmail(""), "");

  assert.equal(maskPhone("+96550001234"), "+965••••1234");
  assert.equal(maskPhone("50001234"), "50••••1234");
  assert.equal(maskPhone("1234"), "••••");
  assert.equal(maskPhone(""), "");
});
