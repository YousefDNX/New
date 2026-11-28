import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bot,
  Brain,
  Check,
  Copy,
  Cpu,
  Edit2,
  Eye,
  Globe,
  GraduationCap,
  History,
  ImagePlus,
  Loader2,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  Plus,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  User,
  Volume2,
  Waves,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { SafeMarkdownRenderer } from "@/components/ai/SafeMarkdownRenderer";
import { VoiceConversationDrawer } from "@/components/ai/VoiceConversationDrawer";
import { VoiceConversationSettingsPanel } from "@/components/ai/VoiceConversationSettingsPanel";
import { Button } from "@/components/ui/button";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";
import { MotionCard } from "@/components/ui/motion-card";
import { Textarea } from "@/components/ui/textarea";
import { generateCurriculumAwareReply, type ChatbotRoleId } from "@/lib/ai-fallback";
import { LANG_META } from "@/lib/i18n/types";
import { usePrefs } from "@/lib/preferences";
import { playClickSound, playIncorrectSound, playTaskCompleteSound } from "@/lib/sound-effects";
import { speakEnhancedText, stopEnhancedSpeech } from "@/lib/speech-service";

export function formatFriendlyModelTier(raw?: string, isAr?: boolean): string {
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower.includes("research") || lower.includes("deep")) {
    return isAr ? "Pro Research (بحث وتحليل)" : "Pro Research Mode";
  }
  if (lower.includes("pro") || lower.includes("complex")) {
    return isAr ? "الوضع الاحترافي (Pro)" : "Pro Mode";
  }
  if (lower.includes("fast") || lower.includes("lite")) {
    return isAr ? "Super Fast (فائق السرعة)" : "Super Fast Mode";
  }
  return isAr ? "الوضع العادي (Normal)" : "Normal Mode";
}

export type ChatModelTier = "balanced" | "fast" | "complex" | "deep";

export interface ChatAttachmentPreview {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: ChatAttachmentPreview[] | undefined;
  modelUsed?: string | undefined;
  tierUsed?: string | undefined;
  roleId?: ChatbotRoleId | undefined;
  isError?: boolean | undefined;
  retryPrompt?: string | undefined;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  roleId: ChatbotRoleId;
  modelTier: ChatModelTier;
  messages: ChatMessage[];
}

interface AiStudioPrefs {
  responseLength: "concise" | "standard" | "detailed";
  tone: "coach" | "calm" | "academic";
  stepByStep: boolean;
  useSearchGrounding: boolean;
  autoReadReplies: boolean;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const LEGACY_SESSION_KEY = "btc_gemini_chatbot_conversation_v2";
const AI_SESSIONS_STORAGE_KEY = "btc_ai_chat_sessions_v3";
const AI_ACTIVE_SESSION_ID_KEY = "btc_ai_active_session_id_v3";
const AI_CUSTOM_PROMPT_KEY = "btc_ai_custom_prompt_v1";
const AI_STUDIO_PREFS_KEY = "btc_ai_studio_prefs_v1";
const MAX_IMAGE_ATTACHMENTS = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const DEFAULT_STUDIO_PREFS: AiStudioPrefs = {
  responseLength: "standard",
  tone: "coach",
  stepByStep: true,
  useSearchGrounding: false,
  autoReadReplies: false,
};

const CHATBOT_ROLES: Array<{
  id: ChatbotRoleId;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  icon: typeof GraduationCap;
}> = [
  {
    id: "general",
    labelEn: "Companion & Tutor",
    labelAr: "المساعد والصاحب الشامل",
    descEn: "Daily conversation, coding, writing & all topics",
    descAr: "محادثة ذكية، برمجة، كتابة، وكل المواضيع",
    icon: GraduationCap,
  },
  {
    id: "vocab",
    labelEn: "Vocab & Important Words Coach",
    labelAr: "مدرّب المفردات والإنجليزية",
    descEn: "Grammar, meanings, examples & quizzes",
    descAr: "قواعد اللغة، معاني الكلمات، أمثلة واختبارات",
    icon: BookOpen,
  },
  {
    id: "stem",
    labelEn: "STEM Mentor",
    labelAr: "موجّه العلوم والبرمجة",
    descEn: "Step-by-step math, physics & debugging",
    descAr: "حل المسائل العلمية والبرمجة بالخطوات",
    icon: Cpu,
  },
  {
    id: "exam",
    labelEn: "Exam Prep Coach",
    labelAr: "مدرّب الاختبارات",
    descEn: "Active recall drills & revision checks",
    descAr: "تدريبات مراجعة واستعداد للامتحان",
    icon: Sparkles,
  },
];

const MODEL_TIERS: Array<{
  id: ChatModelTier;
  badge: string;
  labelEn: string;
  labelAr: string;
  taskEn: string;
  taskAr: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "balanced",
    badge: "Normal",
    labelEn: "Normal",
    labelAr: "عادي (Normal)",
    taskEn: "Everyday conversation, Q&A & balanced tutoring",
    taskAr: "محادثة طبيعية وأسئلة عامة وشرح متوازن",
    icon: Sparkles,
  },
  {
    id: "fast",
    badge: "Fast",
    labelEn: "Super Fast",
    labelAr: "فائق السرعة (Super Fast)",
    taskEn: "Instant replies & quick summaries",
    taskAr: "ردود فورية وتلخيص سريع",
    icon: Zap,
  },
  {
    id: "complex",
    badge: "Pro",
    labelEn: "Pro",
    labelAr: "احترافي (Pro)",
    taskEn: "Detailed coding, math & structured writing",
    taskAr: "تفصيل متقدم وبرمجة وحل مسائل",
    icon: Cpu,
  },
  {
    id: "deep",
    badge: "Research",
    labelEn: "Pro Research",
    labelAr: "بحث عميق (Pro Research)",
    taskEn: "Deep research, analysis & exam mastery",
    taskAr: "بحث وتحليل عميق ومراجعة شاملة",
    icon: Brain,
  },
];

const PROMPT_PRESETS = [
  {
    id: "strict_teacher",
    labelAr: "معلم دقيق (تعريف + خطوات + استثناءات)",
    labelEn: "Structured Tutor (Rule + Examples + Exceptions)",
    promptAr:
      "اشرح كل قاعدة أو مفهوم بتعريف مباشر وبسيط ثم خطوات ونقاط واضحة ثم أمثلة عملية مع توضيح أي استثناءات بدقة 100% بدون حشو.",
    promptEn:
      "Explain every rule with a direct definition, bulleted rules/steps, clear examples, and key exceptions with zero guesswork.",
  },
  {
    id: "egyptian_friend",
    labelAr: "صديق ذكي باللهجة المصرية",
    labelEn: "Friendly Dialect Companion",
    promptAr:
      "اتكلم معايا بلهجة مصرية طبيعية وودودة كأنك صاحبي الأنتيم الذكي، وركز على الفهم والوضوح والاختصار المفيد.",
    promptEn:
      "Speak warmly like a sharp, supportive friend while keeping every fact accurate and well-structured.",
  },
  {
    id: "senior_dev",
    labelAr: "مهندس برمجيات ومراجع كود",
    labelEn: "Senior Code Reviewer",
    promptAr:
      "عند مراجعة أو كتابة الكود، اذكر السبب الجذري لأي خطأ، واكتب كوداً نظيفاً وآمناً مع شرح مبسط لكل جزء.",
    promptEn:
      "When writing or debugging code, pinpoint the root cause, provide clean TypeScript/Python blocks, and explain edge cases.",
  },
  {
    id: "concise_exam",
    labelAr: "ملخص امتحانات سريع",
    labelEn: "Exam Revision Brief",
    promptAr:
      "اختصر الإجابة في نقاط مركزة سهلة الحفظ مع سؤال تدريب قصير في النهاية للتأكد من الفهم.",
    promptEn:
      "Summarize answers into memorable bullet points and conclude with one quick active-recall check question.",
  },
];

function extractReplyText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  const candidates = [rec["text"], rec["reply"], rec["content"]];
  for (const cand of candidates) {
    if (typeof cand === "string" && cand.trim().length > 0) {
      return cand
        .replace(/"""+/g, "")
        .replace(/'''+/g, "")
        .replace(/\*{3,}/g, "")
        .trim();
    }
  }
  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function stripLargeAttachmentPayloadsForStorage(sessions: ChatSession[]): ChatSession[] {
  return sessions.map((sess) => ({
    ...sess,
    messages: sess.messages.map((m) =>
      m.attachments && m.attachments.length > 0
        ? {
            ...m,
            attachments: m.attachments.map((att) => ({
              ...att,
              dataUrl: att.dataUrl.length > 180_000 ? "" : att.dataUrl,
            })),
          }
        : m,
    ),
  }));
}

export function AiWorkspace() {
  const { lang, ecosystem } = usePrefs();
  const isAr = lang === "ar";

  // Multi-session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sessionSearch, setSessionSearch] = useState<string>("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>("");

  // Custom prompt & AI studio preferences
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>("");
  const [studioPrefs, setStudioPrefs] = useState<AiStudioPrefs>(DEFAULT_STUDIO_PREFS);

  // Input, attachments & voice recording runtime state
  const [prompt, setPrompt] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachmentPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState<string | null>(null);
  const speechRecRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Accessibility & live voice conversation toggles
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showVoiceTutor, setShowVoiceTutor] = useState(false);
  const [needsApiKeySetup, setNeedsApiKeySetup] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe client-side hydration
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedPrompt = window.localStorage.getItem(AI_CUSTOM_PROMPT_KEY);
      if (savedPrompt) setCustomSystemPrompt(savedPrompt);

      const savedPrefs = window.localStorage.getItem(AI_STUDIO_PREFS_KEY);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs) as Partial<AiStudioPrefs>;
        setStudioPrefs((prev) => ({ ...prev, ...parsed }));
      }

      const raw = window.localStorage.getItem(AI_SESSIONS_STORAGE_KEY);
      let loaded: ChatSession[] = raw ? (JSON.parse(raw) as ChatSession[]) : [];

      if (!loaded || loaded.length === 0) {
        let legacyMsgs: ChatMessage[] = [];
        try {
          const stored = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
          if (stored) legacyMsgs = JSON.parse(stored) as ChatMessage[];
        } catch {
          // Ignore legacy read errors
        }
        const initialSession: ChatSession = {
          id: `sess_${Date.now()}`,
          title:
            legacyMsgs.length > 0 && legacyMsgs[0]?.content
              ? legacyMsgs[0].content.slice(0, 32).trim()
              : isAr
                ? "محادثة جديدة"
                : "New Chat",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roleId: "general",
          modelTier: "balanced",
          messages: legacyMsgs,
        };
        loaded = [initialSession];
      }

      setSessions(loaded);
      const savedActiveId = window.localStorage.getItem(AI_ACTIVE_SESSION_ID_KEY);
      if (savedActiveId && loaded.some((s) => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
      } else {
        setActiveSessionId(loaded[0]?.id ?? "");
      }
    } catch {
      // Ignore storage errors
    }
  }, [isAr]);

  // Persist sessions safely
  useEffect(() => {
    if (typeof window === "undefined" || sessions.length === 0) return;
    try {
      window.localStorage.setItem(AI_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      try {
        window.localStorage.setItem(
          AI_SESSIONS_STORAGE_KEY,
          JSON.stringify(stripLargeAttachmentPayloadsForStorage(sessions)),
        );
      } catch {
        // Ignore storage quota overflow
      }
    }
    try {
      if (activeSessionId) {
        window.localStorage.setItem(AI_ACTIVE_SESSION_ID_KEY, activeSessionId);
      }
    } catch {
      // Ignore
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(AI_CUSTOM_PROMPT_KEY, customSystemPrompt);
    } catch {
      // Ignore
    }
  }, [customSystemPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(AI_STUDIO_PREFS_KEY, JSON.stringify(studioPrefs));
    } catch {
      // Ignore
    }
  }, [studioPrefs]);

  useEffect(() => {
    return () => {
      try {
        speechRecRef.current?.stop();
      } catch {
        // Ignore cleanup errors
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [sessions, sessionSearch]);

  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);
  const chatbotRole = activeSession?.roleId ?? "general";
  const modelTier = activeSession?.modelTier ?? "balanced";

  const setChatbotRole = (role: ChatbotRoleId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === (activeSession?.id ?? "")
          ? { ...s, roleId: role, updatedAt: new Date().toISOString() }
          : s,
      ),
    );
  };

  const setModelTier = (tier: ChatModelTier) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === (activeSession?.id ?? "")
          ? { ...s, modelTier: tier, updatedAt: new Date().toISOString() }
          : s,
      ),
    );
  };

  const updateCurrentMessages = (
    updater: (prev: ChatMessage[]) => ChatMessage[],
    firstPromptToTitle?: string,
  ) => {
    setSessions((prev) => {
      if (prev.length === 0) return prev;
      const targetId = activeSession?.id || prev[0]?.id;
      return prev.map((s) => {
        if (s.id !== targetId) return s;
        const nextMsgs = updater(s.messages);
        let nextTitle = s.title;
        if (
          firstPromptToTitle &&
          (s.title === "محادثة جديدة" ||
            s.title === "New Chat" ||
            s.title === "New Conversation" ||
            s.messages.length === 0)
        ) {
          nextTitle = firstPromptToTitle.slice(0, 36).trim();
        }
        return {
          ...s,
          title: nextTitle,
          messages: nextMsgs,
          updatedAt: new Date().toISOString(),
        };
      });
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, loading, streamingContent]);

  const processSelectedImages = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const remainingSlots = MAX_IMAGE_ATTACHMENTS - pendingAttachments.length;
    if (remainingSlots <= 0) {
      toast.info(
        isAr
          ? `الحد الأقصى ${MAX_IMAGE_ATTACHMENTS} صور في الرسالة الواحدة.`
          : `Maximum ${MAX_IMAGE_ATTACHMENTS} images per message.`,
      );
      return;
    }

    const accepted: ChatAttachmentPreview[] = [];
    for (const file of list.slice(0, remainingSlots)) {
      if (!file.type.startsWith("image/")) {
        toast.error(isAr ? "يرجى اختيار ملفات صور صالحة فقط." : "Only image files are supported.");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(
          isAr
            ? `حجم الصورة (${file.name}) يتجاوز 5 ميجابايت.`
            : `Image "${file.name}" exceeds the 5MB limit.`,
        );
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        if (dataUrl) {
          accepted.push({
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            mimeType: file.type,
            dataUrl,
          });
        }
      } catch {
        toast.error(isAr ? "تعذرت قراءة الصورة المحددة." : "Could not read selected image.");
      }
    }

    if (accepted.length > 0) {
      setPendingAttachments((prev) => [...prev, ...accepted].slice(0, MAX_IMAGE_ATTACHMENTS));
    }
  };

  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processSelectedImages(e.target.files);
    e.target.value = "";
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleVoiceRecording = async () => {
    if (typeof window === "undefined") return;

    if (recording) {
      speechRecRef.current?.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechCtor) {
      try {
        const rec = new SpeechCtor();
        rec.lang =
          lang === "en"
            ? (ecosystem.englishAccent ?? "en-US")
            : (LANG_META[lang]?.bcp47 ?? "ar-EG");
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (ev) => {
          const parts: string[] = [];
          for (let i = 0; i < ev.results.length; i++) {
            const item = ev.results[i];
            if (item?.[0]?.transcript) {
              parts.push(item[0].transcript);
            }
          }
          setVoiceDraft(parts.join(" ").trim());
        };
        rec.onerror = (ev) => {
          setRecording(false);
          if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
            toast.error(
              isAr
                ? "تم رفض إذن الميكروفون. اسمح به من إعدادات المتصفح."
                : "Microphone access was denied.",
            );
          }
        };
        rec.onend = () => {
          setRecording(false);
        };
        speechRecRef.current = rec;
        setVoiceDraft("");
        setRecording(true);
        rec.start();
        return;
      } catch {
        setRecording(false);
      }
    }

    // Fallback: MediaRecorder + server transcription endpoint
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((tr) => tr.stop());
          const blob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          if (blob.size === 0) return;
          setTranscribingAudio(true);
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(String(r.result ?? ""));
              r.onerror = () => reject(new Error("read error"));
              r.readAsDataURL(blob);
            });
            const res = await fetch("/api/ai/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioBase64: dataUrl,
                mimeType: blob.type || "audio/webm",
                languageHint: lang,
              }),
            });
            const json = (await res.json()) as {
              ok?: boolean;
              transcript?: string;
              message?: string;
            };
            if (res.ok && json.ok && json.transcript) {
              setPrompt((prev) => (prev ? `${prev} ${json.transcript}` : json.transcript!));
              toast.success(isAr ? "تم تحويل الصوت إلى نص" : "Voice transcribed to prompt");
            } else if (
              res.status === 503 ||
              /GEMINI_API_KEY|not configured/i.test(json.message ?? "")
            ) {
              setNeedsApiKeySetup(true);
              toast.info(
                isAr
                  ? "خدمة تفريغ الصوت السحابية غير مفعّلة حالياً؛ اكتب سؤالك أو استخدم المحادثة الصوتية المحلية."
                  : "Cloud audio transcription is unavailable right now; type your prompt or open Voice Conversation.",
              );
            } else {
              toast.error(
                (json.message || "").replace(/GEMINI_API_KEY/gi, "API secret") ||
                  (isAr ? "تعذر تفريغ التسجيل الصوتي" : "Audio transcription failed"),
              );
            }
          } catch {
            toast.error(
              isAr ? "تعذر الاتصال بخدمة تفريغ الصوت" : "Could not reach transcription service",
            );
          } finally {
            setTranscribingAudio(false);
          }
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setRecording(true);
        return;
      } catch {
        setRecording(false);
        toast.error(
          isAr ? "تعذر الوصول للميكروفون. تحقق من أذونات المتصفح." : "Could not access microphone.",
        );
        return;
      }
    }

    toast.info(
      isAr
        ? "الإملاء الصوتي غير مدعوم في هذا المتصفح — يمكنك الكتابة أو استخدام المحادثة الصوتية."
        : "Browser speech recording unavailable — type your prompt or open Voice Conversation.",
    );
  };

  const confirmVoiceDraft = () => {
    const clean = (voiceDraft ?? "").trim();
    try {
      speechRecRef.current?.stop();
    } catch {
      // Ignore
    }
    setRecording(false);
    setVoiceDraft(null);
    if (clean) {
      setPrompt((prev) => (prev ? `${prev} ${clean}` : clean));
      textareaRef.current?.focus();
    }
  };

  const discardVoiceDraft = () => {
    try {
      speechRecRef.current?.stop();
    } catch {
      // Ignore
    }
    setRecording(false);
    setVoiceDraft(null);
  };

  const speakAssistantReplyIfEnabled = (id: string, text: string) => {
    if (!studioPrefs.autoReadReplies) return;
    handleSpeakText(id, text);
  };

  const triggerOfflineFallbackReply = (
    promptText: string,
    attachedImages: ChatAttachmentPreview[],
  ) => {
    const offlineReply = generateCurriculumAwareReply({
      message: promptText,
      role: chatbotRole,
      langHint: lang,
      attachmentNames: attachedImages.map((a) => a.name),
    });
    playTaskCompleteSound();
    updateCurrentMessages((prev) => [
      ...prev,
      {
        id: `ai_off_${Date.now()}`,
        role: "assistant",
        content: `${isAr ? "*(الوضع المحلي بدون إنترنت)*\n\n" : "*(Local Offline Assistant)*\n\n"}${offlineReply}`,
        timestamp: new Date().toISOString(),
        tierUsed: modelTier,
        roleId: chatbotRole,
      },
    ]);
  };

  const sendMessage = async (
    rawText: string,
    opts?: { retryErrorId?: string; attachmentsOverride?: ChatAttachmentPreview[] },
  ) => {
    const activeAttachments = opts?.attachmentsOverride ?? pendingAttachments;
    const cleanText = rawText.trim();
    if ((!cleanText && activeAttachments.length === 0) || loading) return;

    const cleanPrompt =
      cleanText ||
      (isAr ? "حلّل الصورة المرفقة واشرحها بوضوح." : "Analyze the attached image(s) clearly.");

    const priorBase = opts?.retryErrorId
      ? messages.filter((m) => m.id !== opts.retryErrorId && !m.isError)
      : messages.filter((m) => !m.isError);

    const lastIsSameUser =
      Boolean(opts?.retryErrorId) &&
      priorBase.length > 0 &&
      priorBase[priorBase.length - 1]?.role === "user" &&
      priorBase[priorBase.length - 1]?.content === cleanPrompt;

    const priorHistorySource = lastIsSameUser ? priorBase.slice(0, -1) : priorBase;
    const priorHistory = priorHistorySource.slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (opts?.retryErrorId) {
      updateCurrentMessages((prev) => prev.filter((m) => m.id !== opts.retryErrorId));
    } else {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: cleanPrompt,
        timestamp: new Date().toISOString(),
        ...(activeAttachments.length > 0 ? { attachments: activeAttachments } : {}),
      };
      updateCurrentMessages((prev) => [...prev, userMessage], cleanPrompt);
    }

    setPrompt("");
    setPendingAttachments([]);
    setStreamingContent("");
    setLoading(true);
    playClickSound();

    const pushErrorMessage = (errorMsg: string) => {
      playIncorrectSound();
      if (/GEMINI_API_KEY|NOT_CONFIGURED|Settings > Secrets/i.test(errorMsg)) {
        setNeedsApiKeySetup(true);
      }
      const sanitizedMsg = errorMsg
        .replace(/GEMINI_API_KEY/gi, "BTC AI key")
        .replace(/gemini/gi, "BTC AI");
      updateCurrentMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: sanitizedMsg,
          timestamp: new Date().toISOString(),
          isError: true,
          retryPrompt: cleanPrompt,
          roleId: chatbotRole,
        },
      ]);
    };

    try {
      const attachmentsPayload = activeAttachments
        .filter((att) => Boolean(att.dataUrl))
        .map((att) => ({
          name: att.name,
          mimeType: att.mimeType,
          dataBase64: att.dataUrl,
        }));

      const res = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          history: priorHistory,
          modelTier,
          chatbotRole,
          ...(attachmentsPayload.length > 0 ? { attachments: attachmentsPayload } : {}),
          ...(customSystemPrompt.trim() ? { customSystemPrompt: customSystemPrompt.trim() } : {}),
          useSearchGrounding: studioPrefs.useSearchGrounding,
          prefs: {
            responseLanguage: lang,
            responseLength: studioPrefs.responseLength,
            tone: studioPrefs.tone,
            stepByStep: studioPrefs.stepByStep,
          },
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (res.ok && contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let doneTierUsed: string | undefined;
        let streamError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            const rawJson = line.slice(5).trim();
            if (!rawJson) continue;
            try {
              const evt = JSON.parse(rawJson) as {
                type?: string;
                code?: string;
                text?: string;
                tierUsed?: string;
                message?: string;
              };
              if (evt.type === "delta" && typeof evt.text === "string") {
                accumulated += evt.text;
                setStreamingContent(accumulated);
              } else if (evt.type === "done") {
                doneTierUsed = evt.tierUsed ?? modelTier;
              } else if (evt.type === "error") {
                if (evt.code === "NOT_CONFIGURED") {
                  setNeedsApiKeySetup(true);
                }
                streamError =
                  evt.message ||
                  (isAr
                    ? "تعذّر الحصول على رد من BTC AI."
                    : "Failed to receive response from BTC AI.");
              }
            } catch {
              // Ignore partial chunk
            }
          }
        }

        if (streamError && !accumulated.trim()) {
          pushErrorMessage(streamError);
          return;
        }

        const cleanedAccumulated = accumulated
          .replace(/"""+/g, "")
          .replace(/'''+/g, "")
          .replace(/\*{3,}/g, "")
          .trim();

        if (!cleanedAccumulated) {
          pushErrorMessage(
            isAr
              ? "لم يرجع المساعد أي نص للرد. يرجى المحاولة مرة أخرى."
              : "BTC AI returned an empty response. Please retry.",
          );
          return;
        }

        setNeedsApiKeySetup(false);
        playTaskCompleteSound();
        const msgId = `ai_${Date.now()}`;
        updateCurrentMessages((prev) => [
          ...prev,
          {
            id: msgId,
            role: "assistant",
            content: cleanedAccumulated,
            timestamp: new Date().toISOString(),
            tierUsed: doneTierUsed ?? modelTier,
            roleId: chatbotRole,
          },
        ]);
        speakAssistantReplyIfEnabled(msgId, cleanedAccumulated);
        return;
      }

      // JSON fallback route
      let payload: Record<string, unknown> | null = null;
      try {
        payload = (await res.json()) as Record<string, unknown>;
      } catch {
        payload = null;
      }

      if (res.ok && payload && payload["ok"] !== false) {
        const replyText = extractReplyText(payload);
        if (replyText) {
          setNeedsApiKeySetup(false);
          playTaskCompleteSound();
          const msgId = `ai_${Date.now()}`;
          updateCurrentMessages((prev) => [
            ...prev,
            {
              id: msgId,
              role: "assistant",
              content: replyText,
              timestamp: new Date().toISOString(),
              tierUsed: typeof payload["tierUsed"] === "string" ? payload["tierUsed"] : modelTier,
              roleId: chatbotRole,
            },
          ]);
          speakAssistantReplyIfEnabled(msgId, replyText);
          return;
        }
      }

      if (payload && payload["code"] === "NOT_CONFIGURED") {
        setNeedsApiKeySetup(true);
      }

      const errMessage =
        (payload && typeof payload["message"] === "string" && payload["message"].trim()) ||
        (isAr
          ? `تعذّر الاتصال بخدمة BTC AI (رمز ${res.status || "غير متاح"}).`
          : `Unable to reach BTC AI right now (status ${res.status || "unavailable"}).`);
      pushErrorMessage(errMessage);
    } catch {
      triggerOfflineFallbackReply(cleanPrompt, activeAttachments);
    } finally {
      setStreamingContent("");
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendMessage(prompt);
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: isAr ? "محادثة جديدة" : "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roleId: chatbotRole,
      modelTier,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setPrompt("");
    setPendingAttachments([]);
    setStreamingContent("");
    toast.info(isAr ? "تم بدء محادثة جديدة" : "New chat started");
    textareaRef.current?.focus();
  };

  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `sess_${Date.now()}`,
          title: isAr ? "محادثة جديدة" : "New Chat",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roleId: "general",
          modelTier: "balanced",
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0]?.id ?? "");
      }
      return filtered;
    });
    toast.success(isAr ? "تم حذف المحادثة" : "Conversation deleted");
  };

  const handleSaveTitle = (sessionId: string) => {
    if (!editingTitleText.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s)),
    );
    setEditingSessionId(null);
    toast.success(isAr ? "تم تحديث عنوان المحادثة" : "Conversation title updated");
  };

  const handleClearAllSessions = () => {
    const fresh: ChatSession = {
      id: `sess_${Date.now()}`,
      title: isAr ? "محادثة جديدة" : "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roleId: "general",
      modelTier: "balanced",
      messages: [],
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setPrompt("");
    setPendingAttachments([]);
    setStreamingContent("");
    toast.info(isAr ? "تم مسح جميع المحادثات" : "All conversations cleared");
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success(isAr ? "تم نسخ النص" : "Copied to clipboard");
    }
  };

  const handleSpeakText = (id: string, text: string) => {
    if (speakingId === id) {
      stopEnhancedSpeech();
      setSpeakingId(null);
      return;
    }
    stopEnhancedSpeech();
    setSpeakingId(id);
    const ok = speakEnhancedText(text, {
      forcedLang: isAr ? "ar" : "en",
      preferredLocale: isAr ? "ar-SA" : (ecosystem.englishAccent ?? "en-US"),
      rate: ecosystem.ttsSpeed || ecosystem.voiceSpeed || 1,
      voicePreset: ecosystem.ttsVoice,
      engine: ecosystem.ttsEngine,
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
    if (!ok) {
      setSpeakingId(null);
      toast.info(
        isAr
          ? "قراءة النص غير مدعومة في متصفحك."
          : "Speech synthesis is not supported in your browser.",
      );
    }
  };

  const samplePrompts = [
    {
      textAr: "اشرح لي الفرق بين الأسماء المعدودة وغير المعدودة مع أمثلة واستثناءات",
      textEn: "Explain countable vs uncountable nouns with rules, examples, and exceptions",
      tagAr: "قواعد وإنجليزية",
      tagEn: "Grammar & English",
      icon: BookOpen,
    },
    {
      textAr: "اكتب دالة Python نظيفة لحساب درجات الطلاب مع شرح كل سطر",
      textEn: "Write a clean Python function to analyze student grades with clear explanation",
      tagAr: "برمجة وكود",
      tagEn: "Code & STEM",
      icon: Cpu,
    },
    {
      textAr: "ساعدني في وضع خطة مراجعة ذكية لاختبار العلوم والرياضيات",
      textEn: "Build a focused study revision plan for my upcoming science & math exam",
      tagAr: "خطة ومراجعة",
      tagEn: "Exam Prep",
      icon: Sparkles,
    },
    {
      textAr: "إزيك يا صاحبي؟ يلا ندردش أو نفكر في فكرة مشروع مفيدة",
      textEn: "Hey buddy! Let's brainstorm a creative student project idea together",
      tagAr: "دردشة وأفكار",
      tagEn: "Ideas & Chat",
      icon: MessageSquare,
    },
  ];

  const activeTierMeta = MODEL_TIERS.find((t) => t.id === modelTier) ?? MODEL_TIERS[0]!;
  const activeRoleMeta = CHATBOT_ROLES.find((r) => r.id === chatbotRole) ?? CHATBOT_ROLES[0]!;

  const roleSelectOptions: ModernSelectOption[] = CHATBOT_ROLES.map((r) => {
    const Icon = r.icon;
    return {
      value: r.id,
      label: isAr ? r.labelAr : r.labelEn,
      description: isAr ? r.descAr : r.descEn,
      icon: <Icon className="size-4" />,
      keywords: `${r.labelEn} ${r.labelAr} ${r.descEn} ${r.descAr} ${r.id}`,
    };
  });

  const tierSelectOptions: ModernSelectOption[] = MODEL_TIERS.map((m) => {
    const Icon = m.icon;
    return {
      value: m.id,
      label: isAr ? m.labelAr : m.labelEn,
      description: isAr ? m.taskAr : m.taskEn,
      badge: m.badge,
      icon: <Icon className="size-4" />,
      keywords: `${m.labelEn} ${m.labelAr} ${m.taskEn} ${m.taskAr} ${m.badge}`,
    };
  });

  return (
    <div
      data-testid="btc-ai-app-shell"
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 h-dvh rounded-none border-0 bg-background"
          : "mx-auto flex h-[calc(100dvh-6rem)] min-h-[560px] w-full flex-col rounded-2xl border border-border/80 bg-surface shadow-sm"
      } overflow-hidden flex flex-col ${highContrast ? "contrast-125 bg-stone-950 text-white" : ""}`}
    >
      {/* Top Standalone BTC AI App Bar */}
      <header className="flex flex-col gap-3 border-b border-border/70 bg-surface/95 px-3.5 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* App Brand Identity */}
          <div className="flex min-w-0 items-center gap-2.5">
            <a
              href="/app"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface-2/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              aria-label={isAr ? "العودة للمنصة" : "Back to Platform"}
              title={isAr ? "العودة للمنصة" : "Back to Platform"}
            >
              <ArrowLeft className="size-4 rtl-flip" />
            </a>

            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary border border-primary/25">
              <Sparkles className="size-4.5" />
            </div>

            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                {isAr ? "BTC AI — التطبيق الذكي المتكامل" : "BTC AI — Standalone AI Workspace"}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {activeSession?.title || (isAr ? "محادثة جديدة" : "New Chat")} ·{" "}
                {isAr ? activeRoleMeta.labelAr : activeRoleMeta.labelEn} ·{" "}
                {isAr ? activeTierMeta.labelAr : activeTierMeta.labelEn}
                {customSystemPrompt.trim()
                  ? isAr
                    ? " · برومبت مخصص نشط"
                    : " · Custom Prompt Active"
                  : ""}
              </p>
            </div>
          </div>

          {/* Primary App Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant={sidebarOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setSidebarOpen((v) => !v)}
              className="min-h-[38px] gap-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0"
              data-testid="ai-toggle-sessions"
              aria-label={isAr ? "سجل المحادثات" : "Chat History"}
            >
              <History className="size-3.5" />
              <span>{isAr ? "المحادثات" : "Chats"}</span>
              <span className="font-mono text-[11px] opacity-80 tabular-nums">
                ({sessions.length})
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="min-h-[38px] gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
              data-testid="ai-new-chat-btn"
              aria-label={isAr ? "محادثة جديدة" : "New Chat"}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">{isAr ? "محادثة جديدة" : "New Chat"}</span>
            </Button>

            <Button
              type="button"
              variant={settingsOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setSettingsOpen((v) => !v)}
              className="min-h-[38px] gap-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0"
              data-testid="ai-toggle-settings"
              aria-label={isAr ? "إعدادات BTC AI والبرومبت" : "BTC AI Settings & Custom Prompt"}
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">
                {isAr ? "الإعدادات والبرومبت" : "Settings & Prompt"}
              </span>
            </Button>

            <Button
              type="button"
              variant={showVoiceTutor ? "glow" : "outline"}
              size="sm"
              onClick={() => setShowVoiceTutor((v) => !v)}
              className="min-h-[38px] gap-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0"
              data-testid="ai-toggle-voice-tutor"
              aria-label={isAr ? "المحادثة الصوتية المباشرة" : "Voice Conversation"}
            >
              <Waves className="size-3.5" />
              <span className="hidden md:inline">
                {isAr ? "محادثة صوتية" : "Voice Conversation"}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen((v) => !v)}
              className="size-9 cursor-pointer"
              data-testid="ai-fullscreen-toggle"
              aria-label={isAr ? "ملء الشاشة" : "Toggle Fullscreen"}
              title={isAr ? "ملء الشاشة" : "Toggle Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Always-Accessible Role & Model Mode Strip */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <ModernSelect
            label={isAr ? "تخصص المساعد" : "Assistant Role"}
            ariaLabel="Chatbot Role"
            data-testid="ai-role-select"
            value={chatbotRole}
            onValueChange={(v) => setChatbotRole(v as ChatbotRoleId)}
            options={roleSelectOptions}
            searchable
            searchPlaceholder={isAr ? "ابحث في التخصصات..." : "Search tutor roles..."}
            leadingIcon={<GraduationCap className="size-4" />}
          />

          <ModernSelect
            label={isAr ? "وضع الذكاء والسرعة" : "Model Mode"}
            ariaLabel="Model Mode"
            data-testid="ai-model-select"
            value={modelTier}
            onValueChange={(v) => setModelTier(v as ChatModelTier)}
            options={tierSelectOptions}
            searchable
            searchPlaceholder={isAr ? "ابحث في الأوضاع..." : "Search model modes..."}
            leadingIcon={<Brain className="size-4" />}
          />
        </div>
      </header>

      {/* API Key Notice (Clean, Zero Gemini Branding) */}
      {needsApiKeySetup && (
        <div
          role="status"
          data-testid="ai-key-setup-notice"
          className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs text-foreground"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">
                {isAr
                  ? "يلزم تفعيل مفتاح الـ API في Settings > Secrets"
                  : "AI API key activation needed in Settings > Secrets"}
              </p>
              <p className="text-muted-foreground">
                {isAr
                  ? "فعّل أو اربط مفتاح الخدمة من لوحة Settings > Secrets في المنصة ثم اضغط إعادة المحاولة."
                  : "Enable the AI secret in Settings > Secrets, then click Retry."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setNeedsApiKeySetup(false)}
            className="h-7 px-2 text-xs"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Main Standalone App Body: Rail + Conversations + Center Chat Canvas + Settings / Voice */}
      <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Persistent Compact App Navigation Rail (Desktop) */}
        <aside
          aria-label={isAr ? "شريط تطبيق BTC AI" : "BTC AI App Navigation"}
          className="hidden md:flex w-13 shrink-0 flex-col items-center justify-between border-e border-border/70 bg-surface-2/40 py-3"
        >
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              title={isAr ? "محادثة جديدة" : "New Chat"}
              className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-surface text-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              title={isAr ? "المحادثات" : "Conversations"}
              className={`flex size-9 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                sidebarOpen
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <MessageSquare className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              title={isAr ? "الإعدادات والبرومبت" : "Settings & Prompt"}
              className={`flex size-9 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                settingsOpen
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowVoiceTutor((v) => !v)}
              title={isAr ? "محادثة صوتية" : "Voice Conversation"}
              className={`flex size-9 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                showVoiceTutor
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Waves className="size-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setLargeText((v) => !v)}
              title={isAr ? "تكبير الخط" : "Large Text"}
              className={`flex size-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                largeText
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Accessibility className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setHighContrast((v) => !v)}
              title={isAr ? "تباين عالي" : "High Contrast"}
              className={`flex size-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                highContrast
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Eye className="size-4" />
            </button>
          </div>
        </aside>

        {/* Collapsible Conversations History Sidebar */}
        {sidebarOpen && (
          <aside
            data-testid="ai-sessions-sidebar"
            className="w-full lg:w-72 max-h-64 lg:max-h-none shrink-0 flex flex-col border-b lg:border-b-0 lg:border-e border-border/80 bg-surface-2/40 p-3 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {isAr ? "سجل المحادثات" : "Conversations"}
                </span>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(false)}
                className="size-7 cursor-pointer"
                aria-label={isAr ? "إغلاق السجل" : "Close History"}
              >
                <X className="size-3.5" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleNewChat}
              className="w-full gap-2 text-xs font-bold min-h-[38px] cursor-pointer"
              data-testid="ai-sidebar-new-chat"
            >
              <Plus className="size-4" />
              <span>{isAr ? "+ بدء محادثة جديدة" : "+ New Conversation"}</span>
            </Button>

            {/* Search Conversations */}
            <div className="relative">
              <Search className="size-3.5 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder={isAr ? "ابحث في المحادثات..." : "Search chats..."}
                className="w-full rounded-lg border border-border/80 bg-surface ps-8 pe-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {filteredSessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                const isEditing = editingSessionId === sess.id;
                return (
                  <div
                    key={sess.id}
                    data-testid={`ai-session-item-${sess.id}`}
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isActive
                        ? "border-primary/50 bg-primary/10 text-foreground font-semibold"
                        : "border-border/60 bg-surface/60 hover:bg-surface hover:border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1.5 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingTitleText}
                          onChange={(e) => setEditingTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(sess.id);
                            if (e.key === "Escape") setEditingSessionId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-surface border border-primary px-2 py-1 rounded text-xs text-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTitle(sess.id)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSessionId(null)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="truncate font-medium text-foreground">{sess.title}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 tabular-nums">
                            <span>
                              {sess.messages.length} {isAr ? "رسائل" : "msgs"}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(sess.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(sess.id);
                              setEditingTitleText(sess.title);
                            }}
                            title={isAr ? "تعديل الاسم" : "Rename"}
                            className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                          >
                            <Edit2 className="size-3" />
                          </button>
                          <button
                            type="button"
                            data-testid={`ai-delete-session-${sess.id}`}
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            title={isAr ? "حذف المحادثة" : "Delete"}
                            className="p-1 text-muted-foreground hover:text-destructive rounded cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {sessions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAllSessions}
                className="w-full text-[11px] text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>{isAr ? "مسح جميع المحادثات" : "Clear all chats"}</span>
              </Button>
            )}
          </aside>
        )}

        {/* Central Chat Canvas & Multimodal Prompt Dock */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0 bg-background/40">
          <div
            className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 space-y-4"
            data-testid="ai-chat-thread"
          >
            {messages.length === 0 ? (
              <MotionCard
                delay={0.04}
                className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center py-6 space-y-6"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <Bot className="size-7" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h2
                    className={`font-display font-bold text-foreground ${
                      largeText ? "text-2xl" : "text-xl"
                    }`}
                  >
                    {isAr
                      ? "مرحباً بك في BTC AI — جاهز لأي سؤال أو مهمة"
                      : "Welcome to BTC AI — Ready for Any Question or Task"}
                  </h2>
                  <p
                    className={`text-muted-foreground leading-relaxed ${
                      largeText ? "text-base" : "text-xs sm:text-sm"
                    }`}
                  >
                    {isAr
                      ? "اسأل بدقة، أرفق صوراً للشرح والتحليل، سجّل صوتك، أو ابدأ محادثة صوتية حية، مع دعم الإعدادات والبرومبت المخصص والعمل دون اتصال."
                      : "Ask questions, attach images for instant analysis, record dictation, customize system instructions, or launch a live voice conversation."}
                  </p>
                </div>

                {/* Structured 2x2 Quick Starter Cards */}
                <div className="w-full space-y-2.5 text-start">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    {isAr ? "ابدأ بنقرة واحدة:" : "Quick Starters:"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {samplePrompts.map((p, idx) => {
                      const text = isAr ? p.textAr : p.textEn;
                      const Icon = p.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void sendMessage(text)}
                          className="flex items-start gap-3 rounded-xl border border-border/80 bg-surface hover:bg-surface-2 hover:border-primary/45 p-3.5 text-xs text-start text-foreground transition-colors cursor-pointer"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 space-y-1">
                            <span className="block text-[11px] font-bold text-primary">
                              {isAr ? p.tagAr : p.tagEn}
                            </span>
                            <span className="block line-clamp-2 text-muted-foreground font-medium leading-snug">
                              {text}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </MotionCard>
            ) : (
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      data-testid={`chat-msg-${m.role}`}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg mt-1 ${
                            m.isError
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {m.isError ? (
                            <AlertTriangle className="size-4" />
                          ) : (
                            <Bot className="size-4" />
                          )}
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 leading-relaxed ${
                          largeText ? "text-lg" : "text-sm"
                        } ${
                          isUser
                            ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                            : m.isError
                              ? "border border-destructive/40 bg-destructive/10 text-foreground rounded-tl-xs space-y-2.5"
                              : "surface-card border border-border/80 text-foreground rounded-tl-xs space-y-2"
                        }`}
                      >
                        {/* Render Attached Images inside User Bubble */}
                        {isUser && m.attachments && m.attachments.length > 0 && (
                          <div className="mb-2.5 flex flex-wrap gap-2">
                            {m.attachments.map((att) =>
                              att.dataUrl ? (
                                <img
                                  key={att.id}
                                  src={att.dataUrl}
                                  alt={att.name}
                                  referrerPolicy="no-referrer"
                                  className="h-24 w-24 rounded-lg border border-white/25 object-cover"
                                />
                              ) : (
                                <div
                                  key={att.id}
                                  className="rounded-lg border border-white/25 bg-black/15 px-2.5 py-1.5 text-[11px]"
                                >
                                  {att.name}
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {isUser ? (
                          <div dir="auto" className="whitespace-pre-wrap break-words">
                            {m.content}
                          </div>
                        ) : m.isError ? (
                          <div className="space-y-2.5">
                            <p dir="auto" className="text-sm font-medium text-foreground">
                              {m.content}
                            </p>
                            {m.retryPrompt && (
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    void sendMessage(m.retryPrompt!, { retryErrorId: m.id })
                                  }
                                  className="min-h-[36px] gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw className="size-3.5" />
                                  <span>{isAr ? "إعادة المحاولة" : "Retry"}</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    updateCurrentMessages((prev) =>
                                      prev.filter((item) => item.id !== m.id),
                                    );
                                    triggerOfflineFallbackReply(m.retryPrompt!, []);
                                  }}
                                  className="min-h-[36px] gap-1.5 cursor-pointer text-xs"
                                >
                                  <WifiOff className="size-3.5" />
                                  <span>
                                    {isAr ? "الرد بالوضع المحلي" : "Answer Locally Offline"}
                                  </span>
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <SafeMarkdownRenderer content={m.content} />
                        )}

                        {!isUser && !m.isError && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSpeakText(m.id, m.content)}
                                className={`text-xs flex items-center gap-1.5 font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                                  speakingId === m.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-primary hover:bg-primary/10"
                                }`}
                              >
                                <Volume2 className="size-3.5" />
                                <span>
                                  {speakingId === m.id
                                    ? isAr
                                      ? "إيقاف القراءة"
                                      : "Stop Reading"
                                    : isAr
                                      ? "قراءة صوتية"
                                      : "Read Aloud"}
                                </span>
                              </button>

                              {(m.tierUsed || m.modelUsed) && (
                                <span className="font-mono text-[10px] text-muted-foreground/80">
                                  {formatFriendlyModelTier(m.tierUsed ?? m.modelUsed, isAr)}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopy(m.id, m.content)}
                              className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 opacity-80 cursor-pointer"
                            >
                              {copiedId === m.id ? (
                                <span className="text-emerald-500 font-semibold">
                                  {isAr ? "تم النسخ" : "Copied"}
                                </span>
                              ) : (
                                <>
                                  <Copy className="size-3" />
                                  <span>{isAr ? "نسخ" : "Copy"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground mt-1">
                          <User className="size-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-3 justify-start items-start">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary mt-1">
                      <Bot className="size-4" />
                    </div>
                    {streamingContent ? (
                      <div
                        className={`max-w-[88%] sm:max-w-[82%] surface-card border border-border/80 rounded-2xl rounded-tl-xs p-4 leading-relaxed ${
                          largeText ? "text-lg" : "text-sm"
                        }`}
                      >
                        <SafeMarkdownRenderer content={streamingContent} />
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Loader2 className="size-3 animate-spin text-primary" />
                          <span>{isAr ? "يكتب الرد..." : "Streaming..."}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="surface-card border border-border/80 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>
                          {isAr ? "BTC AI يفكر ويكتب الرد..." : "BTC AI is generating response..."}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Upgraded Multimodal Prompt Dock (مكان للبرومبت + صور + تسجيل + voice conversation) */}
          <form
            onSubmit={handleSend}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              void processSelectedImages(e.dataTransfer.files);
            }}
            className="border-t border-border/70 bg-surface/90 px-3.5 py-3 sm:px-6"
          >
            <div className="mx-auto max-w-3xl space-y-2">
              {/* Live Speech Dictation Draft Confirmation Strip */}
              {voiceDraft !== null && (
                <div className="rounded-xl border border-primary/40 bg-surface-2 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
                    <span>
                      {isAr ? "التسجيل الصوتي قيد الاستماع..." : "Live Voice Recording Draft"}
                    </span>
                    <button
                      type="button"
                      onClick={discardVoiceDraft}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={voiceDraft}
                    onChange={(e) => setVoiceDraft(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={discardVoiceDraft}
                      className="h-7 px-2.5 text-xs"
                    >
                      {isAr ? "تجاهل" : "Discard"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={confirmVoiceDraft}
                      disabled={!voiceDraft.trim()}
                      className="h-7 px-3 text-xs gap-1"
                    >
                      <Check className="size-3" />
                      <span>{isAr ? "إدراج في البرومبت" : "Insert into Prompt"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending Image Attachments Preview Strip */}
              {pendingAttachments.length > 0 && (
                <div
                  data-testid="ai-attachments-preview"
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-surface-2/70 p-2"
                >
                  {pendingAttachments.map((att, idx) => (
                    <div
                      key={att.id}
                      className="relative group flex items-center gap-2 rounded-lg border border-border bg-surface p-1 pe-6"
                    >
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="size-11 rounded object-cover"
                      />
                      <span className="max-w-[110px] truncate text-[11px] text-muted-foreground">
                        {att.name}
                      </span>
                      <button
                        type="button"
                        data-testid={`ai-remove-attachment-${idx}`}
                        onClick={() => removePendingAttachment(att.id)}
                        aria-label={isAr ? "إزالة الصورة" : "Remove image"}
                        className="absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-surface-2 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Prompt Composer Box */}
              <div
                className={`relative rounded-2xl border bg-surface-2/60 transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 ${
                  isDragOver
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "border-border"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  data-testid="ai-image-input"
                  onChange={(e) => void handleImageInputChange(e)}
                  className="hidden"
                />

                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={
                    isAr
                      ? "اكتب البرومبت أو سؤالك هنا، أرفق صوراً، أو استخدم التسجيل الصوتي..."
                      : "Ask a study question, write your prompt, attach images, or code..."
                  }
                  rows={2}
                  className={`w-full resize-none border-0 bg-transparent px-3.5 pt-3 pb-2 focus-visible:ring-0 placeholder:text-muted-foreground ${
                    largeText ? "text-base" : "text-sm"
                  }`}
                  disabled={loading}
                />

                {/* Prompt Composer Toolbar: Attach Images + Prompt Settings + Recording + Voice Conversation + Send */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2.5 pt-1 border-t border-border/40">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Image Attachments Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="ai-attach-image-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || pendingAttachments.length >= MAX_IMAGE_ATTACHMENTS}
                      title={isAr ? "إرفاق صور للتحليل" : "Attach images"}
                      aria-label={isAr ? "إرفاق صور" : "Attach images"}
                      className="h-9 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      <ImagePlus className="size-4 text-primary" />
                      <span className="hidden sm:inline">{isAr ? "صور" : "Images"}</span>
                    </Button>

                    {/* Voice Recording / Dictation Icon */}
                    <Button
                      type="button"
                      variant={recording ? "destructive" : "outline"}
                      size="sm"
                      data-testid="ai-record-voice-btn"
                      onClick={() => void toggleVoiceRecording()}
                      disabled={loading || transcribingAudio}
                      title={
                        recording
                          ? isAr
                            ? "إيقاف التسجيل"
                            : "Stop recording"
                          : isAr
                            ? "تسجيل صوتي"
                            : "Record voice"
                      }
                      aria-label={
                        recording
                          ? isAr
                            ? "إيقاف التسجيل"
                            : "Stop recording"
                          : isAr
                            ? "تسجيل صوتي"
                            : "Record voice"
                      }
                      className="h-9 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      {transcribingAudio ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : recording ? (
                        <Square className="size-3.5 fill-current" />
                      ) : (
                        <Mic className="size-4 text-primary" />
                      )}
                      <span className="hidden sm:inline">
                        {transcribingAudio
                          ? isAr
                            ? "تفريغ..."
                            : "Transcribing..."
                          : recording
                            ? isAr
                              ? "إيقاف"
                              : "Stop"
                            : isAr
                              ? "تسجيل"
                              : "Record"}
                      </span>
                    </Button>

                    {/* Voice Conversation Icon */}
                    <Button
                      type="button"
                      variant={showVoiceTutor ? "glow" : "outline"}
                      size="sm"
                      data-testid="ai-composer-voice-btn"
                      onClick={() => setShowVoiceTutor((v) => !v)}
                      title={isAr ? "فتح المحادثة الصوتية المباشرة" : "Voice Conversation"}
                      aria-label={isAr ? "المحادثة الصوتية" : "Voice Conversation"}
                      className="h-9 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      <Waves className="size-4 text-primary" />
                      <span className="hidden sm:inline">
                        {isAr ? "محادثة صوتية" : "Voice Chat"}
                      </span>
                    </Button>

                    {/* Custom Prompt & Settings Shortcut */}
                    <Button
                      type="button"
                      variant={customSystemPrompt.trim() || settingsOpen ? "secondary" : "ghost"}
                      size="sm"
                      data-testid="ai-composer-settings-btn"
                      onClick={() => setSettingsOpen((v) => !v)}
                      title={isAr ? "البرومبت المخصص والإعدادات" : "Custom Prompt & Settings"}
                      aria-label={isAr ? "البرومبت والإعدادات" : "Prompt & Settings"}
                      className="h-9 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      <SlidersHorizontal className="size-3.5" />
                      <span className="hidden md:inline">
                        {isAr ? "البرومبت" : "Custom Prompt"}
                      </span>
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!prompt.trim() && pendingAttachments.length === 0) || loading}
                    className="gap-1.5 font-bold cursor-pointer min-h-[38px] px-4"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isAr ? "إرسال" : "Send"}</span>
                        <Send className="size-3.5 rtl-flip" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Custom Prompt & Settings Drawer Panel */}
        {settingsOpen && (
          <aside
            data-testid="ai-settings-panel"
            className="w-full lg:w-84 max-h-96 lg:max-h-none shrink-0 flex flex-col border-t lg:border-t-0 lg:border-s border-border/80 bg-surface-2/40 p-4 space-y-4 overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <h2 className="font-display text-sm font-bold text-foreground">
                  {isAr ? "إعدادات BTC AI والبرومبت" : "AI Settings & Custom Prompt"}
                </h2>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setSettingsOpen(false)}
                className="size-7 cursor-pointer"
                aria-label={isAr ? "إغلاق الإعدادات" : "Close Settings"}
              >
                <X className="size-3.5" />
              </Button>
            </div>

            {/* Dedicated Custom System Prompt Workspace */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ai-custom-prompt-input"
                  className="text-xs font-bold text-foreground"
                >
                  {isAr ? "مكان البرومبت المخصص (تعليمات دائمة)" : "Custom System Prompt"}
                </label>
                {customSystemPrompt.trim() && (
                  <button
                    type="button"
                    onClick={() => setCustomSystemPrompt("")}
                    className="text-[11px] text-destructive hover:underline cursor-pointer"
                  >
                    {isAr ? "مسح" : "Clear"}
                  </button>
                )}
              </div>
              <Textarea
                id="ai-custom-prompt-input"
                data-testid="ai-custom-prompt-input"
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                rows={4}
                placeholder={
                  isAr
                    ? "اكتب هنا شخصيتك المفضلة للمساعد أو قواعد الرد (مثال: اشرح دائماً بأمثلة واضحة وبدون إطالة)..."
                    : "Write permanent instructions for BTC AI (e.g., Always reply with step-by-step examples and concise takeaways)..."
                }
                className="text-xs bg-surface border-border resize-none"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {isAr ? "قوالب برومبت جاهزة:" : "Quick Prompt Templates:"}
                </span>
                <div className="grid gap-1.5">
                  {PROMPT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setCustomSystemPrompt(isAr ? preset.promptAr : preset.promptEn)
                      }
                      className="rounded-lg border border-border/70 bg-surface px-2.5 py-2 text-start text-[11px] font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-surface-2 cursor-pointer"
                    >
                      {isAr ? preset.labelAr : preset.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Tuning */}
            <div className="space-y-3 border-t border-border/60 pt-3">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground">
                  {isAr ? "طول الإجابة" : "Response Length"}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "concise", ar: "مختصر", en: "Concise" },
                      { id: "standard", ar: "متوازن", en: "Standard" },
                      { id: "detailed", ar: "مفصل", en: "Detailed" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setStudioPrefs((prev) => ({ ...prev, responseLength: opt.id }))
                      }
                      className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        studioPrefs.responseLength === opt.id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground">
                  {isAr ? "أسلوب الحديث" : "Tone"}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "coach", ar: "صاحب وموجه", en: "Coach" },
                      { id: "calm", ar: "هادئ", en: "Calm" },
                      { id: "academic", ar: "أكاديمي", en: "Academic" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStudioPrefs((prev) => ({ ...prev, tone: opt.id }))}
                      className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        studioPrefs.tone === opt.id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between gap-2 text-xs cursor-pointer">
                  <span className="font-medium text-foreground">
                    {isAr ? "الشرح بالخطوات المرقمة" : "Step-by-step structure"}
                  </span>
                  <input
                    type="checkbox"
                    checked={studioPrefs.stepByStep}
                    onChange={(e) =>
                      setStudioPrefs((prev) => ({ ...prev, stepByStep: e.target.checked }))
                    }
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 text-xs cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Globe className="size-3.5 text-primary" />
                    <span>{isAr ? "تفعيل البحث المباشر" : "Live Web Search Grounding"}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={studioPrefs.useSearchGrounding}
                    onChange={(e) =>
                      setStudioPrefs((prev) => ({
                        ...prev,
                        useSearchGrounding: e.target.checked,
                      }))
                    }
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 text-xs cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Volume2 className="size-3.5 text-primary" />
                    <span>{isAr ? "قراءة الردود تلقائياً" : "Auto-read AI replies"}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={studioPrefs.autoReadReplies}
                    onChange={(e) =>
                      setStudioPrefs((prev) => ({ ...prev, autoReadReplies: e.target.checked }))
                    }
                    className="size-4 accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* AI Conversation English Accent & Speaking Speed */}
            <div className="border-t border-border/60 pt-3">
              <VoiceConversationSettingsPanel compact />
            </div>

            {/* Display Accessibility Controls */}
            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant={largeText ? "default" : "outline"}
                size="sm"
                onClick={() => setLargeText((v) => !v)}
                className="flex-1 text-xs gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Accessibility className="size-3.5" />
                <span>{isAr ? "خط كبير" : "Large Text"}</span>
              </Button>
              <Button
                type="button"
                variant={highContrast ? "default" : "outline"}
                size="sm"
                onClick={() => setHighContrast((v) => !v)}
                className="flex-1 text-xs gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Eye className="size-3.5" />
                <span>{isAr ? "تباين عالي" : "Contrast"}</span>
              </Button>
            </div>
          </aside>
        )}

        {/* Live Voice Conversation & Audio Visualizer Drawer */}
        {showVoiceTutor && (
          <aside className="w-full lg:w-88 max-h-[26rem] lg:max-h-none shrink-0 flex flex-col border-t lg:border-t-0 lg:border-s border-border/80 bg-surface-2/40 p-3 overflow-y-auto">
            <VoiceConversationDrawer
              contextSummary={`${activeRoleMeta.labelEn} (${activeTierMeta.labelEn})`}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
