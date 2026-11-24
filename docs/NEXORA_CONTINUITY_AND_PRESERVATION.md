# NEXORA Continuity, Knowledge Preservation & Sustainability Guide

> **Tagline:** Study. Focus. Grow.  
> **Scope:** Long-term operational, technical, content-governance, and ethical continuity reference for maintainers, educators, and successor stewards of the NEXORA 20-module platform.  
> **Security Notice:** This document contains **zero secrets, API keys, service credentials, or personal user records**.

---

## 1. System Architecture Overview

- **Frontend Application (`src/`):** React + TypeScript + Vite SPA using TanStack Router (`src/routes/`) and Tailwind CSS v4 Aurora Glass styling (`src/index.css`).
- **Canonical 20-Module Catalog (`src/config/modules-catalog.ts`):** Defines Modules `01` through `20` plus the non-module `GROWTH_MAP_ORCHESTRATOR` connecting academic mastery, focus, wellbeing, careers, global culture, Quranic study, and community impact.
- **Server Proxy (`server.ts`):** Express server serving Vite middlewares in development (`npm run dev`) and static assets in production (`npm run build` / `npm start`), keeping server-side secrets (such as `GEMINI_API_KEY`) strictly out of browser bundles.
- **Client Persistence & Sync (`src/lib/firestore-data.ts`, `src/lib/student-ecosystem.ts`):**
  - **Cloud Firestore (`firestore.rules`):** Enforces owner-scoped reads/writes for profiles, stats, tasks, goals, study items, quizzes, focus sessions, and care entries, plus role-based admin/staff moderation (`admin` / `teacher` / `moderator` roles).
  - **Browser Local Storage (`btc.student_ecosystem.v1.<uid>`):** Stores offline study packs, simulation progress, open-library status overrides, foundational track progress, error report queues, volunteer contribution drafts, and verified backup metadata.

---

## 2. Content Governance, Metadata & Verification Workflow

Educational items in `src/data/open-learning-library.ts` follow a structured metadata schema (`KnowledgeResource`) evaluated by pure logic in `src/lib/legacy-knowledge.ts`:

- **Mandatory Metadata Fields:** `authorOwner`, `sourceReferences[]`, `publicationDate`, `lastReviewedDate`, `reviewStatus` (`draft` | `under_review` | `approved` | `needs_correction` | `outdated` | `archived`), `reviewIntervalDays`, `license`, `isDownloadablePermitted`, `warningsLimitations[]`, and `correctionHistory[]`.
- **Review Cadence & High-Stakes Lock:** High-stakes items (medical/first-aid literacy, lab safety) enforce shorter 90–180 day review cycles (`isResourceDueForReview`) and remain download-locked (`Attribution-Reference-Only` / `under_review`) until qualified human verification completes.
- **Public Error Reporting & Resolution:** Any learner can flag factual, broken-link, outdated, copyright, accessibility, or safety issues in **Module 19 (`KnowledgeToolsPanel.tsx`)**. Validated reports immediately transition the item to `needs_correction` locally and appear in the **Educator Studio (`TeacherCollaborationCenter.tsx`)** moderation queue for staff review and `correctionHistory` logging.

---

## 3. Domain Authenticity & Safety Boundaries

1. **Quran & Islamic Learning (Module 17 — `QuranWorkspace.tsx`, `src/lib/quran.ts`):**
   - Displays verified Uthmani Mushaf text and verified translations/reciters strictly from `QURAN_TEXT_ATTRIBUTION` APIs without AI alteration or verse fabrication.
   - AI features are **strictly prohibited** from inventing Quran verses, fabricating hadiths, generating scholarly quotes, or issuing religious rulings (fatwas).
   - Foundational study notes (`ISLAMIC_FOUNDATIONS_INDEX`) cite classical sources explicitly and note that complex religious questions require qualified human scholars.
2. **Health Literacy & Emergency Awareness (Module 07 — `CareWorkspace.tsx`):**
   - Explicitly marked as requiring qualified healthcare professional review (`requiresQualifiedReview: true`).
   - Displays prominent disclaimers stating educational cards never diagnose or replace emergency services (`112` / `999` / `911`) or certified medical care.

---

## 4. Knowledge Preservation, Backups & Recovery Verification

- **Checksum-Verified Export & Restore (`src/lib/legacy-knowledge.ts`):**
  - `createVersionedEcosystemBackup(state, activeUid)` serializes user state under schema `nexora.legacy.backup.v1` with an integrity checksum (`fnv64_<hex>`).
  - `verifyAndRestoreBackup(rawJson)` recomputes the checksum before permitting restoration into `restoreStudentEcosystemState(...)`, rejecting corrupted or tampered JSON files cleanly.
- **Accessible Locations:** Available both in **Dashboard → Legacy & Impact (`NexoraLegacyHub.tsx`)** and **Care → Student Privacy & Data Inventory (`StudentPrivacyCenter.tsx`)**.
- **Firestore & Deployment Backups (Infrastructure Level):** Maintainers should configure scheduled Firestore managed exports in Google Cloud / Firebase Console targeting a locked GCS bucket outside the public repository.

---

## 5. Administrator Succession & RBAC Continuity

- **Zero Single-Point Lockout:** Avoid relying on a single personal developer email for project ownership. Maintain at least two trusted institutional or co-steward owners on Firebase Console, GitHub repository administration, and deployment secrets.
- **RBAC Enforcement (`src/hooks/use-rbac.ts`, `firestore.rules`):** Staff/educator moderation tools are separated from student views both in UI controls and Firestore security rules. Never commit hardcoded admin UIDs, passwords, or service account JSON files into Git.
- **Documentation & Environment Variables (`.env.example`):** Only variable names belong in `.env.example`; real API keys live strictly in runtime environment secrets (`GEMINI_API_KEY`, etc.).

---

## 6. Ethical Sustainability & Privacy-Preserving Impact Measurement

- **Free Core Access:** Foundational tracks, literacy access tools, open educational library guides, and focus/accessibility utilities remain completely free without ad trackers, paywalls on core study needs, or minor-targeted monetization.
- **Anti-Inflation Impact Ledger (`computePrivacySafeImpactMetrics`):** Impact indicators count **verifiable learning actions only** (foundational checks passed, learning gaps resolved, completed tasks/quizzes/focus blocks, offline packs ready, supervised community plans, approved volunteer edits, resolved corrections) with zero PII and zero page-view inflation.
