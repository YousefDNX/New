import { useState, useMemo } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Heart,
  Quote,
  ShieldCheck,
  Calendar,
  Check,
  ChevronRight,
  HelpCircle,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INITIAL_GOOD_CHARACTER_THEMES, type GoodCharacterTheme } from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";

export function GoodCharacterCompanionPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: ecoState, update: updateEco } = useStudentEcosystem();

  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    INITIAL_GOOD_CHARACTER_THEMES[0]?.id || "",
  );
  const [reflectionInput, setReflectionInput] = useState("");

  const activeTheme = useMemo(() => {
    return (
      INITIAL_GOOD_CHARACTER_THEMES.find((t) => t.id === selectedThemeId) ||
      INITIAL_GOOD_CHARACTER_THEMES[0]
    );
  }, [selectedThemeId]);

  const userThemeRecord = useMemo(() => {
    return ecoState.goodCharacterReflections?.[selectedThemeId] || null;
  }, [ecoState.goodCharacterReflections, selectedThemeId]);

  if (!activeTheme) return null;

  const handleSaveReflection = () => {
    if (!reflectionInput.trim()) return;

    updateEco((prev) => ({
      ...prev,
      goodCharacterReflections: {
        ...(prev.goodCharacterReflections || {}),
        [selectedThemeId]: {
          lastReflectedDate: new Date().toISOString().split("T")[0] || "2026-11-19",
          reflectionNote: reflectionInput.trim(),
          voluntaryGoalCommitted: userThemeRecord?.voluntaryGoalCommitted || true,
        },
      },
    }));

    toast.success(
      isAr
        ? "تم حفظ تأملك الأخلاقي في سجلك الشخصي الخاص"
        : "Personal moral reflection saved quietly in your private record.",
    );
    setReflectionInput("");
  };

  const handleToggleHabitCommitment = () => {
    const current = userThemeRecord?.voluntaryGoalCommitted || false;
    updateEco((prev) => ({
      ...prev,
      goodCharacterReflections: {
        ...(prev.goodCharacterReflections || {}),
        [selectedThemeId]: {
          lastReflectedDate:
            userThemeRecord?.lastReflectedDate ||
            new Date().toISOString().split("T")[0] ||
            "2026-11-19",
          reflectionNote: userThemeRecord?.reflectionNote || "",
          voluntaryGoalCommitted: !current,
        },
      },
    }));

    toast.success(
      isAr
        ? !current
          ? "تم الالتزام بالعزم على هذا الخلق اليومي لوجه الله"
          : "تم إلغاء التحديد"
        : !current
          ? "Voluntary daily character goal committed!"
          : "Commitment reset.",
    );
  };

  return (
    <div className="space-y-6">
      {/* Strict Sincerity & No-Reward-Scoring Banner */}
      <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">
              {isAr
                ? "ميثاق الإخلاص ونفي ادعاء احتساب الأجور"
                : "Strict Ethical Notice: Sincerity & No Reward Scoring"}
            </h4>
            <p className="text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
              {isAr
                ? "تنبيه عقائدي وأخلاقي قطعي: لا يمكن لأي تطبيق بشري حساب حسنات الإنسان، أو ضمان القبول، أو الحكم على مكانة العبد عند الله. هذا القسم لا يضع لوحات منافسة للصدقات ولا يقيس أعمال البر بالنقاط، بل يقدم نصوصاً صحيحة موثقة من صحيح البخاري ومسلم ورياض الصالحين لتكون تذكرة هادئة للتخلق بمحاسن الأخلاق وخدمة الناس، مع ترك النيات والقبول لله سبحانه وحده."
                : "A categorical theological and ethical principle: No application can measure a person's حسنات, calculate divine acceptance, or evaluate righteousness. NEXORA never ranks good deeds on competitive leaderboards or claims spiritual metrics. This companion exists solely to provide authentic, verified prophetic teachings (Sahih al-Bukhari, Sahih Muslim, Riyadh as-Salihin) to quietly inspire humble, sincere daily conduct, leaving all intentions and reward solely to Allah."}
            </p>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "رفيق مكارم الأخلاق والنفع اليومي"
                : "Good Character & Daily Beneficial Conduct"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "12 خلقاً نبيلاً موثقاً بالأحاديث الصحيحة مع تطبيقات عملية لحياة الطالب، ومساحة للتأمل الذاتي الصادق"
              : "12 noble character virtues with verified Hadith citations and practical school scenarios."}
          </p>
        </div>
      </div>

      {/* Main Layout: Themes Grid / Selector & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Themes List */}
        <div className="lg:col-span-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {isAr ? "منظومة مكارم الأخلاق" : "Noble Character Virtues"} (
            {INITIAL_GOOD_CHARACTER_THEMES.length})
          </h4>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {INITIAL_GOOD_CHARACTER_THEMES.map((theme) => {
              const isSelected = activeTheme.id === theme.id;
              const isCommitted =
                ecoState.goodCharacterReflections?.[theme.id]?.voluntaryGoalCommitted;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-semibold"
                      : "border-border bg-card hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{isAr ? theme.titleAr : theme.titleEn}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {theme.arabicConcept}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 font-normal">
                    {theme.coreDefinition}
                  </p>
                  {isCommitted && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
                      <Check className="h-3 w-3" />
                      <span>{isAr ? "ملتزم بالهدف التطبيقي" : "Goal committed"}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Theme Details */}
        <div className="lg:col-span-8">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {isAr ? activeTheme.titleAr : activeTheme.titleEn}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {activeTheme.arabicConcept}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {isAr ? activeTheme.titleEn : activeTheme.titleAr}
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  variant={userThemeRecord?.voluntaryGoalCommitted ? "default" : "outline"}
                  onClick={handleToggleHabitCommitment}
                  className="text-xs gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {userThemeRecord?.voluntaryGoalCommitted
                    ? isAr
                      ? "ملتزم بالتطبيق اليومي"
                      : "Committed Today"
                    : isAr
                      ? "عزم على التطبيق اليومي"
                      : "Commit to Practice"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-6 text-xs leading-relaxed">
              {/* Core Definition */}
              <div className="p-3.5 rounded-lg bg-muted/40 border text-xs">
                <span className="font-semibold text-foreground">
                  {isAr ? "المفهوم الجوهري:" : "Core Ethical Principle:"}{" "}
                </span>
                <span className="text-foreground">{activeTheme.coreDefinition}</span>
              </div>

              {/* Authentic References */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Quote className="h-4 w-4 text-emerald-600" />
                  {isAr
                    ? "النصوص والأحاديث الموثقة بالأسانيد الصحيحة"
                    : "Authentic References & Verified Citations"}
                </h4>
                <div className="space-y-2">
                  {activeTheme.authenticReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2"
                    >
                      <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 font-serif leading-loose">
                        {ref.textAr}
                      </p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "{ref.textEn}"
                      </p>
                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {ref.sourceBook} {ref.citationNumber}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {ref.authenticityGrade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Scenarios */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {isAr
                    ? "مواقف وتطبيقات واقعية للطلبة"
                    : "Practical Student Scenarios in School & Life"}
                </h4>
                <ul className="space-y-1.5">
                  {activeTheme.practicalStudentScenarios.map((sc, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-md border bg-card flex items-start gap-2 text-foreground"
                    >
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{sc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Voluntary Habit Goal */}
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-200">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span>
                    {isAr ? "الهدف العملي اليومي المقترح:" : "Suggested Daily Practice Goal:"}
                  </span>
                </div>
                <p className="text-xs font-medium">{activeTheme.voluntaryHabitGoal}</p>
              </div>

              {/* Reflection Questions & Private Journal */}
              <div className="pt-2 border-t space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  {isAr
                    ? "تأمل ومحاسبة النفس الصامتة (سري وخاص بك)"
                    : "Quiet Self-Reflection (Private to You)"}
                </h4>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {activeTheme.dailyReflectionQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold">?</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    placeholder={
                      isAr
                        ? "اكتب تأملك الصادق هنا بينك وبين نفسك... كيف طبقت هذا الخلق اليوم؟ أين قصرت؟"
                        : "Write your honest reflection... How did you exercise this virtue today? Where can you improve?"
                    }
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSaveReflection}
                      disabled={!reflectionInput.trim()}
                      className="text-xs"
                    >
                      {isAr ? "حفظ التأمل في سجلك الخاص" : "Save Quiet Reflection"}
                    </Button>
                  </div>
                </div>

                {userThemeRecord?.reflectionNote && (
                  <div className="p-3 rounded-lg bg-muted/40 border text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground flex items-center justify-between">
                      <span>{isAr ? "آخر تأمل محفوظ لك:" : "Your Last Saved Reflection:"}</span>
                      <span className="text-[10px]">{userThemeRecord.lastReflectedDate}</span>
                    </div>
                    <p className="italic">"{userThemeRecord.reflectionNote}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
