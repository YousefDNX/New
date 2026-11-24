export const ACCOUNT_AUTH_STATES = [
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
] as const;

export type AccountAuthState = (typeof ACCOUNT_AUTH_STATES)[number];

export const VALID_AUTH_STATE_TRANSITIONS: Readonly<
  Record<AccountAuthState, readonly AccountAuthState[]>
> = {
  SESSION_RESTORING: [
    "NOT_AUTHENTICATED",
    "EMAIL_VERIFICATION_REQUIRED",
    "EMAIL_VERIFICATION_PENDING",
    "PHONE_VERIFICATION_REQUIRED",
    "PHONE_VERIFICATION_PENDING",
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "SESSION_EXPIRED",
    "ACCOUNT_RESTRICTED",
    "ACCOUNT_DISABLED",
    "AUTHENTICATION_ERROR",
  ],
  NOT_AUTHENTICATED: [
    "AUTHENTICATING",
    "SESSION_RESTORING",
    "AUTHENTICATION_ERROR",
    "ACCOUNT_DISABLED",
    "ACCOUNT_RESTRICTED",
  ],
  AUTHENTICATING: [
    "NOT_AUTHENTICATED",
    "EMAIL_VERIFICATION_REQUIRED",
    "EMAIL_VERIFICATION_PENDING",
    "PHONE_VERIFICATION_REQUIRED",
    "PHONE_VERIFICATION_PENDING",
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "ACCOUNT_RESTRICTED",
    "ACCOUNT_DISABLED",
    "AUTHENTICATION_ERROR",
    "VERIFICATION_ERROR",
  ],
  EMAIL_VERIFICATION_REQUIRED: [
    "EMAIL_VERIFICATION_PENDING",
    "EMAIL_VERIFIED",
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "VERIFICATION_ERROR",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  EMAIL_VERIFICATION_PENDING: [
    "EMAIL_VERIFICATION_REQUIRED",
    "EMAIL_VERIFIED",
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "VERIFICATION_ERROR",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  EMAIL_VERIFIED: [
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  PHONE_VERIFICATION_REQUIRED: [
    "PHONE_VERIFICATION_PENDING",
    "PHONE_VERIFIED",
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "VERIFICATION_ERROR",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  PHONE_VERIFICATION_PENDING: [
    "PHONE_VERIFICATION_REQUIRED",
    "PHONE_VERIFIED",
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "VERIFICATION_ERROR",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  PHONE_VERIFIED: [
    "ACCOUNT_INITIALIZATION_PENDING",
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  ACCOUNT_INITIALIZATION_PENDING: [
    "PROFILE_COMPLETION_REQUIRED",
    "AUTHENTICATED",
    "AUTHENTICATION_ERROR",
    "SESSION_EXPIRED",
    "NOT_AUTHENTICATED",
  ],
  PROFILE_COMPLETION_REQUIRED: [
    "AUTHENTICATED",
    "SESSION_EXPIRED",
    "ACCOUNT_RESTRICTED",
    "ACCOUNT_DISABLED",
    "NOT_AUTHENTICATED",
  ],
  AUTHENTICATED: [
    "SESSION_EXPIRED",
    "ACCOUNT_RESTRICTED",
    "ACCOUNT_DISABLED",
    "EMAIL_VERIFICATION_PENDING",
    "PHONE_VERIFICATION_PENDING",
    "NOT_AUTHENTICATED",
  ],
  SESSION_EXPIRED: ["AUTHENTICATING", "SESSION_RESTORING", "NOT_AUTHENTICATED"],
  ACCOUNT_RESTRICTED: ["AUTHENTICATED", "NOT_AUTHENTICATED"],
  ACCOUNT_DISABLED: ["NOT_AUTHENTICATED"],
  AUTHENTICATION_ERROR: ["AUTHENTICATING", "NOT_AUTHENTICATED", "SESSION_RESTORING"],
  VERIFICATION_ERROR: [
    "EMAIL_VERIFICATION_REQUIRED",
    "EMAIL_VERIFICATION_PENDING",
    "PHONE_VERIFICATION_REQUIRED",
    "PHONE_VERIFICATION_PENDING",
    "EMAIL_VERIFIED",
    "PHONE_VERIFIED",
    "NOT_AUTHENTICATED",
  ],
};

export function canTransitionAuthState(from: AccountAuthState, to: AccountAuthState): boolean {
  if (from === to) return true;
  return VALID_AUTH_STATE_TRANSITIONS[from].includes(to);
}

export interface ProviderEligibilityInput {
  isAnonymous?: boolean | undefined;
  providers?: readonly string[] | undefined;
  emailVerified?: boolean | undefined;
  signInProvider?: string | null | undefined;
}

/**
 * Mirrors Firestore `isEligibleUser()` security rule logic while remaining
 * backward-compatible when ID token `signInProvider` is not yet resolved.
 */
export function resolveProviderVerificationEligibility(input: ProviderEligibilityInput): {
  eligible: boolean;
  requiresEmailVerification: boolean;
} {
  if (input.isAnonymous || input.signInProvider === "anonymous") {
    return { eligible: true, requiresEmailVerification: false };
  }

  if (input.signInProvider === "phone") {
    return { eligible: true, requiresEmailVerification: false };
  }

  if (input.signInProvider === "password") {
    const needsEmail = !input.emailVerified;
    return { eligible: !needsEmail, requiresEmailVerification: needsEmail };
  }

  if (input.signInProvider === "google.com") {
    return { eligible: true, requiresEmailVerification: false };
  }

  const providers = input.providers ?? [];
  const hasVerifiedAlternateChannel =
    providers.includes("phone") || providers.includes("google.com");
  if (hasVerifiedAlternateChannel) {
    return { eligible: true, requiresEmailVerification: false };
  }

  const hasPassword = providers.includes("password");
  const needsEmail = hasPassword && !input.emailVerified;
  return { eligible: !needsEmail, requiresEmailVerification: needsEmail };
}

export interface AuthStateResolutionInput {
  isInitialized: boolean;
  loading?: boolean;
  authenticating?: boolean;
  hasUser: boolean;
  isAnonymous?: boolean;
  providers?: readonly string[];
  signInProvider?: string | null;
  emailVerified?: boolean;
  profileInitialized?: boolean | null;
  profileOnboarded?: boolean | null;
  verificationPendingChannel?: "email" | "phone" | null;
  verificationRequiredChannel?: "email" | "phone" | null;
  justVerifiedChannel?: "email" | "phone" | null;
  sessionExpired?: boolean;
  accountRestricted?: boolean;
  accountDisabled?: boolean;
  authError?: string | null;
  verificationError?: string | null;
}

export function resolveAccountAuthState(input: AuthStateResolutionInput): AccountAuthState {
  if (input.accountDisabled) return "ACCOUNT_DISABLED";
  if (input.accountRestricted) return "ACCOUNT_RESTRICTED";
  if (input.sessionExpired) return "SESSION_EXPIRED";

  if (!input.isInitialized || (input.loading && !input.authenticating && !input.hasUser)) {
    return "SESSION_RESTORING";
  }

  if (input.authenticating) {
    return "AUTHENTICATING";
  }

  if (!input.hasUser) {
    if (input.authError) return "AUTHENTICATION_ERROR";
    return "NOT_AUTHENTICATED";
  }

  const { requiresEmailVerification } = resolveProviderVerificationEligibility({
    isAnonymous: input.isAnonymous,
    providers: input.providers,
    emailVerified: input.emailVerified,
    signInProvider: input.signInProvider,
  });

  if (input.verificationError) {
    return "VERIFICATION_ERROR";
  }

  if (input.verificationPendingChannel === "phone") {
    return "PHONE_VERIFICATION_PENDING";
  }

  if (input.verificationRequiredChannel === "phone") {
    return "PHONE_VERIFICATION_REQUIRED";
  }

  if (requiresEmailVerification || input.verificationRequiredChannel === "email") {
    return input.verificationPendingChannel === "email"
      ? "EMAIL_VERIFICATION_PENDING"
      : "EMAIL_VERIFICATION_REQUIRED";
  }

  if (input.justVerifiedChannel === "email") {
    return "EMAIL_VERIFIED";
  }

  if (input.justVerifiedChannel === "phone") {
    return "PHONE_VERIFIED";
  }

  if (input.profileInitialized === false) {
    return "ACCOUNT_INITIALIZATION_PENDING";
  }

  if (input.profileOnboarded === false) {
    return "PROFILE_COMPLETION_REQUIRED";
  }

  return "AUTHENTICATED";
}

export function isAppAccessAllowedForState(state: AccountAuthState): boolean {
  return (
    state === "AUTHENTICATED" ||
    state === "EMAIL_VERIFIED" ||
    state === "PHONE_VERIFIED" ||
    state === "ACCOUNT_INITIALIZATION_PENDING" ||
    state === "PROFILE_COMPLETION_REQUIRED"
  );
}

/**
 * Masks an email address before UI presentation so raw PII is not echoed unnecessarily.
 * Example: "student@nexora.school" -> "st***@nexora.school"
 */
export function maskEmail(rawEmail: string | null | undefined): string {
  const clean = (rawEmail ?? "").trim();
  if (!clean) return "";
  const atIndex = clean.indexOf("@");
  if (atIndex <= 0) return "***";
  const local = clean.slice(0, atIndex);
  const domain = clean.slice(atIndex + 1);
  if (!domain) return "***";
  const visiblePrefix = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visiblePrefix}***@${domain}`;
}

/**
 * Masks a phone number while keeping country prefix and last 4 digits readable.
 * Example: "+96550001234" -> "+965••••1234"
 */
export function maskPhone(rawPhone: string | null | undefined): string {
  const clean = (rawPhone ?? "").trim();
  if (!clean) return "";
  if (clean.length <= 4) return "••••";
  const prefixMatch = clean.match(/^\+\d{1,3}/);
  const tail = clean.slice(-4);
  if (prefixMatch && clean.length - prefixMatch[0].length > 4) {
    return `${prefixMatch[0]}••••${tail}`;
  }
  const head = clean.slice(0, Math.min(2, clean.length - 4));
  return `${head}••••${tail}`;
}
