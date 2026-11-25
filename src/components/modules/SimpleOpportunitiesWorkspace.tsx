import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  ExternalLink,
  ListTodo,
  Plus,
  Radar,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpportunities, useOpportunityActions } from "@/hooks/use-modules";
import { useTaskActions, useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import type { OpportunityCategory } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import { REFERENCE_OPPORTUNITIES, type ReferenceOpportunityItem } from "@/lib/recommendations";

const CATEGORY_LABELS: Record<OpportunityCategory, { en: string; ar: string }> = {
  scholarship: { en: "Scholarship", ar: "منحة دراسية" },
  competition: { en: "Competition", ar: "مسابقة" },
  program: { en: "Program", ar: "برنامج" },
  course: { en: "Course", ar: "دورة" },
  initiative: { en: "Initiative", ar: "مبادرة" },
  internship: { en: "Internship", ar: "تدريب عملي" },
};

const SCOPE_LABELS: Record<"kuwait" | "gcc" | "global", { en: string; ar: string }> = {
  kuwait: { en: "Kuwait", ar: "الكويت" },
  gcc: { en: "GCC", ar: "الخليج" },
  global: { en: "Global", ar: "عالمي" },
};

const STATUS_LABELS: Record<"saved" | "applied" | "archived", { en: string; ar: string }> = {
  saved: { en: "Saved", ar: "محفوظة" },
  applied: { en: "Applied", ar: "تم التقديم" },
  archived: { en: "Archived", ar: "مؤرشفة" },
};

export function SimpleOpportunitiesWorkspace() {
  const { lang } = usePrefs();
  const { data: user } = useUser();
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(user?.uid, {
      path: "/app/opportunities",
      labelEn: "Opportunity Radar",
      labelAr: "رادار الفرص",
    });
  }, [user?.uid]);

  const { data: saved = [] } = useOpportunities();
  const { saveOpportunity, updateOpportunityStatus, updateOpportunityNotes, deleteOpportunity } =
    useOpportunityActions();
  const { addTask } = useTaskActions();

  const [tab, setTab] = useState<"discover" | "saved">("discover");
  const [scope, setScope] = useState<"all" | "kuwait" | "gcc" | "global">("all");
  const [category, setCategory] = useState<"all" | OpportunityCategory>("all");
  const [search, setSearch] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  // Manual entry
  const [mTitle, setMTitle] = useState("");
  const [mOrg, setMOrg] = useState("");
  const [mCat, setMCat] = useState<OpportunityCategory>("scholarship");
  const [mScope, setMScope] = useState<"kuwait" | "gcc" | "global">("kuwait");
  const [mDeadline, setMDeadline] = useState("");
  const [mUrl, setMUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REFERENCE_OPPORTUNITIES.filter((item) => {
      if (scope !== "all" && item.region_scope !== scope) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.titleAr.toLowerCase().includes(q) ||
        item.organizer.toLowerCase().includes(q) ||
        item.organizerAr.toLowerCase().includes(q) ||
        item.eligibility.toLowerCase().includes(q) ||
        item.eligibilityAr.toLowerCase().includes(q)
      );
    });
  }, [scope, category, search]);

  const handleSaveCatalogItem = async (item: ReferenceOpportunityItem) => {
    try {
      await saveOpportunity({
        title: isAr ? item.titleAr : item.title,
        organizer: isAr ? item.organizerAr : item.organizer,
        category: item.category,
        region_scope: item.region_scope,
        eligibility: isAr ? item.eligibilityAr : item.eligibility,
        deadline: isAr ? item.deadlineAr : item.deadline,
        cost: isAr ? item.costAr : item.cost,
        url: item.url,
        source: isAr ? item.sourceAr : item.source,
        source_kind: "reference_catalog",
        last_verified_at: item.last_verified_at,
      });
      toast.success(isAr ? "تم حفظ الفرصة في قائمتك." : "Saved to your tracker.");
    } catch {
      toast.error(isAr ? "تعذر حفظ الفرصة." : "Could not save opportunity.");
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mOrg.trim()) return;
    setBusy(true);
    try {
      await saveOpportunity({
        title: mTitle.trim(),
        organizer: mOrg.trim(),
        category: mCat,
        region_scope: mScope,
        deadline: mDeadline.trim() || null,
        url: mUrl.trim() || null,
        source: isAr ? "أُضيفت بواسطة الطالب" : "Student Added",
        source_kind: "manual",
      });
      setMTitle("");
      setMOrg("");
      setMDeadline("");
      setMUrl("");
      toast.success(isAr ? "تمت إضافة الفرصة." : "Opportunity saved.");
      setTab("saved");
    } catch {
      toast.error(isAr ? "تعذر إضافة الفرصة." : "Could not add opportunity.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddPrepTask = async (oppTitle: string, deadline: string | null) => {
    try {
      const due =
        deadline && /^\d{4}-\d{2}-\d{2}/.test(deadline)
          ? new Date(`${deadline.slice(0, 10)}T12:00:00Z`).toISOString()
          : null;
      await addTask({
        title: isAr ? `تجهيز التقديم: ${oppTitle}` : `Prepare application: ${oppTitle}`,
        area: "career",
        priority: "high",
        due_at: due,
      });
      toast.success(
        isAr ? "تمت إضافة مهمة التحضير إلى الإنتاجية." : "Prep task added to Productivity.",
      );
    } catch {
      toast.error(isAr ? "تعذر إضافة المهمة." : "Could not create task.");
    }
  };

  return (
    <div className="space-y-6 pb-12" dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={isAr ? "رادار الفرص" : "Opportunity Radar"}
        subtitle={
          isAr
            ? "استكشف المنح والمسابقات والورش التعليمية مع روابط المصادر الرسمية وتاريخ التحقق."
            : "Discover verified scholarships, competitions, and programs with official links and personal tracking."
        }
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-1.5">
        <Button
          type="button"
          size="sm"
          variant={tab === "discover" ? "glow" : "ghost"}
          onClick={() => setTab("discover")}
          className="min-h-11 gap-1.5 px-3 text-xs"
        >
          <Radar className="size-3.5 shrink-0" />
          <span>{isAr ? "استكشاف الفرص" : "Discover Opportunities"}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "saved" ? "glow" : "ghost"}
          onClick={() => setTab("saved")}
          className="min-h-11 gap-1.5 px-3 text-xs"
        >
          <Bookmark className="size-3.5 shrink-0" />
          <span>
            {isAr ? `الفرص المحفوظة (${saved.length})` : `My Saved Tracker (${saved.length})`}
          </span>
        </Button>
      </div>

      {tab === "discover" && (
        <div className="space-y-4">
          <div className="surface-card space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "all", en: "All Regions", ar: "كل المناطق" },
                    { id: "kuwait", en: "Kuwait", ar: "الكويت" },
                    { id: "gcc", en: "GCC", ar: "الخليج" },
                    { id: "global", en: "Global", ar: "عالمي" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScope(s.id)}
                    className={`min-h-10 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      scope === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isAr ? s.ar : s.en}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute start-2.5 top-3 size-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    isAr ? "ابحث عن منحة أو مسابقة..." : "Search programs or organizers..."
                  }
                  className="h-10 ps-8 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", en: "All Types", ar: "كل الأنواع" },
                  { id: "scholarship", en: "Scholarships", ar: "منح دراسية" },
                  { id: "competition", en: "Competitions", ar: "مسابقات" },
                  { id: "program", en: "Programs", ar: "برامج" },
                  { id: "course", en: "Courses", ar: "دورات" },
                  { id: "initiative", en: "Initiatives", ar: "مبادرات" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`min-h-9 rounded-lg px-2.5 py-1 text-xs cursor-pointer ${
                    category === c.id
                      ? "bg-primary/15 text-primary font-semibold"
                      : "bg-surface-2/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? c.ar : c.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="surface-card flex flex-col justify-between space-y-4 p-5"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">
                      {isAr ? CATEGORY_LABELS[item.category].ar : CATEGORY_LABELS[item.category].en}{" "}
                      ·{" "}
                      {isAr
                        ? SCOPE_LABELS[item.region_scope].ar
                        : SCOPE_LABELS[item.region_scope].en}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                      <BadgeCheck className="size-3 shrink-0" />
                      <span>{isAr ? "معلومات رسمية موثقة" : "Verified official information"}</span>
                    </span>
                  </div>

                  <h2 className="font-display text-base font-bold leading-snug text-foreground">
                    {isAr ? item.titleAr : item.title}
                  </h2>
                  <div className="text-xs font-medium text-muted-foreground">
                    {isAr ? item.organizerAr : item.organizer}
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">
                    {isAr ? item.eligibilityAr : item.eligibility}
                  </p>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div>
                      {isAr ? "الموعد والتكلفة: " : "Timeline & cost: "}
                      {isAr ? item.deadlineAr : item.deadline} · {isAr ? item.costAr : item.cost}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span>
                        {isAr ? "آخر تحقق: " : "Verified: "}
                        {item.last_verified_at}
                      </span>
                      <span>·</span>
                      <span>
                        {isAr
                          ? "تختلف التفاصيل حسب البلد أو المؤسسة — راجع الرابط الرسمي"
                          : "Varies by country or institution — confirm on official portal"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{isAr ? item.sourceAr : item.source}</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleSaveCatalogItem(item)}
                    className="min-h-10 gap-1.5 px-3 text-xs"
                  >
                    <Bookmark className="size-3.5" />
                    <span>{isAr ? "حفظ للمتابعة" : "Save"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "saved" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <form
            onSubmit={handleAddManual}
            className="surface-card space-y-3 p-5 lg:col-span-5 h-fit"
          >
            <h3 className="font-display text-sm font-bold text-foreground">
              {isAr ? "أضف فرصة يدوياً" : "Add Opportunity Manually"}
            </h3>
            <div>
              <Label htmlFor="opp-title" className="text-xs">
                {isAr ? "اسم الفرصة" : "Title"}
              </Label>
              <Input
                id="opp-title"
                value={mTitle}
                onChange={(e) => setMTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="opp-org" className="text-xs">
                {isAr ? "الجهة المنظمة" : "Organizer"}
              </Label>
              <Input
                id="opp-org"
                value={mOrg}
                onChange={(e) => setMOrg(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="opp-cat" className="text-xs">
                  {isAr ? "النوع" : "Category"}
                </Label>
                <select
                  id="opp-cat"
                  value={mCat}
                  onChange={(e) => setMCat(e.target.value as OpportunityCategory)}
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
                >
                  {(Object.keys(CATEGORY_LABELS) as OpportunityCategory[]).map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {isAr ? CATEGORY_LABELS[catKey].ar : CATEGORY_LABELS[catKey].en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="opp-scope" className="text-xs">
                  {isAr ? "النطاق" : "Scope"}
                </Label>
                <select
                  id="opp-scope"
                  value={mScope}
                  onChange={(e) => setMScope(e.target.value as "kuwait" | "gcc" | "global")}
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
                >
                  {(Object.keys(SCOPE_LABELS) as ("kuwait" | "gcc" | "global")[]).map((sKey) => (
                    <option key={sKey} value={sKey}>
                      {isAr ? SCOPE_LABELS[sKey].ar : SCOPE_LABELS[sKey].en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="opp-deadline" className="text-xs">
                {isAr ? "آخر موعد (اختياري)" : "Deadline (optional)"}
              </Label>
              <Input
                id="opp-deadline"
                type="date"
                value={mDeadline}
                onChange={(e) => setMDeadline(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="opp-url" className="text-xs">
                {isAr ? "الرابط الرسمي (اختياري)" : "Official URL (optional)"}
              </Label>
              <Input
                id="opp-url"
                type="url"
                value={mUrl}
                onChange={(e) => setMUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={busy || !mTitle.trim() || !mOrg.trim()}
              size="sm"
              variant="glow"
              className="min-h-11 gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>{isAr ? "حفظ الفرصة" : "Save Opportunity"}</span>
            </Button>
          </form>

          <div className="space-y-3 lg:col-span-7">
            {saved.length === 0 ? (
              <div className="surface-card p-8 text-center text-xs text-muted-foreground">
                {isAr ? "لم تحفظ أي فرصة بعد." : "No saved opportunities yet."}
              </div>
            ) : (
              saved.map((opp) => (
                <div key={opp.id} className="surface-card space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary font-medium">
                          {isAr
                            ? CATEGORY_LABELS[opp.category].ar
                            : CATEGORY_LABELS[opp.category].en}{" "}
                          ·{" "}
                          {isAr
                            ? SCOPE_LABELS[opp.region_scope].ar
                            : SCOPE_LABELS[opp.region_scope].en}
                        </span>
                        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-muted-foreground">
                          {opp.source_kind === "reference_catalog"
                            ? isAr
                              ? "معلومات رسمية موثقة"
                              : "Verified official information"
                            : isAr
                              ? "أُضيفت يدوياً"
                              : "Added by student"}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold leading-snug text-foreground">
                        {opp.title}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        {opp.organizer} {opp.deadline ? `· ${opp.deadline}` : ""}
                      </div>
                      {opp.url && (
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <span>{isAr ? "الرابط الرسمي" : "Official Source"}</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteOpportunity(opp.id)}
                      aria-label={isAr ? "حذف" : "Delete"}
                      className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(["saved", "applied", "archived"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void updateOpportunityStatus(opp, status)}
                        className={`min-h-9 rounded-lg px-2.5 py-1 text-xs cursor-pointer ${
                          opp.status === status
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-surface-2 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isAr ? STATUS_LABELS[status].ar : STATUS_LABELS[status].en}
                      </button>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleAddPrepTask(opp.title, opp.deadline)}
                      className="min-h-9 gap-1 text-xs"
                    >
                      <ListTodo className="size-3" />
                      <span>{isAr ? "أضف مهمة تحضير" : "Add Prep Task"}</span>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={noteDrafts[opp.id] ?? opp.notes ?? ""}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [opp.id]: e.target.value }))
                      }
                      placeholder={isAr ? "ملاحظات التقديم..." : "Application notes..."}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void updateOpportunityNotes(opp, noteDrafts[opp.id] ?? opp.notes ?? "");
                        toast.success(isAr ? "تم حفظ الملاحظة." : "Note saved.");
                      }}
                      className="h-9 text-xs"
                    >
                      {isAr ? "حفظ" : "Save"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
