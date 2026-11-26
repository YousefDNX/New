import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Bot,
  Copy,
  Send,
  Sparkles,
  RotateCcw,
  User,
  Loader2,
  Volume2,
  Eye,
  Accessibility,
  BookOpen,
  Cpu,
  GraduationCap,
  Zap,
  Brain,
  RefreshCw,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import { VoiceDictationButton } from "@/components/common/VoiceDictationButton";
import { SafeMarkdownRenderer } from "@/components/ai/SafeMarkdownRenderer";
import { VoiceConversationDrawer } from "@/components/ai/VoiceConversationDrawer";
import { speakEnhancedText, stopEnhancedSpeech } from "@/lib/speech-service";
import type { ChatbotRoleId } from "@/lib/ai-fallback";

export function formatFriendlyModelTier(raw?: string, isAr?: boolean): string {
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower.includes("carbon") || lower.includes("research") || lower.includes("deep")) {
    return isAr ? "وضع البحث (Research)" : "Research Mode";
  }
  if (lower.includes("neon") || lower.includes("pro") || lower.includes("complex")) {
    return isAr ? "الوضع الاحترافي (Pro)" : "Pro Mode";
  }
  if (lower.includes("flash") || lower.includes("fast")) {
    return isAr ? "الوضع السريع (Fast)" : "Fast Mode";
  }
  return isAr ? "الوضع العادي (Normal)" : "Normal Mode";
}

type ChatModelTier = "balanced" | "fast" | "complex" | "deep";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string | undefined;
  roleId?: ChatbotRoleId | undefined;
  isError?: boolean | undefined;
  retryPrompt?: string | undefined;
}

const AI_SESSION_STORAGE_KEY = "btc_gemini_chatbot_conversation_v2";
const AI_ROLE_STORAGE_KEY = "btc_gemini_chatbot_role_v1";
const AI_TIER_STORAGE_KEY = "btc_gemini_chatbot_tier_v1";

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
    labelEn: "Study Tutor",
    labelAr: "المعلم الدراسي",
    descEn: "All school subjects & clear explanations",
    descAr: "جميع المواد الدراسية وشرح مبسط",
    icon: GraduationCap,
  },
  {
    id: "vocab",
    labelEn: "Vocab & Important Words Coach",
    labelAr: "مدرّب المفردات والكلمات المهمة",
    descEn: "Grade 9 meanings, examples & quizzes",
    descAr: "معاني الصف التاسع وأمثلة واختبارات",
    icon: BookOpen,
  },
  {
    id: "stem",
    labelEn: "STEM Mentor",
    labelAr: "موجّه العلوم والرياضيات",
    descEn: "Step-by-step maths, physics & coding",
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
  modelName: string;
  labelEn: string;
  labelAr: string;
  taskEn: string;
  taskAr: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "balanced",
    modelName: "gemini-4-hydrogen",
    labelEn: "Normal",
    labelAr: "عادي",
    taskEn: "Standard Q&A & tutoring",
    taskAr: "أسئلة عامة وشرح مبسط",
    icon: Sparkles,
  },
  {
    id: "fast",
    modelName: "gemini-3.1-flash-lite",
    labelEn: "Fast",
    labelAr: "سريع",
    taskEn: "Quick replies & summaries",
    taskAr: "ردود فورية وتلخيص سريع",
    icon: Zap,
  },
  {
    id: "complex",
    modelName: "gemini-4-neon",
    labelEn: "Pro",
    labelAr: "احترافي (Pro)",
    taskEn: "Detailed reasoning & coding",
    taskAr: "تفصيل متقدم وبرمجة",
    icon: Cpu,
  },
  {
    id: "deep",
    modelName: "gemini-4-carbon",
    labelEn: "Research",
    labelAr: "بحث وتحليل (Research)",
    taskEn: "Deep study & research",
    taskAr: "تحليل وبحث عميق",
    icon: Brain,
  },
];

function extractReplyText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  const candidates = [rec["text"], rec["reply"], rec["content"]];
  for (const cand of candidates) {
    if (typeof cand === "string" && cand.trim().length > 0) {
      return cand.trim();
    }
  }
  return null;
}

export function AiWorkspace() {
  const { lang, ecosystem } = usePrefs();
  const isAr = lang === "ar";

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.sessionStorage.getItem(AI_SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [chatbotRole, setChatbotRole] = useState<ChatbotRoleId>(() => {
    if (typeof window === "undefined") return "general";
    try {
      const stored = window.sessionStorage.getItem(AI_ROLE_STORAGE_KEY) as ChatbotRoleId | null;
      return stored && ["general", "vocab", "stem", "exam"].includes(stored) ? stored : "general";
    } catch {
      return "general";
    }
  });

  const [modelTier, setModelTier] = useState<ChatModelTier>(() => {
    if (typeof window === "undefined") return "balanced";
    try {
      const stored = window.sessionStorage.getItem(AI_TIER_STORAGE_KEY) as ChatModelTier | null;
      return stored && ["balanced", "fast", "complex", "deep"].includes(stored)
        ? stored
        : "balanced";
    } catch {
      return "balanced";
    }
  });

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Accessibility & live voice toggles for chatbot
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showVoiceTutor, setShowVoiceTutor] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync conversation, role, and model mode to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(AI_SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage quota issues
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(AI_ROLE_STORAGE_KEY, chatbotRole);
    } catch {
      // Ignore storage issues
    }
  }, [chatbotRole]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(AI_TIER_STORAGE_KEY, modelTier);
    } catch {
      // Ignore storage issues
    }
  }, [modelTier]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, loading, streamingContent]);

  const sendMessage = async (rawText: string, opts?: { retryErrorId?: string }) => {
    const cleanPrompt = rawText.trim();
    if (!cleanPrompt || loading) return;

    const priorBase = opts?.retryErrorId
      ? messages.filter((m) => m.id !== opts.retryErrorId && !m.isError)
      : messages.filter((m) => !m.isError);

    // If retrying a failed turn, avoid duplicating the user's message if it's already the last turn
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
      setMessages((prev) => prev.filter((m) => m.id !== opts.retryErrorId));
    } else {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: cleanPrompt,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setPrompt("");
    setStreamingContent("");
    setLoading(true);

    const pushErrorMessage = (errorMsg: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: errorMsg,
          timestamp: new Date().toISOString(),
          isError: true,
          retryPrompt: cleanPrompt,
          roleId: chatbotRole,
        },
      ]);
    };

    try {
      const res = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          history: priorHistory,
          modelTier,
          chatbotRole,
          prefs: {
            responseLanguage: lang,
          },
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (res.ok && contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let doneModelUsed: string | undefined;
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
                text?: string;
                modelUsed?: string;
                message?: string;
              };
              if (evt.type === "delta" && typeof evt.text === "string") {
                accumulated += evt.text;
                setStreamingContent(accumulated);
              } else if (evt.type === "done") {
                doneModelUsed = evt.modelUsed;
              } else if (evt.type === "error") {
                streamError =
                  evt.message ||
                  (isAr
                    ? "تعذّر الحصول على رد من BTC AI."
                    : "Failed to receive response from BTC AI.");
              }
            } catch {
              // Ignore malformed partial SSE chunk
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

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            role: "assistant",
            content: cleanedAccumulated,
            timestamp: new Date().toISOString(),
            modelUsed: doneModelUsed,
            roleId: chatbotRole,
          },
        ]);
        return;
      }

      // Standard JSON fallback path (or JSON error payload)
      let payload: Record<string, unknown> | null = null;
      try {
        payload = (await res.json()) as Record<string, unknown>;
      } catch {
        payload = null;
      }

      if (res.ok && payload && payload["ok"] !== false) {
        const replyText = extractReplyText(payload);
        if (replyText) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              role: "assistant",
              content: replyText,
              timestamp: new Date().toISOString(),
              modelUsed:
                typeof payload["modelUsed"] === "string" ? payload["modelUsed"] : undefined,
              roleId: chatbotRole,
            },
          ]);
          return;
        }
      }

      const errMessage =
        (payload && typeof payload["message"] === "string" && payload["message"].trim()) ||
        (isAr
          ? `تعذّر الاتصال بخدمة BTC AI (رمز ${res.status || "غير متاح"}).`
          : `Unable to reach BTC AI right now (status ${res.status || "unavailable"}).`);
      pushErrorMessage(errMessage);
    } catch {
      pushErrorMessage(
        isAr
          ? "حدث خطأ في الاتصال بخدمة BTC AI. تحقق من الشبكة ثم أعد المحاولة."
          : "Network error reaching BTC AI. Check your connection and retry.",
      );
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
    setMessages([]);
    setPrompt("");
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(AI_SESSION_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    toast.info(isAr ? "تم بدء محادثة جديدة" : "New chat started");
    textareaRef.current?.focus();
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success(isAr ? "تم نسخ النص" : "Copied to clipboard");
    }
  };

  // Natural Text-To-Speech reader for accessibility (strips markdown, selects natural voice)
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
      preferredLocale: isAr ? "ar-SA" : "en-GB",
      rate: ecosystem.ttsSpeed || 0.95,
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
      textAr: "أهلاً! إزيك النهارده؟ تقدر تساعدني في إيه؟",
      textEn: "Hey! What can we work on together today — coding, writing, or studying?",
    },
    {
      textAr: "اكتب دالة بايثون بسيطة لحساب متوسط درجات الطالب مع مثال",
      textEn: "Write a clean TypeScript function to sort study tasks by priority",
    },
    {
      textAr: "اشرح لي الفرق بين Both ... and و Neither ... nor مع تدريب سريع",
      textEn: "Explain 'hypothesis' and 'algorithm' with clear real-world examples",
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
      badge: m.modelName.includes("flash")
        ? "Lite"
        : m.modelName.includes("carbon")
          ? "Deep"
          : m.modelName.includes("neon")
            ? "Pro"
            : "Core",
      icon: <Icon className="size-4" />,
      keywords: `${m.labelEn} ${m.labelAr} ${m.taskEn} ${m.taskAr} ${m.modelName} Deep Reason Carbon`,
    };
  });

  return (
    <div
      className={`mx-auto flex h-[calc(100vh-8rem)] max-w-6xl flex-col pb-4 ${highContrast ? "contrast-125 bg-stone-950 text-white" : ""}`}
    >
      {/* Top Header & Accessibility Toolbar */}
      <div className="space-y-3 border-b border-border/70 pb-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>{isAr ? "BTC AI — المساعد الذكي" : "BTC AI — Intelligent Assistant"}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `الدور: ${activeRoleMeta.labelAr} · الوضع: ${activeTierMeta.labelAr} · الصوت: ${ecosystem.ttsVoice}`
                  : `Role: ${activeRoleMeta.labelEn} · Mode: ${activeTierMeta.labelEn} · Voice: ${ecosystem.ttsVoice}`}
              </p>
            </div>
          </div>

          {/* Accessibility & Live Voice Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={showVoiceTutor ? "glow" : "outline"}
              size="sm"
              onClick={() => setShowVoiceTutor((v) => !v)}
              className="text-xs gap-1.5 min-h-[40px] cursor-pointer"
              data-testid="ai-toggle-voice-tutor"
            >
              <Mic className="size-3.5" />
              <span>{isAr ? "المحادثة الصوتية والثقة" : "Voice & Confidence"}</span>
            </Button>

            <Button
              type="button"
              variant={largeText ? "default" : "outline"}
              size="sm"
              onClick={() => setLargeText((v) => !v)}
              className="text-xs gap-1 min-h-[40px] cursor-pointer"
              title={isAr ? "تكبير الخط" : "Toggle Large Text"}
            >
              <Accessibility className="size-3.5" />
              <span>
                {largeText
                  ? isAr
                    ? "خط كبير (مفعل)"
                    : "Large Text ON"
                  : isAr
                    ? "خط كبير"
                    : "Large Text"}
              </span>
            </Button>

            <Button
              type="button"
              variant={highContrast ? "default" : "outline"}
              size="sm"
              onClick={() => setHighContrast((v) => !v)}
              className="text-xs gap-1 min-h-[40px] cursor-pointer"
              title={isAr ? "التباين العالي" : "High Contrast"}
            >
              <Eye className="size-3.5" />
              <span>
                {highContrast ? (isAr ? "تباين عالي" : "Contrast ON") : isAr ? "تباين" : "Contrast"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="gap-1.5 text-xs font-semibold cursor-pointer shrink-0 min-h-[40px]"
            >
              <RotateCcw className="size-3.5" />
              <span>{isAr ? "محادثة جديدة" : "New Chat"}</span>
            </Button>
          </div>
        </div>

        {/* Unified Spacious Searchable Role & Model Selection Controls */}
        <div className="grid gap-3 sm:grid-cols-2">
          <ModernSelect
            label={isAr ? "دور المساعد الذكي" : "Assistant Role"}
            ariaLabel="Chatbot Role"
            data-testid="ai-role-select"
            value={chatbotRole}
            onValueChange={(v) => setChatbotRole(v as ChatbotRoleId)}
            options={roleSelectOptions}
            searchable
            searchPlaceholder={isAr ? "ابحث في أدوار المساعد..." : "Search tutor roles..."}
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
            searchPlaceholder={isAr ? "ابحث في أوضاع النموذج..." : "Search model modes..."}
            leadingIcon={<Brain className="size-4" />}
          />
        </div>
      </div>

      {/* Main Split Workspace: Chat Thread + Optional Side-by-Side Live Voice & Speaking Confidence */}
      <div
        className={`flex-1 min-h-0 ${showVoiceTutor ? "grid gap-4 lg:grid-cols-12 pt-3" : "flex flex-col"}`}
      >
        <div className={`flex flex-col min-h-0 ${showVoiceTutor ? "lg:col-span-7" : "flex-1"}`}>
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1" data-testid="ai-chat-thread">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-5">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="size-8" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h2
                    className={`font-display font-bold text-foreground ${largeText ? "text-2xl" : "text-lg"}`}
                  >
                    {isAr
                      ? "مرحباً! أنا BTC AI — اسألني في أي موضوع، برمجة، كتابة، أو دراسة"
                      : "Hello! Ask BTC AI anything — conversation, coding, writing, or study"}
                  </h2>
                  <p
                    className={`text-muted-foreground leading-relaxed ${largeText ? "text-base" : "text-xs"}`}
                  >
                    {isAr
                      ? "يتحدث معك بلغتك ولهجتك بطبيعية، ويدعم الشرح والملخصات والأكواد البرمجية والأسئلة الدراسية."
                      : "Replies naturally in your language and dialect across multi-turn conversations, code blocks, summaries, and academics."}
                  </p>
                </div>

                {/* Quick Suggestions */}
                <div className="w-full max-w-lg space-y-2 pt-2 text-start">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? "اقتراحات للبدء:" : "Try asking:"}
                  </div>
                  <div className="space-y-1.5">
                    {samplePrompts.map((p, idx) => {
                      const text = isAr ? p.textAr : p.textEn;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void sendMessage(text)}
                          className="w-full rounded-xl border border-border/80 bg-surface-2/50 hover:bg-surface-2 hover:border-primary/40 p-3 text-xs text-start text-foreground transition-all cursor-pointer font-medium"
                        >
                          &ldquo;{text}&rdquo;
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => {
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
                      className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                        largeText ? "text-lg" : "text-sm"
                      } ${
                        isUser
                          ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                          : m.isError
                            ? "border border-destructive/40 bg-destructive/10 text-foreground rounded-tl-xs space-y-2.5"
                            : "surface-card border border-border/80 text-foreground rounded-tl-xs space-y-2"
                      }`}
                    >
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
                          )}
                        </div>
                      ) : (
                        <SafeMarkdownRenderer content={m.content} />
                      )}

                      {!isUser && !m.isError && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 mt-2">
                          <div className="flex items-center gap-2">
                            {/* TTS read aloud button for accessibility */}
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

                            {m.modelUsed && (
                              <span className="font-mono text-[10px] text-muted-foreground/80">
                                {formatFriendlyModelTier(m.modelUsed, isAr)}
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
              })
            )}

            {loading && (
              <div className="flex gap-3 justify-start items-start">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary mt-1">
                  <Bot className="size-4" />
                </div>
                {streamingContent ? (
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] surface-card border border-border/80 rounded-2xl rounded-tl-xs p-4 leading-relaxed ${
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

          {/* Input Box with Voice Dictation */}
          <form onSubmit={handleSend} className="relative mt-2 border-t border-border/70 pt-3">
            <div className="relative rounded-2xl border border-border bg-surface-2/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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
                    ? "اكتب سؤالك هنا (أو اضغط Enter للإرسال)..."
                    : "Ask a study question, Important Vocabulary, or follow-up..."
                }
                rows={2}
                className={`w-full resize-none border-0 bg-transparent p-3 focus-visible:ring-0 placeholder:text-muted-foreground ${
                  largeText ? "text-base" : "text-sm"
                }`}
                disabled={loading}
              />

              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <VoiceDictationButton
                    size="sm"
                    onInsert={(txt) => setPrompt((prev) => (prev ? `${prev} ${txt}` : txt))}
                  />
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    {isAr ? "الإملاء الصوتي مدعوم" : "Voice dictation enabled"}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!prompt.trim() || loading}
                  className="gap-1.5 font-bold cursor-pointer min-h-[40px]"
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
          </form>
        </div>

        {showVoiceTutor && (
          <aside className="lg:col-span-5 flex flex-col justify-start overflow-y-auto">
            <VoiceConversationDrawer
              contextSummary={`${activeRoleMeta.labelEn} (${activeTierMeta.labelEn})`}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
