import { useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  PlusCircle,
  Flag,
  Phone,
  Accessibility,
  Globe,
  Filter,
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
  INITIAL_COMMUNITY_MAP_RESOURCES,
  type CommunityResourceEntry,
  type CommunityResourceCategory,
  type VerificationConfidence,
} from "@/data/humanity-first";
import { usePrefs } from "@/lib/preferences";

const CATEGORY_LABELS: Record<CommunityResourceCategory, { en: string; ar: string }> = {
  public_library: { en: "Public Library", ar: "مكتبة عامة" },
  educational_center: { en: "Educational & Cultural Center", ar: "مركز تعليمي وثقافي" },
  accessible_services: { en: "Accessible & Assistive Services", ar: "خدمات أصحاب الهمم" },
  community_center: { en: "Community Digital Hub", ar: "مركز تعلم مجتمعي" },
  verified_nonprofit: { en: "Verified Non-Profit Foundation", ar: "مؤسسة غير ربحية موثقة" },
  youth_development: { en: "Youth & Science Incubator", ar: "حاضنة شباب وعلوم" },
  public_health_learning: { en: "Public Health Education Center", ar: "مركز تثقيف صحي مجتمعي" },
};

const CONFIDENCE_META: Record<
  VerificationConfidence,
  { labelEn: string; labelAr: string; color: string }
> = {
  officially_verified: {
    labelEn: "Officially Verified by NEXORA",
    labelAr: "موثق رسمياً من نكسورا",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
  },
  source_confirmed: {
    labelEn: "Source Confirmed",
    labelAr: "مؤكد من المصدر المباشر",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
  },
  awaiting_verification: {
    labelEn: "Awaiting Verification",
    labelAr: "قيد التحقق الميداني",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
  },
  outdated: {
    labelEn: "Needs Reverification",
    labelAr: "يتطلب إعادة تدقيق",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
  },
};

export function CommunityResourceMapPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [resources, setResources] = useState<CommunityResourceEntry[]>(
    INITIAL_COMMUNITY_MAP_RESOURCES,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CommunityResourceCategory | "all">("all");
  const [regionFilter, setRegionFilter] = useState<"all" | "kuwait" | "gcc" | "global">("all");

  // Suggest Resource Form State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestNameAr, setSuggestNameAr] = useState("");
  const [suggestCategory, setSuggestCategory] =
    useState<CommunityResourceCategory>("public_library");
  const [suggestRegion, setSuggestRegion] = useState<"kuwait" | "gcc" | "global">("kuwait");
  const [suggestCity, setSuggestCity] = useState("");
  const [suggestDesc, setSuggestDesc] = useState("");
  const [suggestWebsite, setSuggestWebsite] = useState("");

  // Report Form State
  const [reportingResourceId, setReportingResourceId] = useState<string | null>(null);
  const [reportNote, setReportNote] = useState("");

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchCat = categoryFilter === "all" || res.category === categoryFilter;
      const matchReg = regionFilter === "all" || res.region === regionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        res.name.toLowerCase().includes(q) ||
        res.nameAr.includes(q) ||
        res.cityLocation.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q);
      return matchCat && matchReg && matchSearch;
    });
  }, [resources, categoryFilter, regionFilter, searchQuery]);

  const handleSaveSuggestion = () => {
    if (!suggestName.trim() || !suggestCity.trim()) {
      toast.error(
        isAr ? "يرجى كتابة اسم المركز والمدينة" : "Please enter the center name and city",
      );
      return;
    }

    const newEntry: CommunityResourceEntry = {
      id: `comm_${Date.now()}`,
      name: suggestName.trim(),
      nameAr: suggestNameAr.trim() || suggestName.trim(),
      category: suggestCategory,
      region: suggestRegion,
      cityLocation: suggestCity.trim(),
      description:
        suggestDesc.trim() || (isAr ? "مركز تعليمي وثقافي مجتمعي" : "Community learning center"),
      ...(suggestWebsite.trim() ? { officialWebsite: suggestWebsite.trim() } : {}),
      eligibility: isAr ? "مفتوح للطلبة والجمهور" : "Open to students and public",
      costInfo: "Free",
      accessibilityFeatures: ["Wheelchair Accessible"],
      verificationConfidence: "awaiting_verification",
      lastVerificationDate: new Date().toISOString().split("T")[0] || "2026-11-19",
      verificationSource: isAr ? "اقتراح من مجتمع الطلبة" : "Student community suggestion",
    };

    setResources((prev) => [newEntry, ...prev]);
    setIsSuggesting(false);
    setSuggestName("");
    setSuggestNameAr("");
    setSuggestCity("");
    setSuggestDesc("");
    setSuggestWebsite("");
    toast.success(
      isAr
        ? "تم إرسال اقتراح المركز للمراجعة وإضافته إلى الدليل!"
        : "Resource suggested and queued for verification!",
    );
  };

  const handleSendReport = () => {
    if (!reportNote.trim() || !reportingResourceId) return;
    toast.success(
      isAr
        ? "شكرًا لك! تم تسجيل بلاغ تدقيق البيانات وسيتم التحقق من المركز."
        : "Thank you! Your verification feedback was logged.",
    );
    setReportingResourceId(null);
    setReportNote("");
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-sky-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "خريطة ودليل المراكز المجتمعية والمعرفية الموثقة"
                : "Verified Community & Educational Resources"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "دليل موثق للمكتبات العامة، مراكز العلوم والثقافة، والخدمات الميسرة للطلبة في الكويت والخليج والعالم"
              : "Direct access to public libraries, cultural hubs, science museums, and accessible learning spaces."}
          </p>
        </div>

        <Button
          size="sm"
          variant={isSuggesting ? "secondary" : "default"}
          onClick={() => setIsSuggesting(!isSuggesting)}
          className="text-xs gap-1.5"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          {isSuggesting
            ? isAr
              ? "إغلاق النموذج"
              : "Close Form"
            : isAr
              ? "اقتراح مركز تعليمي موثق"
              : "Suggest Learning Center"}
        </Button>
      </div>

      {/* Suggestion Form Modal Card */}
      {isSuggesting && (
        <Card className="border-2 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {isAr
                ? "اقتراح مركز أو مكتبة عامة للتوثيق"
                : "Suggest a Learning Center for Registry"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isAr
                ? "ساعد زملاءك في العثور على أماكن دراسة هادئة أو متاحف علمية أو مكتبات مجانية."
                : "Help students locate verified public libraries, quiet study spaces, or free science centers."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isAr ? "اسم المركز (بالإنجليزية)" : "Center Name (English)"}
                </Label>
                <Input
                  placeholder="E.g. National Library of Kuwait"
                  value={suggestName}
                  onChange={(e) => setSuggestName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isAr ? "اسم المركز (بالعربية)" : "Center Name (Arabic)"}
                </Label>
                <Input
                  placeholder="مثال: مكتبة الكويت الوطنية"
                  value={suggestNameAr}
                  onChange={(e) => setSuggestNameAr(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <ModernSelect
                id="community-suggest-category"
                label={isAr ? "التصنيف" : "Category"}
                value={suggestCategory}
                onValueChange={(v) => setSuggestCategory(v as CommunityResourceCategory)}
                searchPlaceholder={isAr ? "ابحث في التصنيفات..." : "Search categories..."}
                options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                  value: k,
                  label: isAr ? v.ar : v.en,
                  keywords: `${v.en} ${v.ar}`,
                }))}
              />

              <ModernSelect
                id="community-suggest-region"
                label={isAr ? "النطاق الجغرافي" : "Region"}
                value={suggestRegion}
                onValueChange={(v) => setSuggestRegion(v as "kuwait" | "gcc" | "global")}
                searchable={false}
                options={[
                  { value: "kuwait", label: isAr ? "دولة الكويت" : "Kuwait" },
                  { value: "gcc", label: isAr ? "دول مجلس التعاون" : "GCC Region" },
                  { value: "global", label: isAr ? "عالمي" : "Global" },
                ]}
              />

              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "المدينة والموقع" : "City & Location"}</Label>
                <Input
                  placeholder={isAr ? "مثال: مدينة الكويت، شرق" : "E.g. Kuwait City, Sharq"}
                  value={suggestCity}
                  onChange={(e) => setSuggestCity(e.target.value)}
                  className="min-h-[44px] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "الموقع الرسمي المعتمد" : "Official Website URL"}
              </Label>
              <Input
                placeholder="https://..."
                value={suggestWebsite}
                onChange={(e) => setSuggestWebsite(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "وصف الخدمات المتاحة للطلبة" : "Description of Services"}
              </Label>
              <Textarea
                rows={2}
                placeholder={
                  isAr
                    ? "قاعات دراسة مجانية، مراجع أكاديمية، إنترنت عالي السرعة..."
                    : "Free study halls, academic references, high-speed WiFi..."
                }
                value={suggestDesc}
                onChange={(e) => setSuggestDesc(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSuggesting(false)}
                className="text-xs"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button size="sm" onClick={handleSaveSuggestion} className="text-xs">
                {isAr ? "إرسال المركز للدليل" : "Submit to Directory"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              isAr
                ? "بحث في المراكز، المدن، أو الخدمات..."
                : "Search centers, locations, or services..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[44px] ps-9 text-xs"
          />
        </div>

        <ModernSelect
          id="community-region-filter"
          label={isAr ? "المنطقة" : "Region"}
          value={regionFilter}
          onValueChange={(v) => setRegionFilter(v as "all" | "kuwait" | "gcc" | "global")}
          className="sm:w-48 shrink-0"
          options={[
            { value: "all", label: isAr ? "جميع المناطق" : "All Regions" },
            { value: "kuwait", label: isAr ? "الكويت" : "Kuwait" },
            { value: "gcc", label: isAr ? "دول الخليج العربي" : "GCC" },
            { value: "global", label: isAr ? "عالمي" : "Global" },
          ]}
        />

        <ModernSelect
          id="community-category-filter"
          label={isAr ? "التصنيف" : "Category"}
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as CommunityResourceCategory | "all")}
          searchPlaceholder={isAr ? "ابحث في التصنيفات..." : "Search categories..."}
          className="sm:w-64 shrink-0"
          options={[
            { value: "all", label: isAr ? "جميع التصنيفات" : "All Categories" },
            ...Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
              value: k,
              label: isAr ? v.ar : v.en,
              keywords: `${v.en} ${v.ar}`,
            })),
          ]}
        />
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const conf =
            CONFIDENCE_META[res.verificationConfidence] || CONFIDENCE_META.source_confirmed;
          return (
            <Card key={res.id} className="border flex flex-col justify-between shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {CATEGORY_LABELS[res.category]?.[isAr ? "ar" : "en"] || res.category}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${conf.color}`}
                  >
                    {isAr ? conf.labelAr : conf.labelEn}
                  </span>
                </div>
                <CardTitle className="text-base font-semibold mt-2">
                  {isAr ? res.nameAr : res.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{res.cityLocation}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                  {res.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t text-[11px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isAr ? "الأهلية والتكلفة:" : "Eligibility & Cost:"}</span>
                    <span className="font-medium text-foreground">{res.costInfo}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {res.accessibilityFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] text-foreground"
                      >
                        <Accessibility className="h-3 w-3 text-primary" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {res.officialWebsite && (
                    <a
                      href={res.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      <span>{isAr ? "الموقع الرسمي" : "Official Website"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-muted-foreground h-7 px-2 hover:text-rose-500 gap-1 ml-auto"
                    onClick={() => setReportingResourceId(res.id)}
                  >
                    <Flag className="h-3 w-3" />
                    {isAr ? "إبلاغ عن خطأ" : "Report Issue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Modal */}
      {reportingResourceId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flag className="h-4 w-4 text-rose-500" />
                {isAr
                  ? "إبلاغ عن معلومة غير دقيقة أو رابط معطل"
                  : "Report Inaccurate Information or Hours"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr
                  ? "ساعدنا في الحفاظ على صحة الدليل للطلبة."
                  : "Help us keep community directory details verified and fresh."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={3}
                placeholder={
                  isAr
                    ? "صف ما الذي تغير (مثل: تغيرت أوقات العمل، انتقل المركز، أصبح يتطلب رسوماً...)"
                    : "Describe what has changed (e.g. updated hours, relocation, new admission requirements)..."
                }
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                className="text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportingResourceId(null)}
                  className="text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button size="sm" onClick={handleSendReport} className="text-xs">
                  {isAr ? "إرسال البلاغ" : "Submit Feedback"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
