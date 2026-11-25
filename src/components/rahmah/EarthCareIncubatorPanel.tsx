import { useState, useMemo } from "react";
import {
  Globe2,
  Leaf,
  Droplet,
  Zap,
  Trash2,
  Wind,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  AlertCircle,
  FileText,
  Users,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INITIAL_EARTH_CARE_CHALLENGES,
  type EarthCareChallenge,
  type EarthCareDomain,
  type EarthCareProjectRecord,
} from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";

const DOMAIN_CONFIG: Record<
  EarthCareDomain,
  { labelEn: string; labelAr: string; icon: typeof Leaf; color: string }
> = {
  water_conservation: {
    labelEn: "Water Conservation",
    labelAr: "حفظ واستدامة المياه",
    icon: Droplet,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
  },
  energy_efficiency: {
    labelEn: "Energy Efficiency",
    labelAr: "كفاءة الطاقة والترشيد",
    icon: Zap,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
  },
  waste_recycling: {
    labelEn: "Waste & Recycling",
    labelAr: "إدارة النفايات والتدوير",
    icon: Trash2,
    color:
      "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
  },
  biodiversity_ecosystems: {
    labelEn: "Biodiversity & Native Flora",
    labelAr: "التنوع البيولوجي والنباتات الفطرية",
    icon: Leaf,
    color: "text-green-600 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900",
  },
  climate_science: {
    labelEn: "Climate Science & Data",
    labelAr: "علوم المناخ والبيانات البيئية",
    icon: Globe2,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900",
  },
  air_quality: {
    labelEn: "Air Quality & Urban Greenery",
    labelAr: "جودة الهواء والتشجير الحضري",
    icon: Wind,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900",
  },
};

export function EarthCareIncubatorPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: ecoState, update: updateEco } = useStudentEcosystem();

  const [domainFilter, setDomainFilter] = useState<EarthCareDomain | "all">("all");
  const [activeTab, setActiveTab] = useState<"challenges" | "incubator" | "my_projects">(
    "challenges",
  );

  // Incubator Form State
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    INITIAL_EARTH_CARE_CHALLENGES[0]?.id || "",
  );
  const [projectTitle, setProjectTitle] = useState("");
  const [leadStudent, setLeadStudent] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [researchSummary, setResearchSummary] = useState("");
  const [safeActions, setSafeActions] = useState("");
  const [measuredOutcome, setMeasuredOutcome] = useState("");

  const filteredChallenges = useMemo(() => {
    return INITIAL_EARTH_CARE_CHALLENGES.filter(
      (c) => domainFilter === "all" || c.domain === domainFilter,
    );
  }, [domainFilter]);

  const activeChallenge = useMemo(() => {
    return (
      INITIAL_EARTH_CARE_CHALLENGES.find((c) => c.id === selectedChallengeId) ||
      INITIAL_EARTH_CARE_CHALLENGES[0]
    );
  }, [selectedChallengeId]);

  const handleCreateProject = () => {
    if (!projectTitle.trim() || !leadStudent.trim() || !measuredOutcome.trim()) {
      toast.error(
        isAr
          ? "يرجى كتابة عنوان المشروع، اسم الطالب المسؤول، والنتائج المقاسة بصدق"
          : "Please specify project title, student lead, and honest measured outcome",
      );
      return;
    }

    const newProject: EarthCareProjectRecord = {
      id: `ecp_${Date.now()}`,
      challengeId: selectedChallengeId,
      title: projectTitle.trim(),
      leadStudentOrTeam: leadStudent.trim(),
      status: "completed_published",
      researchSummary: researchSummary.trim() || (activeChallenge?.scientificContext ?? ""),
      safeActionsTaken: safeActions
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean),
      measuredOutcome: measuredOutcome.trim(),
      supervisorName:
        supervisorName.trim() || (isAr ? "مشرف مدرسي / عائلي" : "Faculty / Family Mentor"),
      submittedAt: new Date().toISOString().split("T")[0] || "2026-11-19",
    };

    updateEco((prev) => ({
      ...prev,
      earthCareProjects: [newProject, ...(prev.earthCareProjects || [])],
    }));

    toast.success(
      isAr
        ? "تم توثيق مشروع رعاية الأرض بنجاح بدون تضخيم للأرقام!"
        : "Earth Care Project documented with honest, verified metrics!",
    );

    setProjectTitle("");
    setLeadStudent("");
    setSupervisorName("");
    setResearchSummary("");
    setSafeActions("");
    setMeasuredOutcome("");
    setActiveTab("my_projects");
  };

  return (
    <div className="space-y-6">
      {/* Strict Ethical Evidence Notice */}
      <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">
              {isAr
                ? "ميثاق الأمانة والصدق البيئي الصارم"
                : "Strict Environmental Honesty & Safety Protocol"}
            </h4>
            <p className="text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
              {isAr
                ? "في نكسورا، لا نضع أرقاماً وهمية لحفظ كوكب الأرض، ولا ندعي خفض أطنان من الكربون بدون فواتير أو قياسات حقيقية. جميع التحديات آمنة للطلبة، تتطلب إشرافاً عائلياً أو مدرسياً عند التعامل مع الكهرباء أو النفايات، وتوثق النتائج الميدانية كما هي بصدق وتواضع."
                : "At NEXORA, we categorically reject fabricated environmental vanity metrics (such as claiming fictitious tons of CO2 saved). Every challenge is safety-screened, requires adult supervision where appropriate, and demands strictly honest before-and-after observations."}
            </p>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr ? "حاضنة رعاية الأرض والاستدامة الحقيقية" : "Earth Care Project Incubator"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "مبادرات علمية وميدانية آمنة في حفظ المياه، الطاقة، التشجير الفطري، والحد من النفايات"
              : "Practical, student-safe environmental research projects across 6 conservation domains."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === "challenges" ? "default" : "outline"}
            onClick={() => setActiveTab("challenges")}
            className="text-xs"
          >
            {isAr ? "دليل التحديات الآمنة" : "Challenge Catalog"}
          </Button>
          <Button
            size="sm"
            variant={activeTab === "incubator" ? "default" : "outline"}
            onClick={() => setActiveTab("incubator")}
            className="text-xs gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            {isAr ? "حاضنة المشاريع (8 خطوات)" : "8-Step Incubator"}
          </Button>
          <Button
            size="sm"
            variant={activeTab === "my_projects" ? "default" : "outline"}
            onClick={() => setActiveTab("my_projects")}
            className="text-xs"
          >
            {isAr ? "مشاريعنا الموثقة" : "Documented Projects"} (
            {(ecoState.earthCareProjects || []).length})
          </Button>
        </div>
      </div>

      {/* Tab 1: Challenges Catalog */}
      {activeTab === "challenges" && (
        <div className="space-y-6">
          {/* Domain Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <Button
              variant={domainFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDomainFilter("all")}
              className="text-xs whitespace-nowrap"
            >
              {isAr ? "جميع المجالات البيئية (6)" : "All Domains (6)"}
            </Button>
            {Object.entries(DOMAIN_CONFIG).map(([domKey, cfg]) => {
              const isSelected = domainFilter === domKey;
              const Icon = cfg.icon;
              return (
                <Button
                  key={domKey}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDomainFilter(domKey as EarthCareDomain)}
                  className="text-xs whitespace-nowrap gap-1.5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {isAr ? cfg.labelAr : cfg.labelEn}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((challenge) => {
              const cfg = DOMAIN_CONFIG[challenge.domain];
              const Icon = cfg.icon;
              return (
                <Card key={challenge.id} className="border flex flex-col justify-between shadow-xs">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2 rounded-lg border ${cfg.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        ~{challenge.estimatedEffortHours} {isAr ? "ساعات عمل" : "effort hrs"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold mt-2">
                      {isAr ? challenge.titleAr : challenge.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {challenge.problemStatement}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="p-2.5 rounded-md bg-muted/40 text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">
                        {isAr ? "المعيار القابل للقياس:" : "Verifiable Metric:"}{" "}
                      </span>
                      {challenge.verifiableMetricLabel}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-foreground">
                        {isAr ? "خطوات التنفيذ الآمنة:" : "Safe Student Actions:"}
                      </span>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {challenge.safeActionSteps.slice(0, 3).map((st, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span className="line-clamp-1">{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {challenge.supervisionNeeded && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {isAr ? "يتطلب إشراف معلم أو ولي أمر" : "Adult supervision required"}
                        </span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs mt-2"
                      onClick={() => {
                        setSelectedChallengeId(challenge.id);
                        setProjectTitle(
                          isAr
                            ? `مشروع تطبيق: ${challenge.titleAr}`
                            : `Execution: ${challenge.title}`,
                        );
                        setResearchSummary(challenge.scientificContext);
                        setActiveTab("incubator");
                      }}
                    >
                      {isAr ? "بدء هذا المشروع في الحاضنة" : "Launch in Incubator"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: 8-Step Project Incubator */}
      {activeTab === "incubator" && (
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-emerald-600" />
                  {isAr
                    ? "حاضنة المشاريع البيئية الصادقة (دورة الـ 8 خطوات)"
                    : "8-Step Scientific Earth Care Incubator"}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {isAr
                    ? "منهجية علمية تبدأ بتحديد المشكلة والتدقيق الأولي، مروراً بالتنفيذ الآمن، وحتى توثيق النتائج الصادقة بدون تضخيم."
                    : "From baseline data collection to safety clearance and honest before-and-after empirical observation."}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {activeChallenge ? DOMAIN_CONFIG[activeChallenge.domain]?.labelEn : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 8-Step Progress Bar Visualization */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[11px]">
              {[
                { num: "1", title: isAr ? "المشكلة" : "Problem" },
                { num: "2", title: isAr ? "التدقيق" : "Baseline" },
                { num: "3", title: isAr ? "الأمان" : "Safety" },
                { num: "4", title: isAr ? "الخطة" : "Action Plan" },
                { num: "5", title: isAr ? "التنفيذ" : "Execution" },
                { num: "6", title: isAr ? "القياس" : "Metrics" },
                { num: "7", title: isAr ? "المراجعة" : "Peer Review" },
                { num: "8", title: isAr ? "التوثيق" : "Registry" },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg border bg-muted/30 flex flex-col items-center"
                >
                  <span className="h-5 w-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] mb-1">
                    {step.num}
                  </span>
                  <span className="font-medium text-foreground">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <ModernSelect
                id="earthcare-challenge-framework"
                label={isAr ? "التحدي البيئي الأساسي" : "Selected Challenge Framework"}
                value={selectedChallengeId}
                onValueChange={setSelectedChallengeId}
                searchPlaceholder={isAr ? "ابحث في التحديات..." : "Search challenges..."}
                options={INITIAL_EARTH_CARE_CHALLENGES.map((ch) => ({
                  value: ch.id,
                  label: isAr ? ch.titleAr : ch.title,
                  description: DOMAIN_CONFIG[ch.domain]?.[isAr ? "labelAr" : "labelEn"],
                  keywords: `${ch.title} ${ch.titleAr} ${DOMAIN_CONFIG[ch.domain]?.labelEn ?? ""}`,
                }))}
              />

              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isAr ? "عنوان مشروعك الميداني" : "Your Project Title"}
                </Label>
                <Input
                  placeholder={
                    isAr
                      ? "مثال: تدقيق صيانة صنابير مدرسة الفيحاء ورصد التسريبات"
                      : "E.g. School Faucet Drip Audit & Repair Initiative"
                  }
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="min-h-[44px] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isAr ? "الطالب أو فريق العمل" : "Lead Student or Student Team"}
                </Label>
                <Input
                  placeholder={
                    isAr ? "مثال: يوسف، نادي البيئة الصفي" : "E.g. Student Eco Team (Grade 9)"
                  }
                  value={leadStudent}
                  onChange={(e) => setLeadStudent(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isAr
                    ? "المشرف المعتمد (معلم / ولي أمر)"
                    : "Supervising Mentor (Teacher / Parent)"}
                </Label>
                <Input
                  placeholder={
                    isAr
                      ? "مثال: أ. أحمد (معلم العلوم) / م. سارة"
                      : "E.g. Mr. Al-Kandari (Science Faculty)"
                  }
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr
                  ? "البيانات الأولية والبحث العلمي (Baseline Audit)"
                  : "Scientific Context & Baseline Observations"}
              </Label>
              <Textarea
                rows={3}
                placeholder={
                  isAr
                    ? "صف الوضع قبل بدء المبادرة: كم صنبوراً كان يتسرب؟ ما معدل الهدر المقاس باللتر في الدقيقة؟"
                    : "Describe baseline conditions: number of dripping faucets, measured drip rate in ml/min before intervention."
                }
                value={researchSummary}
                onChange={(e) => setResearchSummary(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr
                  ? "الإجراءات العملية المتخذة بأمان (كل إجراء في سطر)"
                  : "Safe Practical Actions Executed (one per line)"}
              </Label>
              <Textarea
                rows={3}
                placeholder={
                  isAr
                    ? "1. فحص 24 صنبوراً في مبنى المرحلة المتوسطة.\n2. إبلاغ مسؤول الصيانة بـ 3 صنابير تتسرب.\n3. تركيب 6 مهويات موفرة لتدفق الماء (Aerators) بإشراف المعلم."
                    : "1. Audited 24 faucets across campus.\n2. Logged 3 leaking washers with facility management.\n3. Installed 6 low-flow aerators under faculty supervision."
                }
                value={safeActions}
                onChange={(e) => setSafeActions(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {isAr
                    ? "النتيجة الفعلية المقاسة بصدق (بدون مبالغة)"
                    : "Strictly Honest Measured Outcome (No Exaggeration)"}
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? "وثق الأرقام الحقيقية فقط" : "Verified observations only"}
                </span>
              </div>
              <Input
                placeholder={
                  isAr
                    ? "مثال: انخفاض تدفق 6 صنابير من 9 لتر/دقيقة إلى 4.5 لتر/دقيقة، مع إصلاح تسريب كان يهدر ~18 لتر يومياً."
                    : "E.g. Reduced water flow from 9L/min to 4.5L/min on 6 aerated taps; stopped a leak that wasted ~18 liters/day."
                }
                value={measuredOutcome}
                onChange={(e) => setMeasuredOutcome(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("challenges")}
                className="text-xs"
              >
                {isAr ? "رجوع للتحديات" : "Back to Challenges"}
              </Button>
              <Button
                size="sm"
                onClick={handleCreateProject}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isAr ? "اعتماد وتوثيق المشروع" : "Complete & Document Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: My Documented Projects */}
      {activeTab === "my_projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {isAr ? "سجل المشاريع البيئية الموثقة" : "Documented Environmental Projects"} (
              {(ecoState.earthCareProjects || []).length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("incubator")}
              className="text-xs gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {isAr ? "إضافة مشروع جديد" : "Add Project"}
            </Button>
          </div>

          {(ecoState.earthCareProjects || []).length === 0 ? (
            <div className="p-8 text-center border rounded-xl bg-card space-y-3">
              <Leaf className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "لم تقم بتوثيق أي مشروع بيئي بعد. ابدأ باختيار تحدٍ من دليل التحديات الآمنة!"
                  : "No projects recorded yet. Choose a safe challenge from the catalog to launch your first initiative!"}
              </p>
              <Button size="sm" onClick={() => setActiveTab("challenges")} className="text-xs">
                {isAr ? "تصفح التحديات" : "Browse Challenges"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(ecoState.earthCareProjects || []).map((project) => (
                <Card key={project.id} className="border shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold">{project.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {project.submittedAt}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {isAr ? "المسؤول:" : "Lead:"} {project.leadStudentOrTeam} •{" "}
                      {isAr ? "المشرف:" : "Mentor:"} {project.supervisorName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-xs">
                    <div className="p-2.5 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                      <span className="font-semibold">
                        {isAr ? "النتيجة المقاسة:" : "Measured Result:"}{" "}
                      </span>
                      {project.measuredOutcome}
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">
                        {isAr ? "الإجراءات المنفذة:" : "Actions Taken:"}
                      </span>
                      <ul className="space-y-1 text-muted-foreground">
                        {project.safeActionsTaken.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
