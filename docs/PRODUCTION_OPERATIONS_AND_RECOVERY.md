# BTC — Production Operations, Recovery & Recitation Verification Guide

**Platform:** BTC — BE THE CHANGE (`YousefDNX/DNX-Project`)  
**Updated:** 2026-11-18

---

## 1. Architecture Summary

- **Frontend Framework:** React 19 + TanStack Router/Start + Vite + Tailwind CSS v4.
- **Client State & Offline Data:**
  - Embedded **King Fahd Complex Uthmani Mushaf** (`src/lib/quran-mushaf.ts`): 114 Surahs, 604 pages, zero network dependency.
  - **Global Quran Reciters Directory** (`src/lib/quran-reciters-directory.ts`): 23 countries, 67 reciters, 105 verified editions, 10,648 chapter streams, zero fabricated links, strict playback speed lock (`1.0x`).
  - **Recitation Styles & Vocal Characteristics** (`src/lib/quran-recitation-styles.ts`): Strictly separates Traditional Liturgical Formats (`murattal`, `mujawwad`, `tarteel`, `muallim`, `archive`) from Emotional/Spiritual traits (`khushu`, `tearful`, `deeply_moving`, etc.), Vocal Qualities, and 12 verified listener-recognized Reciter Signatures (including Sheikh Mohammed Al-Luhaidan's **النبرة اللحيدانية**).
- **Cloud Persistence:** Firebase Auth + Cloud Firestore (`nexora-me` / DB `ai-studio-dnxproject-4308e372-bc2d-45f5-ab17-5fa290c703fd`).

---

## 2. Authentication, Security & Firestore Rules Deployment Prerequisite

### Local Schema vs. Deployed Project (`nexora-me`)

- Client settings writes (`src/hooks/use-settings.ts`, `defaultSettingsDoc(uid)`) emit an exact **84-key** validated payload matching `firestore.rules` `isValidUserSettings` (`hasAll`/`hasOnly`).
- **Known External Prerequisite:** Because the Firebase project `nexora-me` (`firebase-applet-config.json`) is externally owned outside this runtime sandbox, automated `deploy_firebase` calls return `The caller does not have permission`. Until the project owner (`alshbrawe7373@gmail.com`) deploys the updated `firestore.rules` via Firebase CLI:
  ```bash
  firebase deploy --only firestore:rules
  ```
  anonymous/newly authenticated users writing `user_settings/{uid}` against stale remote rules will receive `Missing or insufficient permissions` (surfaced transparently via `handleFirestoreError` without suppression).

### Data Privacy & Security Boundaries

- `firestore.rules` enforces strict Zero-Trust ABAC (`isOwner(userId)`, immutability on `created_at`/`user_id`, valid field schemas).
- Personal care/emotional entries remain client-side or owner-scoped.
- Observability logger (`src/lib/observability.ts` → `scrubPii`) strips emails, JWT/Bearer tokens, Google API keys (`AIzaSy...`), secret query params, and E.164 phone numbers prior to writing into the in-memory runtime diagnostics buffer.

---

## 3. Backup, Restore & Rollback Recovery Runbook

Implemented in `src/lib/backup-recovery.ts` and exposed in **Student Privacy & Data Inventory Center** (`src/components/care/StudentPrivacyCenter.tsx`):

1. **Export Verified Snapshot:**
   - Captures `btc_quran_reciter_directory_state_v1`, `btc_islamic_center_learning_v1`, `btc_recitation_style_overrides_v1`, `nexora:prefs:appearance`, `nexora:prefs:a11y`, and `nexora:prefs:ui-mode`.
   - Generates a deterministic CRC-style integrity checksum (`btc_crc_<8hex>`) over serialized `data`.
2. **Verify & Restore Backup JSON:**
   - `validateBtcBackupPayload` checks application origin (`"BTC — BE THE CHANGE"`) and recalculates the checksum before mutating any browser storage key. Tampered or truncated files are rejected immediately.
   - Before writing restored keys, `restoreBtcSystemBackup` snapshots the pre-restore state under `btc_backup_safety_rollback_v1`.
3. **One-Click Safety Rollback:**
   - Calling `rollbackPreRestoreBackup()` (or clicking **Rollback Last Restore** in the UI) reverts browser storage cleanly to the pre-restore snapshot.

---

## 4. Monitoring, Live Health Probes & AI Safety Guardrails

Implemented in `src/lib/observability.ts`, `src/lib/islamic-search.ts`, and `src/components/admin/AdminOverview.tsx`:

- **Live Subsystem Health Probes (`checkBtcEcosystemHealth`):**
  - Verifies read/write access on `localStorage`.
  - Confirms offline availability of the 604-page Mushaf index.
  - Performs bounded 3-second `HEAD` / `GET` checks against `cdn.mp3quran.net` and `api.quran.com/api/v4/resources/tafsirs`, automatically disclosing fallback status when external CDNs are unreachable.
- **Islamic & Academic AI Safety Quotas (`recordAiUsageEvent` / `getAiUsageMetrics`):**
  - Evaluates all queries against fatwa solicitation patterns (`fatwa_redirect`) and fabrication prompts (`fabrication_blocked`), preventing speculative AI answers on religious rulings.
  - Meters requests, blocked fatwa prompts, blocked fabrication attempts, and estimated tokens in `btc_ai_usage_stats_v1`.

---

## 5. Recitation Style Editorial Verification Policy

- No classification label is ever invented or inferred automatically via fake audio analysis.
- Unclassified recordings return `null` from `getEffectiveRecordingClassification` and display an explicit empty-state notice until human editorial review.
- Authorized users can adjust formats, emotional characteristics, vocal qualities, and bilingual notes in the Editorial Review modal (`QuranAudioPlayer.tsx`), persisting under `btc_recitation_style_overrides_v1` with instant reset-to-baseline support.

---

## 6. Automated Verification Commands

```bash
# 1. Pure Node tests (Directory referential integrity, styles, backups, PII scrubbing)
./node_modules/.bin/tsx --test src/test/islamic-directory.node.ts

# 2. Full Vitest React & UI test suite
npx vitest run

# 3. TypeScript & Vite production build verification
npm run build

# 4. ESLint code quality & import safety verification
npm run lint
```

---

## 7. External Dependencies & Disclosed Limitations

- **Audio CDNs (`cdn.mp3quran.net`, `server8.mp3quran.net`, `download.quranicaudio.com`):** Real audio streaming requires live client network connectivity to the upstream archives.
- **Classical Tafsir API (`api.quran.com/api/v4`):** Degrades gracefully to verified embedded thematic study guides (`src/lib/quran-tafsir.ts`) when offline or blocked.
- **Firebase Rules Deployment:** Must be pushed by the `nexora-me` project owner via `firebase deploy --only firestore:rules`.
