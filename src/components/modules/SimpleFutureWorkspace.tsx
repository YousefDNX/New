import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  Compass,
  FolderKanban,
  GraduationCap,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFutureActions, useFuturePlans } from "@/hooks/use-modules";
import { useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { usePrefs } from "@/lib/preferences";
import { FUTURE_PATHWAYS } from "@/lib/recommendations";

type FutureTab = "professions" | "specializations" | "pathways" | "plans";

const PROFESSIONS = [
  {
    id: "swe",
    titleEn: "Software & AI Engineer",
    titleAr: "مهندس برمجيات وذكاء اصطناعي",
    descEn: "Builds helpful apps, automated tools, and safe software systems.",
    descAr: "تصميم التطبيقات والأدوات الرقمية والأنظمة البرمجية الموثوقة.",
    skillsEn: ["Mathematics", "Coding Logic", "Problem Solving"],
    skillsAr: ["الرياضيات", "منطق البرمجة", "حل المشكلات"],
  },
  {
    id: "physician",
    titleEn: "Physician & Health Researcher",
    titleAr: "طبيب وباحث صحي",
    descEn: "Cares for patients and investigates better treatments in biology and medicine.",
    descAr: "رعاية المرضى والبحث في العلوم الطبية والحيوية لتحسين الصحة.",
    skillsEn: ["Biology", "Chemistry", "Empathy"],
    skillsAr: ["الأحياء", "الكيمياء", "التعاطف والتواصل"],
  },
  {
    id: "renewable",
    titleEn: "Renewable Energy Engineer",
    titleAr: "مهندس الطاقة المتجددة",
    descEn: "Designs solar, clean power, and sustainable infrastructure solutions.",
    descAr: "تطوير حلول الطاقة الشمسية والنظيفة والبنية التحتية المستدامة.",
    skillsEn: ["Physics", "Calculus", "Systems Design"],
    skillsAr: ["الفيزياء", "التفاضل والتكامل", "التصميم الهندسي"],
  },
  {
    id: "educator",
    titleEn: "Educator & Curriculum Designer",
    titleAr: "معلّم ومصمّم مناهج",
    descEn: "Helps students understand difficult ideas clearly and builds learning tools.",
    descAr: "تبسيط المفاهيم للطلاب وبناء تجارب ومواد تعليمية فعّالة.",
    skillsEn: ["Communication", "Subject Mastery", "Patience"],
    skillsAr: ["التواصل", "إتقان المادة", "الصبر والإرشاد"],
  },
  {
    id: "architect",
    titleEn: "Architect & Urban Designer",
    titleAr: "مهندس معماري ومخطط مدن",
    descEn: "Shapes sustainable, comfortable buildings and public spaces.",
    descAr: "تصميم مبانٍ ومساحات حضرية مريحة وصديقة للبيئة.",
    skillsEn: ["Geometry", "Visual Design", "Physics"],
    skillsAr: ["الهندسة", "التصميم البصري", "الفيزياء"],
  },
  {
    id: "cyber",
    titleEn: "Cybersecurity Specialist",
    titleAr: "متخصص الأمن السيبراني",
    descEn: "Protects organizations, schools, and users from digital threats.",
    descAr: "حماية الأنظمة والبيانات والمستخدمين من المخاطر الرقمية.",
    skillsEn: ["Networking", "Critical Thinking", "Attention to Detail"],
    skillsAr: ["الشبكات", "التفكير النقدي", "الدقة"],
  },
];

const SPECIALIZATIONS = [
  {
    titleEn: "Computer Science & Artificial Intelligence",
    titleAr: "علوم الحاسب والذكاء الاصطناعي",
    prepEn: "Focus on Math, English technical reading, and small personal coding projects.",
    prepAr: "ركّز على الرياضيات وقراءة المصادر التقنية بالإنجليزية وبناء مشاريع برمجية صغيرة.",
  },
  {
    titleEn: "Medicine & Allied Health Sciences",
    titleAr: "الطب والعلوم الصحية",
    prepEn: "Build strong Biology & Chemistry foundations and practice scientific reading.",
    prepAr: "أسس نفسك جيداً في الأحياء والكيمياء وتدرّب على قراءة النصوص العلمية.",
  },
  {
    titleEn: "Engineering (Mechanical, Civil, Electrical)",
    titleAr: "الهندسة (الميكانيكية، المدنية، الكهربائية)",
    prepEn: "Strengthen Physics, Calculus, and structured step-by-step problem solving.",
    prepAr: "قوِّ مهاراتك في الفيزياء والرياضيات وحل المسائل خطوة بخطوة.",
  },
  {
    titleEn: "Business, Finance & Economics",
    titleAr: "إدارة الأعمال والمالية والاقتصاد",
    prepEn: "Develop clear writing, quantitative analysis, and ethical leadership habits.",
    prepAr: "طوّر مهارات الكتابة التحليلية والرياضيات المالية والعمل الجماعي.",
  },
];

export function SimpleFutureWorkspace() {
  const { lang } = usePrefs();
  const { data: user } = useUser();
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(user?.uid, {
      path: "/app/future",
      labelEn: "Future & Careers",
      labelAr: "المستقبل والمهن",
    });
  }, [user?.uid]);

  const { data: plans = [] } = useFuturePlans();
  const { saveFuturePlan, updateFuturePlan, deleteFuturePlan } = useFutureActions();

  const [tab, setTab] = useState<FutureTab>("professions");
  const [customTitle, setCustomTitle] = useState("");
  const [customStep, setCustomStep] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSavePathway = async (p: (typeof FUTURE_PATHWAYS)[number]) => {
    try {
      await saveFuturePlan({
        pathway_id: p.id,
        title: isAr ? p.titleAr : p.title,
        interests: isAr ? p.interestsAr : p.interests,
        strengths: isAr ? p.strengthsAr : p.strengths,
        milestones: (isAr ? p.milestonesAr : p.milestones).map((m, idx) => ({
          id: `${p.id}_m${idx}`,
          title: m,
          done: false,
        })),
      });
      toast.success(isAr ? "تم حفظ المسار في خططك." : "Pathway saved to your plans.");
      setTab("plans");
    } catch {
      toast.error(isAr ? "تعذر حفظ الخطة." : "Could not save plan.");
    }
  };

  const handleCreateCustomPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setBusy(true);
    try {
      const pid = `custom_${Date.now().toString(36)}`;
      await saveFuturePlan({
        pathway_id: pid,
        title: customTitle.trim(),
        interests: [],
        strengths: [],
        milestones: [
          {
            id: `${pid}_m0`,
            title: customStep.trim() || customTitle.trim(),
            done: false,
          },
        ],
        notes: customNote.trim() || null,
      });
      setCustomTitle("");
      setCustomStep("");
      setCustomNote("");
      toast.success(isAr ? "تم حفظ خطتك المستقبلية." : "Career plan saved.");
    } catch {
      toast.error(isAr ? "تعذر حفظ الخطة." : "Could not save plan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-12" dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={isAr ? "المستقبل والمهن" : "Future & Careers"}
        subtitle={
          isAr
            ? "استكشف المهن والتخصصات الجامعية والمسارات التعليمية واحفظ خطتك الخاصة."
            : "Explore professions, university specializations, educational pathways, and save your own plans."
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface/60 px-4 py-3 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0 text-primary" />
        <span className="font-semibold text-foreground">
          {isAr ? "إرشاد تعليمي عام" : "General educational guidance"}
        </span>
        <span>·</span>
        <span>
          {isAr
            ? "يختلف حسب البلد أو المؤسسة التعليمية — تأكد دائماً من شروط الجامعة أو الجهة الرسمية."
            : "Varies by country or institution — always confirm local university admission requirements."}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-1.5">
        {(
          [
            { id: "professions", en: "Professions", ar: "المهن", icon: Briefcase },
            { id: "specializations", en: "Specializations", ar: "التخصصات", icon: GraduationCap },
            { id: "pathways", en: "Educational Pathways", ar: "المسارات التعليمية", icon: Compass },
            {
              id: "plans",
              en: `My Career Plans (${plans.length})`,
              ar: `خططي (${plans.length})`,
              icon: FolderKanban,
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
              className="min-h-11 gap-1.5 px-3 text-xs"
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{isAr ? item.ar : item.en}</span>
            </Button>
          );
        })}
      </div>

      {tab === "professions" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFESSIONS.map((prof) => (
            <div key={prof.id} className="surface-card flex flex-col justify-between space-y-3 p-5">
              <div className="space-y-2">
                <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {isAr ? "إرشاد تعليمي عام" : "General educational guidance"}
                </span>
                <h2 className="font-display text-base font-bold leading-snug text-foreground">
                  {isAr ? prof.titleAr : prof.titleEn}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isAr ? prof.descAr : prof.descEn}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                {(isAr ? prof.skillsAr : prof.skillsEn).map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "specializations" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {SPECIALIZATIONS.map((spec, idx) => (
            <div key={idx} className="surface-card space-y-2.5 p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  {isAr ? "إرشاد تعليمي عام" : "General educational guidance"}
                </span>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-muted-foreground">
                  {isAr ? "يختلف حسب البلد أو المؤسسة" : "Varies by country or institution"}
                </span>
              </div>
              <h2 className="font-display text-base font-bold leading-snug text-foreground">
                {isAr ? spec.titleAr : spec.titleEn}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr ? spec.prepAr : spec.prepEn}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "pathways" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {FUTURE_PATHWAYS.map((pathway) => {
            const title = isAr ? pathway.titleAr : pathway.title;
            const summary = isAr ? pathway.summaryAr : pathway.summary;
            const milestones = isAr ? pathway.milestonesAr : pathway.milestones;
            const subjects = isAr ? pathway.subjectsAr : pathway.subjects;
            return (
              <div
                key={pathway.id}
                className="surface-card flex flex-col justify-between space-y-4 p-5"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {isAr ? "إرشاد تعليمي عام" : "General educational guidance"}
                    </span>
                    <span className="rounded-md bg-surface-2 px-2 py-0.5 text-muted-foreground">
                      {isAr ? "يختلف حسب البلد أو المؤسسة" : "Varies by country or institution"}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-bold leading-snug text-foreground">
                    {title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map((subj) => (
                      <span
                        key={subj}
                        className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-1.5 pt-2 text-xs text-foreground">
                    {milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleSavePathway(pathway)}
                  className="min-h-11 w-fit gap-1.5 px-4 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>{isAr ? "حفظ في خططي" : "Save to My Plans"}</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "plans" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <form
            onSubmit={handleCreateCustomPlan}
            className="surface-card space-y-3 p-5 lg:col-span-5 h-fit"
          >
            <h3 className="font-display text-sm font-bold text-foreground">
              {isAr ? "أنشئ خطة مهنية خاصة بك" : "Create a Career Plan"}
            </h3>
            <div>
              <Label htmlFor="plan-title" className="text-xs">
                {isAr ? "التخصص أو المهنة المستهدفة" : "Target profession or major"}
              </Label>
              <Input
                id="plan-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={isAr ? "مثال: هندسة الحاسوب" : "e.g. Computer Engineering"}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plan-step" className="text-xs">
                {isAr ? "الخطوة الأولى" : "First milestone"}
              </Label>
              <Input
                id="plan-step"
                value={customStep}
                onChange={(e) => setCustomStep(e.target.value)}
                placeholder={
                  isAr ? "مثال: البحث عن متطلبات القبول" : "e.g. Check university prerequisites"
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plan-note" className="text-xs">
                {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
              </Label>
              <Textarea
                id="plan-note"
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={busy || !customTitle.trim()}
              size="sm"
              variant="glow"
              className="min-h-11 gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>{isAr ? "حفظ الخطة" : "Save Plan"}</span>
            </Button>
          </form>

          <div className="space-y-3 lg:col-span-7">
            {plans.length === 0 ? (
              <div className="surface-card p-8 text-center text-xs text-muted-foreground">
                {isAr
                  ? "لا توجد خطط محفوظة بعد. احفظ مساراً تعليمياً أو أنشئ خطتك هنا."
                  : "No saved career plans yet. Save an educational pathway or create your own."}
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="surface-card space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold leading-snug text-foreground">
                      {plan.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => void deleteFuturePlan(plan.id)}
                      aria-label={isAr ? "حذف الخطة" : "Delete plan"}
                      className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {plan.milestones.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const updated = plan.milestones.map((item) =>
                            item.id === m.id ? { ...item, done: !item.done } : item,
                          );
                          void updateFuturePlan(plan, { milestones: updated });
                        }}
                        className="flex min-h-11 w-full items-center gap-2.5 rounded-xl border border-border/70 bg-surface-2/40 px-3 py-2 text-start text-xs cursor-pointer"
                      >
                        {m.done ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={
                            m.done ? "line-through text-muted-foreground" : "text-foreground"
                          }
                        >
                          {m.title}
                        </span>
                      </button>
                    ))}
                  </div>
                  {plan.notes && <p className="text-xs text-muted-foreground">{plan.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
