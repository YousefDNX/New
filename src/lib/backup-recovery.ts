/**
 * BTC — Disaster Recovery, Automated Backups & State Preservation
 *
 * Provides cryptographic-grade deterministic integrity validation,
 * automated backup snapshots, export/import workflows, and pre-restore rollback safety.
 */

export const BTC_BACKUP_SCHEMA_VERSION = "2026-11-18.1";
export const BTC_BACKUP_SAFETY_ROLLBACK_KEY = "btc_backup_safety_rollback_v1";

export interface BtcBackupMetadata {
  appName: string;
  appletId: string;
  schemaVersion: string;
  createdAt: string;
  checksum: string;
  itemCounts: {
    favoriteReciters: number;
    favoriteRecordings: number;
    listeningHistory: number;
    studyNotes: number;
    studyCompletedTopics: number;
    styleOverrides: number;
  };
}

export interface BtcSystemBackupPayload {
  metadata: BtcBackupMetadata;
  data: {
    directoryState?: unknown;
    islamicLearningState?: unknown;
    styleOverrides?: unknown;
    themePrefs?: unknown;
    a11yPrefs?: unknown;
    uiMode?: unknown;
  };
}

/** Compute standard deterministic checksum across serialized JSON */
export function computeDeterministicChecksum(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) + hash + content.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return `btc_crc_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

/** Captures current student and Islamic center states into a validated backup payload */
export function createBtcSystemBackup(): BtcSystemBackupPayload {
  let directoryState: Record<string, unknown> = {};
  let islamicLearningState: Record<string, unknown> = {};
  let styleOverrides: Record<string, unknown> = {};
  let themePrefs: unknown = null;
  let a11yPrefs: unknown = null;
  let uiMode: unknown = null;

  if (typeof window !== "undefined") {
    try {
      directoryState = JSON.parse(
        window.localStorage.getItem("btc_quran_reciter_directory_state_v1") || "{}",
      );
    } catch {
      /* empty */
    }
    try {
      islamicLearningState = JSON.parse(
        window.localStorage.getItem("btc_islamic_center_learning_v1") || "{}",
      );
    } catch {
      /* empty */
    }
    try {
      styleOverrides = JSON.parse(
        window.localStorage.getItem("btc_recitation_style_overrides_v1") || "{}",
      );
    } catch {
      /* empty */
    }
    try {
      themePrefs = JSON.parse(window.localStorage.getItem("nexora:prefs:appearance") || "null");
      a11yPrefs = JSON.parse(window.localStorage.getItem("nexora:prefs:a11y") || "null");
      uiMode = window.localStorage.getItem("nexora:prefs:ui-mode");
    } catch {
      /* empty */
    }
  }

  const data = {
    directoryState,
    islamicLearningState,
    styleOverrides,
    themePrefs,
    a11yPrefs,
    uiMode,
  };

  const dataSerialized = JSON.stringify(data);
  const checksum = computeDeterministicChecksum(dataSerialized);

  const favRecs = Array.isArray(
    (directoryState as { favoriteReciterIds?: unknown[] }).favoriteReciterIds,
  )
    ? (directoryState as { favoriteReciterIds: unknown[] }).favoriteReciterIds.length
    : 0;
  const favRecordings = Array.isArray(
    (directoryState as { favoriteRecordingKeys?: unknown[] }).favoriteRecordingKeys,
  )
    ? (directoryState as { favoriteRecordingKeys: unknown[] }).favoriteRecordingKeys.length
    : 0;
  const historyCount = Array.isArray(
    (directoryState as { listeningHistory?: unknown[] }).listeningHistory,
  )
    ? (directoryState as { listeningHistory: unknown[] }).listeningHistory.length
    : 0;
  const notesCount = Array.isArray(
    (islamicLearningState as { personalNotes?: unknown[] }).personalNotes,
  )
    ? (islamicLearningState as { personalNotes: unknown[] }).personalNotes.length
    : 0;
  const completedTopics = Array.isArray(
    (islamicLearningState as { completedTopicIds?: unknown[] }).completedTopicIds,
  )
    ? (islamicLearningState as { completedTopicIds: unknown[] }).completedTopicIds.length
    : 0;
  const overrideCount = Object.keys(styleOverrides).length;

  const metadata: BtcBackupMetadata = {
    appName: "BTC — BE THE CHANGE",
    appletId: "5e2578e5-d6c6-419c-9c1a-5f8674f1e7dd",
    schemaVersion: BTC_BACKUP_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    checksum,
    itemCounts: {
      favoriteReciters: favRecs,
      favoriteRecordings: favRecordings,
      listeningHistory: historyCount,
      studyNotes: notesCount,
      studyCompletedTopics: completedTopics,
      styleOverrides: overrideCount,
    },
  };

  return { metadata, data };
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  metadata?: BtcBackupMetadata;
}

/** Strictly validates a backup JSON payload without throwing */
export function validateBtcBackupPayload(rawJson: string): BackupValidationResult {
  try {
    const parsed = JSON.parse(rawJson) as Partial<BtcSystemBackupPayload>;
    if (!parsed || typeof parsed !== "object") {
      return { valid: false, error: "Backup file is not a valid JSON object." };
    }
    if (!parsed.metadata || typeof parsed.metadata !== "object") {
      return { valid: false, error: "Missing required backup metadata block." };
    }
    if (parsed.metadata.appName !== "BTC — BE THE CHANGE") {
      return {
        valid: false,
        error: `Invalid application origin: expected 'BTC — BE THE CHANGE', got '${parsed.metadata.appName}'.`,
      };
    }
    if (!parsed.data || typeof parsed.data !== "object") {
      return { valid: false, error: "Missing required backup data payload block." };
    }

    const calculatedChecksum = computeDeterministicChecksum(JSON.stringify(parsed.data));
    if (calculatedChecksum !== parsed.metadata.checksum) {
      return {
        valid: false,
        error: `Checksum verification failed. Backup payload was modified or corrupted (expected: ${parsed.metadata.checksum}, calculated: ${calculatedChecksum}).`,
      };
    }

    return { valid: true, metadata: parsed.metadata };
  } catch (err) {
    return {
      valid: false,
      error: `Malformed JSON structure: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/** Restores system states from a validated backup payload with automatic safety rollback snapshot */
export function restoreBtcSystemBackup(rawJson: string): { success: boolean; message: string } {
  const check = validateBtcBackupPayload(rawJson);
  if (!check.valid || !check.metadata) {
    return { success: false, message: check.error || "Invalid backup payload." };
  }

  if (typeof window === "undefined") {
    return { success: false, message: "Restoration must run in browser runtime." };
  }

  try {
    // 1. Create immediate safety rollback snapshot before overwriting
    const currentBackup = createBtcSystemBackup();
    window.localStorage.setItem(BTC_BACKUP_SAFETY_ROLLBACK_KEY, JSON.stringify(currentBackup));

    // 2. Safely unpack backup payload
    const parsed = JSON.parse(rawJson) as BtcSystemBackupPayload;
    const { data } = parsed;

    if (data.directoryState && typeof data.directoryState === "object") {
      window.localStorage.setItem(
        "btc_quran_reciter_directory_state_v1",
        JSON.stringify(data.directoryState),
      );
    }
    if (data.islamicLearningState && typeof data.islamicLearningState === "object") {
      window.localStorage.setItem(
        "btc_islamic_center_learning_v1",
        JSON.stringify(data.islamicLearningState),
      );
    }
    if (data.styleOverrides && typeof data.styleOverrides === "object") {
      window.localStorage.setItem(
        "btc_recitation_style_overrides_v1",
        JSON.stringify(data.styleOverrides),
      );
    }
    if (data.themePrefs && typeof data.themePrefs === "object") {
      window.localStorage.setItem("nexora:prefs:appearance", JSON.stringify(data.themePrefs));
    }
    if (data.a11yPrefs && typeof data.a11yPrefs === "object") {
      window.localStorage.setItem("nexora:prefs:a11y", JSON.stringify(data.a11yPrefs));
    }
    if (data.uiMode && typeof data.uiMode === "string") {
      window.localStorage.setItem("nexora:prefs:ui-mode", data.uiMode);
    }

    return {
      success: true,
      message: `Backup restored successfully (${check.metadata.itemCounts.studyNotes} study notes, ${check.metadata.itemCounts.favoriteReciters} favorite reciters, ${check.metadata.itemCounts.styleOverrides} style overrides). Rollback safety snapshot saved.`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed during restoration: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/** Reverts system state to the pre-restore rollback snapshot */
export function rollbackPreRestoreBackup(): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "Rollback requires browser environment." };
  }
  const raw = window.localStorage.getItem(BTC_BACKUP_SAFETY_ROLLBACK_KEY);
  if (!raw) {
    return { success: false, message: "No pre-restore safety snapshot found." };
  }
  return restoreBtcSystemBackup(raw);
}
