import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModernSelect } from "@/components/ui/modern-select";
import type { UniversalBenefitResource } from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";
import { SUBJECT_OPTIONS } from "@/lib/settings";

const WIZARD_STEPS = [
  { num: 1, titleEn: "Topic & Subject", titleAr: "الموضوع والمادة" },
  { num: 2, titleEn: "Your Own Words", titleAr: "الشرح بأسلوبك" },
  { num: 3, titleEn: "Clarity & Simplicity", titleAr: "الوضوح والتبسيط" },
  { num: 4, titleEn: "Factual Accuracy", titleAr: "الدقة العلمية" },
  { num: 5, titleEn: "Sources & References", titleAr: "المصادر والمراجع" },
  { num: 6, titleEn: "License & Attribution", titleAr: "الترخيص ونسب الفضل" },
  { num: 7, titleEn: "Review & Quality", titleAr: "المراجعة النهائية" },
  { num: 8, titleEn: "Publish to Registry", titleAr: "النشر للمكتبة العامة" },
] as const;

export function KnowledgeGiftWizard({
  onSuccess,
}: {
  onSuccess?: (createdResource: UniversalBenefitResource) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { update: updateEco } = useStudentEcosystem();

  const [step, setStep] = useState<number>(1);
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0] || "Mathematics");
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [workedExample, setWorkedExample] = useState("");
  const [targetLevel, setTargetLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [sources, setSources] = useState("");
  const [license, setLicense] = useState<string>("CC-BY-4.0");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState<UniversalBenefitResource["creatorRole"]>("student");

  // Step 3 Clarity checks
  const [hasCheckedJargon, setHasCheckedJargon] = useState(false);
  const [hasShortSentences, setHasShortSentences] = useState(false);

  // Step 4 Accuracy checklist
  const [accuracyChecked, setAccuracyChecked] = useState(false);
  const [verifiedFormulas, setVerifiedFormulas] = useState(false);

  // Step 6 Originality & License confirmation
  const [originalityConfirmed, setOriginalityConfirmed] = useState(false);

  // AI suggestions state
  const [clarityAdvice, setClarityAdvice] = useState<string | null>(null);

  const generateClaritySuggestions = () => {
    if (!explanation.trim()) {
      toast.error(
        isAr
          ? "اكتب شرحك أولاً لتوليد نصائح التبسيط"
          : "Write your explanation first to generate clarity tips",
      );
      return;
    }
    const words = explanation.trim().split(/\s+/).length;
    const sentences = explanation.split(/[.!?؟]+/).filter(Boolean).length || 1;
    const avgWordsPerSentence = Math.round(words / sentences);

    let advice = isAr
      ? `تحليل النص: يبلغ متوسط طول الجمل ${avgWordsPerSentence} كلمة.`
      : `Text Analysis: Average sentence length is ${avgWordsPerSentence} words.`;

    if (avgWordsPerSentence > 18) {
      advice += isAr
        ? " الجمل طويلة نسبياً؛ نوصي بتقسيم الأفكار المعقدة إلى خطوات مرقمة قصيرة."
        : " Sentences are slightly long for beginner readers; consider breaking complex sentences into shorter steps.";
    } else {
      advice += isAr
        ? " طول الجمل ممتاز ومناسب للقراءة السلسة والميسرة."
        : " Sentence pacing is clear, balanced, and accessible.";
    }

    if (
      !explanation.includes("على سبيل المثال") &&
      !explanation.toLowerCase().includes("for example")
    ) {
      advice += isAr
        ? " ننصح بإضافة مثال توضيحي واقعي يقرب الفكرة للذهن."
        : " Adding an everyday analogy or concrete example will deepen reader comprehension.";
    }

    setClarityAdvice(advice);
    toast.success(isAr ? "تم توليد نصائح الوضوح والتبسيط" : "Clarity suggestions generated");
  };

  const handleFinishAndSubmit = () => {
    if (!title.trim() || !explanation.trim() || !authorName.trim()) {
      toast.error(isAr ? "يرجى استكمال الحقول الإلزامية" : "Please complete required fields");
      return;
    }

    const newResource: UniversalBenefitResource = {
      id: `ubr_gift_${Date.now().toString(36)}`,
      title: title.trim(),
      titleAr: titleAr.trim() || title.trim(),
      systemKind: "educational_gift",
      lifecycleState: "submitted",
      creatorName: authorName.trim(),
      creatorRole: authorRole,
      originalSource: sources.trim() || "Original Student Educational Contribution",
      license,
      publicationDate: new Date().toISOString().slice(0, 10),
      lastReviewedDate: new Date().toISOString().slice(0, 10),
      reviewIntervalDays: 365,
      version: 1,
      maintenanceStatus: "healthy",
      accessibilityStatus: {
        hasAudio: false,
        hasScreenReaderFormatted: true,
        hasSimplifiedText: targetLevel === "beginner",
        hasDiagramAltText: Boolean(workedExample),
        hasCaptions: false,
      },
      languagesAvailable: titleAr.trim() ? ["en", "ar"] : ["en"],
      pendingCorrectionCount: 0,
      knownLimitations: [
        "Peer educational gift submitted for editorial review; verified by NEXORA Stewardship Board.",
      ],
      contentSummary: `${subject} · ${topic || "Core Concept"} (${targetLevel}) by ${authorName}.`,
      fullContent: `${explanation}\n\nWorked Example:\n${workedExample || "Provided in lesson text."}`,
      targetAudience: `Students studying ${subject} (${targetLevel} level).`,
      versionHistory: [
        {
          version: 1,
          date: new Date().toISOString().slice(0, 10),
          changeSummary:
            "Original student knowledge gift submitted via One Person, One Gift wizard.",
          reviewerName: "Pending Editorial Board Review",
        },
      ],
      correctionReports: [],
    };

    updateEco((prev) => ({
      ...prev,
      universalBenefitResources: [newResource, ...prev.universalBenefitResources],
    }));

    toast.success(
      isAr
        ? "تم إرسال هديتك المعرفية للمراجعة بنجاح! شكراً لبذل علمك لغيرك."
        : "Knowledge Gift submitted to the Universal Registry! Thank you for sharing beneficial understanding.",
    );

    onSuccess?.(newResource);
  };

  return (
    <div className="surface-card space-y-6 border-primary/25 p-5 md:p-7">
      {/* Header */}
      <div className="border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5 text-primary mb-1">
          <Sparkles className="size-5" />
          <h3 className="font-display text-base font-bold text-foreground">
            {isAr
              ? "نظام «إنسان واحد.. هدية معرفية واحدة»"
              : "One Person, One Knowledge Gift System"}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isAr
            ? "حوّل فهماً استصعبته سابقاً إلى شرح مبسط يفيد متعلماً آخر في أي مكان حول العالم. نكافئ الجودة والإتقان والتحقق العلمي وليس الكم المجرد."
            : "Transform a difficult concept you recently mastered into an accessible, high-clarity resource that genuinely helps another learner. Quality, accuracy, and kindness over quantity."}
        </p>
      </div>

      {/* Wizard Step Progress Tracker */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {WIZARD_STEPS.map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                  : isDone
                    ? "border-emerald-500/40 bg-emerald-500/5 text-muted-foreground hover:text-foreground cursor-pointer"
                    : "border-border bg-surface-2/40 text-muted-foreground/60 cursor-not-allowed"
              }`}
            >
              <div
                className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-3 text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="size-3.5 stroke-[3]" /> : s.num}
              </div>
              <span className="text-[10px] leading-tight line-clamp-1">
                {isAr ? s.titleAr : s.titleEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="rounded-xl border border-border/80 bg-surface-2/50 p-4 sm:p-6 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr
                  ? "الخطوة 1: اختيار الموضوع والمادة"
                  : "Step 1: Choose Your Subject & Concept"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "ما الدرس الذي استوعبته بعمق وتريد تبسيطه لغيرك؟"
                  : "Which academic topic did you unlock that you want to explain clearly?"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ModernSelect
                id="gift-subject"
                label={isAr ? "المادة الدراسية" : "Subject"}
                value={subject}
                onValueChange={setSubject}
                searchable
                searchPlaceholder={isAr ? "ابحث عن المادة..." : "Search subjects..."}
                options={SUBJECT_OPTIONS.map((sub) => ({
                  value: sub,
                  label: sub,
                }))}
              />

              <ModernSelect
                id="gift-level"
                label={isAr ? "المستوى المستهدف" : "Target Difficulty"}
                value={targetLevel}
                onValueChange={(v) => setTargetLevel(v as typeof targetLevel)}
                searchable={false}
                options={[
                  {
                    value: "beginner",
                    label: isAr ? "مبتدئ — تأسيس وتبسيط" : "Beginner — Foundational & Simple",
                  },
                  {
                    value: "intermediate",
                    label: isAr ? "متوسط — منهج مدرسي" : "Intermediate — Standard Curriculum",
                  },
                  {
                    value: "advanced",
                    label: isAr ? "متقدم — تعمق وتحليل" : "Advanced — Deep Conceptual Dive",
                  },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gift-title" className="text-xs">
                {isAr ? "عنوان الهدية المعرفية (إنجليزي)" : "Gift Title (English)"} *
              </Label>
              <Input
                id="gift-title"
                placeholder="e.g. Visual Fractions & Unit Rates Made Simple"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gift-title-ar" className="text-xs">
                {isAr ? "عنوان الهدية المعرفية (عربي اختياري)" : "Arabic Title (Optional)"}
              </Label>
              <Input
                id="gift-title-ar"
                placeholder="مثال: الكسور والنسب بأسلوب بصري ميسر"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="text-xs"
                dir="rtl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gift-topic" className="text-xs">
                {isAr ? "المفهوم الدقيق" : "Exact Concept Focus"}
              </Label>
              <Input
                id="gift-topic"
                placeholder="e.g. Solving Proportions with Everyday Prices"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr ? "الخطوة 2: الشرح بأسلوبك الخاص" : "Step 2: Explain in Your Own Words"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "اشرح الفكرة كما لو كنت تشرحها لصديق يسألك. تجنب النسخ الأعمى للكتب."
                  : "Explain the idea as if sitting across from a friend who asked for your help. Use your authentic voice."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gift-explanation" className="text-xs">
                {isAr ? "الشرح المفصل" : "Concept Explanation"} *
              </Label>
              <Textarea
                id="gift-explanation"
                rows={6}
                placeholder="Step 1: Notice what stays constant... Step 2: Calculate the unit amount..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gift-example" className="text-xs">
                {isAr ? "مثال تطبيقي واقعي" : "Concrete Everyday Worked Example"}
              </Label>
              <Textarea
                id="gift-example"
                rows={3}
                placeholder="e.g. If 3 notebooks cost 1.500 KWD, one notebook costs 1.500 / 3 = 0.500 KWD..."
                value={workedExample}
                onChange={(e) => setWorkedExample(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr
                  ? "الخطوة 3: تعزيز الوضوح وبساطة العرض"
                  : "Step 3: Clarity & Readability Enhancer"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تأكد من خلو الشرح من الغموض أو التعقيد الاصطناعي."
                  : "Ensure your lesson is easy to follow without artificial jargon."}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateClaritySuggestions}
              className="gap-2 text-xs"
            >
              <Lightbulb className="size-3.5 text-primary" />
              <span>
                {isAr ? "فحص وضوح النص واقتراح تحسينات" : "Analyze Readability & Suggest Clarity"}
              </span>
            </Button>

            {clarityAdvice && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground leading-relaxed">
                <span className="font-bold text-primary block mb-1">
                  {isAr ? "💡 نصائح مقترحة لتحسين الوضوح:" : "💡 Clarity Feedback:"}
                </span>
                {clarityAdvice}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCheckedJargon}
                  onChange={(e) => setHasCheckedJargon(e.target.checked)}
                  className="rounded border-border mt-0.5"
                />
                <span>
                  {isAr
                    ? "راجعت النص وتأكدت من شرح أي مصطلح صعب قبل استخدامه."
                    : "I defined technical terms before using them in calculations or arguments."}
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasShortSentences}
                  onChange={(e) => setHasShortSentences(e.target.checked)}
                  className="rounded border-border mt-0.5"
                />
                <span>
                  {isAr
                    ? "قسّمت الخطوات إلى نقاط واضحة يسهل على المبتدئ قراءتها دون تشتت."
                    : "I formatted steps clearly so beginner readers can track the logic easily."}
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr
                  ? "الخطوة 4: التحقق من الدقة العلمية"
                  : "Step 4: Factual & Scientific Accuracy"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "المعرفة أمانة ومسؤولية؛ لا يجوز نشر حسابات أو حقائق علمية خاطئة."
                  : "Knowledge is a sacred responsibility. Never publish fabricated claims or unverified equations."}
              </p>
            </div>

            <div className="rounded-lg border border-xp/40 bg-xp/10 p-3 text-xs text-foreground space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xp">
                <ShieldCheck className="size-4" />
                <span>
                  {isAr ? "معايير النزاهة العلمية في NEXORA" : "Scientific Integrity Commitment"}
                </span>
              </div>
              <p className="text-muted-foreground">
                {isAr
                  ? "لا ننشر تخمينات أو حقائق طبية غير موثوقة. كل خطوة يجب أن تكون مطابقة للمنهج العلمي المعتمد."
                  : "We do not publish unverified clinical claims, invented formulas, or unchecked historical statements."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={accuracyChecked}
                  onChange={(e) => setAccuracyChecked(e.target.checked)}
                  className="rounded border-border mt-0.5"
                />
                <span>
                  {isAr
                    ? "أشهد أنني راجعت الحقائق والأرقام مع مرجع دراسي معتمد."
                    : "I verified all numbers, equations, and factual claims against an approved textbook."}
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedFormulas}
                  onChange={(e) => setVerifiedFormulas(e.target.checked)}
                  className="rounded border-border mt-0.5"
                />
                <span>
                  {isAr
                    ? "تأكدت أن المثال المحلول صحيح حسابياً ومنطقياً."
                    : "I solved the worked example by hand and confirmed the arithmetic and units are correct."}
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr
                  ? "الخطوة 5: إضافة المصادر والمراجع"
                  : "Step 5: Traceable Sources & References"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "اذكر الكتاب أو الدورية أو المنصة التعليمية المعتمدة التي بنيت عليها هذا الشرح."
                  : "Provide the textbook, syllabus standard, or academic institution your explanation references."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gift-sources" className="text-xs">
                {isAr
                  ? "المراجع والمصادر (مرجع واحد في كل سطر)"
                  : "Source References (One per line)"}{" "}
                *
              </Label>
              <Textarea
                id="gift-sources"
                rows={4}
                placeholder="e.g. OpenStax Prealgebra (CC-BY 4.0), Chapter 4: Proportional Reasoning&#10;Kuwait Ministry of Education Grade 9 Science Curriculum"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr
                  ? "الخطوة 6: الترخيص وحفظ الملكية الفكرية"
                  : "Step 6: Open License & Originality"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "اختر ترخيصاً مفتوحاً يسمح للمتعلمين بالاستفادة المجانية مع حفظ اسمك كمؤلف أصلي."
                  : "Choose an open educational license permitting free learning while protecting your author attribution."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gift-author" className="text-xs">
                  {isAr ? "اسمك / لقبك للمساهمة" : "Your Name / Attribution"} *
                </Label>
                <Input
                  id="gift-author"
                  placeholder="e.g. Sarah K. (Grade 10 Student)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <ModernSelect
                id="gift-role"
                label={isAr ? "صفتك في المنظومة" : "Your Role"}
                value={authorRole}
                onValueChange={(v) => setAuthorRole(v as UniversalBenefitResource["creatorRole"])}
                searchable={false}
                options={[
                  { value: "student", label: isAr ? "طالب متعلم" : "Student Learner" },
                  { value: "educator", label: isAr ? "معلم / تربوي" : "Educator / Teacher" },
                  {
                    value: "community_volunteer",
                    label: isAr ? "متطوع مجتمعي" : "Community Volunteer",
                  },
                ]}
              />
            </div>

            <ModernSelect
              id="gift-license"
              label={isAr ? "الترخيص المفتوح المعتمد" : "Approved Open License"}
              value={license}
              onValueChange={setLicense}
              searchable={false}
              options={[
                {
                  value: "CC-BY-4.0",
                  label: "Creative Commons Attribution (CC-BY 4.0)",
                  badge: "Recommended",
                },
                {
                  value: "CC-BY-SA-4.0",
                  label: "Creative Commons Attribution-ShareAlike (CC-BY-SA 4.0)",
                },
                {
                  value: "NEXORA-OER-FREE",
                  label: "NEXORA Open Educational Free Resource License",
                },
              ]}
            />

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={originalityConfirmed}
                onChange={(e) => setOriginalityConfirmed(e.target.checked)}
                className="rounded border-border mt-0.5"
              />
              <span>
                {isAr
                  ? "أؤكد أن هذا العمل من صياغتي الشخصية ولا ينتهك حقوق نشر أو ملكية فكرية لأي طرف."
                  : "I confirm this work is my original explanation and does not infringe third-party copyright."}
              </span>
            </label>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isAr
                  ? "الخطوة 7: مراجعة المعاينة قبل الإرسال"
                  : "Step 7: Final Resource Inspection"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "عاين بطاقة هديتك المعرفية كما سيراها الطلاب في المكتبة المفتوحة."
                  : "Review the gift card as other students will discover it in the Open Library."}
              </p>
            </div>

            <div className="rounded-xl border border-primary/30 bg-surface p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2">
                <div>
                  <div className="font-display text-sm font-bold text-foreground">
                    {title || "Untitled"}
                  </div>
                  {titleAr && (
                    <div className="text-xs text-primary font-medium" dir="rtl">
                      {titleAr}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {subject}
                  </span>
                  <span className="rounded border border-border px-1.5 py-0.5 capitalize">
                    {targetLevel}
                  </span>
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono">
                    {license}
                  </span>
                </div>
              </div>

              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {explanation || "No explanation provided yet."}
              </div>

              {workedExample && (
                <div className="rounded-lg border border-border/80 bg-surface-2 p-2.5 text-xs text-foreground">
                  <span className="font-bold text-primary block mb-1">
                    {isAr ? "مثال تطبيقي:" : "Worked Example:"}
                  </span>
                  {workedExample}
                </div>
              )}

              <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/60 flex flex-wrap justify-between gap-2">
                <span>
                  By: <strong>{authorName || "Anonymous Student"}</strong> ({authorRole})
                </span>
                <span>
                  Sources: {sources.split("\n")[0]?.slice(0, 40) || "Curriculum standards"}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <FileCheck2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-base font-bold text-foreground">
                {isAr
                  ? "جاهز لإيداع الهدية المعرفية في المنظومة"
                  : "Ready to Deposit in Universal Registry"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isAr
                  ? "عند الضغط على تأكيد، سيتم حفظ هديتك في سجّل المنافع الشاملة تحت حالة «قيد المراجعة التحريرية» ليتم فحصها ونشرها للمتعلمين."
                  : "Clicking Confirm will register your gift in the Universal Benefit Registry in 'Submitted' state for editorial review and permanent maintenance."}
              </p>
            </div>

            <Button
              type="button"
              variant="glow"
              size="lg"
              onClick={handleFinishAndSubmit}
              className="gap-2 text-xs font-semibold px-6"
            >
              <CheckCircle2 className="size-4" />
              <span>
                {isAr ? "إيداع الهدية المعرفية رسمياً" : "Confirm & Publish Knowledge Gift"}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border/80">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="size-3.5 rtl-flip" />
          <span>{isAr ? "السابق" : "Back"}</span>
        </Button>

        <span className="text-[11px] text-muted-foreground font-mono">
          {step} / {WIZARD_STEPS.length}
        </span>

        {step < 8 && (
          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={() => {
              if (step === 1 && !title.trim()) {
                toast.error(isAr ? "أدخل عنوان الهدية المعرفية" : "Enter a title first");
                return;
              }
              if (step === 2 && !explanation.trim()) {
                toast.error(isAr ? "اكتب شرحك قبل المتابعة" : "Write your explanation first");
                return;
              }
              if (step === 4 && (!accuracyChecked || !verifiedFormulas)) {
                toast.error(
                  isAr
                    ? "يرجى تأكيد الدقة العلمية أولاً"
                    : "Please confirm scientific accuracy first",
                );
                return;
              }
              if (step === 5 && !sources.trim()) {
                toast.error(
                  isAr ? "يرجى ذكر المراجع المعتمدة" : "Please provide at least one source",
                );
                return;
              }
              if (step === 6 && (!authorName.trim() || !originalityConfirmed)) {
                toast.error(
                  isAr ? "أدخل اسمك وأكد الأصالة" : "Enter your name and confirm originality",
                );
                return;
              }
              setStep((s) => Math.min(8, s + 1));
            }}
            className="gap-1.5 text-xs"
          >
            <span>{isAr ? "التالي" : "Continue"}</span>
            <ArrowRight className="size-3.5 rtl-flip" />
          </Button>
        )}
      </div>
    </div>
  );
}
