import { useState, useMemo } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Search,
  PlusCircle,
  Tag,
  Calendar,
  Quote,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INITIAL_HUMAN_WISDOM_RECORDS,
  type HumanWisdomRecord,
  type WisdomCategoryKind,
} from "@/data/humanity-first";
import { usePrefs } from "@/lib/preferences";

const CATEGORY_META: Record<
  WisdomCategoryKind,
  { labelEn: string; labelAr: string; color: string }
> = {
  educational_journey: {
    labelEn: "Educational Journey",
    labelAr: "المسيرة التعليمية والأكاديمية",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
  },
  professional_insight: {
    labelEn: "Professional & Ethical Insight",
    labelAr: "الخبرة المهنية وأخلاقيات العمل",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
  },
  scientific_discovery: {
    labelEn: "Scientific Discovery & Inquiry",
    labelAr: "البحث العلمي والاستكشاف",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
  },
  practical_life_skill: {
    labelEn: "Practical Life Skills",
    labelAr: "المهارات الحياتية والتطبيقية",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
  },
  lessons_from_mistakes: {
    labelEn: "Lessons from Failure & Mistakes",
    labelAr: "دروس العثرات وتجاوز الأخطاء",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
  },
  cultural_heritage: {
    labelEn: "Cultural Heritage & Traditions",
    labelAr: "التراث الحضاري والتقاليد الإنسانية",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
  },
};

export function HumanWisdomArchivePanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [wisdomList, setWisdomList] = useState<HumanWisdomRecord[]>(INITIAL_HUMAN_WISDOM_RECORDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WisdomCategoryKind | "all">("all");
  const [selectedWisdomId, setSelectedWisdomId] = useState<string>(
    INITIAL_HUMAN_WISDOM_RECORDS[0]?.id || "",
  );

  // Form State
  const [isContributing, setIsContributing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<WisdomCategoryKind>("educational_journey");
  const [newAttribution, setNewAttribution] = useState("");
  const [newCoreInsight, setNewCoreInsight] = useState("");
  const [newExperience, setNewExperience] = useState("");
  const [newAdvice, setNewAdvice] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const filteredWisdom = useMemo(() => {
    return wisdomList.filter((item) => {
      const matchCat = categoryFilter === "all" || item.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.titleAr.includes(q) ||
        item.coreInsight.toLowerCase().includes(q) ||
        item.contributorAttribution.toLowerCase().includes(q) ||
        item.topicTags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [wisdomList, categoryFilter, searchQuery]);

  const activeRecord = useMemo(() => {
    return wisdomList.find((w) => w.id === selectedWisdomId) || filteredWisdom[0];
  }, [wisdomList, selectedWisdomId, filteredWisdom]);

  const handleSaveContribution = () => {
    if (!newTitle.trim() || !newCoreInsight.trim() || !newExperience.trim()) {
      toast.error(
        isAr
          ? "يرجى تعبئة العنوان والخبرة وخلاصة الحكمة"
          : "Please provide title, experience, and core insight",
      );
      return;
    }
    if (!consentConfirmed) {
      toast.error(
        isAr
          ? "يرجى تأكيد موافقة صاحب التجربة على النشر"
          : "Contributor consent confirmation is required",
      );
      return;
    }

    const created: HumanWisdomRecord = {
      id: `hwr_${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      titleAr: newTitle.trim(),
      contributorAttribution:
        newAttribution.trim() || (isAr ? "مساهم موثق" : "Verified Contributor"),
      consentConfirmed: true,
      licensingPermitted: true,
      coreInsight: newCoreInsight.trim(),
      detailedExperience: newExperience.trim(),
      practicalAdviceForYouth: newAdvice
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean),
      topicTags: ["wisdom", "mentorship", "nexora"],
      submittedDate: new Date().toISOString().split("T")[0] || "2026-11-19",
      verifiedByReviewer: isAr
        ? "لجنة التوثيق الأخلاقي لنكسورا"
        : "NEXORA Ethics & Verification Board",
      preservationStatus: "permanent_archive",
    };

    setWisdomList((prev) => [created, ...prev]);
    setSelectedWisdomId(created.id);
    setIsContributing(false);
    setNewTitle("");
    setNewAttribution("");
    setNewCoreInsight("");
    setNewExperience("");
    setNewAdvice("");
    setConsentConfirmed(false);
    toast.success(
      isAr
        ? "تم توثيق التجربة في أرشيف الحكمة الإنسانية!"
        : "Wisdom record added to permanent archive!",
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "أرشيف الحكمة والتجارب الإنسانية الملهمة"
                : "Human Wisdom & Mentorship Archive"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "مستودع دائم لخبرات المربين، العلماء، والحرفيين؛ موثقة بموافقة أصحابها لنقل العبر العملية لجيل الشباب"
              : "Preserving real-world life lessons, ethical career insights, and educational journeys with verified consent."}
          </p>
        </div>

        <Button
          size="sm"
          variant={isContributing ? "secondary" : "default"}
          onClick={() => setIsContributing(!isContributing)}
          className="text-xs gap-1.5"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          {isContributing
            ? isAr
              ? "إلغاء النموذج"
              : "Close Form"
            : isAr
              ? "توثيق تجربة أو حكمة"
              : "Contribute Wisdom"}
        </Button>
      </div>

      {/* Contribution Form */}
      {isContributing && (
        <Card className="border-2 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              {isAr ? "نموذج توثيق تجربة إنسانية ملهمة" : "Contribute a Verified Wisdom Experience"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isAr
                ? "انقل خلاصة تجربة ثرية من معلمك، مرشدك، أو من تجاربك الشخصية بعد تجاوز عثرة أو تحقيق منجز."
                : "Share an authentic experience that can guide, encourage, or caution fellow learners."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "عنوان التجربة" : "Experience Title"}</Label>
                <Input
                  placeholder={
                    isAr
                      ? "مثال: عندما فشلت في سنتي الجامعية الأولى وكيف غيرت طريقة استذكاري"
                      : "E.g. Rebounding from Academic Probation via Deliberate Practice"
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "التصنيف" : "Category"}</Label>
                <select
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as WisdomCategoryKind)}
                >
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <option key={k} value={k}>
                      {isAr ? v.labelAr : v.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "صاحب التجربة ونسب الفضل" : "Contributor Attribution / Name"}
              </Label>
              <Input
                placeholder={
                  isAr
                    ? "مثال: د. إبراهيم (أستاذ كيمياء متقاعد) أو اسم مستعار متفق عليه"
                    : "E.g. Dr. Al-Mutawa (Retired Chemistry Professor) or Approved Alias"
                }
                value={newAttribution}
                onChange={(e) => setNewAttribution(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr
                  ? "خلاصة الحكمة (الدرس المستفاد في جملة أو جملتين)"
                  : "Core Insight (1-2 sentences)"}
              </Label>
              <Textarea
                rows={2}
                placeholder={
                  isAr
                    ? "ما العبرة التي تريد أن يخرج بها القارئ؟"
                    : "What is the single most important principle learned?"
                }
                value={newCoreInsight}
                onChange={(e) => setNewCoreInsight(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "سياق التجربة والقصة بالتفصيل" : "Detailed Narrative & Context"}
              </Label>
              <Textarea
                rows={4}
                placeholder={
                  isAr
                    ? "ما الذي حدث؟ ما التحديات التي واجهتك؟ وكيف تغلبت عليها؟"
                    : "Describe the circumstances, the pivotal turning point, and the outcome..."
                }
                value={newExperience}
                onChange={(e) => setNewExperience(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr
                  ? "نصائح عملية موجهة لجيل الشباب (كل نصيحة في سطر)"
                  : "Practical Takeaways for Youth (one per line)"}
              </Label>
              <Textarea
                rows={3}
                placeholder={
                  isAr
                    ? "1. لا تقارن بدايتك بمواسم حصاد غيرك.\n2. اطلب العون مبكراً ولا تكابر."
                    : "1. Don't compare your chapter 1 to someone else's chapter 20.\n2. Seek mentorship early."
                }
                value={newAdvice}
                onChange={(e) => setNewAdvice(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2 p-3 rounded-lg border bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span className="leading-relaxed text-[11px] text-foreground">
                {isAr
                  ? "أؤكد أن صاحب القصة وافق على مشاركتها وتوثيقها لأغراض النفع العام والتعليم في نكسورا، دون أي انتهاك للخصوصية."
                  : "I verify that the contributor explicitly granted consent to publish and preserve this experience for open educational benefit."}
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsContributing(false)}
                className="text-xs"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button size="sm" onClick={handleSaveContribution} className="text-xs">
                {isAr ? "حفظ وتوثيق في الأرشيف" : "Preserve to Archive"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              isAr ? "بحث في قصص الحكمة والدروس..." : "Search wisdom archive and tags..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[44px] ps-9 text-xs"
          />
        </div>

        <select
          aria-label={isAr ? "تصفية مجال الحكمة" : "Filter wisdom domain"}
          className="min-h-[44px] text-xs rounded-md border border-input bg-background px-3 py-2"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as WisdomCategoryKind | "all")}
        >
          <option value="all">{isAr ? "جميع مجالات الحكمة (6)" : "All Wisdom Domains (6)"}</option>
          {Object.entries(CATEGORY_META).map(([k, v]) => (
            <option key={k} value={k}>
              {isAr ? v.labelAr : v.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* Main Layout: List & Reading View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {isAr ? "التجارب الموثقة" : "Preserved Records"} ({filteredWisdom.length})
          </h4>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pe-1">
            {filteredWisdom.map((item) => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.educational_journey;
              const isSelected = activeRecord?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedWisdomId(item.id)}
                  className={`w-full min-h-[44px] text-start p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground line-clamp-1">
                      {isAr ? item.titleAr : item.title}
                    </span>
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {isAr ? meta.labelAr : meta.labelEn}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    "{item.coreInsight}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.contributorAttribution}
                    </span>
                    <span>•</span>
                    <span>{item.submittedDate}</span>
                    {item.consentConfirmed && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {isAr ? "موافقة موثقة" : "Consent Verified"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Record Reading View */}
        <div className="lg:col-span-7">
          {activeRecord ? (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {isAr ? activeRecord.titleAr : activeRecord.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {isAr ? "الراوي:" : "Attribution:"} {activeRecord.contributorAttribution} •{" "}
                      {activeRecord.submittedDate}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      {activeRecord.consentConfirmed
                        ? isAr
                          ? "موافقة ونسب موثق"
                          : "Verified Consent & Attribution"
                        : isAr
                          ? "قيد المراجعة"
                          : "Pending Consent"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {activeRecord.licensingPermitted
                        ? isAr
                          ? "مرخص للنفع التعليمي"
                          : "Educational License Cleared"
                        : ""}{" "}
                      · {activeRecord.preservationStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-5 text-xs leading-relaxed">
                {/* Core Insight Callout */}
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                    <Quote className="h-4 w-4 text-amber-600" />
                    <span>{isAr ? "خلاصة الحكمة والدرس المستفاد:" : "Core Life Insight:"}</span>
                  </div>
                  <p className="text-sm font-medium italic">"{activeRecord.coreInsight}"</p>
                </div>

                {/* Detailed Experience */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    {isAr ? "التجربة والسياق الواقعي" : "The Context & Experience Narrative"}
                  </h4>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-xs p-3 rounded-lg bg-muted/30 border">
                    {activeRecord.detailedExperience}
                  </p>
                </div>

                {/* Practical Advice for Youth */}
                {activeRecord.practicalAdviceForYouth.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                      {isAr ? "نصائح عملية لجيل الشباب" : "Actionable Takeaways for Youth"}
                    </h4>
                    <ul className="space-y-1.5">
                      {activeRecord.practicalAdviceForYouth.map((adv, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-md border bg-card flex items-start gap-2"
                        >
                          <span className="text-amber-500 font-bold shrink-0">{idx + 1}.</span>
                          <span className="text-foreground leading-relaxed">{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags and Reviewer footer */}
                <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="h-3 w-3" />
                    {activeRecord.topicTags.map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span>
                    {isAr ? "المراجع الأخلاقي:" : "Reviewer:"} {activeRecord.verifiedByReviewer}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
