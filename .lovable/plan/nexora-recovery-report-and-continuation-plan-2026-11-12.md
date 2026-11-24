# NEXORA — Recovery Report and Continuation Plan

## 1. Context recovered

- Recovered: the approved plan (revised, incl. final decisions and the customizable-navigation requirement), roadmap.md, a summary of the previous build turn, all project files, the live database structure, and test results.
- Not recoverable: the word-for-word earlier chat (only a summary survives) and an exact "last saved version" marker. The audit below therefore uses the code and database as the source of truth.
- No sign of half-written files: the app builds, no runtime errors are recorded, and all 6 existing checks pass.

## 2. Status table

| Area                                                                             | Status                                                                                                                                                      | Evidence                               |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Design system (dark default, light, tokens, Sora/Manrope/Plex Arabic)            | Implemented, not verified visually                                                                                                                          | styles.css, __root.tsx                 |
| Branding / logo / app icons                                                      | Implemented, not verified                                                                                                                                   | Logo.tsx, public icons                 |
| Navigation (config-driven sidebar, collapsible, mobile floating bar, More sheet) | Implemented, not verified                                                                                                                                   | config/navigation.ts, components/nav/* |
| EN/AR + RTL switching                                                            | Partially implemented (dictionary covers shell only, ~60 keys; module text English)                                                                         | i18n-dict.ts, preferences.tsx          |
| PWA manifest + icons                                                             | Implemented, not verified                                                                                                                                   | manifest.webmanifest                   |
| Offline mode / service worker                                                    | Not implemented                                                                                                                                             | no service worker                      |
| Landing, privacy, terms, safety pages                                            | Implemented, not verified (legal text needs your review)                                                                                                    | routes/*.tsx                           |
| Sign-in email + Google, password reset                                           | Implemented, not verified end-to-end                                                                                                                        | auth.tsx, reset-password.tsx           |
| Onboarding (DOB 13+, region, consent)                                            | Partially implemented (no goals, subjects, accessibility steps)                                                                                             | onboarding.tsx                         |
| Profiles, roles table, has_role, security rules                                  | Implemented, not verified by tests                                                                                                                          | database                               |
| Growth Map engine (events, XP rules, daily caps, levels, streaks)                | Implemented, not verified against live data                                                                                                                 | record_activity, tg_growth, xp_rules   |
| Growth Map dashboard                                                             | Partially implemented (level/streak card only; empty state)                                                                                                 | app.index.tsx, ProgressCard.tsx        |
| Settings page                                                                    | UI only — placeholder page                                                                                                                                  | app.settings.tsx                       |
| Accessibility (font size, dyslexia, contrast, reduced motion)                    | Partially implemented: styles exist, saved only in the browser, no control page; dyslexia option changes spacing only, not font; user_settings table unused | preferences.tsx, styles.css            |
| Read-aloud, voice input                                                          | Not implemented                                                                                                                                             | —                                      |
| Study (subjects, notes, mistakes)                                                | Database ready, page is placeholder                                                                                                                         | app.study.tsx                          |
| Flashcards, quizzes, note files                                                  | Not implemented (no tables)                                                                                                                                 | —                                      |
| Productivity (tasks, focus sessions, goals)                                      | Database ready, page is placeholder                                                                                                                         | app.tasks.tsx                          |
| Calendar, reminders                                                              | Not implemented                                                                                                                                             | —                                      |
| NEXORA AI                                                                        | Placeholder page; no chat tables or AI calls                                                                                                                | app.ai.tsx                             |
| Level Up (badges, skill tree, challenges)                                        | Placeholder; only XP/levels exist                                                                                                                           | app.level-up.tsx                       |
| Care, Future, Knowledge Circle, Opportunity Radar                                | Placeholder pages, no tables                                                                                                                                | app.*.tsx                              |
| Admin & moderation, audit log                                                    | Not implemented (roles exist only)                                                                                                                          | —                                      |
| Notifications / Web Push                                                         | Not implemented                                                                                                                                             | —                                      |
| Data export / delete account                                                     | Not implemented                                                                                                                                             | —                                      |

No buttons pretend to work: placeholder pages clearly say "coming in the next step".

## 3. Unfinished or interrupted work

- Roadmap steps 1–3 are mostly done but never marked or verified; step 4 onward not started.
- Onboarding missing goals/subjects/accessibility steps.
- Accessibility choices not saved to the account and not adjustable anywhere.
- Arabic translations only cover the shell.
- No in-browser end-to-end check was ever run.

## 4. Risks

- Data loss: low — no destructive changes are planned; all new database work is additive.
- Secrets: none missing for current features. AI uses the built-in Lovable AI key; Web Push will need generated keys later.
- Security: rules exist on every table; XP and stats can only be written by the server. Moderator access to private data must be designed carefully when admin is built.
- Legal: privacy/terms/safety text and crisis hotline numbers need your confirmation.
- Navigation will be restyled from your references — keep changes inside the config and nav building blocks.

## 5. Prioritized continuation plan (one phase per request)

**Phase A — Verify and document (first, small)**

- Create NEXORA_BUILD_STATUS.md with this audit; update roadmap.md checkboxes.
- Browser check: sign up, onboarding (under-13 refusal, consent), reach dashboard, switch Arabic/light mode, mobile and desktop nav.
- Fix anything found broken. Accept: flow works end to end with screenshots.

**Phase B — Settings + Accessibility**

- Real Settings page: profile, language, region, theme, font size, dyslexia font (real dyslexia-friendly font), contrast, reduced motion, AI context toggles, notification toggles — saved to the account (user_settings) and synced to the interface.
- Accept: each control visibly changes the app and persists after reload. Test: browser check + unit test for settings mapping.

**Phase C — Productivity**: tasks (create/edit/complete/priority/due), focus timer logging sessions, goals. Accept: completing a task raises XP once, respecting daily cap. Test: database check + browser flow.

**Phase D — Study**: subjects, notes, mistake log; then flashcards with spaced repetition (new tables). Accept: actions add XP; weak topics listed.

**Phase E — Growth Map dashboard**: life areas, goals progress, recent activity, weak topics, next steps from real data only.

**Phase F — Navigation restyle** from your reference images.

**Phase G — NEXORA AI**: saved chats, streaming, context permissions, "add as task/flashcards", safety rules, language-aware answers.

**Phase H onward**: Notifications + Web Push, Knowledge Circle, Admin & moderation, Opportunity Radar (researched real listings), Level Up/Care/Future completion, read-aloud/voice, full Arabic text, offline mode, data export/delete, security scan and permission tests, final responsive QA.

## Technical notes

- Stack: TanStack Start, Lovable Cloud (auth, database), Tailwind v4 tokens. Server-side XP via record_activity + triggers on tasks/focus_sessions/notes/mistakes/goals.
- Preferences currently in localStorage (preferences.tsx); Phase B adds sync with user_settings without removing local fallback.
- Tests: src/test/growth.test.ts (age/levels), app-routing.test.tsx — all passing.
