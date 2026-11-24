export type AppErrorCategory =
  "auth" | "permission" | "network" | "quota" | "validation" | "file" | "unknown";

export interface NormalizedAppError {
  category: AppErrorCategory;
  code: string;
  messageEn: string;
  messageAr: string;
  recoverable: boolean;
}

function extractRawCode(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  const rec = err as { code?: unknown; name?: unknown };
  if (typeof rec.code === "string") return rec.code.toLowerCase();
  if (typeof rec.name === "string") return rec.name.toLowerCase();
  return "";
}

function extractRawMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "";
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    return typeof m === "string" ? m : "";
  }
  return "";
}

/**
 * Normalizes Firebase Auth, Firestore, network, or file-handling errors into safe,
 * user-facing bilingual messages without exposing stack traces, internal paths, or tokens.
 */
export function normalizeAppError(
  err: unknown,
  fallbackEn = "Something went wrong. Please try again.",
  fallbackAr = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
): NormalizedAppError {
  const code = extractRawCode(err);
  const raw = extractRawMessage(err);
  const lower = raw.toLowerCase();

  if (
    code.includes("offline") ||
    code.includes("unavailable") ||
    code.includes("network-request-failed") ||
    lower.includes("offline") ||
    lower.includes("network") ||
    lower.includes("failed to fetch")
  ) {
    return {
      category: "network",
      code: code || "network/unavailable",
      messageEn: "Connection paused. Changes are kept on this device and will sync when online.",
      messageAr: "الاتصال متوقف مؤقتاً. تم حفظ التغييرات محلياً وستتم مزامنتها عند عودة الاتصال.",
      recoverable: true,
    };
  }

  if (
    code.includes("permission-denied") ||
    lower.includes("permission-denied") ||
    lower.includes("missing or insufficient permissions")
  ) {
    return {
      category: "permission",
      code: code || "firestore/permission-denied",
      messageEn:
        "Account verification or sync rules rejected this update. Please re-sign in or try again.",
      messageAr:
        "تعذر التحقق من صلاحية التحديث في السحابة. يرجى إعادة تسجيل الدخول أو المحاولة مجدداً.",
      recoverable: true,
    };
  }

  if (
    code.includes("unauthenticated") ||
    code.includes("requires-recent-login") ||
    code.includes("auth/user-token-expired")
  ) {
    return {
      category: "auth",
      code: code || "auth/session-expired",
      messageEn: "Your sign-in session expired. Please sign in again to continue.",
      messageAr: "انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى للمتابعة.",
      recoverable: true,
    };
  }

  if (code.includes("resource-exhausted") || lower.includes("quota exceeded")) {
    return {
      category: "quota",
      code: code || "resource-exhausted",
      messageEn: "Daily cloud service quota reached. Local saving continues seamlessly.",
      messageAr: "تم الوصول إلى الحد اليومي للخدمة السحابية. يستمر الحفظ محلياً بأمان.",
      recoverable: true,
    };
  }

  if (
    code.includes("invalid-argument") ||
    code.includes("validation") ||
    lower.includes("invalid file") ||
    lower.includes("exceeds maximum")
  ) {
    return {
      category: "validation",
      code: code || "validation/invalid",
      messageEn: raw && raw.length <= 180 ? raw : fallbackEn,
      messageAr: fallbackAr,
      recoverable: true,
    };
  }

  if (
    code.includes("notfounderror") ||
    code.includes("notsupportederror") ||
    code.includes("abort")
  ) {
    return {
      category: "file",
      code: code || "file/error",
      messageEn: fallbackEn,
      messageAr: fallbackAr,
      recoverable: true,
    };
  }

  return {
    category: "unknown",
    code: code || "unknown",
    messageEn: fallbackEn,
    messageAr: fallbackAr,
    recoverable: true,
  };
}

export function reportAppError(
  err: unknown,
  context: string,
  fallbackEn?: string,
  fallbackAr?: string,
): NormalizedAppError {
  const normalized = normalizeAppError(err, fallbackEn, fallbackAr);
  console.warn(`[BTC:${context}] (${normalized.category}:${normalized.code})`, err);
  return normalized;
}
