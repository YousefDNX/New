import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import firebaseConfig from "../../firebase-applet-config.json";
import { firebaseApp, isFirebaseConfigured } from "./firebase";

export type AnalyticsParamValue = string | number | boolean;
export type AnalyticsEventParams = Record<string, AnalyticsParamValue | null | undefined>;

const SENSITIVE_KEY_PATTERN =
  /email|phone|name|uid|user_id|token|password|secret|journal|reflection|care|prompt|message|text|content/i;

let _analyticsInstance: Analytics | null = null;
let _analyticsInitPromise: Promise<Analytics | null> | null = null;

export function getConfiguredMeasurementId(): string {
  const id = (firebaseConfig as { measurementId?: string }).measurementId;
  return typeof id === "string" ? id.trim() : "";
}

export function sanitizeAnalyticsEventName(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  if (!cleaned || !/^[a-z]/.test(cleaned)) {
    return "hub_engagement";
  }
  return cleaned;
}

export function sanitizeAnalyticsParams(
  params?: AnalyticsEventParams,
): Record<string, AnalyticsParamValue> {
  if (!params) return {};
  const clean: Record<string, AnalyticsParamValue> = {};
  let count = 0;

  for (const [rawKey, rawVal] of Object.entries(params)) {
    if (count >= 10) break;
    if (rawVal === null || rawVal === undefined) continue;
    const key = rawKey
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .slice(0, 40);
    if (!key || SENSITIVE_KEY_PATTERN.test(key)) continue;

    if (typeof rawVal === "string") {
      const trimmed = rawVal.trim().slice(0, 64);
      if (trimmed) {
        clean[key] = trimmed;
        count += 1;
      }
    } else if (typeof rawVal === "number" && Number.isFinite(rawVal)) {
      clean[key] = rawVal;
      count += 1;
    } else if (typeof rawVal === "boolean") {
      clean[key] = rawVal;
      count += 1;
    }
  }
  return clean;
}

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (_analyticsInstance) return _analyticsInstance;
  if (_analyticsInitPromise) return _analyticsInitPromise;

  const measurementId = getConfiguredMeasurementId();
  if (!isFirebaseConfigured || !measurementId) {
    return null;
  }

  _analyticsInitPromise = (async () => {
    try {
      const supported = await isSupported();
      if (!supported) return null;
      _analyticsInstance = getAnalytics(firebaseApp);
      return _analyticsInstance;
    } catch {
      return null;
    }
  })();

  return _analyticsInitPromise;
}

export async function trackHubEvent(
  eventName: string,
  params?: AnalyticsEventParams,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const analytics = _analyticsInstance ?? (await initFirebaseAnalytics());
    if (!analytics) return false;
    const safeName = sanitizeAnalyticsEventName(eventName);
    const safeParams = sanitizeAnalyticsParams(params);
    logEvent(analytics, safeName, safeParams);
    return true;
  } catch {
    return false;
  }
}

export function resetAnalyticsForTests(): void {
  _analyticsInstance = null;
  _analyticsInitPromise = null;
}
