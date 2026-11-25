import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { resolveProviderVerificationEligibility } from "./auth-state";
import { reportAppError } from "./error-handler";
import { db, handleFirestoreError, OperationType } from "./firebase";
import {
  isRemoteSettingsInitDeferred,
  markRemoteSettingsInitDeferred,
} from "../hooks/use-settings";
import {
  clampString,
  defaultSettingsDoc,
  defaultStatsDoc,
  extractCoreUserSettingsDoc,
  resolveCommunityGroup,
  sanitizeHttpUrl,
  type ProfileRow,
  type StudentGender,
} from "./firestore-data";
import { isSupportedLang, normalizeLang, type Lang } from "./i18n-dict";

const VALID_REGIONS = new Set(["kuwait", "gcc", "global"]);
const _bootstrapInFlightByUid = new Map<string, Promise<ProfileRow | null>>();
const _cachedProfileByUid = new Map<string, ProfileRow>();
const PENDING_GENDER_KEY = "btc_pending_gender";

export function setPendingRegistrationGender(gender: StudentGender): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_GENDER_KEY, gender);
    localStorage.setItem(PENDING_GENDER_KEY, gender);
  } catch {
    // Ignore storage quota errors
  }
}

export function getPendingRegistrationGender(): StudentGender | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(PENDING_GENDER_KEY) ?? localStorage.getItem(PENDING_GENDER_KEY);
    return raw === "male" || raw === "female" ? raw : null;
  } catch {
    return null;
  }
}

export function clearPendingRegistrationGender(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_GENDER_KEY);
    localStorage.removeItem(PENDING_GENDER_KEY);
  } catch {
    // Ignore storage quota errors
  }
}

export function getCachedBootstrappedProfile(uid: string | null | undefined): ProfileRow | null {
  if (!uid) return null;
  return _cachedProfileByUid.get(uid) ?? null;
}

export function clearCachedBootstrappedProfile(uid?: string): void {
  if (uid) {
    _cachedProfileByUid.delete(uid);
  } else {
    _cachedProfileByUid.clear();
  }
}

export function deriveDisplayName(user: User): string {
  const fromDisplay = user.displayName?.trim();
  if (fromDisplay) return fromDisplay.slice(0, 60);
  if (user.email) {
    const local = user.email.split("@")[0]?.trim();
    if (local) return local.slice(0, 60);
  }
  if (user.phoneNumber) {
    return user.phoneNumber.slice(0, 60);
  }
  return user.isAnonymous ? "Guest Student" : "Student";
}

export function resolveProviderId(user: User, signInProvider?: string | null): string {
  if (user.isAnonymous) return "anonymous";
  const providers =
    user.providerData?.map((p) => p.providerId).filter((id): id is string => Boolean(id)) ?? [];
  if (signInProvider === "google.com" || providers.includes("google.com")) return "google.com";
  if (signInProvider === "phone" || providers.includes("phone")) return "phone";
  if (signInProvider === "password" || providers.includes("password")) return "password";
  return signInProvider ?? providers[0] ?? "firebase";
}

async function runFirebaseUserBootstrap(
  user: User,
  preferredLang: Lang,
): Promise<ProfileRow | null> {
  let signInProvider: string | null = user.isAnonymous ? "anonymous" : null;
  if (!signInProvider && typeof user.getIdTokenResult === "function") {
    try {
      const tokenRes = await user.getIdTokenResult(false);
      if (typeof tokenRes?.signInProvider === "string" && tokenRes.signInProvider) {
        signInProvider = tokenRes.signInProvider;
      }
    } catch {
      // Fallback to providerData inspection
    }
  }

  const providers = user.providerData?.map((p) => p.providerId).filter(Boolean) ?? [];
  const { eligible } = resolveProviderVerificationEligibility({
    isAnonymous: user.isAnonymous,
    providers,
    emailVerified: user.emailVerified,
    signInProvider,
  });

  if (!eligible) {
    return null;
  }

  const now = new Date().toISOString();
  const profileRef = doc(db, "profiles", user.uid);
  const settingsRef = doc(db, "user_settings", user.uid);
  const statsRef = doc(db, "user_stats", user.uid);

  const metaName = deriveDisplayName(user);
  const metaAvatar = sanitizeHttpUrl(user.photoURL, 512);
  const authProvider = resolveProviderId(user, signInProvider);
  const phoneNumber = clampString(user.phoneNumber, 32);

  // Parallelize all three initial document reads in a single round-trip
  let existingSnap;
  let settingsSnap = null;
  let statsSnap = null;
  try {
    [existingSnap, settingsSnap, statsSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(settingsRef).catch(() => null),
      getDoc(statsRef).catch(() => null),
    ]);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `profiles/${user.uid}`);
  }

  let profile: ProfileRow | null = null;
  const writes: Promise<unknown>[] = [];

  if (!existingSnap.exists()) {
    const newProfile: ProfileRow = {
      id: user.uid,
      display_name: metaName,
      avatar_url: metaAvatar,
      language: normalizeLang(preferredLang),
      region: "kuwait",
      date_of_birth: null,
      age_band: null,
      show_gender_on_profile: false,
      parental_consent: false,
      onboarded: false,
      is_anonymous: user.isAnonymous,
      auth_provider: authProvider,
      email_verified: user.emailVerified,
      phone_number: phoneNumber,
      created_at: now,
      updated_at: now,
    };
    profile = newProfile;
    writes.push(
      setDoc(profileRef, newProfile)
        .then(() => {
          clearPendingRegistrationGender();
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `profiles/${user.uid}`);
        }),
    );
  } else {
    const existing = existingSnap.data() as ProfileRow;
    const patch: Partial<ProfileRow> = {};

    if (!existing.display_name && metaName) {
      patch.display_name = metaName;
    }
    if (!existing.avatar_url && metaAvatar) {
      patch.avatar_url = metaAvatar;
    }
    if (!existing.language || !isSupportedLang(existing.language)) {
      patch.language = normalizeLang(preferredLang);
    }
    if (!existing.region || !VALID_REGIONS.has(existing.region)) {
      patch.region = "kuwait";
    }
    if (existing.show_gender_on_profile === undefined) {
      patch.show_gender_on_profile = false;
    }
    if (existing.is_anonymous !== user.isAnonymous) {
      patch.is_anonymous = user.isAnonymous;
    }
    if (existing.auth_provider !== authProvider) {
      patch.auth_provider = authProvider;
    }
    if (existing.email_verified !== user.emailVerified) {
      patch.email_verified = user.emailVerified;
    }
    if (phoneNumber && existing.phone_number !== phoneNumber) {
      patch.phone_number = phoneNumber;
    }

    if (Object.keys(patch).length > 0) {
      patch.updated_at = now;
      profile = { ...existing, ...patch };
      writes.push(
        updateDoc(profileRef, patch).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
        }),
      );
    } else {
      profile = existing;
    }
  }

  // Initialize user_settings if missing (do not overwrite existing accessibility choices).
  // Fall back to core 12-key schema if remote project rules reject newer extended keys,
  // and never block user sign-in/onboarding on secondary settings/stats sync failures.
  if (settingsSnap && !settingsSnap.exists() && !isRemoteSettingsInitDeferred(user.uid)) {
    const initialSettings = defaultSettingsDoc(user.uid, now);
    writes.push(
      setDoc(settingsRef, initialSettings).catch(async () => {
        try {
          await setDoc(settingsRef, extractCoreUserSettingsDoc(initialSettings, user.uid));
        } catch {
          if (!isRemoteSettingsInitDeferred(user.uid)) {
            markRemoteSettingsInitDeferred(user.uid);
            console.info(
              "[BTC:auth-bootstrap:user_settings] Signed in with local settings defaults; cloud settings sync deferred.",
            );
          }
        }
      }),
    );
  }

  // Initialize Growth Map user_stats safely at zero if missing (never invent fake XP)
  if (statsSnap && !statsSnap.exists()) {
    writes.push(
      setDoc(statsRef, defaultStatsDoc(user.uid, now)).catch((err) => {
        reportAppError(err, "auth-bootstrap:user_stats", "Growth stats initialized locally.");
      }),
    );
  }

  if (writes.length > 0) {
    await Promise.all(writes);
  }

  if (profile) {
    _cachedProfileByUid.set(user.uid, profile);
  }

  return profile;
}

/**
 * Ensures an eligible authenticated Firebase user has exactly one profile,
 * user_settings, and user_stats document in Firestore without ever creating
 * duplicate profiles, inventing fake XP, or overwriting existing student progress.
 */
export async function ensureFirebaseUserBootstrap(
  user: User | null | undefined,
  preferredLang: Lang = "en",
): Promise<ProfileRow | null> {
  if (!user?.uid) return null;

  const existingPromise = _bootstrapInFlightByUid.get(user.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const nextPromise = runFirebaseUserBootstrap(user, preferredLang).finally(() => {
    _bootstrapInFlightByUid.delete(user.uid);
  });
  _bootstrapInFlightByUid.set(user.uid, nextPromise);
  return nextPromise;
}
