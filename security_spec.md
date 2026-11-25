# NEXORA Security Specification (Firestore Rules)

## 1. Data Invariants

1. **Default Deny**: No collection outside explicitly defined user-owned paths is readable or writable.
2. **Strict Owner Isolation**: Every `profiles/{userId}`, `user_settings/{userId}`, `user_stats/{userId}`, `tasks/{taskId}`, `goals/{goalId}`, and `activity_events/{eventId}` document belongs exclusively to `request.auth.uid`.
3. **Verification Gate**: Email/password accounts with `email_verified == false` are denied reads and writes until verified. Google (`email_verified == true`), Phone (`sign_in_provider == 'phone'`), and Anonymous (`sign_in_provider == 'anonymous'`) sessions are eligible only for their own `request.auth.uid`.
4. **Immutable Ownership & IDs**: Document `id`, `user_id`, and `created_at` cannot be reassigned or altered after creation.
5. **Bounded Types & Sizes**: Every string field enforces strict `.size()` bounds; numeric XP/level/font_scale fields enforce sane ranges; unknown shadow keys are rejected via `hasOnly(...)`.
6. **Immutable Activity Log**: Once written by the owning user, `activity_events` cannot be mutated or forged to inflate XP (`xp <= 100` per event).
7. **Quran Mushaf Preferences, Bookmarks & Progress Isolation**: `quran_preferences/{userId}` documents contain only non-sensitive reading/listening preferences (`last_surah`, `last_ayah`, `last_position_seconds`, `preferred_reciter_id`, `playback_rate`, `volume`, `muted`, `repeat_mode`, `font_size_step`, `reading_theme`, `line_spacing`, `reading_width`, `show_verse_markers`, `show_translation`, `translation_id`, bounded `bookmarks` max 50 items, bounded `reading_history` max 20 items, `save_enabled`, `updated_at`), strictly owned by `request.auth.uid == userId` with strict key whitelists and range/list bounds.
8. **Legacy Initiatives & Smart Planner Security**: `smart_study_plans/{userId}` is strictly owner-isolated (`request.auth.uid == userId`). `community_resources` and `teaching_guides` enforce moderation queues (`pending_review` / `supervisor_approved == false` on student/educator create unless staff) and zero deletion by non-admins. `real_world_projects` require `adult_supervised == true`, start as `draft`/`in_progress`, and exclude personal student PII. `content_error_reports` are isolated to the reporter and staff. `exam_questions` require authenticated eligibility with strict schema validation.
9. **Legacy Initiatives & Smart Planner Security**: `smart_study_plans/{userId}` is strictly owner-isolated (`request.auth.uid == userId`). `community_resources` and `teaching_guides` enforce moderation queues (`pending_review` / `supervisor_approved == false` on student/educator create unless staff) and zero deletion by non-admins. `real_world_projects` require `adult_supervised == true`, start as `draft`/`in_progress`, and exclude personal student PII. `content_error_reports` are isolated to the reporter and staff. `exam_questions` require authenticated eligibility with strict schema validation.
10. **Productivity Time Blocks Isolation**: `time_blocks/{blockId}` documents are strictly owner-isolated (`user_id == request.auth.uid`) with bounded schedule string lengths and immutable `id`/`user_id`/`created_at`.
11. **Shared Knowledge Circle Security**: `community_posts/{postId}`, `community_posts/{postId}/comments/{commentId}`, and `community_posts/{postId}/reactions/{userId}` are shared among all authenticated sessions (`isEligibleUser()`), enforcing author ownership (`author_id == request.auth.uid`) for edits/deletes, unique per-user reactions (`reactions/{userId}`), Master Gate `exists()` parent checks, and zero PII fields. `users/{userId}/saved_posts/{postId}` is strictly private (`isOwner(userId)`).

## 2. Dirty Dozen Attack Payloads (Must Return PERMISSION_DENIED)

1. Unauthenticated read of `/profiles/uidA`.
2. Unauthenticated list of `/tasks`.
3. Unverified email/password user (`email_verified: false`) creating `/profiles/uidA`.
4. Authenticated user `uidB` reading `/profiles/uidA` or `/user_stats/uidA` or `/quran_preferences/uidA`.
5. Authenticated user `uidB` querying `/tasks` or `/quran_preferences` without owner filter.
6. Authenticated user `uidA` creating `/tasks/t1` with `user_id: "uidB"` (Identity spoofing).
7. Authenticated user `uidA` creating `/profiles/uidA` or `/quran_preferences/uidA` with an injected shadow field `isAdmin: true`.
8. Authenticated user `uidA` updating `/profiles/uidA` to change `id` to `"uidB"`.
9. Authenticated user `uidA` creating `/tasks/t1` with a 5,000-char `title` (Resource poisoning).
10. Authenticated user `uidA` creating `/activity_events/e1` with `xp: 999999` (XP inflation), or `/quran_preferences/uidA` with `last_surah: 999` or >50 bookmarks.
11. Authenticated user `uidA` updating `/activity_events/e1` (Immutable audit log violation).
12. Authenticated user `uidA` creating `/tasks/invalid$id!` with invalid path characters (`isValidId` guard).
