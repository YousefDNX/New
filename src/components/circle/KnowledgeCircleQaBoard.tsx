import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Flag,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validateSafeCommunityContribution } from "@/lib/empowerment-engines";
import { usePrefs } from "@/lib/preferences";

export const KNOWLEDGE_CATEGORIES = [
  { id: "math", en: "Mathematics", ar: "الرياضيات" },
  { id: "physics_chem", en: "Physics & Chemistry", ar: "الفيزياء والكيمياء" },
  { id: "biology", en: "Biology & Health", ar: "الأحياء والصحة" },
  { id: "english", en: "English & CEFR", ar: "اللغة الإنجليزية" },
  { id: "arabic", en: "Arabic & Literature", ar: "اللغة العربية والأدب" },
  { id: "islamic", en: "Quran & Islamic Studies", ar: "القرآن والدراسات الإسلامية" },
  { id: "coding", en: "Coding & AI", ar: "البرمجة والذكاء الاصطناعي" },
  { id: "humanities", en: "History & Geography", ar: "التاريخ والجغرافيا" },
  { id: "mun_debate", en: "Debate & MUN", ar: "المناظرة والقيادة" },
  { id: "exams", en: "Study Skills & Exams", ar: "مهارات الدراسة والاختبارات" },
] as const;

type CategoryId = (typeof KNOWLEDGE_CATEGORIES)[number]["id"];

interface QaReply {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  helpfulCount: number;
  likedByMe?: boolean;
}

interface QaThread {
  id: string;
  category: CategoryId;
  author: string;
  title: string;
  body: string;
  createdAt: string;
  helpfulCount: number;
  likedByMe?: boolean;
  replies: QaReply[];
}

const INITIAL_THREADS: QaThread[] = [
  {
    id: "qa-1",
    category: "english",
    author: "Amina S. (Grade 9)",
    title: "Best way to memorize Grade 9 Unit 3 vocabulary for weekly quizzes?",
    body: "I mix up similar adjectives in Unit 3 when writing sentences. How do you practice them with active recall?",
    createdAt: "2h ago",
    helpfulCount: 14,
    replies: [
      {
        id: "r-1",
        author: "Youssef K.",
        body: "Use the flashcards tab in Study Studio and write one short sentence per missed word in the Mistake Log — it cuts confusion in half.",
        createdAt: "1h ago",
        helpfulCount: 8,
      },
    ],
  },
  {
    id: "qa-2",
    category: "math",
    author: "Omar H.",
    title: "Quick intuition for factoring quadratics when the leading coefficient > 1",
    body: "Splitting the middle term takes me too long under exam timing. Does anyone have a reliable check?",
    createdAt: "5h ago",
    helpfulCount: 19,
    replies: [
      {
        id: "r-2",
        author: "Layla M.",
        body: "Multiply a*c first, list factor pairs that add to b, and always verify by expanding the outer and inner terms right away.",
        createdAt: "4h ago",
        helpfulCount: 11,
      },
    ],
  },
  {
    id: "qa-3",
    category: "coding",
    author: "Noura A.",
    title: "How to structure clean recursion base cases without stack overflows?",
    body: "Looking for simple guidelines when solving tree traversal challenges.",
    createdAt: "1d ago",
    helpfulCount: 12,
    replies: [],
  },
];

export function KnowledgeCircleQaBoard({
  authorName,
  onReportThread,
}: {
  authorName: string;
  onReportThread?: (threadId: string) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const [charterAccepted, setCharterAccepted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("btc_circle_charter_v1") === "accepted";
  });
  const [threads, setThreads] = useState<QaThread[]>(INITIAL_THREADS);
  const [selectedCat, setSelectedCat] = useState<"all" | CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCat, setNewCat] = useState<CategoryId>("english");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  function acceptCharter() {
    setCharterAccepted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("btc_circle_charter_v1", "accepted");
    }
    toast.success(
      isAr
        ? "شكراً لالتزامك بميثاق الاحترام ومكافحة التنمر"
        : "Anti-bullying & kindness charter accepted",
    );
  }

  function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!charterAccepted) {
      toast.error(
        isAr
          ? "يرجى قبول ميثاق الاحترام ومكافحة التنمر أولاً"
          : "Please accept the Anti-Bullying Charter before posting",
      );
      return;
    }
    const check = validateSafeCommunityContribution(`${newTitle}\n${newBody}`);
    if (!check.ok) {
      toast.error(
        check.reason || "Please keep posts respectful and free of personal contact info.",
      );
      return;
    }
    const created: QaThread = {
      id: `qa-${Date.now()}`,
      category: newCat,
      author: authorName || (isAr ? "طالب BTC" : "BTC Student"),
      title: newTitle.trim(),
      body: newBody.trim(),
      createdAt: isAr ? "الآن" : "Just now",
      helpfulCount: 1,
      likedByMe: true,
      replies: [],
    };
    setThreads((prev) => [created, ...prev]);
    setNewTitle("");
    setNewBody("");
    setShowComposer(false);
    toast.success(isAr ? "تم نشر سؤالك في حلقة المعرفة" : "Question published to Knowledge Circle");
  }

  function handleReplySubmit(threadId: string) {
    if (!charterAccepted) {
      toast.error(
        isAr ? "يرجى الموافقة على ميثاق الاحترام أولاً" : "Accept the Kindness Charter first",
      );
      return;
    }
    const text = (replyDrafts[threadId] || "").trim();
    if (!text) return;
    const check = validateSafeCommunityContribution(text);
    if (!check.ok) {
      toast.error(check.reason || "Please keep replies constructive and safe.");
      return;
    }
    const reply: QaReply = {
      id: `rep-${Date.now()}`,
      author: authorName || (isAr ? "زميل دراسة" : "Peer Mentor"),
      body: text,
      createdAt: isAr ? "الآن" : "Just now",
      helpfulCount: 0,
    };
    setThreads((prev) =>
      prev.map((th) => (th.id === threadId ? { ...th, replies: [...th.replies, reply] } : th)),
    );
    setReplyDrafts((prev) => ({ ...prev, [threadId]: "" }));
    toast.success(isAr ? "تمت إضافة إجابتك" : "Reply added");
  }

  function toggleHelpfulThread(threadId: string) {
    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              likedByMe: !th.likedByMe,
              helpfulCount: th.helpfulCount + (th.likedByMe ? -1 : 1),
            }
          : th,
      ),
    );
  }

  const visibleThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return threads.filter((th) => {
      if (selectedCat !== "all" && th.category !== selectedCat) return false;
      if (!q) return true;
      return (
        th.title.toLowerCase().includes(q) ||
        th.body.toLowerCase().includes(q) ||
        th.author.toLowerCase().includes(q)
      );
    });
  }, [threads, selectedCat, searchQuery]);

  return (
    <div data-testid="knowledge-circle-qa" className="space-y-5">
      {/* Zero-Tolerance Anti-Bullying Charter Banner */}
      <div className="surface-card flex flex-col justify-between gap-3 border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-foreground">
              {isAr
                ? "ميثاق حلقة المعرفة: عدم التسامح مطلقاً مع التنمر أو السخرية"
                : "Zero-Tolerance Anti-Bullying & Kindness Charter"}
            </p>
            <p className="text-muted-foreground">
              {isAr
                ? "نشجع الأسئلة مهما كانت بسيطة، ونحمي الخصوصية الطلابية مع حظر مشاركة بيانات التواصل الشخصية."
                : "Every honest question is respected. Personal contact info and harassment are strictly blocked."}
            </p>
          </div>
        </div>
        {charterAccepted ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
            <CheckCircle2 className="size-3.5" />
            <span>{isAr ? "تمت الموافقة" : "Charter Signed"}</span>
          </span>
        ) : (
          <Button type="button" size="sm" onClick={acceptCharter} className="shrink-0 text-xs">
            {isAr ? "أتعهد بالاحترام" : "Accept Charter"}
          </Button>
        )}
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? "ابحث في أسئلة المادة أو المناقشات..."
                : "Search subject questions or answers..."
            }
            className="h-9 ps-9 text-xs"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowComposer((v) => !v)}
          className="gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          <span>{isAr ? "اطرح سؤالاً دراسياً" : "Ask a Study Question"}</span>
        </Button>
      </div>

      {/* 10 Academic Subject Category Filters */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedCat("all")}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
            selectedCat === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? "جميع المواد (١٠)" : "All 10 Subjects"}
        </button>
        {KNOWLEDGE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              selectedCat === cat.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAr ? cat.ar : cat.en}
          </button>
        ))}
      </div>

      {/* New Question Composer */}
      {showComposer && (
        <form onSubmit={handleAskQuestion} className="surface-card space-y-3 p-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={isAr ? "عنوان سؤالك الدراسي..." : "Clear question title..."}
              className="sm:col-span-2"
            />
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value as CategoryId)}
              className="h-9 rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
            >
              {KNOWLEDGE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {isAr ? cat.ar : cat.en}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            rows={3}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder={
              isAr
                ? "اشرح ما جربته وما الجزء الذي تحتاج مساعدة فيه..."
                : "Describe what you tried and where you got stuck..."
            }
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowComposer(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" size="sm">
              {isAr ? "نشر السؤال" : "Publish Question"}
            </Button>
          </div>
        </form>
      )}

      {/* Question Threads */}
      <div className="space-y-3">
        {visibleThreads.map((th) => {
          const catMeta = KNOWLEDGE_CATEGORIES.find((c) => c.id === th.category);
          return (
            <article key={th.id} className="surface-card space-y-3 p-4 sm:p-5 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {catMeta ? (isAr ? catMeta.ar : catMeta.en) : th.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{th.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{th.createdAt}</span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-foreground">{th.title}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={th.likedByMe ? "default" : "ghost"}
                    onClick={() => toggleHelpfulThread(th.id)}
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <ThumbsUp className="size-3" />
                    <span className="tabular-nums">{th.helpfulCount}</span>
                  </Button>
                  {onReportThread && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onReportThread(th.id)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                      aria-label={isAr ? "إبلاغ" : "Report"}
                    >
                      <Flag className="size-3" />
                    </Button>
                  )}
                </div>
              </div>

              {th.body && <p className="leading-relaxed text-muted-foreground">{th.body}</p>}

              {th.replies.length > 0 && (
                <div className="space-y-2 border-t border-border/60 pt-3">
                  {th.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="rounded-lg border border-border/70 bg-surface-2/60 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{rep.author}</span>
                        <span>{rep.createdAt}</span>
                      </div>
                      <p className="text-foreground/90 leading-relaxed">{rep.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                <Input
                  value={replyDrafts[th.id] || ""}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [th.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleReplySubmit(th.id);
                    }
                  }}
                  placeholder={isAr ? "اكتب إجابة مساعدة لزميلك..." : "Write a helpful reply..."}
                  className="h-8 flex-1 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleReplySubmit(th.id)}
                  className="h-8 px-2.5"
                  aria-label={isAr ? "إرسال الرد" : "Send reply"}
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
