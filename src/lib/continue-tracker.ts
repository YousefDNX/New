export interface ContinueEntry {
  path: string;
  labelEn: string;
  labelAr: string;
  detailEn?: string;
  detailAr?: string;
  updatedAt: string;
}

function getStorageKey(uid: string | null | undefined): string {
  return `btc_continue_${uid || "guest"}`;
}

export function recordLastVisitedModule(
  uid: string | null | undefined,
  entry: Omit<ContinueEntry, "updatedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ContinueEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(uid), JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

export function getLastVisitedModule(uid: string | null | undefined): ContinueEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ContinueEntry>;
    if (
      typeof parsed.path === "string" &&
      typeof parsed.labelEn === "string" &&
      typeof parsed.labelAr === "string"
    ) {
      return {
        path: parsed.path,
        labelEn: parsed.labelEn,
        labelAr: parsed.labelAr,
        ...(typeof parsed.detailEn === "string" ? { detailEn: parsed.detailEn } : {}),
        ...(typeof parsed.detailAr === "string" ? { detailAr: parsed.detailAr } : {}),
        updatedAt:
          typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}
