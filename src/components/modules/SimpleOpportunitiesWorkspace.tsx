import { useEffect, useMemo, useState } from "react";
import { Bookmark, ExternalLink, ListTodo, Plus, Radar, Search, Trash2 } from "lucide-react";
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
        item.organizer.toLowerCase().includes(q) ||
        item.eligibility.toLowerCase().includes(q)
      );
    });
  }, [scope, category, search]);

  const handleSaveCatalogItem = async (item: ReferenceOpportunityItem) => {
    try {
      await saveOpportunity({
        title: item.title,
        organizer: item.organizer,
        category: item.category,
        region_scope: item.region_scope,
        eligibility: item.eligibility,
        deadline: item.deadline,
        cost: item.cost,
        url: item.url,
        source: item.source,
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
        source: "Student Added",
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
    <div className="space-y-6 pb-12">
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
          className="gap-1.5 text-xs"
        >
          <Radar className="size-3.5" />
          <span>{isAr ? "استكشاف الفرص" : "Discover Opportunities"}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "saved" ? "glow" : "ghost"}
          onClick={() => setTab("saved")}
          className="gap-1.5 text-xs"
        >
          <Bookmark className="size-3.5" />
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
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
                <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    isAr ? "ابحث عن منحة أو مسابقة..." : "Search programs or organizers..."
                  }
                  className="h-9 ps-8 text-xs"
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
                  className={`rounded-lg px-2.5 py-1 text-xs cursor-pointer ${
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary uppercase">
                      {item.category} · {item.region_scope}
                    </span>
                    <span>
                      {isAr ? "تم التحقق: " : "Verified: "}
                      {item.last_verified_at}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-bold text-foreground">{item.title}</h2>
                  <div className="text-xs font-medium text-muted-foreground">{item.organizer}</div>
                  <p className="text-xs text-foreground">{item.eligibility}</p>
                  <div className="text-[11px] text-muted-foreground">
                    {isAr ? "الموعد: " : "Timeline: "}
                    {item.deadline} · {item.cost}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{isAr ? "المصدر الرسمي" : "Official Source"}</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleSaveCatalogItem(item)}
                    className="h-8 gap-1.5 text-xs"
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
          <form onSubmit={handleAddManual} className="surface-card space-y-3 p-5 lg:col-span-5">
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
                  <option value="scholarship">Scholarship</option>
                  <option value="competition">Competition</option>
                  <option value="program">Program</option>
                  <option value="course">Course</option>
                  <option value="initiative">Initiative</option>
                  <option value="internship">Internship</option>
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
                  <option value="kuwait">Kuwait</option>
                  <option value="gcc">GCC</option>
                  <option value="global">Global</option>
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
              className="gap-1.5"
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
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {opp.title}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        {opp.organizer} {opp.deadline ? `· ${opp.deadline}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteOpportunity(opp.id)}
                      aria-label={isAr ? "حذف" : "Delete"}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
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
                        className={`rounded-lg px-2.5 py-1 text-xs capitalize cursor-pointer ${
                          opp.status === status
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-surface-2 text-muted-foreground"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleAddPrepTask(opp.title, opp.deadline)}
                      className="h-7 gap-1 text-xs"
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
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void updateOpportunityNotes(opp, noteDrafts[opp.id] ?? opp.notes ?? "");
                        toast.success(isAr ? "تم حفظ الملاحظة." : "Note saved.");
                      }}
                      className="h-8 text-xs"
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
