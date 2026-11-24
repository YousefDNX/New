# NEXORA — Implementation Plan (Revised)

A unified AI-powered student platform. The **Growth Map** is the core system: every module reads from it and writes to it.

## 1. Growth Map — the central system

```text
                    +-------------------------+
                    |       GROWTH MAP        |
                    | goals, skills, XP, level|
                    | streaks, milestones,    |
                    | strengths & weak areas  |
                    +-----------+-------------+
          activity events  ^    |   context + next steps
   +-------+-------+-------+----+---+-------+-------+-------+
 Study  Productivity LevelUp  Care  Future Circle  Radar  Access/Global
                         |
                   NEXORA AI (reads the whole map)
```

- Each meaningful action (task done, focus session, quiz, mistake fixed, team contribution, opportunity applied, career goal step) is saved as an **activity event**.
- A server-side engine turns events into XP, skill progress, streaks and milestones (rules stored in the database, not the browser, so they can't be faked).
- The map shows life areas (Academic, Skills, Wellbeing, Career, Community), goals with progress, weak topics, and recommended next steps.
- Every module page shows a "Growth" strip linking back to the map. Care contributes only a private check-in streak — never mood details.

## 2. Modules

1. **NEXORA AI** — general-purpose assistant for any student need: studying, writing, planning, careers, life skills, coding, languages. Context-aware (profile, goals, Growth Map, tasks, weak topics) with a user toggle controlling what it can see. Saved chats, file/image questions, streamed answers, actions ("add as task", "make flashcards"). Age-aware safety; wellbeing topics routed to safe responses.
2. **Study** — subjects, notes with attachments, flashcards (spaced repetition), AI quizzes, mistake log with AI analysis of recurring weak topics feeding the Growth Map.
3. **Productivity** — tasks, calendar, reminders, Pomodoro focus timer with logged sessions.
4. **Level Up** — XP, levels, badges, skill tree, weekly challenges.
5. **Care** — mood check-ins, private journal, breathing exercises, supportive AI chat with crisis detection showing hotlines (Kuwait/GCC + international). Never diagnoses.
6. **Future** — strengths/interest quiz, career explorer, AI roadmaps, career goals on the map.
7. **Access** — font size, dyslexia-friendly font, high contrast, reduced motion, read-aloud, voice input, full keyboard navigation.
8. **Global** — English default, Arabic with complete RTL (mirrored layout, icons, dates, numbers), AI answers in the user's language, region setting (Kuwait, GCC, Global).
9. **Knowledge Circle (collaboration)** — teams with roles; **realtime team messaging** (per team and per project); **task assignment** (assignee, due date, status); **shared resources** (files, links, notes); **project progress** (completion %, milestones, activity feed, contributions); public Q&A posts with comments and votes; report button on everything.
10. **Opportunity Radar** — scholarships, competitions, internships, programs, courses. Each listing: organizer, region/country, **deadline**, **eligibility** (age, grade, nationality, GPA, language), cost, **external link**, source, **verified badge + last-verified date**. Filters (Kuwait/GCC first), save, deadline reminders, "matches you" from profile. Workflow: submitted -> moderator review -> verified; scheduled link check flags broken links; expired listings auto-hide.

## 3. Admin & moderation dashboard (role-based)

Roles in a separate table: student, moderator, admin.

- **Overview**: users, active today, pending reports, pending opportunities.
- **Reports queue**: content preview, reason, actions (dismiss, hide, delete, warn, suspend).
- **Content**: posts, comments, resources; team messages only when reported.
- **Opportunities**: create, edit, verify, link status, expire.
- **Users**: search, assign roles (admin only), suspend, age flags.
- **Audit log** of every admin action; keyword filter + AI pre-screening of new posts.
- Moderators never see private data (journal, mood, private notes, AI chats).

## 4. Notifications

- **In-app center** (realtime, owner-only).
- **Device push** via Web Push (free; keys stored as secrets): reminders, deadlines, task assignments, mentions, report outcomes. Works on Android/desktop; iPhone only after adding to Home Screen (iOS 16.4+).
- Scheduled server job sends due reminders and deadline alerts.
- Per-category settings and quiet hours; no sensitive content in push text.

## 5. Privacy & age-appropriate safety (platform-wide)

- Date of birth at signup -> age band (13–15, 16–17, 18+).
- Minors: no messaging strangers — chat only inside joined teams; private profiles by default; no contact/location shown; stricter content filter.
- Private by default: journal, mood, notes, AI chats are owner-only.
- AI: age-aware rules, refusal of harmful topics, crisis routing.
- Data controls: export data, delete account, clear AI history, choose what AI sees.
- Security rules on every table, private file storage with expiring links, rate limits, no API keys in the browser.

## 6. Pages

```text
/                  landing (EN/AR)
/auth, /reset-password
/onboarding        age, region, language, goals, subjects, accessibility
/app               dashboard + Growth Map
/app/ai  /app/study  /app/tasks  /app/level-up  /app/care  /app/future
/app/circle        feed, teams, team/:id (chat, tasks, resources, progress)
/app/opportunities  /app/opportunities/:id
/app/notifications  /app/settings
/admin             overview, reports, content, opportunities, users, audit log
/privacy  /terms  /safety
```

Mobile bottom tabs (Home, Study, Tasks, AI, More); desktop sidebar. Fully mirrored in Arabic.

## 7. Design

Dark-first premium: deep navy-black base, electric teal accent, warm amber for XP, soft glass cards. Fonts Sora + Manrope; Arabic IBM Plex Sans Arabic. Light mode toggle; all colors as theme tokens.

## 8. Database (main tables)

```text
profiles, user_roles, user_settings (privacy, a11y, ai_context, notifications)
growth_areas, goals, skills, user_skills, activity_events, xp_rules, xp_ledger,
  levels, badges, user_badges, streaks, challenges
subjects, notes, note_files, decks, flashcards, quizzes, quiz_attempts, mistakes
tasks, events, reminders, focus_sessions
mood_checkins, journal_entries (owner-only)
careers, career_goals, roadmaps
ai_conversations, ai_messages
teams, team_members, team_messages, projects, project_tasks, project_milestones,
  shared_resources, posts, comments, votes
opportunities, opportunity_submissions, saved_opportunities
notifications, push_subscriptions
reports, moderation_actions, audit_log, blocked_words
```

## 9. Built-in vs external

**Built in (free / low cost, no extra accounts)**

- Database, sign-in (email + Google), file storage, realtime chat, scheduled jobs — Lovable Cloud.
- AI assistant, quizzes, analysis, translation, moderation screening — Lovable AI (usage-based, monthly free credits).
- Read-aloud and voice input — browser built-in.
- Installable PWA, in-app notifications, Web Push.

**Needs external input or setup**

- Real opportunities: no free API covers Kuwait/GCC. Plan: I research and seed ~30 real verified listings with links; moderators maintain them; optional feeds later.
- Email notifications: optional, needs a verified domain.
- Crisis hotlines: I compile them; you confirm local numbers.
- App Store / Play Store apps: out of scope (PWA instead).

## 10. Demo data

Real opportunities (Kuwait/GCC + global), ~30 careers, badges, challenges, XP rules, a demo team with messages/tasks/resources, community posts, a demo student and demo moderator.

## 11. Recommended build order

1. **Foundation & PWA** — design system, dark/light, EN/AR with full RTL, navigation, installable manifest + icons, landing/privacy/safety pages.
2. **Accounts & safety core** — sign-in, onboarding (age, region, goals), profiles, roles, settings, privacy controls, security rules.
3. **Growth Map engine** — events, XP rules, skills, goals, dashboard (before modules so each plugs in).
4. **Productivity + Study** — all emitting Growth events.
5. **NEXORA AI** — general assistant, context controls, actions, safety.
6. **Notifications** — in-app center, Web Push, scheduled reminders.
7. **Knowledge Circle** — teams, messaging, assignments, resources, progress, posts, reporting.
8. **Admin & moderation dashboard**.
9. **Opportunity Radar** — verified listings, eligibility matching, deadlines, link checks.
10. **Level Up, Care, Future, Access** — completion and polish.
11. **Hardening** — security scan, tests for permissions/XP/age rules, offline mode for the installed app, publish.

## 12. Final decisions

- Minimum age 13+; age-band protections; parental consent step for regions that legally require it.
- Offline mode: yes — saved tasks and notes readable (task edits queued) offline in the published, installed app.
- Community: registered students only, strict moderation; private team messaging only between members of joined teams.
- Moderation: admins plus appointed trusted moderators.
- No paid plans at launch.

## 13. Navigation design

- **Desktop**: compact refined sidebar — grouped sections (Core: Home/Growth Map, AI; Learn: Study, Future; Do: Productivity, Circle, Radar; Self: Level Up, Care), icon + label rows with accent glow pill on the active item, collapsible to icon rail, mini XP card and profile at the bottom, quick search (Ctrl+K).
- **Mobile**: floating rounded bottom bar with 4 tabs and a raised central AI button; "More" opens a compact icon-grid sheet for the other modules. 44px touch targets, safe-area aware, mirrored in Arabic.
- Not final: refined when you share visual references.
- **Built to be changed easily**: one navigation settings file defines the items, groups, icons and order; separate design settings control sizes, spacing, corner shapes, colors, blur and layout style (e.g. full sidebar vs icon rail, floating vs docked mobile bar). The sidebar, mobile bar and "More" sheet are reusable building blocks that read those settings, so restyling never means rewriting pages.

## 14. First implementation step (Steps 1 + 2)

1. Design system: dark/light themes, fonts (incl. Arabic), color tokens, reusable cards, buttons, badges, empty states.
2. App shell: desktop sidebar + mobile bottom bar, theme toggle, EN/AR switch with full RTL.
3. Installable PWA: manifest, icons, offline support for the published app.
4. Public pages: landing, privacy, terms, safety.
5. Lovable Cloud: sign-in (email + Google), password reset, profiles, separate roles table, settings, security rules on every table.
6. Onboarding: date of birth (13+ check), region, language, goals, subjects, accessibility — saved to the database.
7. Tests for age gating and permission rules.

Then Step 3 (Growth Map engine) and Step 4 (core modules) follow, continuing through the roadmap. A roadmap.md task list is created at the start of building.
