import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
  type FirestoreErrorInfo,
} from "./firebase";
import type {
  ActivityEventRow,
  GrowthArea,
  ProfileRow,
  UserSettingsRow,
  UserStatsRow,
} from "./firestore-data";
import { defaultSettingsDoc, defaultStatsDoc, generateSafeDocId } from "./firestore-data";
import { levelForXp } from "./growth";

/**
 * Metadata loaded directly from firebase-applet-config.json
 */
export const firestoreConfig = {
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || "(default)",
  authDomain: firebaseConfig.authDomain,
} as const;

/**
 * Diagnostics and connection probe
 */
export async function verifyFirestoreServiceHealth(): Promise<{
  connected: boolean;
  projectId: string;
  databaseId: string;
}> {
  const isHealthy = await testFirestoreConnection();
  return {
    connected: isHealthy,
    projectId: firestoreConfig.projectId,
    databaseId: firestoreConfig.firestoreDatabaseId,
  };
}

function reportSnapshotError(err: unknown, path: string, onError?: (err: unknown) => void) {
  const currentUser = auth.currentUser;
  const info: FirestoreErrorInfo = {
    error: err instanceof Error ? err.message : String(err),
    operationType: OperationType.GET,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId ?? null,
          email: provider.email ?? null,
        })) ?? [],
    },
  };
  console.error("Firestore Listener Error: ", JSON.stringify(info));
  onError?.(err instanceof Error ? err : new Error(info.error));
}

/* =========================================================================
 * 1. User Profile Service Layer
 * ========================================================================= */

export async function fetchUserProfile(userId: string): Promise<ProfileRow | null> {
  if (!userId) return null;
  const path = `profiles/${userId}`;
  try {
    const snap = await getDoc(doc(db, "profiles", userId));
    return snap.exists() ? (snap.data() as ProfileRow) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(
  userId: string,
  profileData: Partial<ProfileRow>,
): Promise<ProfileRow> {
  if (!userId) throw new Error("User ID is required to save profile.");
  const path = `profiles/${userId}`;
  const now = new Date().toISOString();
  const profileRef = doc(db, "profiles", userId);

  try {
    const existing = await getDoc(profileRef);
    if (!existing.exists()) {
      const fullDoc: ProfileRow = {
        id: userId,
        display_name: profileData.display_name?.trim() || "Student",
        avatar_url: profileData.avatar_url ?? null,
        language: profileData.language ?? "en",
        region: profileData.region ?? "kuwait",
        date_of_birth: profileData.date_of_birth ?? null,
        age_band: profileData.age_band ?? null,
        grade_level: profileData.grade_level ?? null,
        school_name: profileData.school_name ?? null,
        preferred_subjects: profileData.preferred_subjects ?? [],
        learning_goals: profileData.learning_goals ?? null,
        parental_consent: profileData.parental_consent ?? false,
        onboarded: profileData.onboarded ?? false,
        is_anonymous: profileData.is_anonymous ?? false,
        auth_provider: profileData.auth_provider ?? "email",
        email_verified: profileData.email_verified ?? false,
        phone_number: profileData.phone_number ?? null,
        created_at: now,
        updated_at: now,
      };
      await setDoc(profileRef, fullDoc);
      return fullDoc;
    } else {
      const patch = {
        ...profileData,
        updated_at: now,
      };
      await updateDoc(profileRef, patch);
      return { ...(existing.data() as ProfileRow), ...patch };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeUserProfile(
  userId: string,
  onData: (profile: ProfileRow | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const path = `profiles/${userId}`;
  return onSnapshot(
    doc(db, "profiles", userId),
    (snap) => {
      onData(snap.exists() ? (snap.data() as ProfileRow) : null);
    },
    (err) => {
      reportSnapshotError(err, path, onError);
    },
  );
}

/* =========================================================================
 * 2. Student Growth Milestones & Stats Service Layer
 * ========================================================================= */

export async function fetchUserStats(userId: string): Promise<UserStatsRow> {
  if (!userId) throw new Error("User ID is required to fetch stats.");
  const path = `user_stats/${userId}`;
  try {
    const snap = await getDoc(doc(db, "user_stats", userId));
    if (snap.exists()) {
      return snap.data() as UserStatsRow;
    }
    const def = defaultStatsDoc(userId);
    await setDoc(doc(db, "user_stats", userId), def);
    return def;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function updateUserStats(
  userId: string,
  patch: Partial<UserStatsRow>,
): Promise<UserStatsRow> {
  if (!userId) throw new Error("User ID is required to update stats.");
  const path = `user_stats/${userId}`;
  const now = new Date().toISOString();
  const statsRef = doc(db, "user_stats", userId);

  try {
    const current = await getDoc(statsRef);
    if (!current.exists()) {
      const fullDoc = { ...defaultStatsDoc(userId, now), ...patch, updated_at: now };
      await setDoc(statsRef, fullDoc);
      return fullDoc;
    }

    const payload = {
      ...patch,
      updated_at: now,
    };
    await updateDoc(statsRef, payload);
    return { ...(current.data() as UserStatsRow), ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Awards student XP, updates level progression, and logs verifiable activity event.
 */
export async function awardStudentXp(params: {
  userId: string;
  xpAmount: number;
  area: GrowthArea;
  eventType: string;
  refId?: string | null;
}): Promise<{ newXp: number; newLevel: number; eventId: string }> {
  const { userId, xpAmount, area, eventType, refId } = params;
  const now = new Date().toISOString();
  const safeXp = Math.min(100, Math.max(0, Math.round(xpAmount)));

  const eventId = generateSafeDocId("ev");
  const eventDoc: ActivityEventRow = {
    id: eventId,
    user_id: userId,
    event_type: eventType.slice(0, 64),
    area,
    xp: safeXp,
    ref_id: refId ? refId.slice(0, 128) : null,
    created_at: now,
  };

  try {
    await setDoc(doc(db, "activity_events", eventId), eventDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `activity_events/${eventId}`);
  }

  // Update user_stats
  const statsRef = doc(db, "user_stats", userId);
  let finalXp = safeXp;
  let finalLevel = 1;

  try {
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      const current = statsSnap.data() as UserStatsRow;
      finalXp = (current.xp || 0) + safeXp;
      finalLevel = Math.max(current.level || 1, levelForXp(finalXp));
      await updateDoc(statsRef, {
        xp: finalXp,
        level: finalLevel,
        updated_at: now,
      });
    } else {
      finalLevel = levelForXp(finalXp);
      await setDoc(statsRef, {
        user_id: userId,
        xp: finalXp,
        level: finalLevel,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: now.slice(0, 10),
        updated_at: now,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `user_stats/${userId}`);
  }

  return { newXp: finalXp, newLevel: finalLevel, eventId };
}

export function subscribeUserStats(
  userId: string,
  onData: (stats: UserStatsRow | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const path = `user_stats/${userId}`;
  return onSnapshot(
    doc(db, "user_stats", userId),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserStatsRow) : null);
    },
    (err) => {
      reportSnapshotError(err, path, onError);
    },
  );
}

/* =========================================================================
 * 3. User Settings Service Layer
 * ========================================================================= */

export async function fetchUserSettings(userId: string): Promise<UserSettingsRow> {
  if (!userId) throw new Error("User ID is required to fetch settings.");
  const path = `user_settings/${userId}`;
  try {
    const snap = await getDoc(doc(db, "user_settings", userId));
    if (snap.exists()) {
      return snap.data() as UserSettingsRow;
    }
    const def = defaultSettingsDoc(userId);
    await setDoc(doc(db, "user_settings", userId), def);
    return def;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserSettings(
  userId: string,
  patch: Partial<UserSettingsRow>,
): Promise<UserSettingsRow> {
  if (!userId) throw new Error("User ID is required to save settings.");
  const path = `user_settings/${userId}`;
  const now = new Date().toISOString();
  const settingsRef = doc(db, "user_settings", userId);

  try {
    const current = await getDoc(settingsRef);
    if (!current.exists()) {
      const fullDoc = { ...defaultSettingsDoc(userId, now), ...patch, updated_at: now };
      await setDoc(settingsRef, fullDoc);
      return fullDoc;
    }

    const payload = {
      ...patch,
      updated_at: now,
    };
    await updateDoc(settingsRef, payload);
    return { ...(current.data() as UserSettingsRow), ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeUserSettings(
  userId: string,
  onData: (settings: UserSettingsRow | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const path = `user_settings/${userId}`;
  return onSnapshot(
    doc(db, "user_settings", userId),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserSettingsRow) : null);
    },
    (err) => {
      reportSnapshotError(err, path, onError);
    },
  );
}
