import React, { useState, useEffect, useRef } from "react";
import {
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
} from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceDictationButton } from "@/components/common/VoiceDictationButton";
import { generateCurriculumAwareReply, type ChatbotRoleId } from "@/lib/ai-fallback";

type ChatModelTier = "balanced" | "fast" | "complex" | "deep";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string | undefined;
  roleId?: ChatbotRoleId | undefined;
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
    labelEn: "Vocab & Unit 9 Coach",
    labelAr: "مدرّب المفردات والوحدة ٩",
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
    labelEn: "General (Hydrogen)",
    labelAr: "عام (Hydrogen)",
    taskEn: "Everyday Q&A",
    taskAr: "الأسئلة العامة",
    icon: Sparkles,
  },
  {
    id: "fast",
    modelName: "gemini-3.1-flash-lite",
    labelEn: "Fast (Flash Lite)",
    labelAr: "سريع (Flash Lite)",
    taskEn: "Quick replies",
    taskAr: "ردود فورية",
    icon: Zap,
  },
  {
    id: "complex",
    modelName: "gemini-4-neon",
    labelEn: "Interactive (Neon)",
    labelAr: "تفاعلي (Neon)",
    taskEn: "Complex tasks",
    taskAr: "مهام تفاعلية معقدة",
    icon: Cpu,
  },
  {
    id: "deep",
    modelName: "gemini-4-carbon",
    labelEn: "Deep Reason (Carbon)",
    labelAr: "تفكير عميق (Carbon)",
    taskEn: "Deep reasoning",
    taskAr: "تحليل واستنتاج عميق",
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
  const { lang } = usePrefs();
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Accessibility toggles for chatbot
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

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
  }, [messages, loading]);

  const sendMessage = async (rawText: string) => {
    const cleanPrompt = rawText.trim();
    if (!cleanPrompt || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: cleanPrompt,
      timestamp: new Date().toISOString(),
    };

    // Pass prior turns as history cleanly (without duplicating the current turn)
    const priorHistory = messages.slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
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

      let replyText: string | null = null;
      let modelUsed: string | undefined;

      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        replyText = extractReplyText(data);
        if (typeof data["modelUsed"] === "string") {
          modelUsed = data["modelUsed"];
        }
      }

      if (!replyText) {
        replyText = generateCurriculumAwareReply({
          message: cleanPrompt,
          history: priorHistory,
          role: chatbotRole,
          langHint: lang,
        });
        modelUsed = "btc-study-assistant";
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toISOString(),
        modelUsed,
        roleId: chatbotRole,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Seamless curriculum-aware study fallback if the network or API route is unreachable
      const fallbackText = generateCurriculumAwareReply({
        message: cleanPrompt,
        history: priorHistory,
        role: chatbotRole,
        langHint: lang,
      });

      const fallbackReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: fallbackText,
        timestamp: new Date().toISOString(),
        modelUsed: "btc-study-assistant",
        roleId: chatbotRole,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
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

  // Text-To-Speech reader for accessibility
  const handleSpeakText = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info(
        isAr
          ? "قراءة النص غير مدعومة في متصفحك."
          : "Speech synthesis is not supported in your browser.",
      );
      return;
    }
    try {
      window.speechSynthesis.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isAr ? "ar-SA" : "en-GB";
      utterance.rate = 0.9;
      setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingId(null);
    }
  };

  const samplePrompts = [
    {
      textAr: "اشرح لي كلمة hypothesis و algorithm من الوحدة التاسعة مع أمثلة",
      textEn: "Explain 'hypothesis' and 'algorithm' from Unit 9 with examples",
    },
    {
      textAr: "اختبرني بسؤال اختيار من متعدد على مفردات الوحدة التاسعة",
      textEn: "Give me a Unit 9 vocabulary multiple-choice quiz question",
    },
    {
      textAr: "ساعدني في مراجعة أهم كلمات التفوّق مثل analyse و persevere",
      textEn: "Help me practise essential academic words like 'analyse' and 'persevere'",
    },
  ];

  const activeTierMeta = MODEL_TIERS.find((t) => t.id === modelTier) ?? MODEL_TIERS[0]!;
  const activeRoleMeta = CHATBOT_ROLES.find((r) => r.id === chatbotRole) ?? CHATBOT_ROLES[0]!;

  return (
    <div
      className={`mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col pb-4 ${highContrast ? "contrast-125 bg-stone-950 text-white" : ""}`}
    >
      {/* Top Header & Accessibility Toolbar */}
      <div className="space-y-3 border-b border-border/70 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>
                  {isAr ? "BTC AI — مساعد Gemini الدراسي" : "BTC AI — Gemini Study Chatbot"}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `الدور: ${activeRoleMeta.labelAr} · النموذج: ${activeTierMeta.modelName}`
                  : `Role: ${activeRoleMeta.labelEn} · Model: ${activeTierMeta.modelName}`}
              </p>
            </div>
          </div>

          {/* Accessibility & Chat Reset Toolbar */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={largeText ? "default" : "outline"}
              size="sm"
              onClick={() => setLargeText((v) => !v)}
              className="text-xs gap-1 h-8 cursor-pointer"
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
              className="text-xs gap-1 h-8 cursor-pointer"
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
              className="gap-1.5 text-xs font-semibold cursor-pointer shrink-0 h-8"
            >
              <RotateCcw className="size-3.5" />
              <span>{isAr ? "محادثة جديدة" : "New Chat"}</span>
            </Button>
          </div>
        </div>

        {/* Role & Gemini Model Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Chatbot Role"
          >
            {CHATBOT_ROLES.map((roleItem) => {
              const Icon = roleItem.icon;
              const selected = chatbotRole === roleItem.id;
              return (
                <button
                  key={roleItem.id}
                  type="button"
                  onClick={() => setChatbotRole(roleItem.id)}
                  title={isAr ? roleItem.descAr : roleItem.descEn}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface-2/80 text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{isAr ? roleItem.labelAr : roleItem.labelEn}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Model Mode">
            {MODEL_TIERS.map((tierItem) => {
              const Icon = tierItem.icon;
              const selected = modelTier === tierItem.id;
              return (
                <button
                  key={tierItem.id}
                  type="button"
                  onClick={() => setModelTier(tierItem.id)}
                  title={`${tierItem.modelName} — ${isAr ? tierItem.taskAr : tierItem.taskEn}`}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    selected
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border/70 bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3" />
                  <span>{isAr ? tierItem.labelAr : tierItem.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
                  ? "مرحباً! أنا BTC الذكي — اسألني عن أي درس أو كلمة إنجليزية"
                  : "Hello! Ask BTC AI about any study topic, Unit 9 word, or quiz"}
              </h2>
              <p
                className={`text-muted-foreground leading-relaxed ${largeText ? "text-base" : "text-xs"}`}
              >
                {isAr
                  ? "يحفظ المساعد سياق المحادثة كاملة معك، ويتكيّف حسب الدور المختار ونوع المهمة."
                  : "Multi-turn conversation stays connected across follow-up questions with dedicated tutor roles."}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full max-w-lg space-y-2 pt-2 text-start">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {isAr ? "أسئلة مقترحة (انقر للإرسال أو التعديل):" : "Suggested questions:"}
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
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary mt-1">
                    <Bot className="size-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 leading-relaxed ${
                    largeText ? "text-lg" : "text-sm"
                  } ${
                    isUser
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                      : "surface-card border border-border/80 text-foreground rounded-tl-xs space-y-2"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>

                  {!isUser && (
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
                            {m.modelUsed}
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
          <div className="flex gap-3 justify-start items-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="size-4" />
            </div>
            <div className="surface-card border border-border/80 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>{isAr ? "BTC الذكي يعالج سؤالك..." : "BTC AI is generating response..."}</span>
            </div>
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
                : "Ask a study question, Unit 9 vocabulary, or follow-up..."
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
              className="gap-1.5 font-bold cursor-pointer"
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
  );
}
