import { translate } from "./preferences";
import type { Lang } from "./i18n-dict";

export interface PasswordStrengthResult {
  score: number; // 0..4
  valid: boolean;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
  };
}

export interface CountryCallingCode {
  iso: string;
  dial: string;
  en: string;
  ar: string;
}

export const COUNTRY_CODES: CountryCallingCode[] = [
  { iso: "KW", dial: "+965", en: "Kuwait (+965)", ar: "الكويت (+965)" },
  { iso: "SA", dial: "+966", en: "Saudi Arabia (+966)", ar: "السعودية (+966)" },
  { iso: "AE", dial: "+971", en: "UAE (+971)", ar: "الإمارات (+971)" },
  { iso: "QA", dial: "+974", en: "Qatar (+974)", ar: "قطر (+974)" },
  { iso: "BH", dial: "+973", en: "Bahrain (+973)", ar: "البحرين (+973)" },
  { iso: "OM", dial: "+968", en: "Oman (+968)", ar: "عُمان (+968)" },
  { iso: "EG", dial: "+20", en: "Egypt (+20)", ar: "مصر (+20)" },
  { iso: "JO", dial: "+962", en: "Jordan (+962)", ar: "الأردن (+962)" },
  { iso: "GB", dial: "+44", en: "United Kingdom (+44)", ar: "المملكة المتحدة (+44)" },
  { iso: "US", dial: "+1", en: "United States / Canada (+1)", ar: "الولايات المتحدة / كندا (+1)" },
  { iso: "JP", dial: "+81", en: "Japan (+81)", ar: "اليابان (+81)" },
  { iso: "KR", dial: "+82", en: "South Korea (+82)", ar: "كوريا الجنوبية (+82)" },
  { iso: "CN", dial: "+86", en: "China (+86)", ar: "الصين (+86)" },
  { iso: "FR", dial: "+33", en: "France (+33)", ar: "فرنسا (+33)" },
  { iso: "DE", dial: "+49", en: "Germany (+49)", ar: "ألمانيا (+49)" },
  { iso: "IN", dial: "+91", en: "India (+91)", ar: "الهند (+91)" },
  { iso: "PK", dial: "+92", en: "Pakistan (+92)", ar: "باكستان (+92)" },
  { iso: "TR", dial: "+90", en: "Turkey (+90)", ar: "تركيا (+90)" },
];

export function formatCountryLabel(c: CountryCallingCode, lang: Lang): string {
  if (lang === "ar") return c.ar;
  try {
    const regionNames = new Intl.DisplayNames([lang], { type: "region" });
    const name = regionNames.of(c.iso);
    if (name) return `${name} (${c.dial})`;
  } catch {
    // Fallback below
  }
  return c.en;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  const clean = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}

export function validateFullName(name: string): { valid: boolean; cleaned: string } {
  const cleaned = name.replace(/\s+/g, " ").trim();
  return {
    valid: cleaned.length >= 2 && cleaned.length <= 60,
    cleaned,
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const score =
    Number(checks.length) + Number(checks.upper) + Number(checks.lower) + Number(checks.number);
  return {
    score,
    valid: checks.length && checks.upper && checks.lower && checks.number,
    checks,
  };
}

export function validatePhoneNumber(
  dialCode: string,
  localInput: string,
): { valid: boolean; e164: string } {
  const trimmed = localInput.trim();
  // Allow user to paste full E.164 directly starting with '+'
  if (trimmed.startsWith("+")) {
    const digitsOnly = `+${trimmed.slice(1).replace(/\D/g, "")}`;
    return {
      valid: /^\+[1-9]\d{6,14}$/.test(digitsOnly),
      e164: digitsOnly,
    };
  }
  const dialDigits = dialCode.replace(/\D/g, "");
  let nationalDigits = trimmed.replace(/\D/g, "");
  if (nationalDigits.startsWith("0") && nationalDigits.length > 6) {
    nationalDigits = nationalDigits.replace(/^0+/, "");
  }
  const e164 = `+${dialDigits}${nationalDigits}`;
  return {
    valid: /^\+[1-9]\d{6,14}$/.test(e164),
    e164,
  };
}

export function sanitizeRedirectPath(raw: string | null | undefined, fallback = "/app"): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  if (trimmed.startsWith("/auth") || trimmed.startsWith("/reset-password")) {
    return fallback;
  }
  return trimmed;
}

function unwrapErrorMessage(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Authentication failed";
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as { error?: unknown };
      if (typeof parsed.error === "string" && parsed.error.trim().length > 0) {
        return parsed.error.trim();
      }
    } catch {
      // Keep original message if not valid JSON
    }
  }
  return raw;
}

export function extractFirebaseAuthCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") {
    return err.code.toLowerCase();
  }
  const msg = unwrapErrorMessage(err);
  const match = msg.match(/\b(?:auth|firestore)\/[a-z0-9-]+\b/i);
  return match ? match[0].toLowerCase() : "";
}

function localizedFallbackMessage(lang: Lang, en: string, ar: string): string {
  return lang === "ar" ? ar : en;
}

export function mapAuthError(err: unknown, lang: Lang): string {
  const code = extractFirebaseAuthCode(err);
  const raw = unwrapErrorMessage(err);
  const m = raw.toLowerCase();

  if (code === "auth/email-already-in-use" || m.includes("already registered")) {
    return translate(lang, "auth.err.emailInUse");
  }
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    m.includes("invalid login credentials")
  ) {
    return translate(lang, "auth.err.invalidCred");
  }
  if (code === "auth/invalid-email") {
    return translate(lang, "auth.err.invalidEmail");
  }
  if (code === "auth/weak-password") {
    return translate(lang, "auth.err.weakPw");
  }
  if (code === "auth/too-many-requests" || m.includes("rate limit")) {
    return translate(lang, "auth.err.tooMany");
  }
  if (code === "auth/user-disabled") {
    return translate(lang, "auth.err.disabled");
  }
  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/redirect-cancelled-by-user" ||
    m.includes("cancelled") ||
    m.includes("canceled") ||
    m.includes("access_denied")
  ) {
    return translate(lang, "auth.err.popupClosed");
  }
  if (code === "auth/popup-blocked") {
    return translate(lang, "auth.err.popupBlocked");
  }
  if (code === "auth/account-exists-with-different-credential") {
    return translate(lang, "auth.err.diffCred");
  }
  if (code === "auth/credential-already-in-use") {
    return translate(lang, "auth.err.credInUse");
  }
  if (code === "auth/provider-already-linked") {
    return translate(lang, "auth.err.alreadyLinked");
  }
  if (code === "auth/operation-not-allowed" || code === "auth/admin-restricted-operation") {
    return translate(lang, "auth.err.notAllowed");
  }
  if (code === "auth/unauthorized-domain" || code === "auth/app-not-authorized") {
    return translate(lang, "auth.err.unauthDomain");
  }
  if (code === "auth/invalid-phone-number") {
    return translate(lang, "auth.err.invalidPhone");
  }
  if (code === "auth/invalid-verification-code" || code === "auth/missing-verification-code") {
    return translate(lang, "auth.err.invalidCode");
  }
  if (code === "auth/code-expired" || code === "auth/expired-action-code") {
    return translate(lang, "auth.err.expiredCode");
  }
  if (code === "auth/invalid-action-code") {
    return translate(lang, "auth.err.invalidAction");
  }
  if (
    code === "auth/captcha-check-failed" ||
    code === "auth/missing-client-identifier" ||
    code === "auth/invalid-app-credential"
  ) {
    return translate(lang, "auth.err.captchaFailed");
  }
  if (code === "auth/quota-exceeded" || code === "auth/billing-not-enabled") {
    return translate(lang, "auth.err.quotaBilling");
  }
  if (code === "auth/requires-recent-login") {
    return translate(lang, "auth.err.recentLogin");
  }
  if (
    code === "auth/network-request-failed" ||
    code === "firestore/unavailable" ||
    m.includes("the client is offline") ||
    m.includes("network error")
  ) {
    return translate(lang, "auth.err.network");
  }
  if (
    code === "auth/web-storage-unsupported" ||
    code === "auth/operation-not-supported-in-this-environment"
  ) {
    return localizedFallbackMessage(
      lang,
      "Your browser blocked storage or embedded sign-in here. Allow cookies/storage for this site or open sign-in in a new browser tab.",
      "حظر المتصفح التخزين أو تسجيل الدخول داخل الإطار المضمّن. اسمح بملفات تعريف الارتباط أو افتح صفحة الدخول في تبويب جديد.",
    );
  }
  if (
    code === "auth/internal-error" ||
    code === "auth/argument-error" ||
    code === "auth/missing-or-invalid-nonce"
  ) {
    return localizedFallbackMessage(
      lang,
      "Google sign-in could not complete because of a browser session or popup configuration error. Please allow popups and try again.",
      "تعذّر إكمال تسجيل الدخول عبر Google بسبب إعدادات الجلسة أو النافذة المنبثقة. اسمح بالنوافذ المنبثقة وأعد المحاولة.",
    );
  }
  if (code === "firestore/permission-denied" || m.includes("missing or insufficient permissions")) {
    return localizedFallbackMessage(
      lang,
      "Signed in, but account profile permissions could not be synced yet. Please refresh or try again.",
      "تم تسجيل الدخول، لكن تعذّر مزامنة صلاحيات الملف الشخصي. يرجى التحديث وإعادة المحاولة.",
    );
  }

  return raw;
}
