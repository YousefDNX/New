import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Copy,
  Check,
  Send,
  Sparkles,
  RotateCcw,
  User,
  Loader2,
  Volume2,
  Mic,
  Eye,
  Accessibility,
} from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceDictationButton } from "@/components/common/VoiceDictationButton";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const AI_SESSION_STORAGE_KEY = "btc_accessible_ai_conversation_v1";

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

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Accessibility toggles for chatbot
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(AI_SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save AI conversation:", e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: cleanPrompt,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    try {
      const history = newMessages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          history,
          subject: "General",
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply
          : typeof data?.content === "string" && data.content.trim()
            ? data.content
            : isAr
              ? "تمت معالجة سؤالك، ولكن لم تتلق المنصة إجابة نصية مباشرة. يرجى إعادة المحاولة."
              : "Your question was processed, but no direct reply was returned. Please try again.";

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("BTC AI chat error:", err);
      const fallbackReply: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: "assistant",
        content: isAr
          ? "تعذر الاتصال بخدمة BTC الذكي حالياً. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
          : "Could not connect to BTC AI service at this time. Please check your connection and try again.",
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
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
      textAr: "اشرح لي قاعدة الوحدات الدراسية للصف التاسع ببساطة",
      textEn: "Explain Grade 9 study units simply",
    },
    {
      textAr: "كيف أستخدم كلمات الوحدة الأولى في جملة صحيحة؟",
      textEn: "How do I use Unit 1 vocabulary in sentences?",
    },
    {
      textAr: "ساعدني في تلخيص أهم قواعد الأمان الرقمي للوحدة الثانية",
      textEn: "Help me summarise digital safety rules for Unit 2",
    },
  ];

  return (
    <div
      className={`mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col pb-4 ${highContrast ? "contrast-125 bg-stone-950 text-white" : ""}`}
    >
      {/* Top Header & Accessibility Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{isAr ? "BTC الذكي (مساعد سهل للجميع)" : "BTC AI (Accessible Chatbot)"}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "مساعدك الدراسي الذكي مع دعم الصوت وإمكانية الوصول الكاملة."
                : "Your accessible AI study assistant with voice & reading support."}
            </p>
          </div>
        </div>

        {/* Accessibility Toolbar */}
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
            <span>{isAr ? "جديد" : "New Chat"}</span>
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
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
                  ? "مرحباً! اسألنِي عن أي درس أو كلمة إنجليزية"
                  : "Hello! Ask me about any study lesson or English word"}
              </h2>
              <p
                className={`text-muted-foreground leading-relaxed ${largeText ? "text-base" : "text-xs"}`}
              >
                {isAr
                  ? "يمكنك كتابة سؤالك أو استخدام زر الميكروفون للصوت. المساعد جاهز لمساعدتك."
                  : "Type your question or use voice dictation. The assistant is ready to help you."}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full max-w-lg space-y-2 pt-2 text-start">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {isAr ? "أسئلة مقترحة:" : "Suggested questions:"}
              </div>
              <div className="space-y-1.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(isAr ? p.textAr : p.textEn)}
                    className="w-full rounded-xl border border-border/80 bg-surface-2/50 hover:bg-surface-2 hover:border-primary/40 p-3 text-xs text-start text-foreground transition-all cursor-pointer font-medium"
                  >
                    "{isAr ? p.textAr : p.textEn}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
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
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
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
            placeholder={
              isAr
                ? "اكتب سؤالك هنا أو استخدم زر الصوت للملاءمة..."
                : "Type your study question here or use voice dictation..."
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
