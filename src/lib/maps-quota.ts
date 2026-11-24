export const GMP_QUOTA_EVENT = "gmp-quota-exceeded";
export const GMP_ATTRIBUTION_ID = "gmp_mcp_codeassist_v1_aistudio";
export const GMP_QUOTA_DOCS_URL =
  "https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors";

declare global {
  interface Window {
    gm_authFailure?: () => void;
    __gmpQuotaTrapInstalled?: boolean;
  }
}

export function dispatchGmpQuotaExceeded(reason?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(GMP_QUOTA_EVENT, {
      detail: { reason: reason || "Maps quota exceeded" },
    }),
  );
}

export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "object") {
    const rec = err as Record<string, unknown>;
    if (rec["status"] === 429 || rec["code"] === 429) return true;
    const msg = String(rec["message"] ?? rec["statusText"] ?? rec["code"] ?? "").toUpperCase();
    if (
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("OVER_QUERY_LIMIT") ||
      msg.includes("OVERQUOTAMAPERROR") ||
      msg.includes("QUOTAEXCEEDEDERROR") ||
      msg.includes("QUOTA_EXCEEDED")
    ) {
      return true;
    }
  }
  if (typeof err === "string") {
    const upper = err.toUpperCase();
    return (
      upper.includes("RESOURCE_EXHAUSTED") ||
      upper.includes("OVER_QUERY_LIMIT") ||
      upper.includes("OVERQUOTAMAPERROR") ||
      upper.includes("QUOTAEXCEEDEDERROR")
    );
  }
  return false;
}

export function initGmpQuotaDefense(): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.__gmpQuotaTrapInstalled) return () => {};
  window.__gmpQuotaTrapInstalled = true;

  const prevAuthFailure = window.gm_authFailure;
  window.gm_authFailure = () => {
    dispatchGmpQuotaExceeded("gm_authFailure");
    if (typeof prevAuthFailure === "function") {
      prevAuthFailure();
    }
  };

  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      const joined = args.map((a) => String(a ?? "")).join(" ");
      const lower = joined.toLowerCase();
      const hasMapsContext =
        lower.includes("maps.googleapis") ||
        lower.includes("google.maps") ||
        lower.includes("places") ||
        lower.includes("gmp") ||
        lower.includes("gm_") ||
        lower.includes("initmap");
      if (
        joined.includes("OverQuotaMapError") ||
        joined.includes("OVER_QUERY_LIMIT") ||
        (joined.includes("QuotaExceededError") && hasMapsContext)
      ) {
        dispatchGmpQuotaExceeded(joined.slice(0, 160));
      }
    } catch {
      /* ignore console wrapper error */
    }
    originalError(...args);
  };

  return () => {
    window.__gmpQuotaTrapInstalled = false;
    if (prevAuthFailure) {
      window.gm_authFailure = prevAuthFailure;
    } else {
      delete window.gm_authFailure;
    }
    console.error = originalError;
  };
}
