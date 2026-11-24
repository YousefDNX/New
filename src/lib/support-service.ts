import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { BRAND } from "../config/brand";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { filterHelpArticles, type HelpArticleCategory } from "./help-indexing";

export { filterHelpArticles };

// ==========================================
// 1. Types & Interfaces
// ==========================================

export type { HelpArticleCategory };

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  category: HelpArticleCategory;
  excerpt: string;
  content: string;
  steps?: string[];
  tags: string[];
  related_article_ids: string[];
  published: boolean;
  last_updated_at: string;
  created_at: string;
  author_name?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: HelpArticleCategory;
}

export type SupportTicketCategory =
  | "account"
  | "login_verification"
  | "technical"
  | "study_learning"
  | "growth_map"
  | "billing"
  | "privacy_security"
  | "general"
  | "other";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";
export type SupportTicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "student" | "staff";
  message: string;
  created_at: string;
  is_internal?: boolean;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  description: string;
  attachment_url?: string;
  contact_preference: "in_app" | "email";
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  resolution_notes?: string | null;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
}

export type TechReportCategory =
  | "broken_button"
  | "page_not_loading"
  | "incorrect_result"
  | "auth_problem"
  | "settings_not_saving"
  | "unexpected_error"
  | "other";

export interface TechnicalReport {
  id: string;
  user_id: string;
  user_email: string;
  category: TechReportCategory;
  title: string;
  description: string;
  steps_to_reproduce: string;
  page_url?: string;
  browser_info?: string;
  attachment_url?: string;
  status: "open" | "investigating" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

export type ModerationCategory =
  | "inappropriate_content"
  | "harassment"
  | "spam"
  | "impersonation"
  | "unsafe_behavior"
  | "misleading_content"
  | "other";

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_email?: string;
  reported_target_id?: string;
  reported_target_type?: "circle_post" | "circle_member" | "comment" | "resource" | "other";
  target_id?: string;
  target_type?: string;
  circle_id?: string | null;
  category?: ModerationCategory;
  reason?: string;
  details: string | null;
  status: "pending" | "submitted" | "reviewed" | "action_taken" | "resolved" | "dismissed";
  moderator_notes?: string;
  created_at: string;
  updated_at?: string;
}

export type FeedbackCategory =
  "feature_suggestion" | "usability_feedback" | "content_improvement" | "general";

export interface FeedbackItem {
  id: string;
  user_id: string;
  user_name: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  status: "submitted" | "under_review" | "planned" | "completed" | "closed";
  upvotes: number;
  upvoted_by: string[];
  created_at: string;
  updated_at: string;
}

export type StaffRoleType =
  "founder" | "admin" | "support" | "moderator" | "content_manager" | "student";

export interface StaffRole {
  user_id: string;
  email: string;
  role: StaffRoleType;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformStats {
  total_users: number;
  open_tickets: number;
  pending_reports: number;
  unresolved_technical_reports: number;
  published_articles: number;
  system_status: "operational" | "maintenance" | "degraded";
  maintenance_mode: boolean;
  announcement?: string;
}

// ==========================================
// 2. Comprehensive Seed Help Articles & FAQs
// ==========================================

export const SEED_HELP_ARTICLES: HelpArticle[] = [
  {
    id: "art-getting-started",
    slug: "getting-started-with-nexora",
    title: `Getting Started with ${BRAND.shortName}`,
    category: "getting_started",
    excerpt:
      "Everything you need to set up your learning workspace, select goals, and begin earning XP on your Growth Map.",
    content: `Welcome to ${BRAND.shortName}! This platform is designed to unite your academic study sessions, daily productivity, personal care, and future educational opportunities into a single unified Growth Map.\n\nWhen you first log in, you will be invited to complete a quick onboarding setup. You can select your current grade level, school, preferred study subjects, and target learning goals. Each activity you complete across ${BRAND.shortName} awards Experience Points (XP) and contributes to your daily study streak.`,
    steps: [
      "Sign in using your student email or continue with Google Single Sign-On.",
      "Complete the initial onboarding questions to tailor your subjects and goals.",
      "Explore the Growth Map on your dashboard to see your current learning trajectory.",
      "Open the Study module to launch a Pomodoro focus sprint or review flashcards.",
      "Set your daily task goals in the Productivity module to keep your streak alive.",
    ],
    tags: ["getting started", "welcome", "onboarding", "growth map", "xp", "streak"],
    related_article_ids: ["art-growth-map-guide", "art-productivity-guide"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Academic Team`,
  },
  {
    id: "art-account-verification",
    slug: "account-and-email-verification",
    title: "Account Security & Verification Guide",
    category: "account",
    excerpt:
      "Learn how email verification protects student accounts and how session persistence keeps you logged in securely.",
    content: `${BRAND.shortName} uses zero-trust account security to keep student data private and safe. After signing up with an email address, a verification link is sent to your inbox. You must verify your email before interacting with shared community circles or receiving official certificates.\n\nSession Persistence:\n${BRAND.shortName} supports encrypted local browser sessions. When 'Keep me signed in' is enabled, your session securely persists across browser restarts and device reboots so you never lose your active study session.`,
    steps: [
      `Check your inbox for a message from ${BRAND.shortName} with the subject 'Verify your student account'.`,
      "Click the verification link to immediately validate your student credentials.",
      "If you do not see the email within 2 minutes, check your Spam or Junk folder.",
      "You can click 'Resend verification email' in the Verification Pending screen anytime.",
      "To change your password or update your profile details, navigate to Settings > Account.",
    ],
    tags: ["account", "verification", "email", "security", "login", "password"],
    related_article_ids: ["art-getting-started", "art-privacy-security"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Security Team`,
  },
  {
    id: "art-growth-map-guide",
    slug: "mastering-the-growth-map",
    title: "Mastering the Growth Map & XP Progression",
    category: "growth_map",
    excerpt:
      "Understand how your academic milestones, level progression, and skill spider charts reflect real learning momentum.",
    content: `The Growth Map is ${BRAND.shortName}'s central dashboard visualization. It translates your study hours, completed assignments, quizzes, and reflection entries into clear developmental milestones.\n\nXP (Experience Points):\nXP is earned through verified learning actions: +10 XP for checking off a task, +25 XP for a 25-minute Pomodoro focus session, +50 XP for completing a topic review quiz, and +15 XP for a daily journal reflection. Leveling up unlocks new themes, achievement badges, and advanced study analytics.`,
    steps: [
      "Review your current level and progress bar at the top of the dashboard.",
      "Check your Growth Areas (Knowledge, Focus, Discipline, Curiosity, Wellbeing).",
      "Inspect the Growth History tab to review a chronological ledger of earned XP.",
      "Maintain your daily study streak by completing at least one verified study activity every 24 hours.",
      "Export your Growth Map progress summary anytime from the Settings page.",
    ],
    tags: ["growth map", "xp", "level up", "streak", "analytics", "milestones"],
    related_article_ids: ["art-study-guide", "art-productivity-guide"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Learning Science`,
  },
  {
    id: "art-study-guide",
    slug: "study-module-and-focus-sprints",
    title: "Effective Study Sprints & Spaced Repetition",
    category: "study",
    excerpt:
      "Maximize retention using the integrated Pomodoro timer, adaptive flashcards, and step-by-step revision breakdown.",
    content: `The Study module combines evidence-based cognitive psychology with modern productivity tooling. Rather than cramming for hours, ${BRAND.shortName} encourages 25-minute concentrated focus sprints followed by 5-minute cognitive breaks.\n\nSpaced Repetition Flashcards:\nCards are scheduled based on your recall accuracy. Items you find difficult will reappear sooner, while mastered concepts are spaced out across subsequent days to cement long-term memory.`,
    steps: [
      "Navigate to the Study module from the sidebar or press Ctrl+2.",
      "Select your target subject (e.g. Mathematics, Physics, Computer Science).",
      "Launch a 25-minute Pomodoro focus sprint with ambient sound enabled if desired.",
      "Review active flashcards, marking each item as Easy, Good, or Hard.",
      "Take a mandatory 5-minute break when the timer chimes to prevent mental fatigue.",
    ],
    tags: ["study", "pomodoro", "timer", "flashcards", "spaced repetition", "focus"],
    related_article_ids: ["art-growth-map-guide", "art-ai-assistant-guide"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Academic Team`,
  },
  {
    id: "art-productivity-guide",
    slug: "productivity-tasks-and-calendar",
    title: "Productivity, Task Management & Calendar",
    category: "productivity",
    excerpt:
      "Organize deadlines, prioritize homework, break large assignments into subtasks, and view your schedule on the calendar.",
    content:
      "The Productivity module is your personal academic planner. It allows you to create tasks with priority flags, recurrence rules, due dates, and checklist subtasks.\n\nInteractive Calendar Integration:\nAll tasks with due dates automatically appear on the interactive calendar. You can switch between month, week, and day views, and view your historical study sessions directly alongside upcoming deadlines.",
    steps: [
      "Click 'Add Task' to create an assignment or study target.",
      "Set a priority level: Low, Medium, or High.",
      "Add subtasks for multi-step projects to track granular completion.",
      "Assign the task to a specific growth area (e.g. Knowledge or Discipline).",
      "Open the Calendar view to visualize your weekly academic workload.",
    ],
    tags: ["productivity", "tasks", "calendar", "deadlines", "subtasks", "priorities"],
    related_article_ids: ["art-getting-started", "art-study-guide"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Engineering`,
  },
  {
    id: "art-ai-assistant-guide",
    slug: "using-nexora-ai-responsibly",
    title: `Using ${BRAND.shortName} AI as an Academic Study Coach`,
    category: "ai",
    excerpt: `How to use ${BRAND.shortName} AI for conceptual explanations, practice quizzes, and homework troubleshooting while maintaining academic integrity.`,
    content: `${BRAND.shortName} AI is designed as an interactive academic tutor. Unlike ordinary chatbots that simply provide answers, ${BRAND.shortName} AI is instructed to ask clarifying questions, walk you through principles step by step, and encourage active problem solving.\n\nAcademic Integrity:\n${BRAND.shortName} AI is an educational coach, not a ghostwriter. It helps explain difficult formulas, suggests revision strategies, and creates practice exam questions tailored to your curriculum.`,
    steps: [
      `Open ${BRAND.shortName} AI from the navigation bar or press Ctrl+4.`,
      "Type a question or paste a difficult concept from your textbook.",
      "Choose your preferred explanation style in Settings > AI (Concise, Standard, Detailed).",
      "Ask the assistant to test your understanding with 3 practice questions.",
      "Save key explanations to your study items for later review.",
    ],
    tags: ["ai", "tutor", "study coach", "practice questions", "integrity"],
    related_article_ids: ["art-study-guide", "art-settings-themes"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} AI Research`,
  },
  {
    id: "art-settings-themes",
    slug: "personalization-themes-and-accessibility",
    title: "Customizing Themes, Typography & Accessibility",
    category: "settings",
    excerpt:
      "Switch between Aurora Glass, Creative Neon, and Minimal themes, configure dyslexia fonts, and customize layout density.",
    content: `${BRAND.shortName} is built to feel personal and comfortable for every student. You can select between rich design systems including Aurora Glass (translucent deep space navy), Creative Neon (dark obsidian with electric lime and cyan glow), and Minimal.\n\nAccessibility Options:\n${BRAND.shortName} offers comprehensive accessibility options including dyslexia-friendly typography, high-contrast mode, reduced motion, custom font scaling, and read-aloud speech synthesis.`,
    steps: [
      "Click the Settings icon in the sidebar or user menu.",
      "Navigate to the Themes & Appearance tab.",
      "Select a theme card (e.g. Aurora Glass or Creative Neon) to instantly apply it.",
      "Open the Typography tab to adjust font size, line height, or enable Dyslexia-friendly font.",
      "Settings are automatically synchronized to your cloud profile and stored locally.",
    ],
    tags: ["settings", "themes", "aurora glass", "creative neon", "accessibility", "dyslexia"],
    related_article_ids: ["art-getting-started", "art-privacy-security"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Design Team`,
  },
  {
    id: "art-privacy-security",
    slug: "privacy-policy-and-student-data-safety",
    title: "Student Privacy, Data Ownership & Export",
    category: "settings",
    excerpt: `How ${BRAND.shortName} isolates Personally Identifiable Information, encrypts data, and allows 1-click JSON data export and account deletion.`,
    content: `We believe student privacy is sacred. ${BRAND.shortName} enforces strict owner-only access controls across all student records. Your study notes, private goals, and journal entries can only be read by your signed-in account.\n\nData Ownership:\nYou can export a complete JSON archive of all your tasks, goals, study items, and journal reflections anytime from Settings > Privacy & Security.`,
    steps: [
      "Open Settings > Privacy & Security.",
      "Click 'Export My Data' to download a complete, readable JSON backup of your records.",
      "Review your profile visibility settings (Private vs Team Circle).",
      "To permanently remove all records from the server, click 'Delete Account' and confirm.",
    ],
    tags: ["privacy", "security", "gdpr", "data export", "encryption", "safety"],
    related_article_ids: ["art-account-verification", "art-settings-themes"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Security Team`,
  },
  {
    id: "art-troubleshooting",
    slug: "troubleshooting-common-technical-issues",
    title: "Troubleshooting Connection & Storage Errors",
    category: "troubleshooting",
    excerpt:
      "Quick fixes for offline mode notices, settings save rollbacks, and browser cache conflicts.",
    content: `If you experience an issue while using ${BRAND.shortName}, this guide walks you through the most common self-repair steps.\n\nOffline Mode Notice:\n${BRAND.shortName} includes automatic network detection. If your internet connection drops, an offline banner appears at the top of the workspace. Your local progress is preserved and will synchronize once your connection is restored.`,
    steps: [
      "Refresh the page with Ctrl+F5 (or Cmd+Shift+R on Mac) to bypass stale service worker caches.",
      "If settings fail to save, verify that you are connected to the internet and signed in.",
      "Ensure third-party cookies or IndexedDB storage are not blocked by browser extensions.",
      "If a button does not respond, check your browser console or submit a Technical Report.",
      "Contact support directly via Help Center > Contact Support if the problem persists.",
    ],
    tags: ["troubleshooting", "offline", "cache", "refresh", "errors", "help"],
    related_article_ids: ["art-account-verification", "art-settings-themes"],
    published: true,
    last_updated_at: "2026-11-15T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    author_name: `${BRAND.shortName} Technical Support`,
  },
];

export const SEED_FAQS: FaqItem[] = [
  {
    id: "faq-session-persistence",
    question: "How does session persistence work? Will I stay logged in?",
    answer: `Yes! ${BRAND.shortName} stores encrypted local session credentials when 'Keep me signed in' is enabled. You will remain signed in across page refreshes, browser restarts, and computer reboots until you explicitly click 'Sign Out'.`,
    category: "account",
  },
  {
    id: "faq-theme-switching",
    question: "How do I switch between the 10 Global Design Presets?",
    answer:
      "Open Settings > Themes & Appearance. You will see cards for all 10 global design presets. Selecting any preset immediately transforms colors, surfaces, borders, typography, and layout feel without requiring a page reload.",
    category: "settings",
  },
  {
    id: "faq-offline-use",
    question: `Can I use ${BRAND.shortName} without an active internet connection?`,
    answer: `${BRAND.shortName} provides offline resilience. When you lose connection, a status banner informs you. You can still read cached help documentation, interact with active study timers, and draft notes. Once connection is restored, pending changes sync automatically to your cloud workspace.`,
    category: "troubleshooting",
  },
  {
    id: "faq-ai-privacy",
    question: "Are my private study notes or AI chats shared with other students?",
    answer:
      "No. All private conversations, journal reflections, and personal tasks are protected by strict owner-only security rules. Other students can never view your personal study data.",
    category: "ai",
  },
  {
    id: "faq-xp-levels",
    question: "How do I earn XP and increase my student Level?",
    answer:
      "XP is earned by finishing study tasks (+10 XP), completing 25-minute Pomodoro sessions (+25 XP), writing daily journal reflections (+15 XP), and completing quizzes (+50 XP). Reaching higher levels unlocks new achievement badges and themes.",
    category: "growth_map",
  },
  {
    id: "faq-support-ticket-response",
    question: "How long does it take for staff to reply to a support ticket?",
    answer:
      "Our support staff and academic advisors review tickets continuously. Most student inquiries receive a response within a few hours. You can track your ticket's live status and reply history directly in Help Center > My Tickets.",
    category: "troubleshooting",
  },
  {
    id: "faq-multiple-devices",
    question: "Can I log in on my phone and laptop at the same time?",
    answer: `Yes! ${BRAND.shortName} supports concurrent sessions across multiple devices. Your Growth Map, tasks, and settings synchronize automatically in real time.`,
    category: "account",
  },
  {
    id: "faq-export-delete",
    question: "How can I export my student data or delete my account?",
    answer:
      "Go to Settings > Privacy & Security. You will find a 1-click 'Export My Data' button that downloads all your records as a clean JSON file, as well as an account deletion option that permanently deletes your profile and associated documents.",
    category: "settings",
  },
];

// ==========================================
// 3. Firestore Service Operations
// ==========================================

export async function fetchHelpArticles(
  categoryFilter?: HelpArticleCategory | "all",
  searchQuery?: string,
  includeUnpublished = false,
): Promise<HelpArticle[]> {
  try {
    const colRef = collection(db, "help_articles");
    const q = includeUnpublished
      ? query(colRef, limit(100))
      : query(colRef, where("published", "==", true), limit(100));
    const snap = await getDocs(q);

    const articles: HelpArticle[] = !snap.empty
      ? snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HelpArticle)
      : [...SEED_HELP_ARTICLES];

    return filterHelpArticles(
      articles,
      categoryFilter ?? "all",
      searchQuery ?? "",
      includeUnpublished,
    );
  } catch (err) {
    console.warn("Using offline seed articles due to Firestore read notice:", err);
    return filterHelpArticles(
      SEED_HELP_ARTICLES,
      categoryFilter ?? "all",
      searchQuery ?? "",
      includeUnpublished,
    );
  }
}

export async function fetchHelpArticleById(id: string): Promise<HelpArticle | null> {
  try {
    const docRef = doc(db, "help_articles", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as HelpArticle;
    }
  } catch {
    // fallback to seed
  }
  const seed = SEED_HELP_ARTICLES.find((a) => a.id === id || a.slug === id);
  return seed ?? null;
}

export async function createHelpArticle(article: Omit<HelpArticle, "id">): Promise<string> {
  const newId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, "help_articles", newId);
  try {
    await setDoc(docRef, {
      ...article,
      id: newId,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    });
    return newId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `help_articles/${newId}`);
  }
}

export async function updateHelpArticle(id: string, patch: Partial<HelpArticle>): Promise<void> {
  const docRef = doc(db, "help_articles", id);
  try {
    await updateDoc(docRef, {
      ...patch,
      last_updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `help_articles/${id}`);
  }
}

export async function deleteHelpArticle(id: string): Promise<void> {
  const docRef = doc(db, "help_articles", id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `help_articles/${id}`);
  }
}

// ------------------------------------------
// Support Tickets CRUD
// ------------------------------------------

export async function createSupportTicket(params: {
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
  attachment_url?: string;
  contact_preference?: "in_app" | "email";
}): Promise<SupportTicket> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit a support ticket.");

  const ticketId = `TICK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const now = new Date().toISOString();

  const initialMessage: TicketMessage = {
    id: `msg-${Date.now()}`,
    sender_id: user.uid,
    sender_name: user.displayName || user.email?.split("@")[0] || "Student",
    sender_role: "student",
    message: params.description,
    created_at: now,
  };

  const newTicket: SupportTicket = {
    id: ticketId,
    user_id: user.uid,
    user_email: user.email || "",
    user_display_name: user.displayName || user.email?.split("@")[0] || "Student",
    subject: params.subject.trim(),
    category: params.category,
    priority: params.priority,
    status: "open",
    description: params.description.trim(),
    attachment_url: params.attachment_url?.trim() || "",
    contact_preference: params.contact_preference || "in_app",
    assigned_staff_id: null,
    assigned_staff_name: null,
    resolution_notes: null,
    messages: [initialMessage],
    created_at: now,
    updated_at: now,
  };

  const docRef = doc(db, "support_tickets", ticketId);
  try {
    await setDoc(docRef, newTicket);
    return newTicket;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `support_tickets/${ticketId}`);
  }
}

export async function fetchUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const colRef = collection(db, "support_tickets");
    const q = query(colRef, where("user_id", "==", userId));
    const snap = await getDocs(q);
    const tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SupportTicket);
    // Sort descending by updated_at in memory
    return tickets.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `support_tickets(user_id=${userId})`);
  }
}

export async function fetchAllSupportTickets(
  statusFilter?: SupportTicketStatus | "all",
  categoryFilter?: SupportTicketCategory | "all",
): Promise<SupportTicket[]> {
  try {
    const colRef = collection(db, "support_tickets");
    const snap = await getDocs(colRef);
    let tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SupportTicket);

    if (statusFilter && statusFilter !== "all") {
      tickets = tickets.filter((t) => t.status === statusFilter);
    }
    if (categoryFilter && categoryFilter !== "all") {
      tickets = tickets.filter((t) => t.category === categoryFilter);
    }

    return tickets.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "support_tickets");
  }
}

export async function addTicketReply(params: {
  ticketId: string;
  message: string;
  isInternal?: boolean;
  staffRole?: "student" | "staff";
  newStatus?: SupportTicketStatus;
}): Promise<TicketMessage> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const ticketRef = doc(db, "support_tickets", params.ticketId);
  let snap;
  try {
    snap = await getDoc(ticketRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `support_tickets/${params.ticketId}`);
  }
  if (!snap.exists()) throw new Error("Ticket not found.");

  const current = snap.data() as SupportTicket;
  const now = new Date().toISOString();

  const newMsg: TicketMessage = {
    id: `msg-${Date.now()}`,
    sender_id: user.uid,
    sender_name: user.displayName || user.email?.split("@")[0] || "User",
    sender_role: params.staffRole || (user.uid === current.user_id ? "student" : "staff"),
    message: params.message.trim(),
    created_at: now,
    is_internal: Boolean(params.isInternal),
  };

  const updatedMessages = [...(current.messages || []), newMsg];
  const patch: Partial<SupportTicket> = {
    messages: updatedMessages,
    updated_at: now,
  };

  if (params.newStatus) {
    patch.status = params.newStatus;
  } else if (params.staffRole === "staff" && current.status === "open") {
    patch.status = "waiting_user";
  } else if (
    user.uid === current.user_id &&
    params.staffRole !== "staff" &&
    (current.status === "waiting_user" ||
      current.status === "resolved" ||
      current.status === "closed")
  ) {
    patch.status = "in_progress";
  }

  try {
    await updateDoc(ticketRef, patch);
    return newMsg;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${params.ticketId}`);
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
  resolutionNotes?: string,
): Promise<void> {
  const ticketRef = doc(db, "support_tickets", ticketId);
  const patch: Partial<SupportTicket> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (resolutionNotes !== undefined) {
    patch.resolution_notes = resolutionNotes;
  }
  try {
    await updateDoc(ticketRef, patch);
    recordAuditLog({
      action: "ticket_status_updated",
      actor_id: auth.currentUser?.uid || "staff",
      actor_email: auth.currentUser?.email || "staff@nexora.internal",
      actor_role: "support",
      target_type: "ticket",
      target_id: ticketId,
      details: `Updated ticket ${ticketId} to status "${status}". Notes: ${resolutionNotes || "None"}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${ticketId}`);
  }
}

// ------------------------------------------
// Technical Reports
// ------------------------------------------

export async function createTechnicalReport(params: {
  category: TechReportCategory;
  title: string;
  description: string;
  steps_to_reproduce: string;
  page_url?: string;
  attachment_url?: string;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required to report an issue.");

  const reportId = `TECH-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const now = new Date().toISOString();

  const report: TechnicalReport = {
    id: reportId,
    user_id: user.uid,
    user_email: user.email || "",
    category: params.category,
    title: params.title.trim(),
    description: params.description.trim(),
    steps_to_reproduce: params.steps_to_reproduce.trim(),
    page_url: params.page_url || (typeof window !== "undefined" ? window.location.href : ""),
    browser_info:
      typeof navigator !== "undefined"
        ? `${navigator.userAgent} (${window.innerWidth}x${window.innerHeight})`
        : "unknown",
    attachment_url: params.attachment_url?.trim() || "",
    status: "open",
    created_at: now,
    updated_at: now,
  };

  const docRef = doc(db, "technical_reports", reportId);
  try {
    await setDoc(docRef, report);
    return reportId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `technical_reports/${reportId}`);
  }
}

export async function fetchAllTechnicalReports(statusFilter?: string): Promise<TechnicalReport[]> {
  try {
    const colRef = collection(db, "technical_reports");
    const snap = await getDocs(colRef);
    let reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TechnicalReport);
    if (statusFilter && statusFilter !== "all") {
      reports = reports.filter((r) => r.status === statusFilter);
    }
    return reports.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "technical_reports");
  }
}

// ------------------------------------------
// Moderation Reports (Private Queue)
// ------------------------------------------

export async function createModerationReport(params: {
  reported_target_id?: string;
  reported_target_type: "circle_post" | "circle_member" | "comment" | "resource" | "other";
  category: ModerationCategory;
  details: string;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const reportId = `MOD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const now = new Date().toISOString();

  const report: ModerationReport = {
    id: reportId,
    reporter_id: user.uid,
    reporter_email: user.email || "",
    reported_target_id: params.reported_target_id || "",
    reported_target_type: params.reported_target_type,
    category: params.category,
    details: params.details.trim(),
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  const docRef = doc(db, "moderation_reports", reportId);
  try {
    await setDoc(docRef, report);
    return reportId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `moderation_reports/${reportId}`);
  }
}

export async function fetchAllModerationReports(): Promise<ModerationReport[]> {
  try {
    const colRef = collection(db, "moderation_reports");
    const snap = await getDocs(colRef);
    const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ModerationReport);
    return reports.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "moderation_reports");
  }
}

export async function updateModerationReportStatus(
  reportId: string,
  status: "pending" | "reviewed" | "action_taken" | "dismissed",
  notes?: string,
): Promise<void> {
  const docRef = doc(db, "moderation_reports", reportId);
  try {
    await updateDoc(docRef, {
      status,
      moderator_notes: notes ?? "",
      updated_at: new Date().toISOString(),
    });
    recordAuditLog({
      action: "moderation_status_updated",
      actor_id: auth.currentUser?.uid || "staff",
      actor_email: auth.currentUser?.email || "moderator@nexora.internal",
      actor_role: "moderator",
      target_type: "moderation_report",
      target_id: reportId,
      details: `Updated moderation report ${reportId} to status "${status}". Notes: ${notes || "None"}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `moderation_reports/${reportId}`);
  }
}

// ------------------------------------------
// Feedback Items
// ------------------------------------------

export async function createFeedbackItem(params: {
  category: FeedbackCategory;
  title: string;
  description: string;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const feedbackId = `FB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const now = new Date().toISOString();

  const item: FeedbackItem = {
    id: feedbackId,
    user_id: user.uid,
    user_name: user.displayName || user.email?.split("@")[0] || "Student",
    category: params.category,
    title: params.title.trim(),
    description: params.description.trim(),
    status: "submitted",
    upvotes: 1,
    upvoted_by: [user.uid],
    created_at: now,
    updated_at: now,
  };

  const docRef = doc(db, "feedback_items", feedbackId);
  try {
    await setDoc(docRef, item);
    return feedbackId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `feedback_items/${feedbackId}`);
  }
}

export async function fetchFeedbackItems(): Promise<FeedbackItem[]> {
  try {
    const colRef = collection(db, "feedback_items");
    const snap = await getDocs(colRef);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FeedbackItem);
    return items.sort((a, b) => b.upvotes - a.upvotes);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "feedback_items");
  }
}

export async function toggleFeedbackUpvote(feedbackId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const docRef = doc(db, "feedback_items", feedbackId);
  let snap;
  try {
    snap = await getDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `feedback_items/${feedbackId}`);
  }
  if (!snap.exists()) return;

  const current = snap.data() as FeedbackItem;
  const hasUpvoted = current.upvoted_by.includes(user.uid);
  const nextUpvotedBy = hasUpvoted
    ? current.upvoted_by.filter((uid) => uid !== user.uid)
    : [...current.upvoted_by, user.uid];

  try {
    await updateDoc(docRef, {
      upvotes: nextUpvotedBy.length,
      upvoted_by: nextUpvotedBy,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `feedback_items/${feedbackId}`);
  }
}

// ------------------------------------------
// Staff Roles & Platform Overview
// ------------------------------------------

export const FOUNDER_EMAIL = "moderator@btc.internal";

export async function fetchUserStaffRole(
  userId: string,
  _email?: string | null,
): Promise<StaffRoleType> {
  try {
    const docRef = doc(db, "staff_roles", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return (snap.data() as StaffRole).role;
    }
  } catch {
    // default to student
  }
  return "student";
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const [profilesSnap, ticketsSnap, techSnap, modSnap, artSnap] = await Promise.all([
      getDocs(query(collection(db, "profiles"), limit(100))),
      getDocs(query(collection(db, "support_tickets"), limit(100))),
      getDocs(query(collection(db, "technical_reports"), limit(100))),
      getDocs(query(collection(db, "moderation_reports"), limit(100))),
      getDocs(query(collection(db, "help_articles"), limit(100))),
    ]);

    const openTickets = ticketsSnap.docs.filter((d) => d.data()["status"] === "open").length;
    const unresolvedTech = techSnap.docs.filter(
      (d) => d.data()["status"] === "open" || d.data()["status"] === "investigating",
    ).length;
    const pendingMod = modSnap.docs.filter((d) => d.data()["status"] === "pending").length;
    const publishedArticles = artSnap.docs.filter((d) => d.data()["published"] !== false).length;

    return {
      total_users: Math.max(profilesSnap.size, 1),
      open_tickets: openTickets,
      pending_reports: pendingMod,
      unresolved_technical_reports: unresolvedTech,
      published_articles: publishedArticles > 0 ? publishedArticles : SEED_HELP_ARTICLES.length,
      system_status: "operational",
      maintenance_mode: false,
    };
  } catch {
    return {
      total_users: 1,
      open_tickets: 0,
      pending_reports: 0,
      unresolved_technical_reports: 0,
      published_articles: SEED_HELP_ARTICLES.length,
      system_status: "operational",
      maintenance_mode: false,
    };
  }
}

// ==========================================
// 4. Audit Logging & Platform Governance
// ==========================================

export interface AuditLogEntry {
  id: string;
  action:
    | "user_role_assigned"
    | "user_role_revoked"
    | "moderation_status_updated"
    | "ticket_status_updated"
    | "help_article_created"
    | "help_article_updated"
    | "help_article_deleted"
    | "system_settings_updated"
    | "audit_logs_cleared";
  actor_id: string;
  actor_email: string;
  actor_role: StaffRoleType;
  target_type: "user" | "ticket" | "moderation_report" | "article" | "system";
  target_id: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const AUDIT_STORAGE_KEY = "nexora_audit_logs_v1";

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit-init-001",
    action: "system_settings_updated",
    actor_id: "system-bootstrap",
    actor_email: "platform-admin@btc.internal",
    actor_role: "founder",
    target_type: "system",
    target_id: "platform-bootstrap",
    details:
      "Initialized zero-trust Firestore security rules, seed documentation, and RBAC policies.",
    timestamp: "2026-11-12T08:00:00.000Z",
  },
  {
    id: "audit-init-002",
    action: "user_role_assigned",
    actor_id: "system-root",
    actor_email: "platform-admin@btc.internal",
    actor_role: "founder",
    target_type: "user",
    target_id: "founder-root",
    details: "Confirmed Founder super-administrative status for verified account.",
    timestamp: "2026-11-12T08:01:00.000Z",
  },
  {
    id: "audit-init-003",
    action: "help_article_created",
    actor_id: "system-init",
    actor_email: "support@nexora.internal",
    actor_role: "content_manager",
    target_type: "article",
    target_id: "art-getting-started",
    details: "Published comprehensive student onboarding guide and Growth Map orientation.",
    timestamp: "2026-11-14T10:30:00.000Z",
  },
  {
    id: "audit-init-004",
    action: "moderation_status_updated",
    actor_id: "mod-root",
    actor_email: "moderator@nexora.internal",
    actor_role: "moderator",
    target_type: "moderation_report",
    target_id: "MOD-INIT-01",
    details: "Automated scan verified zero toxic content in public community circles.",
    timestamp: "2026-11-15T14:15:00.000Z",
  },
];

export function fetchAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [...SEED_AUDIT_LOGS];
  try {
    const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [...SEED_AUDIT_LOGS];
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_AUDIT_LOGS];
  } catch {
    return [...SEED_AUDIT_LOGS];
  }
}

export function recordAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = fetchAuditLogs();
      const updated = [fullEntry, ...current].slice(0, 250);
      window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save audit log to localStorage:", e);
    }
  }

  console.info(`[AUDIT] [${fullEntry.action}] ${fullEntry.actor_email} -> ${fullEntry.details}`);
  return fullEntry;
}

export function clearAuditLogs(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}

// ==========================================
// 5. User Directory & Role Assignment (Admin)
// ==========================================

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  gradeLevel?: string;
  schoolName?: string;
  preferredSubjects?: string[];
  role: StaffRoleType;
  createdAt?: string;
  isFounder?: boolean;
}

export async function fetchAdminUserList(): Promise<AdminUserRecord[]> {
  try {
    const [profilesSnap, staffSnap] = await Promise.all([
      getDocs(query(collection(db, "profiles"), limit(100))),
      getDocs(query(collection(db, "staff_roles"), limit(100))),
    ]);

    const staffMap = new Map<string, StaffRole>();
    staffSnap.docs.forEach((d) => {
      staffMap.set(d.id, d.data() as StaffRole);
    });

    const users: AdminUserRecord[] = [];
    const currentAuth = auth.currentUser;
    const knownUids = new Set<string>();

    profilesSnap.docs.forEach((d) => {
      const data = d.data();
      const uid = d.id;
      knownUids.add(uid);
      const email = String(
        data["email"] ||
          (currentAuth?.uid === uid ? currentAuth.email : "") ||
          `${uid.slice(0, 8)}@student.nexora`,
      );
      const staffEntry = staffMap.get(uid);
      const isFounder = staffEntry?.role === "founder";
      const role: StaffRoleType = staffEntry?.role || "student";

      users.push({
        uid,
        email,
        displayName: String(
          data["display_name"] ||
            (currentAuth?.uid === uid ? currentAuth.displayName : "") ||
            "Student",
        ),
        ...(typeof data["grade_level"] === "string" ? { gradeLevel: data["grade_level"] } : {}),
        ...(typeof data["school_name"] === "string" ? { schoolName: data["school_name"] } : {}),
        preferredSubjects: Array.isArray(data["preferred_subjects"])
          ? data["preferred_subjects"]
          : [],
        role,
        ...(typeof data["created_at"] === "string" ? { createdAt: data["created_at"] } : {}),
        isFounder,
      });
    });

    staffSnap.docs.forEach((d) => {
      if (!knownUids.has(d.id)) {
        const staff = d.data() as StaffRole;
        const isFounder = staff.role === "founder";
        users.push({
          uid: d.id,
          email: staff.email,
          displayName: staff.email.split("@")[0] || "Staff Member",
          role: staff.role,
          createdAt: staff.created_at,
          isFounder,
        });
        knownUids.add(d.id);
      }
    });

    if (currentAuth && !knownUids.has(currentAuth.uid)) {
      const staffEntry = staffMap.get(currentAuth.uid);
      const isFounder = staffEntry?.role === "founder";
      users.unshift({
        uid: currentAuth.uid,
        email: currentAuth.email || "student@nexora.internal",
        displayName: currentAuth.displayName || currentAuth.email?.split("@")[0] || "Student",
        role: staffEntry?.role || "student",
        isFounder,
      });
    }

    if (users.length === 0) {
      users.push({
        uid: "founder-root-preview",
        email: "moderator@btc.internal",
        displayName: "Moderator & Lead Architect",
        gradeLevel: "University / Higher Ed",
        schoolName: `${BRAND.name} Engineering`,
        role: "founder",
        isFounder: true,
      });
    }

    return users;
  } catch (err) {
    console.warn("Using local user list due to read query restriction:", err);
    return [
      {
        uid: auth.currentUser?.uid || "user-current",
        email: auth.currentUser?.email || "moderator@btc.internal",
        displayName: auth.currentUser?.displayName || "Primary Administrator",
        role: "admin",
        isFounder: false,
      },
    ];
  }
}

export async function assignStaffRole(
  targetUid: string,
  targetEmail: string,
  role: StaffRoleType,
  actor: { uid: string; email: string; role: StaffRoleType },
): Promise<void> {
  const docRef = doc(db, "staff_roles", targetUid);
  let snap;
  try {
    snap = await getDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `staff_roles/${targetUid}`);
  }
  const now = new Date().toISOString();

  if (snap.exists()) {
    try {
      await updateDoc(docRef, {
        role,
        email: targetEmail,
        assigned_by: actor.email,
        updated_at: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `staff_roles/${targetUid}`);
    }
  } else {
    const newRoleDoc: StaffRole = {
      user_id: targetUid,
      email: targetEmail,
      role,
      assigned_by: actor.email,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(docRef, newRoleDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `staff_roles/${targetUid}`);
    }
  }

  recordAuditLog({
    action: "user_role_assigned",
    actor_id: actor.uid,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: targetUid,
    details: `Assigned staff role "${role}" to ${targetEmail} (${targetUid}).`,
  });
}

export async function revokeStaffRole(
  targetUid: string,
  actor: { uid: string; email: string; role: StaffRoleType },
  targetEmail = "user",
): Promise<void> {
  const docRef = doc(db, "staff_roles", targetUid);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `staff_roles/${targetUid}`);
  }

  recordAuditLog({
    action: "user_role_revoked",
    actor_id: actor.uid,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: targetUid,
    details: `Revoked staff privileges from ${targetEmail} (${targetUid}). Reverted to student.`,
  });
}
