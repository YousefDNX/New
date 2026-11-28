import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import { useOptionalAuth } from "@/lib/auth";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { usePrefs } from "@/lib/preferences";

type StudyTab = "notes" | "flashcards" | "mistakes";

interface StudyNoteItem {
  id: string;
  subject: string;
  title: string;
  content: string;
  createdAt: string;
}

interface AcademicFlashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  reviewed: boolean;
}

interface MistakeLogItem {
  id: string;
  subject: string;
  question: string;
  correction: string;
  resolved: boolean;
}

const GENERAL_SUBJECTS = [
  { id: "math", en: "Mathematics", ar: "الرياضيات" },
  { id: "science", en: "Science", ar: "العلوم" },
  { id: "arabic", en: "Arabic", ar: "اللغة العربية" },
  { id: "english", en: "English", ar: "اللغة الإنجليزية" },
  { id: "history", en: "Social Studies & History", ar: "الدراسات والتاريخ" },
  { id: "cs", en: "Computing", ar: "الحاسوب" },
] as const;

function readStoredList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStoredList<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore storage quota failures
  }
}

export function StudyWorkspace() {
  const { lang, t } = usePrefs();
  const auth = useOptionalAuth();
  const uid = auth?.user?.uid ?? null;
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(uid, {
      path: "/app/study",
      labelEn: "Study & Academics",
      labelAr: "الدراسة والأكاديميات",
    });
  }, [uid]);

  const notesKey = `btc_academic_notes_${uid || "guest"}`;
  const cardsKey = `btc_academic_cards_${uid || "guest"}`;
  const mistakesKey = `btc_academic_mistakes_${uid || "guest"}`;

  const [tab, setTab] = useState<StudyTab>("notes");

  // Notes state
  const [notes, setNotes] = useState<StudyNoteItem[]>(() => readStoredList(notesKey));
  const [noteSubject, setNoteSubject] = useState("math");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Flashcards state
  const [cards, setCards] = useState<AcademicFlashcard[]>(() => readStoredList(cardsKey));
  const [cardSubject, setCardSubject] = useState("science");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Mistake log state
  const [mistakes, setMistakes] = useState<MistakeLogItem[]>(() => readStoredList(mistakesKey));
  const [mistakeSubject, setMistakeSubject] = useState("math");
  const [mistakeQuestion, setMistakeQuestion] = useState("");
  const [mistakeCorrection, setMistakeCorrection] = useState("");

  useEffect(() => {
    setNotes(readStoredList(notesKey));
    setCards(readStoredList(cardsKey));
    setMistakes(readStoredList(mistakesKey));
  }, [notesKey, cardsKey, mistakesKey]);

  const getSubjectLabel = (id: string) => {
    const found = GENERAL_SUBJECTS.find((s) => s.id === id);
    if (!found) return id;
    return isAr ? found.ar : found.en;
  };

  const visibleNotes = useMemo(
    () => (filterSubject === "all" ? notes : notes.filter((n) => n.subject === filterSubject)),
    [notes, filterSubject],
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const title = noteTitle.trim();
    const content = noteContent.trim();
    if (!title || !content) return;
    const next: StudyNoteItem[] = [
      {
        id: `note-${Date.now()}`,
        subject: noteSubject,
        title,
        content,
        createdAt: new Date().toISOString(),
      },
      ...notes,
    ];
    setNotes(next);
    writeStoredList(notesKey, next);
    setNoteTitle("");
    setNoteContent("");
    toast.success(isAr ? "تم حفظ الملاحظة الدراسية." : "Study note saved.");
  };

  const handleDeleteNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    writeStoredList(notesKey, next);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const front = cardFront.trim();
    const back = cardBack.trim();
    if (!front || !back) return;
    const next: AcademicFlashcard[] = [
      {
        id: `card-${Date.now()}`,
        subject: cardSubject,
        front,
        back,
        reviewed: false,
      },
      ...cards,
    ];
    setCards(next);
    writeStoredList(cardsKey, next);
    setCardFront("");
    setCardBack("");
    toast.success(isAr ? "تمت إضافة البطاقة للمراجعة." : "Flashcard added for review.");
  };

  const handleToggleReviewed = (id: string) => {
    const next = cards.map((c) => (c.id === id ? { ...c, reviewed: !c.reviewed } : c));
    setCards(next);
    writeStoredList(cardsKey, next);
  };

  const handleDeleteCard = (id: string) => {
    const next = cards.filter((c) => c.id !== id);
    setCards(next);
    writeStoredList(cardsKey, next);
  };

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    const question = mistakeQuestion.trim();
    const correction = mistakeCorrection.trim();
    if (!question || !correction) return;
    const next: MistakeLogItem[] = [
      {
        id: `err-${Date.now()}`,
        subject: mistakeSubject,
        question,
        correction,
        resolved: false,
      },
      ...mistakes,
    ];
    setMistakes(next);
    writeStoredList(mistakesKey, next);
    setMistakeQuestion("");
    setMistakeCorrection("");
    toast.success(isAr ? "تم تسجيل الخطأ للمراجعة." : "Mistake recorded for review.");
  };

  const handleToggleMistakeResolved = (id: string) => {
    const next = mistakes.map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m));
    setMistakes(next);
    writeStoredList(mistakesKey, next);
  };

  const handleDeleteMistake = (id: string) => {
    const next = mistakes.filter((m) => m.id !== id);
    setMistakes(next);
    writeStoredList(mistakesKey, next);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <PageHeader
        title={t("nav.study") || (isAr ? "الدراسة والأكاديميات" : "Study & Academics")}
        subtitle={
          isAr
            ? "مساحة منظمة وبسيطة لتدوين ملخصاتك ومراجعة بطاقات المواد ومتابعة أخطاء الاختبارات."
            : "A clean academic space to capture subject notes, practice active flashcards, and track exam corrections."
        }
      />

      {/* Pointer to Grade 9 Vocabulary Center moved inside English World */}
      <div className="surface-card flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <BookOpen className="size-4 shrink-0" />
            <span>
              {isAr
                ? "مفردات الصف التاسع — اللغة الإنجليزية"
                : "Grade 9 English Vocabulary & Tests"}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {isAr
              ? "انتقل مركز مفردات الصف التاسع (الوحدات ١–٤) واختباراته التفاعلية إلى قسم عالم الإنجليزية لسهولة الوصول، مع قسم مستقل للمفردات المهمة والأساسية."
              : "The Grade 9 Units 1–4 vocabulary, summaries, and interactive tests live inside English World, alongside a dedicated Important & Essential Vocab section."}
          </p>
        </div>

        <a
          href="/app/english?tab=grade9"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <span>{isAr ? "افتح الصف التاسع (الوحدات ١–٤)" : "Open Grade 9 — Units 1–4"}</span>
          <ArrowRight className="size-4 rtl-flip" />
        </a>
      </div>

      {/* Simple Module Mode Switcher */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-1.5">
        {(
          [
            {
              id: "notes",
              en: `Study Notes (${notes.length})`,
              ar: `الملاحظات والملخصات (${notes.length})`,
              icon: FileText,
            },
            {
              id: "flashcards",
              en: `Flashcard Deck (${cards.length})`,
              ar: `بطاقات المراجعة (${cards.length})`,
              icon: Layers,
            },
            {
              id: "mistakes",
              en: `Mistake Log (${mistakes.length})`,
              ar: `سجل الأخطاء والتصحيح (${mistakes.length})`,
              icon: AlertCircle,
            },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={tab === item.id ? "glow" : "ghost"}
              onClick={() => setTab(item.id)}
              className="min-h-[42px] gap-1.5 text-xs"
            >
              <Icon className="size-4 shrink-0" />
              <span>{isAr ? item.ar : item.en}</span>
            </Button>
          );
        })}
      </div>

      {/* TAB 1: Study Notes */}
      {tab === "notes" && (
        <div className="space-y-5">
          <form onSubmit={handleAddNote} className="surface-card space-y-3 rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-foreground">
              {isAr ? "أضف ملخص درس أو ملاحظة" : "Add Study Note or Lesson Summary"}
            </h2>
            <div className="grid items-end gap-3 sm:grid-cols-2">
              <ModernSelect
                id="study-note-subject"
                label={isAr ? "المادة الدراسية" : "Subject"}
                ariaLabel={isAr ? "المادة الدراسية" : "Subject"}
                value={noteSubject}
                onValueChange={setNoteSubject}
                searchPlaceholder={isAr ? "ابحث في المواد..." : "Search subjects..."}
                options={GENERAL_SUBJECTS.map((s) => ({
                  value: s.id,
                  label: isAr ? s.ar : s.en,
                  keywords: `${s.en} ${s.ar}`,
                }))}
              />
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder={isAr ? "عنوان الدرس أو المفهوم..." : "Lesson topic or concept..."}
                className="min-h-[44px]"
              />
            </div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب النقاط الرئيسية أو القوانين بأسلوبك..."
                  : "Write key points, formulas, or ideas in your own words..."
              }
              rows={3}
            />
            <Button type="submit" variant="glow" className="min-h-[44px] gap-2">
              <Plus className="size-4" />
              <span>{isAr ? "حفظ الملاحظة" : "Save Study Note"}</span>
            </Button>
          </form>

          {notes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterSubject("all")}
                className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filterSubject === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? "كل المواد" : "All Subjects"}
              </button>
              {GENERAL_SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFilterSubject(s.id)}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterSubject === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? s.ar : s.en}
                </button>
              ))}
            </div>
          )}

          {visibleNotes.length === 0 ? (
            <div className="surface-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
              {isAr
                ? "لا توجد ملاحظات مسجلة بعد. ابدأ بكتابة أول ملخص دراسي بالأعلى."
                : "No study notes yet. Write your first concise lesson summary above."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleNotes.map((note) => (
                <div
                  key={note.id}
                  className="surface-card flex flex-col justify-between gap-3 rounded-2xl p-5"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {getSubjectLabel(note.subject)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        aria-label={isAr ? "حذف الملاحظة" : "Delete note"}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground leading-snug">
                      {note.title}
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Active Flashcards */}
      {tab === "flashcards" && (
        <div className="space-y-5">
          <form onSubmit={handleAddCard} className="surface-card space-y-3 rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-foreground">
              {isAr ? "أنشئ بطاقة مراجعة سريعة" : "Create Active Recall Flashcard"}
            </h2>
            <div className="grid items-end gap-3 sm:grid-cols-3">
              <ModernSelect
                id="study-card-subject"
                label={isAr ? "المادة" : "Subject"}
                ariaLabel={isAr ? "المادة" : "Subject"}
                value={cardSubject}
                onValueChange={setCardSubject}
                searchPlaceholder={isAr ? "ابحث في المواد..." : "Search subjects..."}
                options={GENERAL_SUBJECTS.map((s) => ({
                  value: s.id,
                  label: isAr ? s.ar : s.en,
                  keywords: `${s.en} ${s.ar}`,
                }))}
              />
              <Input
                value={cardFront}
                onChange={(e) => setCardFront(e.target.value)}
                placeholder={isAr ? "السؤال أو المصطلح..." : "Question or concept prompt..."}
                className="min-h-[44px]"
              />
              <Input
                value={cardBack}
                onChange={(e) => setCardBack(e.target.value)}
                placeholder={isAr ? "الإجابة أو الشرح..." : "Answer or explanation..."}
                className="min-h-[44px]"
              />
            </div>
            <Button type="submit" variant="glow" className="min-h-[44px] gap-2">
              <Plus className="size-4" />
              <span>{isAr ? "إضافة البطاقة" : "Add Flashcard"}</span>
            </Button>
          </form>

          {cards.length === 0 ? (
            <div className="surface-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
              {isAr
                ? "أنشئ بطاقات سؤال وجواب لأي مادة لاختبار تذكرك النشط."
                : "Create question-and-answer flashcards for any subject to practice active recall."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((card) => {
                const shown = Boolean(revealedIds[card.id]);
                return (
                  <div key={card.id} className="surface-card space-y-3 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {getSubjectLabel(card.subject)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleReviewed(card.id)}
                          className={`inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 text-xs font-medium ${
                            card.reviewed
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-surface-2 text-muted-foreground"
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>
                            {card.reviewed
                              ? isAr
                                ? "مُتقنة"
                                : "Mastered"
                              : isAr
                                ? "قيد المراجعة"
                                : "Reviewing"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          aria-label={isAr ? "حذف البطاقة" : "Delete flashcard"}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-base font-bold text-foreground leading-snug">{card.front}</p>

                    {shown && (
                      <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm text-foreground">
                        {card.back}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRevealedIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                      }
                      className="min-h-[40px] w-full gap-2 text-xs"
                    >
                      {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      <span>
                        {shown
                          ? isAr
                            ? "إخفاء الإجابة"
                            : "Hide Answer"
                          : isAr
                            ? "إظهار الإجابة"
                            : "Reveal Answer"}
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Mistake Log */}
      {tab === "mistakes" && (
        <div className="space-y-5">
          <form onSubmit={handleAddMistake} className="surface-card space-y-3 rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-foreground">
              {isAr ? "سجل خطأً لتجنّبه مستقبلاً" : "Log a Mistake & Correction"}
            </h2>
            <div className="grid items-end gap-3 sm:grid-cols-3">
              <ModernSelect
                id="study-mistake-subject"
                label={isAr ? "المادة" : "Subject"}
                ariaLabel={isAr ? "المادة" : "Subject"}
                value={mistakeSubject}
                onValueChange={setMistakeSubject}
                searchPlaceholder={isAr ? "ابحث في المواد..." : "Search subjects..."}
                options={GENERAL_SUBJECTS.map((s) => ({
                  value: s.id,
                  label: isAr ? s.ar : s.en,
                  keywords: `${s.en} ${s.ar}`,
                }))}
              />
              <Input
                value={mistakeQuestion}
                onChange={(e) => setMistakeQuestion(e.target.value)}
                placeholder={isAr ? "ما السؤال أو الخطأ؟" : "What was the mistake?"}
                className="min-h-[44px]"
              />
              <Input
                value={mistakeCorrection}
                onChange={(e) => setMistakeCorrection(e.target.value)}
                placeholder={isAr ? "الحل الصحيح أو السبب..." : "Correct answer & takeaway..."}
                className="min-h-[44px]"
              />
            </div>
            <Button type="submit" variant="glow" className="min-h-[44px] gap-2">
              <Plus className="size-4" />
              <span>{isAr ? "تسجيل في السجل" : "Save Correction"}</span>
            </Button>
          </form>

          {mistakes.length === 0 ? (
            <div className="surface-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
              {isAr
                ? "سجل أخطاء التمارين والاختبارات هنا لتحويلها إلى نقاط قوة."
                : "Record quiz or homework mistakes here so you do not repeat them."}
            </div>
          ) : (
            <div className="space-y-3">
              {mistakes.map((item) => (
                <div
                  key={item.id}
                  className="surface-card flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="inline-block rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {getSubjectLabel(item.subject)}
                    </span>
                    <p className="text-sm font-bold text-foreground">{item.question}</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {item.correction}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={item.resolved ? "default" : "outline"}
                      onClick={() => handleToggleMistakeResolved(item.id)}
                      className="min-h-[40px] gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>
                        {item.resolved
                          ? isAr
                            ? "تم الفهم"
                            : "Resolved"
                          : isAr
                            ? "تحديد كمفهوم"
                            : "Mark Resolved"}
                      </span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMistake(item.id)}
                      aria-label={isAr ? "حذف السجل" : "Delete mistake entry"}
                      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
