import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  CheckSquare,
  Clock,
  Compass,
  Globe,
  Heart,
  HelpCircle,
  Languages,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { DailyDuaWidget } from "@/components/dashboard/DailyDuaWidget";
import { SadaqahJariyahWidget } from "@/components/dashboard/SadaqahJariyahWidget";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { useProfile, useTasks, useUser } from "@/hooks/use-nexora";
import { getLastVisitedModule } from "@/lib/continue-tracker";
import { usePrefs } from "@/lib/preferences";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: `Home — ${BRAND.name}` },
      {
        name: "description",
        content:
          "BTC student learning home: Grade 9 study, skills, focus, wellbeing, careers, AI assistant, opportunities, English, and Quran.",
      },
    ],
  }),
  component: StudentHomePage,
});

const MODULES = [
  {
    to: "/app/study" as const,
    icon: BookOpen,
    enTitle: "Study & Academics",
    arTitle: "الدراسة والأكاديميات",
    enDesc: "Organized notes, active flashcards, mistake log, and subject study workspace.",
    arDesc: "ملاحظات منظمة، بطاقات مراجعة نشطة، سجل أخطاء، ومساحة دراسية شاملة.",
    tone: "text-blue-500 bg-blue-500/10",
  },
  {
    to: "/app/skills" as const,
    icon: Compass,
    enTitle: "Skills Academy",
    arTitle: "أكاديمية المهارات",
    enDesc: "8 core skills: communication, critical thinking, digital & life skills.",
    arDesc: "8 مهارات أساسية: التواصل، التفكير الناقد، المهارات الرقمية والحياتية.",
    tone: "text-emerald-500 bg-emerald-500/10",
  },
  {
    to: "/app/tasks" as const,
    icon: CheckSquare,
    enTitle: "Productivity & Focus",
    arTitle: "الإنتاجية والتركيز",
    enDesc: "Tasks, goals, custom hours-minutes-seconds focus timer, and organizer.",
    arDesc: "المهام، الأهداف، مؤقّت تركيز مرن بالساعات والدقائق والثواني، ومنظّم الوقت.",
    tone: "text-amber-500 bg-amber-500/10",
  },
  {
    to: "/app/care" as const,
    icon: Heart,
    enTitle: "Personal Growth",
    arTitle: "النمو الشخصي",
    enDesc: "Habits, private reflection journal, emotional check-in, and healthy routines.",
    arDesc: "العادات، اليوميات الخاصة، متابعة الحالة النفسية، والروتين المتوازن.",
    tone: "text-rose-500 bg-rose-500/10",
  },
  {
    to: "/app/future" as const,
    icon: Briefcase,
    enTitle: "Future & Careers",
    arTitle: "المستقبل والمهن",
    enDesc: "Professions, specializations, educational pathways, and career plans.",
    arDesc: "المهن، التخصصات، المسارات الدراسية، وخطط المستقبل.",
    tone: "text-indigo-500 bg-indigo-500/10",
  },
  {
    to: "/app/ai" as const,
    icon: Sparkles,
    enTitle: "BTC AI Assistant",
    arTitle: "مساعد BTC الذكي",
    enDesc: "Socratic step-by-step tutor, audio transcription, and lesson explanations.",
    arDesc: "معلم ذكي سقراطي خطوة بخطوة، تفريغ صوتي، وشرح مبسط للدروس.",
    tone: "text-cyan-500 bg-cyan-500/10",
  },
  {
    to: "/app/opportunities" as const,
    icon: Globe,
    enTitle: "Opportunity Radar",
    arTitle: "رادار الفرص",
    enDesc: "Curated competitions, programs, and scholarships with official links.",
    arDesc: "مسابقات وبرامج ومنح بروابط رسمية وتواريخ تحقق واضحة.",
    tone: "text-violet-500 bg-violet-500/10",
  },
  {
    to: "/app/english" as const,
    icon: Languages,
    enTitle: "English World",
    arTitle: "عالم الإنجليزية",
    enDesc: "Grade 9 vocabulary, grammar quizzes, listening, reading, speaking, and writing.",
    arDesc: "مفردات الصف التاسع، اختبارات القواعد، الاستماع، القراءة، التحدث، والكتابة.",
    tone: "text-sky-500 bg-sky-500/10",
  },
  {
    to: "/app/quran" as const,
    icon: BookOpenCheck,
    enTitle: "Quran & Islamic Center",
    arTitle: "القرآن الكريم والمركز الإسلامي",
    enDesc: "Holy Quran reading, verified reciters, tafsir, and daily adhkar.",
    arDesc: "المصحف الشريف، تلاوات معتمدة، التفسير، والأذكار اليومية.",
    tone: "text-teal-500 bg-teal-500/10",
  },
];

function StudentHomePage() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data: tasks = [] } = useTasks();

  const nickname =
    profile?.display_name || user?.displayName || (isAr ? "طالب ضيف" : "Guest Student");

  const openTasks = useMemo(() => tasks.filter((tk) => tk.status !== "done"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((tk) => tk.status === "done"), [tasks]);

  const lastVisited = useMemo(() => getLastVisitedModule(user?.uid), [user?.uid]);
  const continueTarget = lastVisited ?? {
    path: "/app/study",
    labelEn: "Study & Academics",
    labelAr: "الدراسة والأكاديميات",
    detailEn: "Grade 9 Units 1–4 Flashcards & Revision",
    detailAr: "بطاقات مفردات الصف التاسع (الوحدات 1–4) والمراجعة",
    updatedAt: "",
  };

  const workspaceModeLabel = user?.isAnonymous
    ? isAr
      ? "جلسة ضيف مهيأة"
      : "Guest Workspace"
    : isAr
      ? "مساحة الطالب"
      : "Student Workspace";

  return (
    <div className="space-y-8 pb-12">
      {/* Calm Personalized Greeting & Continue Card */}
      <section className="surface-card p-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-center space-y-2 lg:col-span-7">
            <p className="text-xs font-semibold text-primary">{workspaceModeLabel}</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl [text-wrap:balance]">
              {isAr ? `أهلاً بك، ${nickname}` : `Welcome back, ${nickname}`}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {isAr
                ? "بيئة تعلم هادئة وبسيطة. اختر المساحة التي تريد العمل عليها الآن."
                : "A calm, clear space to learn, focus, and plan your day."}
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-primary/25 bg-primary/5 p-5 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Clock className="size-3.5" />
                <span>{isAr ? "أكمل من حيث توقفت" : "Continue where you left off"}</span>
              </div>
              <div className="mt-1.5 font-display text-base font-bold text-foreground">
                {isAr ? continueTarget.labelAr : continueTarget.labelEn}
              </div>
              {(continueTarget.detailAr || continueTarget.detailEn) && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {isAr ? continueTarget.detailAr : continueTarget.detailEn}
                </p>
              )}
            </div>
            <div className="pt-3">
              <Button asChild size="sm" className="min-h-[40px] w-full gap-1.5 px-4 sm:w-auto">
                <Link to={continueTarget.path as never}>
                  <span>{isAr ? "متابعة الآن" : "Resume"}</span>
                  <ArrowRight className="size-3.5 rtl-flip" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Strip */}
      <section
        aria-label={isAr ? "الوصول السريع" : "Quick Access"}
        className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 items-stretch"
      >
        <Link
          to="/app/tasks"
          className="surface-card flex h-full items-center gap-3.5 p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <CheckSquare className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">
              {isAr ? "المهام المفتوحة" : "Open Tasks"}
            </div>
            <div className="font-display text-lg font-bold text-foreground tabular-nums">
              {openTasks.length}
            </div>
          </div>
        </Link>

        <Link
          to="/app/english"
          className="surface-card flex h-full items-center gap-3.5 p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
            <Languages className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-foreground leading-snug">
              {isAr ? "عالم الإنجليزية" : "English World"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground leading-snug">
              {isAr ? "مفردات الصف ٩ والأكاديميات" : "Grade 9 & 6 Skill Studios"}
            </div>
          </div>
        </Link>

        <Link
          to="/app/ai"
          className="surface-card flex h-full items-center gap-3.5 p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-foreground leading-snug">
              {isAr ? "مساعد BTC الذكي" : "BTC AI"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground leading-snug">
              {isAr ? "اسأل عن أي موضوع أو سؤال" : "General AI & study help"}
            </div>
          </div>
        </Link>

        <Link
          to="/app/help"
          className="surface-card flex h-full items-center gap-3.5 p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
            <HelpCircle className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-foreground leading-snug">
              {isAr ? "مركز المساعدة" : "Help Center"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground leading-snug">
              {isAr ? "دليل استخدام المنصة" : "Guides & answers"}
            </div>
          </div>
        </Link>
      </section>

      {/* Daily Dua & Sadaqah Jariyah Paired Row */}
      <section
        aria-label={isAr ? "الدعاء والصدقة الجارية" : "Daily Dua & Sadaqah Jariyah"}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        <div className="lg:col-span-6">
          <DailyDuaWidget lang={lang} className="h-full" />
        </div>
        <div className="lg:col-span-6">
          <SadaqahJariyahWidget lang={lang} className="h-full" />
        </div>
      </section>

      {/* All Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-foreground">
            {isAr ? "جميع الوحدات التعليمية" : "Learning Modules"}
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedTasks.length > 0
              ? isAr
                ? `${completedTasks.length} مهمة منجزة`
                : `${completedTasks.length} completed tasks`
              : null}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {MODULES.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="surface-card group flex h-full items-start gap-3.5 p-5 transition-colors hover:border-primary/45 hover:bg-surface-2/50"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="break-words font-display text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {isAr ? card.arTitle : card.enTitle}
                  </div>
                  <div className="break-words text-xs leading-relaxed text-muted-foreground">
                    {isAr ? card.arDesc : card.enDesc}
                  </div>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground rtl-flip group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
