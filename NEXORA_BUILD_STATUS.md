# NEXORA / BTC — Engineering Build Status & Prompt 2 Recovery Audit

> **Recovery Disclosure**: During Prompt 2 continuation after conversation compaction, the verbatim full text of original PROMPT 2 (`User Request #7`) was partially truncated in history context. This status document reflects direct inspection of the actual codebase, schemas, security rules, build artifacts, and verified runtime tests.

---

## 1. Current Platform Overview

- **Active Brand Mode**: `ACTIVE_BRAND_MODE = "BTC"` (`BTC — BE THE CHANGE`) configured cleanly via `/src/config/brand.ts` and reversible to `"NEXORA"` via a single config switch.
- **Stack**: React 19 + TanStack Start / Vite (`server.ts` Express wrapper + `/api/ai` Gemini proxy), Firebase Authentication (Email/Password, Google OAuth, Phone OTP, Anonymous Guest), Cloud Firestore with owner/member-scoped security rules (`firestore.rules`), Recharts visualizations, Vitest + Node `--test` pure suites.
- **Visual Assets (Vite Static Imports)**:
  - Bespoke BTC architectural emblem: `src/assets/images/btc_brand_logo_1794844158108.jpg` (`Logo.tsx`)
  - Landing showcase hero illustration: `src/assets/images/btc_hero_showcase_1794844160324.jpg` (`src/routes/index.tsx`)
  - Knowledge Circle header banner: `src/assets/images/btc_rooms_hero_1794829234198.jpg` (`CircleWorkspace.tsx`)

---

## 2. Module & Prompt 2 Status Matrix

| Area                                                                   | Status               | Evidence & Notes                                                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth, Session Restore Guard, 13+ Verification                          | Implemented & Tested | `firebase-auth.ts`, `auth-state.ts`, `ProtectedRoute.tsx`, `/auth`, `/auth/verify`, `/auth/callback`                                                                      |
| Onboarding (13+ Gate, Consent, Subjects, Comfort/A11y)                 | Implemented          | `src/routes/_authenticated/onboarding.tsx` saves DOB, age band, region, grade, preferred subjects, starter mode, dyslexia/read-aloud prefs                                |
| Growth Map + Radar + 7-Day XP Velocity                                 | Implemented & Tested | `GrowthMapExperience.tsx`, `GrowthRadarChart.tsx`, `XpVelocityChart.tsx`, `growth.ts`                                                                                     |
| Daily Pulse Widget (Mood, Energy, Stress + 7-Day Trend)                | Implemented & Tested | `DailyPulseWidget.tsx`, `computeWeeklyPulseSummary` saving privately to Firestore `care_entries` (excluded from AI prompts)                                               |
| Weekly Objectives Board (6 Growth Categories)                          | Implemented & Tested | `WeeklyObjectivesBoard.tsx`, `computeWeeklyObjectivesBoard` persisted in `goals` (`is_daily: false`) with dynamic activity bars                                           |
| Badges & Milestones Roadmap                                            | Implemented & Tested | `MilestonesGrid.tsx` wired to live stats, Daily Pulse 7-day consistency, journals, and quiz attempts                                                                      |
| Productivity (Tasks, Priorities, Subtasks, Pomodoro, Calendar)         | Implemented & Tested | `app.tasks.tsx`, `PomodoroTimerWidget.tsx`, `InteractiveCalendar.tsx`                                                                                                     |
| Study Hub (Notes, Flashcards, Mistakes, Quiz, Unit 3 Vocab)            | Implemented & Tested | `app.study.tsx`, `Unit3VocabWorkspace.tsx`, `revision-scheduler.ts`, `learning-recovery.ts`                                                                               |
| AI Companion & Structured Study Aids                                   | Implemented & Tested | `app.ai.tsx`, `server.ts`, `src/lib/ai.server.ts` (server-side Gemini calls, private Care isolation enforced)                                                             |
| Wellbeing Care, Daily Journal, Future Planner, Opportunities           | Implemented & Tested | `app.care.tsx`, `DailyJournal.tsx`, `app.future.tsx`, `app.opportunities.tsx`                                                                                             |
| Knowledge Circle (Teams, Invite Codes, Post Create/Edit/Delete)        | Implemented          | `CircleWorkspace.tsx`, `use-modules.ts`, `firestore.rules`                                                                                                                |
| Help Center, FAQ Accordion, Support Tickets & Admin Control            | Implemented & Tested | `HelpCenter.tsx`, `AdminHelpEditor.tsx`, `AdminTicketManager.tsx`, `AdminModerationManager.tsx`, `support-service.ts`                                                     |
| Ready-to-Use Library, Simplified/Advanced Toggle & 24-Theme Studio     | Implemented          | `ReadyToUseLibraryModal.tsx`, `ThemeGalleryModal.tsx`, `src/lib/theme-catalog.ts`, `app.settings.tsx`                                                                     |
| Accessibility (Dyslexia Font, Scale, Read-Aloud, Voice, High Contrast) | Implemented & Tested | `preferences.tsx`, `accessibility-assistant.ts`, Web Speech integration                                                                                                   |
| Full Offline Service Worker                                            | Implemented & Tested | `manifest.webmanifest`, `/public/sw.js` (TanStack-safe shell cache, offline fallback), `pwa.ts`, `registerServiceWorker()` mounted in `__root.tsx` and `app.settings.tsx` |

---

## 3. Recovery Fixes Applied in This Session

1. Upgraded `Logo.tsx`, `index.tsx` landing hero, and `CircleWorkspace.tsx` to use static ES imports for bespoke generated BTC artwork with `onError` resilient fallbacks.
2. Created `DailyPulseWidget.tsx` + `computeWeeklyPulseSummary` and mounted inside `GrowthMapExperience.tsx`.
3. Created `WeeklyObjectivesBoard.tsx` + `computeWeeklyObjectivesBoard` across all 6 growth categories and mounted inside `GrowthMapExperience.tsx`.
4. Wired `journalCount`, `quizCount`, and 7-day Daily Pulse consistency into `MilestonesGrid.tsx`.
5. Wired author-only post editing & deletion (`updateCirclePost`, `deleteCirclePost`) into `CircleWorkspace.tsx`.
6. Extended `onboarding.tsx` with multi-select Preferred Subjects and Workspace Starter Experience / Accessibility quick setup (`setA11y`).
7. Resolved strict TypeScript (`TS4111`, `TS2322`, `TS2339`, `TS2739`) errors across `ai.server.ts`, `use-nexora.ts`, `support-service.ts`, `app.admin.tsx`, `onboarding.tsx`, `platform-innovation-pure.node-test.ts`, and `ui-features.test.tsx`.
