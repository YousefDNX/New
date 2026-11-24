import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Award,
  ChevronRight,
  PlusCircle,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INITIAL_TRUTH_DEFENDER_CLAIMS,
  LOGICAL_FALLACY_MODULES,
  type ClaimVerdict,
  type TruthEvaluationItem,
  type LogicalFallacyModule,
} from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";

const VERDICT_META: Record<
  ClaimVerdict,
  { labelEn: string; labelAr: string; color: string; icon: typeof CheckCircle2 }
> = {
  supported_by_evidence: {
    labelEn: "Supported by Evidence",
    labelAr: "مؤكد بأدلة قاطعة",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    icon: CheckCircle2,
  },
  partially_supported: {
    labelEn: "Partially Supported / Nuanced",
    labelAr: "صحيح جزئياً مع سياق مقيد",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
    icon: AlertCircle,
  },
  contradicted_by_evidence: {
    labelEn: "Contradicted / False",
    labelAr: "مناقض للأدلة العلمية (غير صحيح)",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
    icon: XCircle,
  },
  insufficient_evidence: {
    labelEn: "Insufficient Evidence",
    labelAr: "أدلة غير كافية للحكم",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
    icon: HelpCircle,
  },
  outdated_information: {
    labelEn: "Outdated / Superseded",
    labelAr: "معلومات قديمة تم تصحيحها",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
    icon: Clock,
  },
  opinion_or_interpretation: {
    labelEn: "Opinion or Interpretation",
    labelAr: "رأي أو تأويل غير قابل للجزم",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border-slate-300",
    icon: HelpCircle,
  },
  unverified_claim: {
    labelEn: "Unverified / Needs Research",
    labelAr: "ادعاء قيد البحث والتحقق",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300",
    icon: AlertCircle,
  },
};

export function TruthDefenderPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: ecoState, update: updateEco } = useStudentEcosystem();

  const [mainTab, setMainTab] = useState<"workspace" | "fallacies" | "lateral_guide">("workspace");

  // All evaluations (seeded + student created)
  const allEvaluations = useMemo(() => {
    const userItems = ecoState.truthEvaluations || [];
    const combined = [...userItems, ...INITIAL_TRUTH_DEFENDER_CLAIMS];
    // deduplicate by id
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [ecoState.truthEvaluations]);

  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    INITIAL_TRUTH_DEFENDER_CLAIMS[0]?.id || "",
  );
  const [claimSearch, setClaimSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<ClaimVerdict | "all">("all");

  // New claim creation state
  const [isCreatingClaim, setIsCreatingClaim] = useState(false);
  const [newClaimText, setNewClaimText] = useState("");
  const [newAssertion, setNewAssertion] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [newVerdict, setNewVerdict] = useState<ClaimVerdict>("partially_supported");
  const [newConfidence, setNewConfidence] = useState("");
  const [newSources, setNewSources] = useState("");
  const [newNuances, setNewNuances] = useState("");

  // Fallacy Gym State
  const [activeFallacyId, setActiveFallacyId] = useState<string>(
    LOGICAL_FALLACY_MODULES[0]?.id || "",
  );
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gymScore, setGymScore] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  const activeFallacy = useMemo(() => {
    return (
      LOGICAL_FALLACY_MODULES.find((f) => f.id === activeFallacyId) ?? LOGICAL_FALLACY_MODULES[0]!
    );
  }, [activeFallacyId]);

  const filteredClaims = useMemo(() => {
    return allEvaluations.filter((item) => {
      const matchVerdict = verdictFilter === "all" || item.verdict === verdictFilter;
      const q = claimSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.submittedClaim.toLowerCase().includes(q) ||
        item.centralAssertion.toLowerCase().includes(q) ||
        item.confidenceExplanation.toLowerCase().includes(q);
      return matchVerdict && matchSearch;
    });
  }, [allEvaluations, verdictFilter, claimSearch]);

  const activeClaim = useMemo(() => {
    return allEvaluations.find((c) => c.id === selectedClaimId) || filteredClaims[0];
  }, [allEvaluations, selectedClaimId, filteredClaims]);

  const handleSaveNewClaim = () => {
    if (!newClaimText.trim() || !newAssertion.trim()) {
      toast.error(
        isAr
          ? "يرجى كتابة نص الادعاء والفرضية الأساسية"
          : "Please provide the claim and central assertion",
      );
      return;
    }

    const created: TruthEvaluationItem = {
      id: `eval_${Date.now()}`,
      submittedClaim: newClaimText.trim(),
      centralAssertion: newAssertion.trim(),
      deconstructedPoints: newPoints
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
      verdict: newVerdict,
      confidenceExplanation:
        newConfidence.trim() || (isAr ? "تحقق مستقل للطالب" : "Independent student evaluation"),
      sourcesExamined: newSources
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({
          title: s,
          sourceName: "Examined Academic / Fact-Check Source",
          publicationDate: new Date().toISOString().split("T")[0] || "2026",
          quotedSnippet: "Direct verification excerpt.",
        })),
      identifiedDisagreementsOrNuances: newNuances
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
      evaluatedAt: new Date().toISOString().split("T")[0] || "2026-11-19",
    };

    updateEco((prev) => ({
      ...prev,
      truthEvaluations: [created, ...(prev.truthEvaluations || [])],
    }));

    setSelectedClaimId(created.id);
    setIsCreatingClaim(false);
    setNewClaimText("");
    setNewAssertion("");
    setNewPoints("");
    setNewConfidence("");
    setNewSources("");
    setNewNuances("");
    toast.success(
      isAr ? "تم حفظ التحقق وإضافته إلى سجل الحقيقة" : "Claim evaluation saved to Truth Registry!",
    );
  };

  const handleSelectFallacyAnswer = (index: number) => {
    if (showExplanation || !activeFallacy) return;
    setUserSelectedOption(index);
    setShowExplanation(true);
    const isCorrect = index === activeFallacy.practiceScenario.correctIndex;
    setGymScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNextFallacy = () => {
    const currentIndex = LOGICAL_FALLACY_MODULES.findIndex((f) => f.id === activeFallacyId);
    const nextIndex = (currentIndex + 1) % LOGICAL_FALLACY_MODULES.length;
    setActiveFallacyId(LOGICAL_FALLACY_MODULES[nextIndex]?.id || "");
    setUserSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr ? "حامي الحقيقة والتفكير النقدي" : "Truth & Knowledge Defender"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "مختبر تفكيك الادعاءات، القراءة الجانبية المستقلة، والتمرس على كشف المغالطات المنطقية"
              : "Rigorous claim deconstruction, lateral reading methodologies, and an interactive logical fallacy gymnasium."}
          </p>
        </div>

        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)}>
          <TabsList>
            <TabsTrigger
              value="workspace"
              onClick={() => setMainTab("workspace")}
              className="text-xs"
            >
              {isAr ? "مختبر التحقق من الادعاءات" : "Claim Workspace"}
            </TabsTrigger>
            <TabsTrigger
              value="fallacies"
              onClick={() => setMainTab("fallacies")}
              className="text-xs"
            >
              {isAr ? "نادي المغالطات المنطقية" : "Fallacy Gym"}
            </TabsTrigger>
            <TabsTrigger
              value="lateral_guide"
              onClick={() => setMainTab("lateral_guide")}
              className="text-xs"
            >
              {isAr ? "دليل القراءة الجانبية" : "Lateral Reading"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Tab 1: Claim Workspace */}
      {mainTab === "workspace" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isAr ? "بحث في الادعاءات المفحوصة..." : "Search examined claims..."}
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isCreatingClaim ? "secondary" : "default"}
                onClick={() => setIsCreatingClaim(!isCreatingClaim)}
                className="text-xs gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {isCreatingClaim
                  ? isAr
                    ? "إلغاء النموذج"
                    : "Cancel Form"
                  : isAr
                    ? "فحص ادعاء جديد"
                    : "Evaluate New Claim"}
              </Button>
            </div>
          </div>

          {isCreatingClaim ? (
            <Card className="border-2 border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  {isAr ? "نموذج تفكيك وفحص ادعاء جديد" : "Deconstruct & Evaluate a New Claim"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? "اتبع منهجية التحقق الصارمة: حدد الادعاء، فكك جزئياته، اذكر مصادرك المكتوبة، واختر حكماً موضوعياً متزناً."
                    : "Follow structured truth verification: state the assertion, isolate sub-points, document sources, and select a calibrated verdict."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "نص الادعاء الشائع" : "Submitted Claim Text"}
                    </Label>
                    <Input
                      placeholder={
                        isAr
                          ? "مثال: شرب 4 لترات ماء مثلج يحرق 500 سعرة حرارية يومياً"
                          : "E.g. Drinking iced water burns 500 calories daily"
                      }
                      value={newClaimText}
                      onChange={(e) => setNewClaimText(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "الفرضية المركزية للاختبار" : "Central Testable Assertion"}
                    </Label>
                    <Input
                      placeholder={
                        isAr
                          ? "هل يؤثر انخفاض حرارة الماء على معدل الأيض بشكل ملحوظ؟"
                          : "Does cold water consumption significantly elevate metabolic burn?"
                      }
                      value={newAssertion}
                      onChange={(e) => setNewAssertion(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {isAr
                      ? "تفكيك نقاط الادعاء (كل نقطة في سطر)"
                      : "Deconstructed Sub-Points (one per line)"}
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder={
                      isAr
                        ? "1. الادعاء يزعم حرق 500 سعرة.\n2. النظريات الفيزيولوجية تثبت أن تسخين لتر ماء يستهلك فقط حوالي 8 سعرات.\n3. الرقم مبالغ فيه بنسبة تزيد عن 95%."
                        : "1. The claim asserts 500 kcal burn.\n2. Thermogenesis only accounts for ~8 kcal per liter.\n3. The magnitude is exaggerated by >95%."
                    }
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "الحكم الموضوعي المتزن" : "Calibrated Evidence Verdict"}
                    </Label>
                    <select
                      className="w-full text-xs rounded-md border border-input bg-background p-2"
                      value={newVerdict}
                      onChange={(e) => setNewVerdict(e.target.value as ClaimVerdict)}
                    >
                      {Object.entries(VERDICT_META).map(([key, meta]) => (
                        <option key={key} value={key}>
                          {isAr ? meta.labelAr : meta.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {isAr ? "شرح مستوى الثقة والنتيجة" : "Confidence & Reasoning Summary"}
                    </Label>
                    <Input
                      placeholder={
                        isAr
                          ? "شرح موجز لسبب اتخاذ هذا الحكم..."
                          : "Briefly explain the rationale for this verdict..."
                      }
                      value={newConfidence}
                      onChange={(e) => setNewConfidence(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {isAr
                      ? "المصادر المفحوصة (سلسلة روابط أو أسماء أبحاث)"
                      : "Examined Sources (links or paper titles)"}
                  </Label>
                  <Textarea
                    rows={2}
                    placeholder={
                      isAr
                        ? "American Journal of Clinical Nutrition\nWHO Hydration Advisory"
                        : "Journal of Clinical Endocrinology\nWHO Water Guidelines"
                    }
                    value={newSources}
                    onChange={(e) => setNewSources(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {isAr ? "الفروق الدقيقة والاستثناءات" : "Identified Nuances or Disagreements"}
                  </Label>
                  <Input
                    placeholder={
                      isAr
                        ? "مثال: الماء البارد مفيد للترطيب أثناء التمارين ولكن لا يسبب فقدان وزن مباشر"
                        : "Cold water is effective for sports hydration, but does not induce passive weight loss."
                    }
                    value={newNuances}
                    onChange={(e) => setNewNuances(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreatingClaim(false)}
                    className="text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button size="sm" onClick={handleSaveNewClaim} className="text-xs">
                    {isAr ? "اعتماد وحفظ التحقق" : "Save Evaluation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Claims List and Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{isAr ? "سجل الادعاءات المفحوصة" : "Examined Claims Registry"}</span>
                <span>
                  {filteredClaims.length} {isAr ? "ادعاء" : "claims"}
                </span>
              </div>
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {filteredClaims.map((item) => {
                  const meta = VERDICT_META[item.verdict] || VERDICT_META.unverified_claim;
                  const Icon = meta.icon;
                  const isSelected = activeClaim?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedClaimId(item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold line-clamp-2 text-foreground">
                          {item.submittedClaim}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {isAr ? meta.labelAr : meta.labelEn}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {item.evaluatedAt}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Claim Detail View */}
            <div className="lg:col-span-7">
              {activeClaim ? (
                <Card className="border shadow-xs">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-bold text-foreground leading-snug">
                          "{activeClaim.submittedClaim}"
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {isAr ? "الفرضية المركزية:" : "Central Assertion:"}{" "}
                          {activeClaim.centralAssertion}
                        </CardDescription>
                      </div>
                      {(() => {
                        const meta =
                          VERDICT_META[activeClaim.verdict] || VERDICT_META.unverified_claim;
                        const Icon = meta.icon;
                        return (
                          <div
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{isAr ? meta.labelAr : meta.labelEn}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Confidence Explanation */}
                    <div className="p-3 rounded-lg bg-muted/40 border text-xs leading-relaxed">
                      <span className="font-semibold text-foreground">
                        {isAr ? "خلاصة الدليل والحكم:" : "Evidence Rationale:"}{" "}
                      </span>
                      <span>{activeClaim.confidenceExplanation}</span>
                    </div>

                    {/* Deconstructed Sub-points */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {isAr ? "تفكيك عناصر الادعاء" : "Deconstructed Claim Elements"}
                      </h4>
                      <ul className="space-y-1.5">
                        {activeClaim.deconstructedPoints.map((pt, idx) => (
                          <li
                            key={idx}
                            className="text-xs p-2 rounded-md bg-card border flex items-start gap-2"
                          >
                            <span className="text-primary font-bold">{idx + 1}.</span>
                            <span className="text-foreground leading-normal">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sources Examined */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {isAr ? "المصادر المرجعية المفحوصة" : "Sources Examined for Verification"}
                      </h4>
                      <div className="space-y-2">
                        {activeClaim.sourcesExamined.map((src, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md border bg-muted/20 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{src.title}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {src.sourceName}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground italic">
                              "{src.quotedSnippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nuances & Disagreements */}
                    {activeClaim.identifiedDisagreementsOrNuances.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          <span>
                            {isAr
                              ? "الفروق الدقيقة والسياقات المشروطة:"
                              : "Contextual Nuances & Scientific Caveats:"}
                          </span>
                        </div>
                        <ul className="space-y-1 pl-4 list-disc">
                          {activeClaim.identifiedDisagreementsOrNuances.map((nuance, idx) => (
                            <li key={idx}>{nuance}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Fallacy Gym */}
      {mainTab === "fallacies" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
            <div>
              <h3 className="font-semibold text-sm">
                {isAr ? "صالة تدريب كشف المغالطات المنطقية" : "Logical Fallacy Practice Gymnasium"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "تعلم تمييز الخلل الاستدلالي في النقاشات الأكاديمية والمنصات الرقمية عبر سيناريوهات تفاعلية واقعية."
                  : "Train your critical reasoning by diagnosing flawed arguments in realistic academic and media scenarios."}
              </p>
            </div>
            {gymScore.total > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0 py-1 px-3">
                {isAr ? "النتيجة:" : "Score:"} {gymScore.correct} / {gymScore.total} (
                {Math.round((gymScore.correct / gymScore.total) * 100)}%)
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Fallacies Selector */}
            <div className="lg:col-span-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isAr ? "أنواع المغالطات" : "Fallacy Catalog"}
              </h4>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {LOGICAL_FALLACY_MODULES.map((fallacy) => {
                  const isSelected = activeFallacy.id === fallacy.id;
                  return (
                    <button
                      key={fallacy.id}
                      onClick={() => {
                        setActiveFallacyId(fallacy.id);
                        setUserSelectedOption(null);
                        setShowExplanation(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border bg-card hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{isAr ? fallacy.nameAr : fallacy.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 font-normal">
                        {fallacy.definition}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fallacy Interactive Gym Box */}
            <div className="lg:col-span-8">
              <Card className="border shadow-xs">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-primary">
                        {isAr ? activeFallacy.nameAr : activeFallacy.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {isAr ? activeFallacy.name : activeFallacy.nameAr}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {isAr ? "تدريب تفاعلي" : "Interactive Challenge"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  {/* Definition and Spotting tips */}
                  <div className="space-y-3">
                    <div className="text-xs text-foreground leading-relaxed">
                      <span className="font-semibold text-primary">
                        {isAr ? "التعريف:" : "Definition:"}{" "}
                      </span>
                      {activeFallacy.definition}
                    </div>

                    <div className="p-3 rounded-md bg-muted/40 border text-xs text-muted-foreground space-y-1">
                      <div className="font-semibold text-foreground">
                        {isAr ? "مثال من الحياة اليومية:" : "Everyday Real-World Example:"}
                      </div>
                      <p className="italic">"{activeFallacy.everydayExample}"</p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {isAr ? "كيف تكشف هذه المغالطة؟" : "How to Spot It:"}{" "}
                      </span>
                      {activeFallacy.howToSpotIt}
                    </div>
                  </div>

                  {/* Practice Challenge Scenario */}
                  <div className="pt-3 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <h5 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                        {isAr ? "اختبار التفكير النقدي" : "Critical Reasoning Challenge"}
                      </h5>
                    </div>

                    <div className="p-3.5 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20 text-xs font-medium text-foreground leading-relaxed">
                      <p className="font-semibold mb-1 text-muted-foreground">
                        {isAr ? "الادعاء المعروض:" : "Target Argument:"}
                      </p>
                      "{activeFallacy.practiceScenario.argumentText}"
                    </div>

                    <p className="text-xs font-semibold text-foreground">
                      {activeFallacy.practiceScenario.flawQuestion}
                    </p>

                    <div className="space-y-2">
                      {activeFallacy.practiceScenario.options.map((opt, optIdx) => {
                        const isCorrectOption =
                          optIdx === activeFallacy.practiceScenario.correctIndex;
                        const isSelected = userSelectedOption === optIdx;

                        const btnVariant = "outline";
                        let extraStyle = "text-foreground bg-card hover:bg-muted/50";

                        if (showExplanation) {
                          if (isCorrectOption) {
                            extraStyle =
                              "bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300";
                          } else if (isSelected && !isCorrectOption) {
                            extraStyle =
                              "bg-rose-50 text-rose-900 border-rose-500 line-through dark:bg-rose-950/40 dark:text-rose-300";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={showExplanation}
                            onClick={() => handleSelectFallacyAnswer(optIdx)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${extraStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showExplanation && (
                      <div className="space-y-3 pt-2">
                        <div
                          className={`p-3 rounded-lg border text-xs ${
                            userSelectedOption === activeFallacy.practiceScenario.correctIndex
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                              : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
                          }`}
                        >
                          <div className="font-bold mb-1">
                            {userSelectedOption === activeFallacy.practiceScenario.correctIndex
                              ? isAr
                                ? "إجابة دقيقة وصحيحة!"
                                : "Excellent Analysis! That is correct."
                              : isAr
                                ? "تحليل غير دقيق."
                                : "Not quite right."}
                          </div>
                          <p>{activeFallacy.practiceScenario.remediationNote}</p>
                        </div>

                        <Button size="sm" onClick={handleNextFallacy} className="text-xs">
                          {isAr ? "التالي في المغالطات" : "Next Fallacy Exercise"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: Lateral Reading Guide */}
      {mainTab === "lateral_guide" && (
        <div className="space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                {isAr
                  ? "منهجية القراءة الجانبية المستقلة (Lateral Reading)"
                  : "Lateral Reading: Stanford & Professional Fact-Checker Methodology"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr
                  ? "بدلاً من البقاء داخل الصفحة المشبوهة وقراءة معلوماتها المصممة لخداعك، افتح علامات تبويب جديدة فوراً واسأل مصادر مستقلة موثوقة عما تقوله عن الموقع."
                  : "Instead of staying on a single webpage and reading vertically, open new browser tabs immediately to investigate what independent trusted sources say about the publisher."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-semibold text-xs text-foreground">
                    {isAr ? "من يقف وراء المعلومة؟" : "Who is Behind the Information?"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr
                      ? "ابحث عن الجهة الممولة، مؤهلات الكاتب في هذا المجال بعينه، وما إذا كان للموقع مصلحة تجارية أو سياسية خفية."
                      : "Research the funding entity, domain registration, author credentials in this specific discipline, and potential financial or political conflicts of interest."}
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-semibold text-xs text-foreground">
                    {isAr ? "ما هي الأدلة الملموسة؟" : "What is the Concrete Evidence?"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr
                      ? "هل يقدم المقال أرقاماً ودراسات خاضعة لمراجعة الأقران (Peer-reviewed)، أم مجرد تجارب شخصية وانطباعات عاطفية؟"
                      : "Does the claim cite peer-reviewed academic literature, randomized controlled trials, or official census data, or solely anecdotal stories and emotional appeals?"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-semibold text-xs text-foreground">
                    {isAr
                      ? "ماذا تقول المصادر الأخرى المستقلة؟"
                      : "What Do Independent Sources Say?"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr
                      ? "قارن التقرير بقواعد التحقق العالمية (مثل Snopes, PolitiFact, Full Fact, AFP Fact Check). إذا لم يشر أحد ذو مصداقية إلى الخبر الخارق، فالاحتمال الأكبر أنه زائف."
                      : "Cross-reference against independent fact-checking databases. If a monumental claim is not corroborated by established scientific consensus or international newsrooms, treat it with extreme skepticism."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border space-y-2">
                <h4 className="font-semibold text-xs text-foreground">
                  {isAr
                    ? "قواعد ضبط النفس الرقمي (Click Restraint)"
                    : "The Discipline of Click Restraint"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isAr
                    ? "لا تضغط فوراً على النتيجة الأولى في محركات البحث؛ فالنتيجة الأولى قد تكون إعلاناً مدفوعاً أو محسّنة عبر تقنيات السيو (SEO). تصفح العناوين والملخصات لعدة نتائج، واختر مواقع المؤسسات الأكاديمية (.edu)، الحكومية (.gov)، والمنظمات الدولية المعتمدة."
                    : "Do not automatically click the first search result, which is often an ad or optimized for commercial SEO. Scan snippets of several results before clicking, prioritizing university databases, government repositories, and verified institutional publications."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
