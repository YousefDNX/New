import { useState, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Smartphone,
  Wifi,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INITIAL_DIGITAL_SAFETY_LESSONS,
  DIGITAL_SAFETY_CHECKLIST_ITEMS,
  type DigitalSafetyLesson,
  type DigitalSafetyChecklistItem,
} from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";

export function DigitalSafetyPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: ecoState, update: updateEco } = useStudentEcosystem();

  const [activeTab, setActiveTab] = useState<"checklist" | "lessons">("checklist");
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    INITIAL_DIGITAL_SAFETY_LESSONS[0]?.id || "",
  );
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [showChoiceExplanation, setShowChoiceExplanation] = useState(false);

  const activeLesson = useMemo(() => {
    return (
      INITIAL_DIGITAL_SAFETY_LESSONS.find((l) => l.id === selectedLessonId) ||
      INITIAL_DIGITAL_SAFETY_LESSONS[0]
    );
  }, [selectedLessonId]);

  const checkedItemIds = useMemo(() => {
    return new Set(ecoState.digitalProtectionChecklistChecked || []);
  }, [ecoState.digitalProtectionChecklistChecked]);

  const toggleChecklistItem = (id: string) => {
    const nextSet = new Set(checkedItemIds);
    if (nextSet.has(id)) {
      nextSet.delete(id);
    } else {
      nextSet.add(id);
    }
    updateEco((prev) => ({
      ...prev,
      digitalProtectionChecklistChecked: Array.from(nextSet),
    }));
  };

  const checklistProgressPercent = Math.round(
    (checkedItemIds.size / DIGITAL_SAFETY_CHECKLIST_ITEMS.length) * 100,
  );

  return (
    <div className="space-y-6">
      {/* Strict Privacy & No-Credentials Guarantee */}
      <div className="rounded-xl border border-blue-300 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">
              {isAr
                ? "ضمان الخصوصية والأمان الرقمي المطلق"
                : "Strict Zero-Credential Privacy Guarantee"}
            </h4>
            <p className="text-blue-800 dark:text-blue-300 mt-1 leading-relaxed">
              {isAr
                ? "قائمة التحقق الرقمية تعمل محلياً بنسبة 100% داخل متصفحك. لا تطلب نكسورا إطلاقاً كتابة أي كلمة مرور أو رمز مصادقة (OTP) أو أرقام حساباتك السرية. كل خياراتك تُفحص ذاتياً على جهازك دون إرسال أي بيانات حساسة إلى أي خادم خارجي."
                : "This digital defense suite operates purely client-side within your browser. NEXORA never solicits, accepts, transmits, or stores passwords, two-factor OTP tokens, PINs, or sensitive credentials. All self-assessments are strictly confidential."}
            </p>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr ? "أكاديمية الحماية والأمان الرقمي" : "Digital Safety & Cyber Defense Academy"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "15 درساً تفاعلياً في صد الاحتيال والهندسة الاجتماعية، مع قائمة التدقيق الدفاعي للعائلة والطلبة"
              : "Defensive hygiene lessons, anti-phishing simulations, and an interactive 10-point cyber posture checklist."}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger
              value="checklist"
              onClick={() => setActiveTab("checklist")}
              className="text-xs"
            >
              {isAr ? "قائمة الدفاع الرقمي (10 نقاط)" : "10-Point Checklist"}
            </TabsTrigger>
            <TabsTrigger
              value="lessons"
              onClick={() => setActiveTab("lessons")}
              className="text-xs"
            >
              {isAr ? "المناهج الدفاعية والسيناريوهات" : "Defense Lessons"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab 1: 10-Point Interactive Checklist */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {isAr ? "مستوى الحصانة الرقمية لحساباتك" : "Personal Digital Hygiene Posture"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {checkedItemIds.size}{" "}
                    {isAr ? "من 10 ضوابط مفعلة" : "of 10 active safeguards verified"}
                  </CardDescription>
                </div>
                <Badge
                  variant={checklistProgressPercent >= 80 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {checklistProgressPercent}% {isAr ? "مكتمل" : "Covered"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${checklistProgressPercent}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DIGITAL_SAFETY_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItemIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`min-h-[44px] text-start p-3.5 rounded-lg border transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-primary/5 border-primary shadow-xs"
                          : "bg-card border-border hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-background"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              isChecked ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {isAr ? item.labelAr : item.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Defensive Lessons and Scenarios */}
      {activeTab === "lessons" && activeLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lessons List */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {isAr ? "موضوعات الدفاع السيبراني" : "Cyber Defense Topics"} (
              {INITIAL_DIGITAL_SAFETY_LESSONS.length})
            </h4>
            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pe-1">
              {INITIAL_DIGITAL_SAFETY_LESSONS.map((lesson) => {
                const isSelected = activeLesson.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setSelectedChoiceIdx(null);
                      setShowChoiceExplanation(false);
                    }}
                    className={`w-full min-h-[44px] text-start p-3 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1">{isAr ? lesson.titleAr : lesson.title}</span>
                      <ChevronRight className="h-3 w-3 opacity-50 shrink-0 rtl-flip" />
                    </div>
                    <Badge variant="outline" className="text-[9px] mt-1.5 font-normal">
                      {lesson.category.replace("_", " ")}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lesson Content & Scenario */}
          <div className="lg:col-span-8">
            <Card className="border shadow-xs">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base text-foreground">
                      {isAr ? activeLesson.titleAr : activeLesson.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {isAr ? activeLesson.title : activeLesson.titleAr}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {activeLesson.category.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-5">
                {/* Threat Explanation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    {isAr ? "طبيعة التهديد السيبراني" : "Nature of the Threat"}
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed p-3 rounded-lg bg-muted/40 border">
                    {activeLesson.threatExplanation}
                  </p>
                </div>

                {/* Best Practices */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {isAr
                      ? "إجراءات الحصانة الموصى بها عالمياً"
                      : "Defensive Countermeasures & Best Practices"}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {activeLesson.defensiveBestPractices.map((bp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-md bg-card border text-foreground"
                      >
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Scenario */}
                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <h5 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                      {isAr
                        ? "سيناريو تفاعلي: ماذا تفعل في هذا الموقف؟"
                        : "Real-World Decision Scenario"}
                    </h5>
                  </div>

                  <p className="text-xs text-foreground font-medium p-3 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20 leading-relaxed">
                    {activeLesson.interactiveScenario.prompt}
                  </p>

                  <div className="space-y-2">
                    {activeLesson.interactiveScenario.choices.map((choice, cIdx) => {
                      const isSelected = selectedChoiceIdx === cIdx;
                      let borderStyle = "border-border bg-card hover:bg-muted/40";

                      if (showChoiceExplanation) {
                        if (choice.isSafe) {
                          borderStyle =
                            "border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold";
                        } else if (isSelected && !choice.isSafe) {
                          borderStyle =
                            "border-rose-500 bg-rose-50/70 text-rose-950 dark:bg-rose-950/40 dark:text-rose-200 line-through";
                        }
                      }

                      return (
                        <button
                          key={cIdx}
                          type="button"
                          disabled={showChoiceExplanation}
                          onClick={() => {
                            setSelectedChoiceIdx(cIdx);
                            setShowChoiceExplanation(true);
                          }}
                          className={`w-full min-h-[44px] text-start p-3 rounded-lg border text-xs transition-all ${borderStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold">
                              {String.fromCharCode(65 + cIdx)}
                            </span>
                            <span>{choice.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showChoiceExplanation && selectedChoiceIdx !== null && (
                    <div
                      className={`p-3 rounded-lg border text-xs leading-relaxed ${
                        activeLesson.interactiveScenario.choices[selectedChoiceIdx]?.isSafe
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                          : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
                      }`}
                    >
                      <div className="font-bold mb-1">
                        {activeLesson.interactiveScenario.choices[selectedChoiceIdx]?.isSafe
                          ? isAr
                            ? "تصرف وقائي سليم!"
                            : "Correct Defense Strategy!"
                          : isAr
                            ? "تصرف محفوف بالمخاطر!"
                            : "High-Risk Decision!"}
                      </div>
                      <p>
                        {activeLesson.interactiveScenario.choices[selectedChoiceIdx]?.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
