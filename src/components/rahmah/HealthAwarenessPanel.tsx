import { useState, useMemo } from "react";
import {
  HeartPulse,
  AlertTriangle,
  PhoneCall,
  Search,
  BookOpen,
  CheckCircle2,
  Stethoscope,
  Info,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Activity,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INITIAL_HEALTH_TOPICS,
  type HealthDomainKind,
  type HealthTopicRecord,
} from "@/data/humanity-first";
import { usePrefs } from "@/lib/preferences";

const DOMAIN_LABELS: Record<HealthDomainKind, { en: string; ar: string }> = {
  vision_eye: { en: "Vision & Screen Health", ar: "صحة الإبصار والشاشات" },
  brain_nervous: { en: "Brain & Sleep Architecture", ar: "الدماغ ونمط النوم" },
  heart_cardiovascular: { en: "Heart & Activity", ar: "صحة القلب والنشاط" },
  respiratory: { en: "Respiratory & Clean Air", ar: "الجهاز التنفسي والهواء النقي" },
  digestive: { en: "Digestive & Hydration", ar: "الجهاز الهضمي والترطيب" },
  oral: { en: "Oral & Dental Care", ar: "صحة الفم والأسنان" },
  skin: { en: "Skin & Sun Protection", ar: "صحة الجلد والحماية من الشمس" },
  nutrition: { en: "Nutrition & Balanced Energy", ar: "التغذية المتوازنة" },
  sleep: { en: "Sleep Hygiene", ar: "عادات النوم الصحية" },
  wellness: { en: "Ergonomics & Posture", ar: "الوضعية الجسدية المريحة" },
  mental_wellbeing: { en: "Mental Wellbeing & Stress", ar: "الصحة النفسية والتعامل مع الضغوط" },
  hygiene_prevention: { en: "Infection Prevention & Hygiene", ar: "النظافة والوقاية من العدوى" },
  healthy_habits: { en: "Lifelong Active Habits", ar: "العادات الصحية اليومية" },
  age_appropriate: { en: "Adolescent Physical Growth", ar: "النمو البدني لليافعين" },
  preventative_screenings: { en: "Routine Preventative Care", ar: "الفحوصات الدورية الوقائية" },
};

const CORE_PILLAR_FILTERS = [
  {
    id: "pillar_nutrition",
    labelEn: "Nutrition & Hydration",
    labelAr: "التغذية والترطيب",
    domains: ["nutrition", "digestive"] as HealthDomainKind[],
    defaultTopicId: "hlt_nutrition",
  },
  {
    id: "pillar_sleep",
    labelEn: "Sleep & Recovery",
    labelAr: "النوم والاستشفاء",
    domains: ["sleep", "brain_nervous"] as HealthDomainKind[],
    defaultTopicId: "hlt_sleep",
  },
  {
    id: "pillar_activity",
    labelEn: "Physical Activity & Posture",
    labelAr: "النشاط البدني والوضعية",
    domains: ["heart_cardiovascular", "healthy_habits", "wellness"] as HealthDomainKind[],
    defaultTopicId: "hlt_heart_cardiovascular",
  },
] as const;

export function HealthAwarenessPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<HealthDomainKind | "all">("all");
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string>(INITIAL_HEALTH_TOPICS[0]?.id || "");
  const [activeTab, setActiveTopicTab] = useState<
    "overview" | "emergency" | "glossary" | "assistant"
  >("overview");

  // Health Educational Assistant State (Strict No-Diagnosis)
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<
    Array<{ sender: "user" | "assistant"; text: string; disclaimer?: boolean }>
  >([
    {
      sender: "assistant",
      text: isAr
        ? "مرحبًا بك في مساعد التثقيف الصحي في نكسورا. أقدم معلومات علمية عامة وعادات وقائية مبنية على إرشادات منظمة الصحة العالمية والجهات الصحية المعتمدة. تذكر دائماً: أنا لست طبيباً، ولا أقدم تشخيصاً أو علاجاً. في حالات الطوارئ اتصل فوراً برقم 112."
        : "Welcome to the NEXORA Health Education Assistant. I provide evidence-based general wellness information, prevention tips, and study ergonomics based on WHO, CDC, and NHS guidelines. Crucial notice: I am not a doctor, and I do not diagnose or prescribe treatment. For medical emergencies, call 112, 999, or 911 immediately.",
      disclaimer: true,
    },
  ]);
  const [isAnswering, setIsAnswering] = useState(false);

  // Filter topics by core pillar, individual domain, and search query
  const filteredTopics = useMemo(() => {
    const activePillarCfg = CORE_PILLAR_FILTERS.find((p) => p.id === selectedPillar);
    return INITIAL_HEALTH_TOPICS.filter((topic) => {
      const matchPillar = !activePillarCfg || activePillarCfg.domains.includes(topic.domain);
      const matchDomain = selectedDomain === "all" || topic.domain === selectedDomain;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.titleAr.includes(q) ||
        topic.beginnerExplanation.toLowerCase().includes(q) ||
        topic.detailedExplanation.toLowerCase().includes(q);
      return matchPillar && matchDomain && matchSearch;
    });
  }, [searchQuery, selectedDomain, selectedPillar]);

  const activeTopic: HealthTopicRecord | undefined = useMemo(() => {
    return (
      filteredTopics.find((t) => t.id === activeTopicId) ||
      filteredTopics[0] ||
      INITIAL_HEALTH_TOPICS.find((t) => t.id === activeTopicId)
    );
  }, [activeTopicId, filteredTopics]);

  const handleSendAssistant = () => {
    if (!assistantPrompt.trim() || isAnswering) return;
    const userQ = assistantPrompt.trim();
    setAssistantPrompt("");
    setAssistantMessages((prev) => [...prev, { sender: "user", text: userQ }]);
    setIsAnswering(true);

    // Controlled educational response with safety red-flag detection
    setTimeout(() => {
      const lower = userQ.toLowerCase();
      let answer = "";
      const isEmergencyQuery =
        lower.includes("chest pain") ||
        lower.includes("difficulty breathing") ||
        lower.includes("fainting") ||
        lower.includes("unconscious") ||
        lower.includes("severe bleed") ||
        lower.includes("ألم في الصدر") ||
        lower.includes("صعوبة تنفس") ||
        lower.includes("إغماء") ||
        lower.includes("نزيف شديد");

      if (isEmergencyQuery) {
        answer = isAr
          ? "⚠️ تنبيه طوارئ فوري: ما وصفته قد يشير إلى حالة طبية طارئة تتطلب تدخلاً عاجلاً. يرجى التوقف فوراً والاتصال برقم الطوارئ (112 في الكويت والخليج، أو 999 أو 911) أو التوجه لأقرب قسم حوادث/طوارئ. لا تنتظر ولا تعتمد على الإنترنت في الطوارئ."
          : "⚠️ IMMEDIATE EMERGENCY ALERT: The symptoms you described may indicate an acute medical emergency requiring immediate professional care. Stop now and call emergency dispatch (112 in Kuwait/Gulf, 999, or 911) or proceed immediately to the nearest hospital emergency room. Do not rely on web apps during emergencies.";
      } else if (lower.includes("headache") || lower.includes("صداع")) {
        answer = isAr
          ? "معلومات تثقيفية عامة: الصداع الشائع بين الطلبة يرتبط غالبًا بالإجهاد البصري، الجفاف، أو قلة النوم. عادات مساعدة: قاعدة 20-20-20 للشاشات، شرب كميات كافية من الماء، وتعديل إضاءة الغرفة. متى تستشير الطبيب: إذا كان الصداع مفاجئاً وشديداً جداً، أو مصحوباً بتشوش رؤية أو حمى وتصلب رقبة."
          : "Educational wellness context: Frequent student headaches are commonly linked to digital eye strain, dehydration, or irregular sleep cycles. Preventive habits: apply the 20-20-20 rule during screen study, ensure consistent hydration (2-2.5L/day), and optimize workspace ambient lighting. Consult a physician if headaches are severe, sudden, worsening, or accompanied by visual aura or fever.";
      } else if (lower.includes("sleep") || lower.includes("نوم")) {
        answer = isAr
          ? "وفقاً للأكاديمية الأمريكية لطب النوم ومنظمة الصحة العالمية: يحتاج اليافعون والطلبة من 8 إلى 10 ساعات نوم ليلي منتظم. ينصح بإيقاف الشاشات الزرقاء قبل 60 دقيقة من النوم، والحفاظ على درجة حرارة معتدلة في الغرفة، وتجنب مشروبات الطاقة والكافيين في المساء لتسهيل دخول مرحلة النوم العميق الضرورية لتثبيت الذاكرة."
          : "According to the American Academy of Sleep Medicine and WHO guidance: Adolescents and students require 8-10 hours of quality night sleep. Best practices include dimming screens 60 minutes before bed, keeping the bedroom cool and dark, and avoiding late-afternoon caffeine/energy drinks to preserve slow-wave deep sleep crucial for memory consolidation.";
      } else {
        answer = isAr
          ? `معلومات علمية عامة للإرشاد: في المواضيع المتعلقة بـ (${userQ}): توصي المبادئ التوجيهية بالتركيز على التغذية المتوازنة الغنية بالألياف، الحركة البدنية المعتدلة 60 دقيقة يومياً، والحفاظ على الفحوصات الدورية الوقائية مع طبيب العائلة. هذه إرشادات تثقيفية عامة وليست وصفة طبية.`
          : `General health education overview regarding "${userQ}": Clinical prevention guidelines emphasize foundational habits: balanced whole-food nutrition, 60 minutes of moderate physical movement daily, ergonomic study setups, and scheduled wellness checkups with your family physician. This is educational guidance only.`;
      }

      setAssistantMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: answer,
          disclaimer: true,
        },
      ]);
      setIsAnswering(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Strict Medical Disclaimer Banner */}
      <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200">
              {isAr
                ? "إشعار المسؤولية الصحية والأخلاقية الصارم"
                : "Strict Ethical & Clinical Health Disclaimer"}
            </h4>
            <p className="text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              {isAr
                ? "هذا القسم يقدم معلومات تثقيفية ووقائية عامة مستندة إلى مصادر موثوقة (WHO, CDC, NHS). المحتوى لا يمثل استشارة طبية أو تشخيصاً أو خطة علاج، ولا يغني إطلاقاً عن زيارة الطبيب المختص. لا تبدأ أو توقف أي دواء بناءً على ما تقرؤه هنا."
                : "This section provides verified, general preventative health education sourced from international authorities (WHO, CDC, NHS). It DOES NOT constitute medical advice, diagnosis, or clinical treatment plans. Never ignore professional medical advice or delay seeking it because of information read here."}
            </p>
            <div className="mt-2 flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
              <PhoneCall className="h-4 w-4" />
              <span>
                {isAr
                  ? "في حالات الطوارئ الطارئة (فقدان وعي، صعوبة تنفس، ألم صدر، نزيف حاد): اتصل فوراً برقم 112 (الكويت والخليج) أو 999 أو 911."
                  : "For immediate life-threatening emergencies: Call 112 (Kuwait/Gulf), 999 (UK/Gulf), or 911 (US/Americas) without delay."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "أكاديمية الوعي الصحي والوقائي للطلبة"
                : "Student Health & Wellness Awareness"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "15 مجالاً صحياً معتمداً لتعزيز نمط الحياة السليم والوقاية المبكرة مع معايير الاستشارة الطبية"
              : "15 verified clinical & wellness domains covering prevention, study ergonomics, and doctor escalation thresholds."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAr ? "بحث في المواضيع الصحية..." : "Search health topics..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[44px] ps-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Core Wellness Pillars (Nutrition, Sleep, Physical Activity) */}
      <div data-testid="health-core-pillars" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {CORE_PILLAR_FILTERS.map((pillar) => {
          const isActive = selectedPillar === pillar.id;
          return (
            <button
              key={pillar.id}
              type="button"
              data-testid={`health-pillar-${pillar.id}`}
              onClick={() => {
                if (isActive) {
                  setSelectedPillar(null);
                } else {
                  setSelectedPillar(pillar.id);
                  setSelectedDomain("all");
                  setActiveTopicId(pillar.defaultTopicId);
                }
              }}
              className={`min-h-[44px] flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-start text-xs font-semibold transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted/50 text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 shrink-0 text-primary" />
                <span>{isAr ? pillar.labelAr : pillar.labelEn}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                {INITIAL_HEALTH_TOPICS.filter((t) => pillar.domains.includes(t.domain)).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Domain Quick Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <Button
          type="button"
          variant={selectedDomain === "all" && !selectedPillar ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSelectedPillar(null);
            setSelectedDomain("all");
          }}
          className="min-h-[40px] whitespace-nowrap text-xs"
        >
          {isAr ? "جميع المجالات (15)" : "All Domains (15)"}
        </Button>
        {Object.entries(DOMAIN_LABELS).map(([domainKey, label]) => {
          const isSelected = selectedDomain === domainKey;
          return (
            <Button
              key={domainKey}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedPillar(null);
                setSelectedDomain(domainKey as HealthDomainKind);
              }}
              className="min-h-[40px] whitespace-nowrap text-xs"
            >
              {isAr ? label.ar : label.en}
            </Button>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Topics List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isAr ? "المواضيع المتاحة" : "Available Topics"} ({filteredTopics.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pe-1">
            {filteredTopics.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setActiveTopicId(topic.id);
                  }}
                  className={`w-full min-h-[44px] text-start p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-foreground line-clamp-1">
                      {isAr ? topic.titleAr : topic.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {DOMAIN_LABELS[topic.domain]?.[isAr ? "ar" : "en"] || topic.domain}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {topic.beginnerExplanation}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-emerald-500" />
                      {topic.clinicalReviewer}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Details */}
        <div className="lg:col-span-8">
          {activeTopic ? (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {isAr ? activeTopic.titleAr : activeTopic.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {isAr ? activeTopic.title : activeTopic.titleAr} •{" "}
                      {DOMAIN_LABELS[activeTopic.domain]?.[isAr ? "ar" : "en"]}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {isAr ? "مراجعة سريرية:" : "Clinical Review:"}{" "}
                    {activeTopic.lastClinicalReviewDate}
                  </Badge>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTopicTab(v as typeof activeTab)}
                  className="mt-4"
                >
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto gap-1 w-full">
                    <TabsTrigger
                      value="overview"
                      onPointerDown={() => setActiveTopicTab("overview")}
                      onClick={() => setActiveTopicTab("overview")}
                      className="min-h-[40px] text-xs"
                    >
                      {isAr ? "الشرح والعادات" : "Overview & Habits"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="emergency"
                      onPointerDown={() => setActiveTopicTab("emergency")}
                      onClick={() => setActiveTopicTab("emergency")}
                      className="min-h-[40px] text-xs"
                    >
                      {isAr ? "استشارة الطبيب والطوارئ" : "Doctor vs Emergency"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="glossary"
                      onPointerDown={() => setActiveTopicTab("glossary")}
                      onClick={() => setActiveTopicTab("glossary")}
                      className="min-h-[40px] text-xs"
                    >
                      {isAr ? "المصطلحات والمراجع" : "Glossary & Sources"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="assistant"
                      onPointerDown={() => setActiveTopicTab("assistant")}
                      onClick={() => setActiveTopicTab("assistant")}
                      className="min-h-[40px] text-xs"
                    >
                      {isAr ? "المساعد التثقيفي" : "Edu Assistant"}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="pt-4 space-y-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Beginner Explanation */}
                    <div className="rounded-lg bg-muted/40 p-3.5 border text-sm leading-relaxed">
                      <div className="flex items-center gap-2 font-semibold text-foreground mb-1 text-xs uppercase tracking-wide">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {isAr ? "خلاصة مبسطة للطلبة" : "Student Core Summary"}
                      </div>
                      <p>{activeTopic.beginnerExplanation}</p>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        {isAr ? "الشرح العلمي المفصل" : "Detailed Scientific Context"}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activeTopic.detailedExplanation}
                      </p>
                    </div>

                    {/* Lifestyle Checklist */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {isAr
                          ? "قائمة العادات اليومية الموصى بها"
                          : "Recommended Daily Lifestyle Checklist"}
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {activeTopic.lifestyleChecklist.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40"
                          >
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                              ✓
                            </span>
                            <span className="text-foreground leading-normal">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Misconceptions */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                        {isAr
                          ? "مفاهيم شائعة خاطئة يجب الحذر منها"
                          : "Common Misconceptions to Avoid"}
                      </h4>
                      <div className="space-y-1.5">
                        {activeTopic.commonMisconceptions.map((mis, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200"
                          >
                            • {mis}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "emergency" && (
                  <div className="space-y-6">
                    {/* When to Consult a Doctor */}
                    <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
                      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold text-sm">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                        {isAr
                          ? "متى يجب عليك استشارة الطبيب؟ (رعاية اعتيادية)"
                          : "When Should You Consult a Doctor? (Non-Emergency)"}
                      </div>
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        {isAr
                          ? "إذا ظهرت عليك إحدى هذه العلامات، احجز موعداً مع طبيب الرعاية الأولية أو المركز الصحي ولا تؤجل الفحص:"
                          : "Schedule an appointment with your primary healthcare provider if you notice any of these persistent signs:"}
                      </p>
                      <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-100">
                        {activeTopic.whenToConsultDoctor.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Immediate Emergency Red Flags */}
                    <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 text-red-900 dark:text-red-200 font-bold text-sm">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        {isAr
                          ? "علامات الطوارئ القصوى (اتصل بالإسعاف فوراً)"
                          : "Critical Emergency Warning Signs (Call Dispatch Immediately)"}
                      </div>
                      <div className="text-xs font-semibold text-red-800 dark:text-red-300">
                        {isAr
                          ? "🚨 اتصل فوراً برقم 112 (الكويت ودول الخليج) أو 999 أو 911 ولا تنتظر:"
                          : "🚨 Call 112 (Kuwait & GCC), 999, or 911 immediately upon noticing any of the following:"}
                      </div>
                      <ul className="space-y-2 text-xs font-medium text-red-950 dark:text-red-100">
                        {activeTopic.emergencyWarningSigns.map((sign, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 bg-red-100/70 dark:bg-red-900/40 p-2 rounded-md"
                          >
                            <PhoneCall className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground flex items-center justify-between">
                      <span>
                        {isAr ? "المراجع السريري المعتمد:" : "Verified Clinical Reviewer:"}{" "}
                        {activeTopic.clinicalReviewer}
                      </span>
                      <span>
                        {isAr ? "تاريخ التحديث:" : "Updated:"} {activeTopic.lastClinicalReviewDate}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "glossary" && (
                  <div className="space-y-6">
                    {/* Glossary */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {isAr
                          ? "قاموس المصطلحات الطبية المبسط"
                          : "Simplified Medical Terms Glossary"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeTopic.glossary.map((term, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors space-y-1.5"
                          >
                            <div className="flex items-baseline justify-between">
                              <span className="font-semibold text-xs text-primary">
                                {isAr ? term.termAr : term.term}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {isAr ? term.term : term.termAr}
                              </span>
                            </div>
                            <p className="text-xs text-foreground font-medium">
                              {term.simpleExplanation}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-normal">
                              {term.definition}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trusted References */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        {isAr
                          ? "المراجع والمنظمات الصحية الدولية"
                          : "Traceable Sources & International Guidelines"}
                      </h4>
                      <div className="space-y-2">
                        {activeTopic.trustedReferences.map((ref, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-md border bg-muted/20 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{ref.name}</span>
                            </div>
                            <span className="text-muted-foreground text-[11px]">
                              {isAr ? "تاريخ الاعتماد:" : "Verified:"} {ref.updateDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQs */}
                    {activeTopic.faqs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-primary" />
                          {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
                        </h4>
                        <div className="space-y-2.5">
                          {activeTopic.faqs.map((faq, idx) => (
                            <div key={idx} className="p-3 rounded-lg border bg-muted/10 space-y-1">
                              <div className="text-xs font-semibold text-foreground">
                                Q: {isAr ? faq.questionAr : faq.question}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "assistant" && (
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">
                        {isAr
                          ? "مساعد التثقيف الصحي الصارم (لا تشخيص - لا وصف أدوية):"
                          : "Safe Health Education Assistant (Zero Diagnosis - No Prescriptions):"}
                      </p>
                      <p>
                        {isAr
                          ? "اسأل عن العادات الوقائية، أساليب المذاكرة الصحية، شرب الماء، بيئة الشاشات، وإرشادات منظمة الصحة العالمية."
                          : "Ask general questions about study ergonomics, prevention, sleep hygiene, hydration, and verified WHO wellness guidance."}
                      </p>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-3 max-h-[360px] overflow-y-auto p-2 border rounded-lg bg-card">
                      {assistantMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground border"
                            }`}
                          >
                            <p>{msg.text}</p>
                            {msg.disclaimer && (
                              <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3 shrink-0" />
                                <span>
                                  {isAr
                                    ? "لأغراض التثقيف فقط، راجع طبيبك دائماً."
                                    : "Educational guidance only; always consult a doctor."}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isAnswering && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-2.5 rounded-lg border flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            <span>
                              {isAr
                                ? "جارٍ استرجاع التوجيهات الصحية..."
                                : "Retrieving verified health guidelines..."}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input box */}
                    <div className="flex gap-2">
                      <Input
                        placeholder={
                          isAr
                            ? "مثال: كيف أحمي عيني أثناء المذاكرة الطويلة؟"
                            : "E.g. How to prevent eye strain during long study sessions?"
                        }
                        value={assistantPrompt}
                        onChange={(e) => setAssistantPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendAssistant()}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={handleSendAssistant}
                        disabled={!assistantPrompt.trim() || isAnswering}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-64 flex items-center justify-center border rounded-lg text-muted-foreground text-sm">
              {isAr
                ? "اختر موضوعاً للاطلاع على الإرشادات"
                : "Select a topic to view clinical guidance"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
