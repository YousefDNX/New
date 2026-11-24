import { useState, useMemo } from "react";
import {
  Library,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  ShieldCheck,
  Flag,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Activity,
  Layers,
  ArrowUpRight,
  Volume2,
  FileText,
  Eye,
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
  type UniversalBenefitResource,
  type BenefitLifecycleState,
  type SystemKind,
  type ResourceCorrectionReport,
  INITIAL_UNIVERSAL_BENEFIT_REGISTRY,
} from "@/data/humanity-first";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { usePrefs } from "@/lib/preferences";

const LIFECYCLE_STAGES: Array<{ key: BenefitLifecycleState; labelEn: string; labelAr: string }> = [
  { key: "draft", labelEn: "Draft", labelAr: "مسودة أولية" },
  { key: "submitted", labelEn: "Submitted", labelAr: "مقدمة للمراجعة" },
  { key: "under_review", labelEn: "Under Review", labelAr: "قيد فحص الأقران" },
  { key: "approved", labelEn: "Approved", labelAr: "معتمدة علمياً" },
  { key: "published", labelEn: "Published", labelAr: "منشورة للنفع العام" },
  { key: "active_maintenance", labelEn: "Active Maintenance", labelAr: "صيانة دورية نشطة" },
  { key: "update_required", labelEn: "Update Required", labelAr: "تتطلب تدقيقاً دورياً" },
  { key: "under_revision", labelEn: "Under Revision", labelAr: "قيد التعديل والتصويب" },
  { key: "reverified", labelEn: "Reverified", labelAr: "معاد توثيقها بنجاح" },
  { key: "archived", labelEn: "Archived", labelAr: "مؤرشفة كمرجع تاريخي" },
];

export function BenefitContinuityRegistryPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: ecoState, update: updateEco } = useStudentEcosystem();

  const [activeTab, setActiveTab] = useState<"registry" | "dashboard" | "schedule" | "corrections">(
    "registry",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<SystemKind | "all">("all");

  // All resources in state (fallback to initial registry)
  const allResources: UniversalBenefitResource[] = useMemo(() => {
    const userRes = ecoState.universalBenefitResources || [];
    if (userRes.length === 0) return INITIAL_UNIVERSAL_BENEFIT_REGISTRY;
    // merge and deduplicate
    const map = new Map<string, UniversalBenefitResource>();
    INITIAL_UNIVERSAL_BENEFIT_REGISTRY.forEach((r) => map.set(r.id, r));
    userRes.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [ecoState.universalBenefitResources]);

  const [selectedResourceId, setSelectedResourceId] = useState<string>(allResources[0]?.id || "");

  // Report Modal State
  const [reportingRes, setReportingRes] = useState<UniversalBenefitResource | null>(null);
  const [reportKind, setReportKind] = useState<ResourceCorrectionReport["kind"]>("factual_error");
  const [reportDetails, setReportDetails] = useState("");

  const filteredResources = useMemo(() => {
    return allResources.filter((res) => {
      const matchKind = kindFilter === "all" || res.systemKind === kindFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        res.titleAr.includes(q) ||
        res.contentSummary.toLowerCase().includes(q) ||
        res.creatorName.toLowerCase().includes(q);
      return matchKind && matchSearch;
    });
  }, [allResources, kindFilter, searchQuery]);

  const activeResource = useMemo(() => {
    return allResources.find((r) => r.id === selectedResourceId) || filteredResources[0];
  }, [allResources, selectedResourceId, filteredResources]);

  // Derived Health Dashboard Metrics
  const dashboardStats = useMemo(() => {
    const total = allResources.length;
    let healthyCount = 0;
    let reviewDueCount = 0;
    let openCorrectionsCount = 0;
    let fullAccessibilityCount = 0;

    const now = new Date();

    allResources.forEach((res) => {
      if (res.maintenanceStatus === "healthy") healthyCount++;
      if (res.maintenanceStatus === "review_due") reviewDueCount++;
      openCorrectionsCount += res.pendingCorrectionCount || res.correctionReports?.length || 0;

      const acc = res.accessibilityStatus;
      if (acc && acc.hasAudio && acc.hasScreenReaderFormatted && acc.hasSimplifiedText) {
        fullAccessibilityCount++;
      }
    });

    const accessPercent = total > 0 ? Math.round((fullAccessibilityCount / total) * 100) : 100;
    const healthPercent = total > 0 ? Math.round((healthyCount / total) * 100) : 100;

    return {
      total,
      healthyCount,
      reviewDueCount,
      openCorrectionsCount,
      accessPercent,
      healthPercent,
    };
  }, [allResources]);

  // Handle Reverification Action
  const handleReverifyResource = (resId: string) => {
    const today = new Date().toISOString().split("T")[0] || "2026-11-19";
    updateEco((prev) => {
      const currentList = prev.universalBenefitResources || INITIAL_UNIVERSAL_BENEFIT_REGISTRY;
      const updated = currentList.map((r) => {
        if (r.id !== resId) return r;
        return {
          ...r,
          lastReviewedDate: today,
          maintenanceStatus: "healthy" as const,
          lifecycleState: "reverified" as const,
          version: r.version + 1,
          versionHistory: [
            {
              version: r.version + 1,
              date: today,
              changeSummary: "Periodic evidence & accessibility reverification confirmed.",
              reviewerName: "NEXORA Knowledge Continuity Team",
            },
            ...(r.versionHistory || []),
          ],
        };
      });
      return { ...prev, universalBenefitResources: updated };
    });

    toast.success(
      isAr
        ? "تمت إعادة توثيق المورد بنجاح وتحديث تاريخ الصيانة الدورية"
        : "Resource reverified successfully; next review interval scheduled.",
    );
  };

  // Submit Community Correction
  const handleSubmitCorrection = () => {
    if (!reportDetails.trim() || !reportingRes) return;

    const newReport: ResourceCorrectionReport = {
      id: `rep_${Date.now()}`,
      reportedAt: new Date().toISOString().split("T")[0] || "2026-11-19",
      kind: reportKind,
      details: reportDetails.trim(),
      status: "pending",
    };

    updateEco((prev) => {
      const currentList = prev.universalBenefitResources || INITIAL_UNIVERSAL_BENEFIT_REGISTRY;
      const updated = currentList.map((r) => {
        if (r.id !== reportingRes.id) return r;
        return {
          ...r,
          pendingCorrectionCount: (r.pendingCorrectionCount || 0) + 1,
          correctionReports: [newReport, ...(r.correctionReports || [])],
        };
      });
      return { ...prev, universalBenefitResources: updated };
    });

    toast.success(
      isAr
        ? "تم تسجيل بلاغ التحسين وسيتم فحص الأدلة من فريق المراجعة الأكاديمي!"
        : "Correction feedback recorded for peer review inspection!",
    );

    setReportingRes(null);
    setReportDetails("");
  };

  // Maintainer: Resolve Report & Version Bump
  const handleResolveReport = (resId: string, repId: string, approved: boolean) => {
    const today = new Date().toISOString().split("T")[0] || "2026-11-19";

    updateEco((prev) => {
      const currentList = prev.universalBenefitResources || INITIAL_UNIVERSAL_BENEFIT_REGISTRY;
      const updated = currentList.map((r) => {
        if (r.id !== resId) return r;
        const updatedReports = (r.correctionReports || []).map((rep) => {
          if (rep.id !== repId) return rep;
          return {
            ...rep,
            status: (approved ? "approved" : "rejected") as ResourceCorrectionReport["status"],
            resolvedAt: today,
            resolutionNote: approved
              ? "Verified against authoritative literature; version updated."
              : "Reviewed and found consistent with primary source consensus.",
          };
        });

        const newVersion = approved ? r.version + 1 : r.version;
        const newHistory = approved
          ? [
              {
                version: newVersion,
                date: today,
                changeSummary: "Community correction approved and applied.",
                reviewerName: "NEXORA Editorial Board",
              },
              ...(r.versionHistory || []),
            ]
          : r.versionHistory || [];

        return {
          ...r,
          version: newVersion,
          versionHistory: newHistory,
          pendingCorrectionCount: Math.max(0, (r.pendingCorrectionCount || 1) - 1),
          correctionReports: updatedReports,
        };
      });
      return { ...prev, universalBenefitResources: updated };
    });

    toast.success(approved ? "Report approved & version updated!" : "Report inspected & archived.");
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">
              {isAr
                ? "سجل النفع العام واستدامة المعرفة الدائمة"
                : "Universal Benefit Resource Registry"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "المنظومة المركزية الحادية عشرة: دورة حياة الموارد (10 مراحل)، الصيانة المجدولة، وتصويبات الأقران"
              : "The 11th Central System: 10-stage lifecycle, automated maintenance reviews, and community corrections."}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger
              value="registry"
              onClick={() => setActiveTab("registry")}
              className="text-xs gap-1.5"
            >
              <Library className="h-3.5 w-3.5" />
              {isAr ? "سجل الموارد" : "Registry Browser"}
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              onClick={() => setActiveTab("dashboard")}
              className="text-xs gap-1.5"
            >
              <Activity className="h-3.5 w-3.5" />
              {isAr ? "لوحة صحة الموارد" : "Health Dashboard"}
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              onClick={() => setActiveTab("schedule")}
              className="text-xs gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              {isAr ? "جدولة الصيانة الدورية" : "Review Schedule"}
            </TabsTrigger>
            <TabsTrigger
              value="corrections"
              onClick={() => setActiveTab("corrections")}
              className="text-xs gap-1.5"
            >
              <Flag className="h-3.5 w-3.5" />
              {isAr ? "بلاغات التصويب" : "Correction Queue"} ({dashboardStats.openCorrectionsCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab 1: Registry Browser */}
      {activeTab === "registry" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  isAr
                    ? "بحث في الموارد الدائمة، المعلمين، والمحتوى..."
                    : "Search resources, creators, or topics..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <select
              className="text-xs rounded-md border border-input bg-background p-2"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as SystemKind | "all")}
            >
              <option value="all">{isAr ? "جميع منظومات النفع" : "All Benefit Domains"}</option>
              <option value="health_awareness">
                {isAr ? "التوعية الصحية" : "Health Awareness"}
              </option>
              <option value="truth_defender">{isAr ? "حامي الحقيقة" : "Truth Defender"}</option>
              <option value="earth_care">{isAr ? "رعاية الأرض" : "Earth Care"}</option>
              <option value="digital_protection">
                {isAr ? "الحماية الرقمية" : "Digital Protection"}
              </option>
              <option value="life_saving">{isAr ? "إنقاذ الحياة" : "Life Saving"}</option>
              <option value="open_tools">{isAr ? "أدوات مفتوحة" : "Open Tools"}</option>
              <option value="educational_gift">{isAr ? "هدية علمية" : "Educational Gift"}</option>
              <option value="islamic_beneficial">
                {isAr ? "مكارم الأخلاق" : "Islamic Benefit"}
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List */}
            <div className="lg:col-span-5 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {isAr ? "الموارد المسجلة" : "Universal Registry Catalog"} (
                {filteredResources.length})
              </h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredResources.map((res) => {
                  const isSelected = activeResource?.id === res.id;
                  return (
                    <button
                      key={res.id}
                      onClick={() => setSelectedResourceId(res.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground line-clamp-1">
                          {isAr ? res.titleAr : res.title}
                        </span>
                        <Badge variant="outline" className="text-[9px] shrink-0 font-mono">
                          v{res.version}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {res.contentSummary}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <Badge variant="secondary" className="text-[9px]">
                          {res.systemKind.replace("_", " ")}
                        </Badge>
                        <span className="ml-auto">{res.lastReviewedDate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Resource Deep Inspector */}
            <div className="lg:col-span-7">
              {activeResource ? (
                <Card className="border shadow-xs">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-bold text-foreground">
                            {isAr ? activeResource.titleAr : activeResource.title}
                          </CardTitle>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            v{activeResource.version}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs mt-1">
                          {isAr ? "المعد / المسؤول:" : "Creator:"} {activeResource.creatorName} (
                          {activeResource.creatorRole}) • {activeResource.license}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReportingRes(activeResource)}
                        className="text-xs gap-1.5 shrink-0 hover:text-rose-600"
                      >
                        <Flag className="h-3.5 w-3.5" />
                        {isAr ? "إبلاغ عن خطأ" : "Report Issue"}
                      </Button>
                    </div>

                    {/* 10-Stage Lifecycle Step Indicator */}
                    <div className="pt-4 mt-2 border-t">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        {isAr
                          ? "المرحلة الحالية في دورة الحياة (10 مراحل):"
                          : "Current 10-Stage Lifecycle Pipeline:"}
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {LIFECYCLE_STAGES.map((st, idx) => {
                          const isCurrent = activeResource.lifecycleState === st.key;
                          return (
                            <div
                              key={st.key}
                              className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-medium border ${
                                isCurrent
                                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                                  : "bg-muted/30 text-muted-foreground border-border/50"
                              }`}
                            >
                              {idx + 1}. {isAr ? st.labelAr : st.labelEn}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-5 text-xs leading-relaxed">
                    {/* Summary */}
                    <div className="p-3.5 rounded-lg bg-muted/40 border text-xs">
                      <span className="font-semibold text-foreground">
                        {isAr ? "ملخص النفع والمحتوى:" : "Content Overview:"}{" "}
                      </span>
                      <span>{activeResource.contentSummary}</span>
                    </div>

                    {/* Full Content */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isAr ? "المحتوى العلمي للمورد" : "Resource Body Content"}
                      </h4>
                      <div className="p-3.5 rounded-lg border bg-card text-foreground whitespace-pre-line text-xs font-sans max-h-64 overflow-y-auto leading-relaxed">
                        {activeResource.fullContent}
                      </div>
                    </div>

                    {/* Accessibility Capabilities */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isAr
                          ? "جاهزية إمكانية الوصول والتكييف"
                          : "Multi-Modal Accessibility Capabilities"}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        {[
                          {
                            label: isAr ? "صوت ملائم" : "Audio Adapt",
                            active: activeResource.accessibilityStatus.hasAudio,
                          },
                          {
                            label: isAr ? "نص مبسط" : "Simplified",
                            active: activeResource.accessibilityStatus.hasSimplifiedText,
                          },
                          {
                            label: isAr ? "هيكل دلالي" : "Screen Reader",
                            active: activeResource.accessibilityStatus.hasScreenReaderFormatted,
                          },
                          {
                            label: isAr ? "وصف الرسوم" : "Alt-Text",
                            active: activeResource.accessibilityStatus.hasDiagramAltText,
                          },
                        ].map((acc, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-md border flex items-center justify-between ${
                              acc.active
                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                                : "bg-muted/40 border-border text-muted-foreground"
                            }`}
                          >
                            <span>{acc.label}</span>
                            {acc.active ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Maintenance Actions & Version History */}
                    <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-muted-foreground">
                        <span>
                          {isAr ? "دورية التدقيق:" : "Review Interval:"}{" "}
                          {activeResource.reviewIntervalDays} {isAr ? "يوماً" : "days"} •{" "}
                        </span>
                        <span>
                          {isAr ? "آخر مراجعة:" : "Last:"} {activeResource.lastReviewedDate}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReverifyResource(activeResource.id)}
                        className="text-xs gap-1.5 h-7"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-primary" />
                        {isAr ? "تأكيد إعادة التوثيق الآن" : "Trigger Reverification"}
                      </Button>
                    </div>

                    {/* Version History Table */}
                    {activeResource.versionHistory && activeResource.versionHistory.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                          <History className="h-3.5 w-3.5" />
                          {isAr ? "سجل الإصدارات والتعديلات:" : "Semantic Version Changelog:"}
                        </span>
                        <div className="space-y-1 text-[11px]">
                          {activeResource.versionHistory.map((vh, i) => (
                            <div
                              key={i}
                              className="p-2 rounded border bg-muted/20 flex items-center justify-between text-muted-foreground"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-foreground">
                                  v{vh.version}
                                </span>
                                <span>{vh.changeSummary}</span>
                              </div>
                              <span className="text-[10px] shrink-0">{vh.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Resource Health Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="border shadow-xs text-center p-4">
              <span className="text-2xl font-bold text-primary">{dashboardStats.total}</span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isAr ? "إجمالي الموارد" : "Total Resources"}
              </p>
            </Card>

            <Card className="border shadow-xs text-center p-4">
              <span className="text-2xl font-bold text-emerald-600">
                {dashboardStats.healthyCount}
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isAr ? "صيانة نشطة وسليمة" : "Healthy & Current"}
              </p>
            </Card>

            <Card className="border shadow-xs text-center p-4">
              <span className="text-2xl font-bold text-amber-500">
                {dashboardStats.reviewDueCount}
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isAr ? "مستحقة للمراجعة" : "Review Due"}
              </p>
            </Card>

            <Card className="border shadow-xs text-center p-4">
              <span className="text-2xl font-bold text-rose-500">
                {dashboardStats.openCorrectionsCount}
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isAr ? "بلاغات أقران مفتوحة" : "Open Corrections"}
              </p>
            </Card>

            <Card className="border shadow-xs text-center p-4">
              <span className="text-2xl font-bold text-indigo-600">
                {dashboardStats.accessPercent}%
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isAr ? "جاهزية الوصول الشامل" : "Accessibility Rate"}
              </p>
            </Card>

            <Card className="border shadow-xs text-center p-4">
              <span className="text-2xl font-bold text-teal-600">
                {dashboardStats.healthPercent}%
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isAr ? "مؤشر صحة المعرفة" : "Integrity Index"}
              </p>
            </Card>
          </div>

          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">
                {isAr
                  ? "فترات التدقيق العلمي حسب نوع المعرفة"
                  : "Evidence Review Cadence by Discipline"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr
                  ? "معايير زمنية صارمة لضمان حداثة المعلومات الطبية وحالات الطوارئ قبل الموارد النظرية."
                  : "Strictest cadences enforced on emergency and clinical guidelines before fundamental theory."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  {
                    domain: isAr ? "إنقاذ الحياة والطوارئ" : "Life Saving & Emergency",
                    interval: "60 Days",
                    note: isAr
                      ? "فحص دوري للإجراءات والأرقام"
                      : "Quarterly emergency protocols check",
                  },
                  {
                    domain: isAr ? "التوعية الصحية والطبية" : "Health Awareness",
                    interval: "90 Days",
                    note: isAr ? "مراجعة إرشادات WHO و CDC" : "WHO/CDC clinical guidelines refresh",
                  },
                  {
                    domain: isAr ? "الأدوات والعلوم الرقمية" : "Tools, Cyber & Ecology",
                    interval: "180 Days",
                    note: isAr
                      ? "فحص برمجيات وتحديثات النظم"
                      : "Tool binaries & data source verification",
                  },
                  {
                    domain: isAr ? "المفاهيم والأخلاق الأساسية" : "Fundamentals & Wisdom",
                    interval: "365 Days",
                    note: isAr ? "تدقيق تراثي ومعرفي سنوي" : "Annual historical and ethical review",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border bg-muted/20 space-y-1">
                    <span className="font-semibold text-foreground">{item.domain}</span>
                    <div className="text-primary font-bold font-mono text-sm">{item.interval}</div>
                    <p className="text-[10px] text-muted-foreground">{item.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Review Schedule */}
      {activeTab === "schedule" && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {isAr ? "جدول الصيانة الدورية وتواريخ التدقيق" : "Maintenance & Review Calendar"}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isAr
                ? "قائمة بالموارد المنشورة ومواعيد استحقاق مراجعتها القادمة."
                : "Active schedule indicating upcoming peer inspection dates for each published resource."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {allResources.map((res) => (
                <div
                  key={res.id}
                  className="p-3 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">
                      {isAr ? res.titleAr : res.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {res.systemKind.replace("_", " ")} • {isAr ? "دورية المراجعة:" : "Cadence:"}{" "}
                      {res.reviewIntervalDays} {isAr ? "يوماً" : "days"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px]">
                      <span className="text-muted-foreground block text-[10px]">
                        {isAr ? "آخر مراجعة" : "Last Reviewed"}
                      </span>
                      <span className="font-medium text-foreground">{res.lastReviewedDate}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReverifyResource(res.id)}
                      className="text-xs h-7"
                    >
                      {isAr ? "إعادة توثيق" : "Reverify"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Corrections Queue */}
      {activeTab === "corrections" && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="h-4 w-4 text-rose-500" />
              {isAr
                ? "طابور بلاغات التحسين وتصويب الأقران"
                : "Community Error Reports & Peer Corrections"}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isAr
                ? "مراجعة ملاحظات الطلبة والمعلمين حول الأخطاء العلمية أو الروابط المعطلة أو متطلبات الوصول الميسر."
                : "Inspect submitted corrections, review evidence, and approve semantic version updates."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {allResources.flatMap((r) =>
              (r.correctionReports || []).map((rep) => ({
                resource: r,
                report: rep,
              })),
            ).length === 0 ? (
              <div className="p-8 text-center border rounded-xl bg-card text-muted-foreground text-xs">
                {isAr
                  ? "لا توجد بلاغات تصويب مفتوحة حالياً. جميع الموارد مستقرة ومحققة."
                  : "No open correction reports. All published resources are in good standing."}
              </div>
            ) : (
              <div className="space-y-3">
                {allResources.flatMap((r) =>
                  (r.correctionReports || []).map((rep) => (
                    <div key={rep.id} className="p-3.5 rounded-lg border bg-card space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-foreground">
                            {isAr ? r.titleAr : r.title}
                          </span>
                          <span className="text-muted-foreground ml-2 text-[11px]">
                            ({rep.kind.replace("_", " ")})
                          </span>
                        </div>
                        <Badge
                          variant={rep.status === "approved" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {rep.status}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground leading-relaxed p-2.5 rounded bg-muted/30 border">
                        "{rep.details}"
                      </p>

                      {rep.status === "pending" && (
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveReport(r.id, rep.id, false)}
                            className="text-xs h-7"
                          >
                            {isAr ? "رفض لعدم ثبوت الخطأ" : "Reject (Consistent)"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolveReport(r.id, rep.id, true)}
                            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isAr ? "اعتماد التصويب وتحديث الإصدار" : "Approve & Bump Version"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Community Report Modal */}
      {reportingRes && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border shadow-lg bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Flag className="h-4 w-4 text-rose-500" />
                {isAr ? "إبلاغ عن خطأ علمي أو تحسين" : "Submit Correction Report"}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {reportingRes.title} (v{reportingRes.version})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "نوع الملاحظة" : "Correction Type"}</Label>
                <select
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                  value={reportKind}
                  onChange={(e) =>
                    setReportKind(e.target.value as ResourceCorrectionReport["kind"])
                  }
                >
                  <option value="factual_error">
                    {isAr ? "خطأ علمي أو حقيقة غير دقيقة" : "Factual Error"}
                  </option>
                  <option value="broken_link">
                    {isAr ? "رابط أو مصدر معطل" : "Broken Source / Link"}
                  </option>
                  <option value="outdated">
                    {isAr ? "معلومات قديمة تم تحديثها" : "Outdated Information"}
                  </option>
                  <option value="inaccessible">
                    {isAr
                      ? "صعوبة في الوصول أو قارئات الشاشة"
                      : "Inaccessible / Screen Reader Issue"}
                  </option>
                  <option value="misleading">
                    {isAr ? "صياغة مضللة أو غير واضحة" : "Misleading / Unclear Phrasing"}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  {isAr ? "التفاصيل والمصدر المقترح للتصحيح" : "Details & Authoritative Source"}
                </Label>
                <Textarea
                  rows={4}
                  placeholder={
                    isAr
                      ? "اشرح الخطأ بدقة واذكر الكتاب أو البحث أو المرجع الصحيح..."
                      : "Describe the discrepancy and cite the peer-reviewed or authoritative source..."
                  }
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportingRes(null)}
                  className="text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button size="sm" onClick={handleSubmitCorrection} className="text-xs">
                  {isAr ? "إرسال تقرير التصويب" : "Submit Report"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
