import { useState } from "react";
import { Send, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectUnsafeDojoRequest } from "@/lib/dojo-safety";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface DojoMentorChatProps {
  isAr: boolean;
  lang: string;
}

const SUGGESTED_PROMPTS = [
  {
    en: "What does 'Jita-Kyoei' mean in Judo?",
    ar: "ما معنى مبدأ «جيتا-كيوي» في الجودو؟",
  },
  {
    en: "How do I stay calm when classmates tease me?",
    ar: "كيف أحافظ على هدوئي عند تعرضي للاستفزاز؟",
  },
  {
    en: "What safety checks should parents verify at a local club?",
    ar: "ما معايير السلامة التي يتحقق منها الوالدان في النادي الرياضي؟",
  },
];

function buildSafeOfflineDojoReply(prompt: string, isAr: boolean): string {
  const lower = prompt.toLowerCase();
  if (
    lower.includes("judo") ||
    lower.includes("jita") ||
    prompt.includes("جودو") ||
    prompt.includes("جيتا")
  ) {
    return isAr
      ? "مبدأ **جيتا-كيوي (Jita-Kyoei)** الذي أسسه جيغورو كانو يعني «المنفعة والخير المتبادل للجميع» — أي أن الزملاء في التدريب يتعاونون ليحمي كلٌّ منهم سلامة الآخر ويتقدما معاً بأمان وتواضع."
      : "**Jita-Kyoei** ('Mutual Welfare and Benefit') was established by Judo founder Jigoro Kano to teach that progress comes through cooperation and protecting each other's safety—never through ego or harm.";
  }
  if (
    lower.includes("bully") ||
    lower.includes("tease") ||
    lower.includes("calm") ||
    prompt.includes("تنمر") ||
    prompt.includes("هدوء")
  ) {
    return isAr
      ? "القوة الحقيقية تبدأ بضبط النفس: خذ ثلاثة أنفاس هادئة، وحافظ على مسافة آمنة، واستخدم عبارة موجزة وحازمة لرفض الإساءة، ثم انتقل إلى مكان مأهول واستعن بمعلم أو ولي أمر."
      : "True Dojo strength begins with composure: take three calm breaths, maintain safe distance, use brief firm boundaries, move toward a staffed area, and involve a trusted adult, teacher, or counselor.";
  }
  return isAr
    ? "أهلاً بك في موجّه الدوجو! يمكنك سؤالي عن تاريخ الفنون القتالية (١٤ فناً)، أو قيم الاحترام والتواضع، أو مناهضة التنمر، أو إرشادات السلامة العامة. *(ملاحظة: يتم الاعتماد حالياً على المرشد التعليمي المحلّي الآمن لعدم توفر اتصال خادم الذكاء الاصطناعي)*."
    : "Welcome to Dojo Mentor! Ask about martial arts history, ethics, anti-bullying strategies, safe warm-ups, or how to evaluate certified clubs safely. *(Local educational mentor mode active while server AI is offline or unconfigured.)*";
}

export function DojoMentorChat({ isAr, lang }: DojoMentorChatProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "dojo_welcome",
      role: "assistant",
      content: isAr
        ? "مرحباً بك في موجّه الدوجو! أسعد بمساعدتك في فهم تاريخ فنون القتال وأخلاقها، وبناء الانضباط، والتعامل الحكيم مع التنمر. لن أقدّم أي تعليمات للهجوم أو العنف."
        : "Welcome to Dojo Mentor AI! I help you explore martial arts history, character discipline, safe training principles, and peaceful anti-bullying wisdom. I never provide striking, grappling attack, weapons, or medical advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const sendPrompt = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;

    const userMsg: ChatMsg = { id: `u_${Date.now()}`, role: "user", content: clean };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Immediate non-violence guardrail check before calling API
    const guard = detectUnsafeDojoRequest(clean, lang);
    if (guard.unsafe) {
      setMessages((prev) => [
        ...prev,
        { id: `guard_${Date.now()}`, role: "assistant", content: guard.refusalText },
      ]);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          domainMode: "dojo_mentor",
          enableActionProposals: false,
          prefs: {
            responseLanguage: lang,
            tone: "calm",
            responseLength: "concise",
          },
        }),
      });
      const data = (await res.json()) as { ok?: boolean; text?: string };
      const reply = data.ok && data.text ? data.text : buildSafeOfflineDojoReply(clean, isAr);
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `off_${Date.now()}`,
          role: "assistant",
          content: buildSafeOfflineDojoReply(clean, isAr),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface-card space-y-4 p-5" data-testid="dojo-mentor-chat">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <Sparkles className="size-5 text-primary" />
            {isAr ? "موجّه الدوجو الذكي (حوار آمن وهادئ)" : "Dojo Mentor AI"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "موجّه تعليمي للقيم والتاريخ والوقاية والتهدئة — يرفض طلبات العنف أو التشخيص الطبي."
              : "Strictly educational mentor for history, character ethics, de-escalation, and safe training—refuses attack/weapon/medical requests."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <ShieldAlert className="size-3.5 text-primary" />
          {isAr ? "حماية عدم الإيذاء مفعّلة" : "Non-Violence Guard Active"}
        </span>
      </div>

      {/* Quick Safe Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((sp) => (
          <button
            key={sp.en}
            type="button"
            onClick={() => void sendPrompt(isAr ? sp.ar : sp.en)}
            className="min-h-[36px] rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs text-foreground hover:border-primary/40"
          >
            {isAr ? sp.ar : sp.en}
          </button>
        ))}
      </div>

      {/* Transcript */}
      <div className="max-h-80 space-y-2.5 overflow-y-auto rounded-xl border border-border bg-surface-2/40 p-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg p-3 text-xs whitespace-pre-wrap ${
              m.role === "user"
                ? "ms-auto max-w-[85%] border border-primary/30 bg-primary/15 text-foreground"
                : "me-auto max-w-[90%] border border-border bg-card text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendPrompt(input);
        }}
        className="flex gap-2"
      >
        <Input
          data-testid="dojo-mentor-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isAr
              ? "اسأل موجّه الدوجو عن القيم أو التاريخ أو مناهضة التنمر..."
              : "Ask Dojo Mentor about ethics, history, safety, or calm de-escalation..."
          }
          className="min-h-[44px] text-xs"
        />
        <Button
          type="submit"
          variant="glow"
          disabled={busy || !input.trim()}
          data-testid="dojo-mentor-send"
          className="min-h-[44px] shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  );
}
