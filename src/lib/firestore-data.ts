import type { Lang } from "./i18n-dict";
import {
  defaultA11yFull,
  defaultAiPrefs,
  defaultAppearancePrefs,
  defaultLayoutPrefs,
  defaultLocalePrefs,
  defaultNotificationPrefs,
  defaultPrivacyPrefs,
  defaultStudyPrefs,
  defaultTypographyPrefs,
  type AccentPreset,
  type AnimationLevelPref,
  type BgStylePref,
  type BorderStylePref,
  type CardStylePref,
  type CornerPref,
  type DashboardTabPref,
  type DashboardWidgetId,
  type DensityPref,
  type FontFamilyPref,
  type FontWeightPref,
  type InterfaceTheme,
  type LayoutWorkspaceId,
  type ReadabilityPresetId,
  type ReadingLayoutPref,
  type ShadowLevelPref,
  type SidebarModePref,
  type ThemeMode,
} from "./settings";
import type { LayoutMode, UiMode } from "./theme-catalog";

export type AppRole = "admin" | "moderator" | "user";
export type GrowthArea =
  "academic" | "productivity" | "growth" | "wellbeing" | "career" | "community";
export type StudentGender = "male" | "female";
export type CommunityGroup = "boys" | "girls";

export function resolveCommunityGroup(
  gender: StudentGender | string | null | undefined,
  explicitGroup?: CommunityGroup | string | null | undefined,
): CommunityGroup | null {
  if (gender === "male") return "boys";
  if (gender === "female") return "girls";
  if (explicitGroup === "boys" || explicitGroup === "girls") return explicitGroup;
  return null;
}

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  language: Lang;
  region: "kuwait" | "gcc" | "global";
  date_of_birth: string | null;
  age_band: string | null;
  gender?: StudentGender | null;
  community_group?: CommunityGroup | null;
  show_gender_on_profile?: boolean;
  grade_level?: string | null;
  school_name?: string | null;
  preferred_subjects?: string[];
  learning_goals?: string | null;
  parental_consent: boolean;
  onboarded: boolean;
  is_anonymous: boolean;
  auth_provider: string;
  email_verified: boolean;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsRow {
  user_id: string;
  theme: ThemeMode;
  font_scale: number;
  dyslexia_font: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
  focus_ring?: boolean;
  simplified_ui?: boolean;
  clear_language?: boolean;
  read_aloud?: boolean;
  read_aloud_rate?: number;
  voice_input?: boolean;
  captions_preferred?: boolean;

  ui_theme?: InterfaceTheme;
  accent_color?: AccentPreset;
  custom_accent_hex?: string;
  density?: DensityPref;
  corner_style?: CornerPref;
  card_style?: CardStylePref;
  border_style?: BorderStylePref;
  shadow_level?: ShadowLevelPref;
  animation_level?: AnimationLevelPref;
  bg_style?: BgStylePref;
  font_family?: FontFamilyPref;
  heading_scale?: number;
  line_height?: number;
  letter_spacing?: number;
  font_weight?: FontWeightPref;
  readability_preset?: ReadabilityPresetId;
  layout_workspace?: LayoutWorkspaceId;
  sidebar_mode?: SidebarModePref;
  show_quick_actions?: boolean;
  reduce_visual_effects?: boolean;
  reading_layout?: ReadingLayoutPref;
  default_home_tab?: DashboardTabPref;
  dashboard_hidden_widgets?: DashboardWidgetId[];
  dashboard_widget_order?: DashboardWidgetId[];

  timezone?: string;
  date_format?: "auto" | "dmy" | "mdy" | "ymd";
  time_format?: "12h" | "24h";
  first_day_of_week?: "sunday" | "monday" | "saturday";
  calendar_type?: "gregorian" | "hijri";
  measurement_units?: "metric" | "imperial";
  opportunity_scope?: "local" | "gcc" | "global";

  study_explanation_lang?: "ui" | Lang;
  study_complexity?: "simple" | "balanced" | "advanced";
  study_detail_level?: "concise" | "standard" | "detailed";
  study_step_by_step?: boolean;
  study_examples_first?: boolean;
  study_visual_aids?: boolean;
  study_practice_questions?: boolean;
  study_flashcard_style?: "recall" | "spaced" | "cloze";
  study_quiz_difficulty?: "adaptive" | "foundation" | "challenge";
  study_session_minutes?: number;
  study_break_minutes?: number;
  study_revision_reminders?: boolean;

  ai_response_lang?: "ui" | Lang;
  ai_response_length?: "concise" | "standard" | "detailed";
  ai_tone?: "coach" | "calm" | "academic";
  ai_clarifying_questions?: boolean;
  ai_share_profile: boolean;
  ai_share_tasks: boolean;
  ai_share_growth: boolean;
  ai_remember_preferences?: boolean;
  ai_save_history?: boolean;
  ai_proactive_suggestions?: boolean;
  ai_notifications?: boolean;

  notify_reminders: boolean;
  notify_tasks?: boolean;
  notify_calendar?: boolean;
  notify_streak?: boolean;
  notify_opportunities?: boolean;
  notify_community: boolean;
  notify_teams?: boolean;
  notify_email_enabled?: boolean;
  notify_push_enabled?: boolean;
  notify_frequency?: "instant" | "daily" | "weekly";
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;

  keep_signed_in?: boolean;
  profile_visibility?: "private" | "team";
  show_in_circle?: boolean;

  ui_mode?: UiMode;
  theme_preset_id?: string | null;
  layout_mode?: LayoutMode;

  updated_at: string;
}

export interface QuranBookmarkRow {
  id: string;
  surah_id: number;
  ayah_number: number;
  verse_key: string;
  surah_name_ar: string;
  surah_name_en: string;
  excerpt: string;
  label: string;
  category: "continue" | "review" | "favorite" | "custom";
  created_at: string;
}

export interface QuranReadingHistoryRow {
  surah_id: number;
  ayah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  opened_at: string;
}

export interface QuranPreferencesRow {
  user_id: string;
  save_enabled: boolean;
  last_surah: number;
  last_ayah: number;
  last_position_seconds: number;
  preferred_reciter_id: number;
  playback_rate: number;
  volume: number;
  muted: boolean;
  repeat_mode: "off" | "ayah" | "surah";
  font_size_step?: number;
  reading_theme?: "system" | "light" | "dark";
  line_spacing?: "compact" | "comfortable" | "spacious";
  reading_width?: "focused" | "wide";
  show_verse_markers?: boolean;
  show_translation?: boolean;
  translation_id?: number;
  bookmarks?: QuranBookmarkRow[];
  reading_history?: QuranReadingHistoryRow[];
  updated_at: string;
}

export interface UserStatsRow {
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  updated_at?: string;
}

export interface SubtaskItem {
  id: string;
  title: string;
  done: boolean;
}

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type GoalStatus = "active" | "paused" | "completed";
export type StudyTopicStatus =
  "not_started" | "learning" | "needs_review" | "practicing" | "comfortable" | "completed";
export type MistakeStatus =
  | "open"
  | "reviewed"
  | "mastered"
  | "recorded"
  | "understanding_needed"
  | "explanation_viewed"
  | "practice_pending"
  | "review_scheduled"
  | "comfortable";

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  details: string | null;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  area?: GrowthArea;
  subject?: string | null;
  recurrence?: "none" | "daily" | "weekly";
  subtasks?: SubtaskItem[];
  due_at: string | null;
  goal_id: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  area: GrowthArea;
  status: GoalStatus;
  is_daily?: boolean;
  last_reset_date?: string | null;
  target_date: string | null;
  milestones?: FutureMilestoneItem[];
  completed_at: string | null;
  created_at: string;
}

export interface ActivityEventRow {
  id: string;
  user_id: string;
  event_type: string;
  area: GrowthArea;
  xp: number;
  ref_id: string | null;
  created_at: string;
}

export interface StudyItemRow {
  id: string;
  user_id: string;
  kind: "note" | "flashcard" | "mistake";
  subject: string;
  topic?: string | null;
  deck: string | null;
  title: string;
  content: string;
  simplified_content?: string | null;
  answer: string | null;
  difficulty: "easy" | "medium" | "hard";
  study_status?: StudyTopicStatus;
  mistake_reason: string | null;
  mistake_status: MistakeStatus;
  review_count: number;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptRow {
  id: string;
  user_id: string;
  subject: string;
  total_questions: number;
  correct_count: number;
  score_pct: number;
  wrong_item_ids: string[];
  created_at: string;
}

export interface FocusSessionRow {
  id: string;
  user_id: string;
  title: string;
  area: GrowthArea;
  subject: string | null;
  duration_minutes: number;
  completed: boolean;
  created_at: string;
}

export type CareMood = "calm" | "okay" | "tired" | "stressed" | "overwhelmed" | "focused";

export interface CareEntryRow {
  id: string;
  user_id: string;
  mood: CareMood;
  energy: number;
  stress_level: number;
  sleep_hours: number | null;
  prompt: string | null;
  note: string | null;
  created_at: string;
}

export type JournalMood =
  "focused" | "curious" | "confident" | "challenged" | "reflective" | "energized";

export interface JournalEntryRow {
  id: string;
  user_id: string;
  entry_date: string;
  title: string;
  reflection: string;
  key_win: string | null;
  next_step: string | null;
  subject: string | null;
  area: GrowthArea;
  mood: JournalMood;
  study_minutes: number | null;
  tags?: string[];
  blocker?: string | null;
  gratitude?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FutureMilestoneItem {
  id: string;
  title: string;
  done: boolean;
}

export interface FuturePlanRow {
  id: string;
  user_id: string;
  pathway_id: string;
  title: string;
  interests: string[];
  strengths: string[];
  milestones: FutureMilestoneItem[];
  notes: string | null;
  status: "exploring" | "active" | "achieved";
  created_at: string;
  updated_at: string;
}

export type OpportunityCategory =
  "scholarship" | "competition" | "program" | "course" | "initiative" | "internship";

export interface OpportunityRow {
  id: string;
  user_id: string;
  title: string;
  organizer: string;
  category: OpportunityCategory;
  region_scope: "kuwait" | "gcc" | "global";
  eligibility: string | null;
  deadline: string | null;
  cost: string | null;
  url: string | null;
  source: string | null;
  source_kind: "manual" | "reference_catalog";
  last_verified_at: string | null;
  status: "saved" | "applied" | "archived";
  notes: string | null;
  linked_plan_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AiConversationRow {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  messages: AiChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface CircleTeamRow {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  community_group?: CommunityGroup | null;
  invite_code: string;
  owner_id: string;
  shared_goal: string | null;
  member_uids: string[];
  created_at: string;
  updated_at: string;
}

export interface CircleInviteRow {
  id: string;
  circle_id: string;
  circle_name: string;
  subject: string | null;
  community_group?: CommunityGroup | null;
  owner_id: string;
  created_at: string;
}

export interface CircleMemberRow {
  uid: string;
  circle_id: string;
  display_name: string;
  role: "owner" | "member";
  show_progress: boolean;
  xp_snapshot?: number | null;
  level_snapshot?: number | null;
  joined_at: string;
}

export interface CirclePostRow {
  id: string;
  circle_id: string;
  community_group?: CommunityGroup | null;
  author_id: string;
  author_name: string;
  kind: "discussion" | "resource" | "task";
  title: string;
  body: string | null;
  resource_url: string | null;
  assignee_name: string | null;
  status: "open" | "done";
  member_uids: string[];
  helpful_uids: string[];
  created_at: string;
}

export interface ModerationReportRow {
  id: string;
  reporter_id: string;
  circle_id: string | null;
  community_group?: CommunityGroup | null;
  target_type: "post" | "resource" | "task" | "team";
  target_id: string;
  reason: "harassment" | "spam" | "pii_exposed" | "inappropriate" | "cheating" | "other";
  details: string | null;
  status: "submitted" | "pending" | "reviewed" | "action_taken" | "resolved" | "dismissed";
  created_at: string;
}

export function generateSafeDocId(prefix = "id"): string {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${randomPart}`.slice(0, 128);
}

export function clampString(value: string | null | undefined, maxLen: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export function sanitizeHttpUrl(raw: string | null | undefined, maxLen = 512): string | null {
  const trimmed = clampString(raw, maxLen);
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString().slice(0, maxLen);
    }
    return null;
  } catch {
    return null;
  }
}

export function generateInviteCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function defaultSettingsDoc(
  userId: string,
  nowIso = new Date().toISOString(),
): UserSettingsRow {
  return {
    user_id: userId,
    theme: "dark",
    font_scale: defaultA11yFull.fontScale,
    dyslexia_font: defaultA11yFull.dyslexia,
    high_contrast: defaultA11yFull.contrast,
    reduced_motion: defaultA11yFull.reduceMotion,
    focus_ring: defaultA11yFull.focusRing,
    simplified_ui: defaultA11yFull.simplified,
    clear_language: defaultA11yFull.clearLanguage,
    read_aloud: defaultA11yFull.readAloud,
    read_aloud_rate: defaultA11yFull.readAloudRate,
    voice_input: defaultA11yFull.voiceInput,
    captions_preferred: defaultA11yFull.captions,

    ui_theme: defaultAppearancePrefs.uiTheme,
    accent_color: defaultAppearancePrefs.accent,
    custom_accent_hex: defaultAppearancePrefs.customAccentHex,
    density: defaultAppearancePrefs.density,
    corner_style: defaultAppearancePrefs.cornerStyle,
    card_style: defaultAppearancePrefs.cardStyle,
    border_style: defaultAppearancePrefs.borderStyle,
    shadow_level: defaultAppearancePrefs.shadowLevel,
    animation_level: defaultAppearancePrefs.animationLevel,
    bg_style: defaultAppearancePrefs.bgStyle,
    font_family: defaultAppearancePrefs.fontFamily,
    heading_scale: defaultTypographyPrefs.headingScale,
    line_height: defaultTypographyPrefs.lineHeight,
    letter_spacing: defaultTypographyPrefs.letterSpacing,
    font_weight: defaultTypographyPrefs.fontWeight,
    readability_preset: defaultTypographyPrefs.readabilityPreset,
    layout_workspace: defaultLayoutPrefs.workspace,
    sidebar_mode: defaultLayoutPrefs.sidebarMode,
    show_quick_actions: defaultLayoutPrefs.showQuickActions,
    reduce_visual_effects: defaultAppearancePrefs.reduceVisualEffects,
    reading_layout: defaultAppearancePrefs.readingLayout,
    default_home_tab: defaultAppearancePrefs.defaultHomeTab,
    dashboard_hidden_widgets: defaultAppearancePrefs.hiddenWidgets,
    dashboard_widget_order: defaultAppearancePrefs.widgetOrder,

    timezone: defaultLocalePrefs.timezone,
    date_format: defaultLocalePrefs.dateFormat,
    time_format: defaultLocalePrefs.timeFormat,
    first_day_of_week: defaultLocalePrefs.firstDayOfWeek,
    calendar_type: defaultLocalePrefs.calendar,
    measurement_units: defaultLocalePrefs.units,
    opportunity_scope: defaultLocalePrefs.opportunityScope,

    study_explanation_lang: defaultStudyPrefs.explanationLanguage,
    study_complexity: defaultStudyPrefs.complexity,
    study_detail_level: defaultStudyPrefs.detailLevel,
    study_step_by_step: defaultStudyPrefs.stepByStep,
    study_examples_first: defaultStudyPrefs.examplesFirst,
    study_visual_aids: defaultStudyPrefs.visualAids,
    study_practice_questions: defaultStudyPrefs.practiceQuestions,
    study_flashcard_style: defaultStudyPrefs.flashcardStyle,
    study_quiz_difficulty: defaultStudyPrefs.quizDifficulty,
    study_session_minutes: defaultStudyPrefs.sessionMinutes,
    study_break_minutes: defaultStudyPrefs.breakMinutes,
    study_revision_reminders: defaultStudyPrefs.revisionReminders,

    ai_response_lang: defaultAiPrefs.responseLanguage,
    ai_response_length: defaultAiPrefs.responseLength,
    ai_tone: defaultAiPrefs.tone,
    ai_clarifying_questions: defaultAiPrefs.clarifyingQuestions,
    ai_share_profile: defaultAiPrefs.shareProfile,
    ai_share_tasks: defaultAiPrefs.shareTasks,
    ai_share_growth: defaultAiPrefs.shareGrowth,
    ai_remember_preferences: defaultAiPrefs.rememberPreferences,
    ai_save_history: defaultAiPrefs.saveHistory,
    ai_proactive_suggestions: defaultAiPrefs.proactiveSuggestions,
    ai_notifications: defaultAiPrefs.notifications,

    notify_reminders: defaultNotificationPrefs.reminders,
    notify_tasks: defaultNotificationPrefs.tasks,
    notify_calendar: defaultNotificationPrefs.calendar,
    notify_streak: defaultNotificationPrefs.streak,
    notify_opportunities: defaultNotificationPrefs.opportunities,
    notify_community: defaultNotificationPrefs.community,
    notify_teams: defaultNotificationPrefs.teams,
    notify_email_enabled: defaultNotificationPrefs.emailEnabled,
    notify_push_enabled: defaultNotificationPrefs.pushEnabled,
    notify_frequency: defaultNotificationPrefs.frequency,
    quiet_hours_enabled: defaultNotificationPrefs.quietHoursEnabled,
    quiet_hours_start: defaultNotificationPrefs.quietStart,
    quiet_hours_end: defaultNotificationPrefs.quietEnd,

    keep_signed_in: defaultPrivacyPrefs.keepSignedIn,
    profile_visibility: defaultPrivacyPrefs.profileVisibility,
    show_in_circle: defaultPrivacyPrefs.showInCircle,

    updated_at: nowIso,
  };
}

export const USER_SETTINGS_CORE_KEYS = [
  "user_id",
  "theme",
  "font_scale",
  "dyslexia_font",
  "high_contrast",
  "reduced_motion",
  "ai_share_profile",
  "ai_share_tasks",
  "ai_share_growth",
  "notify_reminders",
  "notify_community",
  "updated_at",
] as const;

export function extractCoreUserSettingsDoc(
  docData: Partial<UserSettingsRow> | (Partial<UserSettingsRow> & Record<string, unknown>),
  userId: string,
): Record<string, unknown> {
  const defaults = defaultSettingsDoc(userId);
  const rec = docData as Record<string, unknown>;
  const core: Record<string, unknown> = {};
  for (const key of USER_SETTINGS_CORE_KEYS) {
    const val = rec[key] !== undefined ? rec[key] : defaults[key];
    core[key] = val;
  }
  core["user_id"] = userId;
  return core;
}

export function defaultStatsDoc(userId: string, nowIso = new Date().toISOString()): UserStatsRow {
  return {
    user_id: userId,
    xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: null,
    updated_at: nowIso,
  };
}

export interface SmartStudyPlanRow {
  user_id: string;
  daily_minutes: number;
  preferred_time: "morning" | "afternoon" | "evening";
  commitments_note: string;
  blocked_weekdays: number[];
  subjects: Array<{
    id: string;
    subject: string;
    examDateIso: string;
    difficulty: "foundation" | "medium" | "challenging";
    priorityTopic: string;
  }>;
  blocks: Array<{
    id: string;
    dayIso: string;
    dayLabel: string;
    timeWindow: string;
    subject: string;
    topic: string;
    durationMin: number;
    priority: "high" | "medium" | "low";
    rationale: string;
    status: "planned" | "completed" | "missed";
  }>;
  engine?: string;
  updated_at: string;
}

export interface ExamQuestionRow {
  id: string;
  subject: string;
  topic: string;
  difficulty: "foundation" | "standard" | "challenge";
  format: "mcq" | "true_false" | "short_answer" | "written_response";
  prompt: string;
  options?: string[];
  correct_index?: number;
  accepted_keywords?: string[];
  model_answer: string;
  explanation: string;
  created_at: string;
}

export interface ContentErrorReportRow {
  id: string;
  reporter_id: string;
  resource_id: string;
  resource_title: string;
  kind:
    | "factual_error"
    | "broken_link"
    | "outdated"
    | "copyright"
    | "inappropriate"
    | "accessibility"
    | "translation_issue"
    | "outdated_info"
    | "broken_source"
    | "accessibility_issue";
  details: string;
  status: "open" | "resolved";
  resolution_note?: string | null;
  reported_at: string;
}
