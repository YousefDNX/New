import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CalendarClock,
  CheckCircle2,
  Circle,
  Compass,
  Laptop,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app/Page";
import { Input } from "@/components/ui/input";
import { useOptionalAuth } from "@/lib/auth";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { usePrefs } from "@/lib/preferences";

type SkillCategory =
  "all" | "communication_thinking" | "study_organization" | "digital" | "personal";

interface CoreSkill {
  id: string;
  category: Exclude<SkillCategory, "all">;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  lessonEn: string;
  lessonAr: string;
  stepsEn: string[];
  stepsAr: string[];
  icon: typeof MessageSquare;
}

const CORE_SKILLS: CoreSkill[] = [
  {
    id: "communication",
    category: "communication_thinking",
    titleEn: "Clear Communication",
    titleAr: "التواصل الفعّال والواضح",
    summaryEn: "Express ideas clearly in class discussions, summaries, and presentations.",
    summaryAr: "التعبير عن الأفكار بوضوح في النقاشات الصفية والملخصات والعروض.",
    lessonEn:
      "Use the PREP pattern: Point (state your main idea), Reason (why it matters), Example (one concrete illustration), and Point again (brief wrap-up). Listen actively before replying.",
    lessonAr:
      "استخدم أسلوب الفكرة الواضحة: ابدأ بالنقطة الأساسية، ثم اذكر السبب، ثم قدّم مثالاً واحداً محدداً، ثم اختم بملخص سريع مع الاستماع الجيد للطرف الآخر.",
    stepsEn: [
      "Summarize a classmate's point in one sentence before adding your own",
      "Practice a 60-second explanation using Point -> Reason -> Example",
      "Write one concise paragraph with a clear topic sentence",
    ],
    stepsAr: [
      "لخّص فكرة زميلك بجملة واحدة قبل إضافة رأيك",
      "تدرّب على شرح فكرة في ٦٠ ثانية بالترتيب: الفكرة، السبب، المثال",
      "اكتب فقرة قصيرة تبدأ بجملة موضوع واضحة",
    ],
    icon: MessageSquare,
  },
  {
    id: "critical-thinking",
    category: "communication_thinking",
    titleEn: "Critical Thinking",
    titleAr: "التفكير النقدي",
    summaryEn: "Distinguish facts from opinions and verify claims before accepting them.",
    summaryAr: "التمييز بين الحقائق والآراء والتحقق من المعلومات قبل اعتمادها.",
    lessonEn:
      "Before believing a headline or claim, ask three questions: Who is the source? What evidence supports it? Is there another reasonable explanation?",
    lessonAr:
      "قبل تصديق أي خبر أو معلومة، اسأل ثلاثة أسئلة: من هو المصدر؟ ما الدليل الذي يدعمه؟ وهل هناك تفسير آخر أكثر دقة؟",
    stepsEn: [
      "Identify two facts and one opinion in an article you read today",
      "Check the original source of a science or news claim",
      "Write down one counter-argument to test your own conclusion",
    ],
    stepsAr: [
      "استخرج حقيقتين ورأياً واحداً من نص قرأته اليوم",
      "تحقق من المصدر الأصلي لمعلومة علمية أو إخبارية",
      "اكتب وجهة نظر مخالفة لاختبار قوة استنتاجك",
    ],
    icon: Brain,
  },
  {
    id: "problem-solving",
    category: "communication_thinking",
    titleEn: "Step-by-Step Problem Solving",
    titleAr: "حل المشكلات خطوة بخطوة",
    summaryEn: "Break tough academic or daily challenges into smaller solvable steps.",
    summaryAr: "تقسيم التحديات الدراسية أو اليومية الصعبة إلى خطوات صغيرة قابلة للحل.",
    lessonEn:
      "When stuck on a hard question, stop rushing: 1) State exactly what is given and what is asked. 2) Solve a simpler version first. 3) Check whether your final answer makes practical sense.",
    lessonAr:
      "عند التوقف أمام مسألة صعبة: ١) حدد المعطيات والمطلوب بدقة، ٢) جرّب حل نسخة أبسط أولاً، ٣) راجع هل النتيجة منطقية أم تحتاج مراجعة.",
    stepsEn: [
      "Write out 'Given' and 'Need to Find' on a difficult homework problem",
      "Review one past mistake and write why the correct method works",
      "Test your solution using an estimate or reverse check",
    ],
    stepsAr: [
      "دوّن المعطيات والمطلوب في مسألة دراسية صعبة",
      "راجع خطأً سابقاً واكتب سبب صحة الطريقة البديلة",
      "تحقق من إجابتك بالتقدير أو المراجعة العكسية",
    ],
    icon: Lightbulb,
  },
  {
    id: "collaboration",
    category: "communication_thinking",
    titleEn: "Respectful Collaboration",
    titleAr: "التعاون والعمل الجماعي",
    summaryEn: "Work smoothly in study groups with shared fairness and helpful feedback.",
    summaryAr: "العمل بتناغم في المجموعات الدراسية مع توزيع عادل وتغذية راجعة بنّاءة.",
    lessonEn:
      "Strong groups agree on a clear goal, divide tasks fairly by time and effort, and give specific, kind feedback focused on the work rather than the person.",
    lessonAr:
      "تتفق المجموعات الناجحة على هدف واضح وتقسّم المهام بعدل، وتقدّم ملاحظات محددة ولطيفة تركز على تحسين العمل نفسه.",
    stepsEn: [
      "Clarify everyone's role at the start of a group task",
      "Give feedback using 'What worked well' + 'One suggestion to improve'",
      "Follow through on your committed deadline so peers can rely on you",
    ],
    stepsAr: [
      "حدّد دور كل عضو بوضوح عند بدء العمل الجماعي",
      "قدّم ملاحظاتك بأسلوب: ما أعجبني + اقتراح واحد للتحسين",
      "التزم بموعد تسليم الجزء الخاص بك لدعم زملائك",
    ],
    icon: Users,
  },
  {
    id: "time-management",
    category: "study_organization",
    titleEn: "Calm Time Management",
    titleAr: "إدارة الوقت بهدوء",
    summaryEn: "Plan realistic study blocks without overloading your day.",
    summaryAr: "تخطيط فترات دراسة واقعية دون إرهاق أو تشتت.",
    lessonEn:
      "Pick 1–3 priority tasks each day instead of a list of 15. Pair focused 25-minute blocks with short 5-minute breaks, and leave buffer time between commitments.",
    lessonAr:
      "اختر ١ إلى ٣ مهام أساسية يومياً بدلاً من قائمة مزدحمة، وادمج جلسات تركيز لمدة ٢٥ دقيقة مع استراحة قصيرة لمدة ٥ دقائق.",
    stepsEn: [
      "Choose your top 2 priorities before opening study materials",
      "Complete one 25-minute distraction-free study block",
      "Schedule one realistic revision block in Productivity & Focus",
    ],
    stepsAr: [
      "اختر أهم أولويتين قبل بدء المذاكرة",
      "أنجز جلسة تركيز واحدة لمدة ٢٥ دقيقة بدون مقاطعات",
      "رتّب موعد مراجعة واقعياً في أداة تنظيم الوقت",
    ],
    icon: CalendarClock,
  },
  {
    id: "study-skills",
    category: "study_organization",
    titleEn: "Effective Study Methods",
    titleAr: "مهارات المذاكرة الفعّالة",
    summaryEn: "Use active recall and short spaced reviews instead of passive re-reading.",
    summaryAr: "استخدام الاسترجاع النشط والمراجعة المتباعدة بدلاً من القراءة المتكررة فقط.",
    lessonEn:
      "Reading notes five times feels familiar but fades quickly. Instead, close the book, write or speak what you remember, check gaps, and revisit the hardest concepts two days later.",
    lessonAr:
      "إعادة القراءة تعطي شعوراً زائفاً بالحفظ؛ الأفضل أن تغلق الدفتر وتحاول استرجاع الفكرة بنفسك، ثم تراجع النقاط الناقصة بعد يومين.",
    stepsEn: [
      "Use flashcards with meaning hidden first (Active Recall)",
      "Summarize one lesson in 4 bullet points in your own words",
      "Take a short self-quiz right after revising a unit",
    ],
    stepsAr: [
      "استخدم البطاقات التعليمية مع إخفاء الإجابة أولاً",
      "لخّص درساً واحداً في ٤ نقاط بأسلوبك الخاص",
      "اختبر نفسك باختبار قصير مباشرة بعد المراجعة",
    ],
    icon: Sparkles,
  },
  {
    id: "digital-literacy",
    category: "digital",
    titleEn: "Digital Literacy & Online Safety",
    titleAr: "الوعي الرقمي والأمان الإلكتروني",
    summaryEn: "Spot phishing, verify links, and search effectively for reliable learning.",
    summaryAr: "اكتشاف الروابط الاحتيالية والتحقق من المواقع والبحث الدراسي الذكي.",
    lessonEn:
      "Never share personal phone numbers, passwords, or private details online. Inspect website domains carefully before clicking, and cross-check study facts with educational sources.",
    lessonAr:
      "لا تشارك رقم هاتفك أو بياناتك الشخصية أبداً عبر الإنترنت، وتأكد من صحة اسم الموقع قبل الضغط على الروابط، وتحقق من المعلومات عبر مصادر تعليمية موثوقة.",
    stepsEn: [
      "Check a link's domain spelling before opening it",
      "Practice searching with specific keywords instead of full questions",
      "Keep personal contact info private in public forums",
    ],
    stepsAr: [
      "تأكد من عنوان الموقع الإملائي قبل فتح أي رابط",
      "تدرّب على البحث بكلمات مفتاحية دقيقة ومحددة",
      "حافظ على خصوصية بياناتك في أي مساحة نقاش عامة",
    ],
    icon: Laptop,
  },
  {
    id: "self-management",
    category: "personal",
    titleEn: "Self-Management & Calm Focus",
    titleAr: "تنظيم الذات والهدوء تحت الضغط",
    summaryEn: "Stay steady before exams, track habits gently, and reflect honestly.",
    summaryAr: "الثبات قبل الاختبارات ومتابعة العادات بلطف والتأمل الواقعي.",
    lessonEn:
      "When stress rises before an exam, pause for 3 slow breaths, pick the single smallest next step you can finish in 10 minutes, and reward consistent effort rather than perfection.",
    lessonAr:
      "عند التوتر قبل الاختبار، خذ ٣ أنفاس هادئة، واختر أصغر خطوة عملية يمكنك إنجازها خلال ١٠ دقائق، وقدّر استمراريتك دون طلب الكمال.",
    stepsEn: [
      "Pause for a 1-minute slow breathing reset when feeling overwhelmed",
      "Write one thing that went well and one small step for tomorrow",
      "Protect regular sleep and screen breaks on busy weeks",
    ],
    stepsAr: [
      "خذ استراحة تنفس هادئة لمدة دقيقة عند الشعور بالضغط",
      "اكتب إنجازاً واحداً تم اليوم وخطوة صغيرة للغد",
      "احرص على النوم الكافي وفواصل الراحة في أسابيع الاختبارات",
    ],
    icon: Compass,
  },
];

export function SimpleSkillsWorkspace() {
  const { lang } = usePrefs();
  const auth = useOptionalAuth();
  const uid = auth?.user?.uid ?? null;
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(uid, {
      path: "/app/skills",
      labelEn: "Skills Academy",
      labelAr: "أكاديمية المهارات",
    });
  }, [uid]);

  const storageKey = `btc_skills_steps_${uid || "guest"}`;
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(`btc_skills_steps_${uid || "guest"}`);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      setCompletedSteps(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setCompletedSteps({});
    }
  }, [storageKey]);

  const toggleStep = (skillId: string, stepIdx: number) => {
    const key = `${skillId}:${stepIdx}`;
    setCompletedSteps((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const [category, setCategory] = useState<SkillCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string>(CORE_SKILLS[0]!.id);

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CORE_SKILLS.filter((skill) => {
      if (category !== "all" && skill.category !== category) return false;
      if (!q) return true;
      return (
        skill.titleEn.toLowerCase().includes(q) ||
        skill.titleAr.includes(q) ||
        skill.summaryEn.toLowerCase().includes(q) ||
        skill.summaryAr.includes(q)
      );
    });
  }, [category, search]);

  const activeSkill =
    filteredSkills.find((s) => s.id === selectedSkillId) ?? filteredSkills[0] ?? CORE_SKILLS[0]!;

  const totalSteps = CORE_SKILLS.reduce((acc, s) => acc + s.stepsEn.length, 0);
  const doneSteps = CORE_SKILLS.reduce(
    (acc, s) =>
      acc + s.stepsEn.filter((_, idx) => Boolean(completedSteps[`${s.id}:${idx}`])).length,
    0,
  );
  const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "أكاديمية المهارات" : "Skills Academy"}
        subtitle={
          isAr
            ? "دروس عملية قصيرة في التواصل، التفكير، تنظيم الوقت، والوعي الرقمي."
            : "Short practical lessons in communication, thinking, organization, and digital safety."
        }
      />

      {/* Overall progress & filters */}
      <div className="surface-card space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              {isAr ? "تقدّم الممارسة العملية" : "Practical Checklist Progress"}
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground">
              {isAr
                ? `${doneSteps} من ${totalSteps} خطوات مكتملة (${progressPct}%)`
                : `${doneSteps} of ${totalSteps} practice steps completed (${progressPct}%)`}
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "ابحث عن مهارة..." : "Search skills..."}
              className="h-9 ps-8 text-xs"
            />
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "all", en: "All Skills (8)", ar: "جميع المهارات (٨)" },
              {
                id: "communication_thinking",
                en: "Communication & Thinking",
                ar: "التواصل والتفكير",
              },
              { id: "study_organization", en: "Study & Time", ar: "المذاكرة والوقت" },
              { id: "digital", en: "Digital Literacy", ar: "الوعي الرقمي" },
              { id: "personal", en: "Self-Management", ar: "تنظيم الذات" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                category === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? cat.ar : cat.en}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail clean layout */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-2.5 lg:col-span-5">
          {filteredSkills.length === 0 ? (
            <div className="surface-card p-6 text-center text-xs text-muted-foreground">
              {isAr ? "لا توجد مهارات مطابقة لبحثك." : "No skills match your search."}
            </div>
          ) : (
            filteredSkills.map((skill) => {
              const Icon = skill.icon;
              const isSelected = activeSkill.id === skill.id;
              const skillDone = skill.stepsEn.filter(
                (_, idx) => completedSteps[`${skill.id}:${idx}`],
              ).length;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`w-full rounded-2xl border p-4 text-start transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-surface/60 hover:border-primary/40 hover:bg-surface-2/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold text-foreground">
                          {isAr ? skill.titleAr : skill.titleEn}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {isAr ? skill.summaryAr : skill.summaryEn}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                      {skillDone}/{skill.stepsEn.length}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {activeSkill && (
            <div className="surface-card space-y-5 p-5 sm:p-6">
              <div className="flex items-start gap-3 border-b border-border/70 pb-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <activeSkill.icon className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {isAr ? activeSkill.titleAr : activeSkill.titleEn}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? activeSkill.summaryAr : activeSkill.summaryEn}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-surface-2/60 p-4 space-y-1.5">
                <div className="text-xs font-semibold text-primary">
                  {isAr ? "الدرس السريع" : "Micro-Lesson"}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {isAr ? activeSkill.lessonAr : activeSkill.lessonEn}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-foreground">
                  {isAr ? "خطوات التطبيق العملية" : "Practice Checklist"}
                </div>
                {(isAr ? activeSkill.stepsAr : activeSkill.stepsEn).map((stepText, idx) => {
                  const checked = Boolean(completedSteps[`${activeSkill.id}:${idx}`]);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStep(activeSkill.id, idx)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-start text-sm transition-colors cursor-pointer ${
                        checked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                          : "border-border/80 bg-surface/50 hover:bg-surface-2/50 text-foreground"
                      }`}
                    >
                      {checked ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={checked ? "line-through text-muted-foreground" : ""}>
                        {stepText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
