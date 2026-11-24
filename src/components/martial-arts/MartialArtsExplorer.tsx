import { useMemo, useState } from "react";
import { Bookmark, Compass, Info, Scale, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MARTIAL_ARTS_DISCIPLINES, type MartialArtDiscipline } from "@/data/martial-arts";

export interface MartialArtsExplorerProps {
  isAr: boolean;
  savedDisciplineIds: string[];
  onToggleSaveDiscipline: (id: string) => void;
}

export function MartialArtsExplorer({
  isAr,
  savedDisciplineIds,
  onToggleSaveDiscipline,
}: MartialArtsExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | MartialArtDiscipline["category"]>("all");
  const [selectedId, setSelectedId] = useState<string>(MARTIAL_ARTS_DISCIPLINES[0]!.id);
  const [compareA, setCompareA] = useState<string>("karate");
  const [compareB, setCompareB] = useState<string>("judo");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARTIAL_ARTS_DISCIPLINES.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (!q) return true;
      return (
        d.name.en.toLowerCase().includes(q) ||
        d.name.ar.includes(q) ||
        d.origin.en.toLowerCase().includes(q) ||
        d.philosophy.en.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const activeArt = useMemo(
    () => MARTIAL_ARTS_DISCIPLINES.find((d) => d.id === selectedId) ?? MARTIAL_ARTS_DISCIPLINES[0]!,
    [selectedId],
  );

  const artA = useMemo(
    () => MARTIAL_ARTS_DISCIPLINES.find((d) => d.id === compareA) ?? MARTIAL_ARTS_DISCIPLINES[0]!,
    [compareA],
  );
  const artB = useMemo(
    () => MARTIAL_ARTS_DISCIPLINES.find((d) => d.id === compareB) ?? MARTIAL_ARTS_DISCIPLINES[2]!,
    [compareB],
  );

  const categoryTabs: Array<{
    id: "all" | MartialArtDiscipline["category"];
    en: string;
    ar: string;
  }> = [
    { id: "all", en: "All (14)", ar: "الكل (١٤)" },
    { id: "striking_sport", en: "Footwork & Sport Striking", ar: "رياضات المسافة والتوقيت" },
    { id: "grappling_balance", en: "Balance & Grappling Sports", ar: "رياضات التوازن والبساط" },
    {
      id: "holistic_tradition",
      en: "Traditional & Holistic Ways",
      ar: "الفنون التقليدية والشاملة",
    },
    {
      id: "traditional_weapons_sport",
      en: "Padded/Sport Apparatus",
      ar: "الرياضات المجهزة بأدوات",
    },
  ];

  return (
    <section className="space-y-6" data-testid="martial-arts-explorer">
      {/* Search & Category Filter */}
      <div className="surface-card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Compass className="size-5 text-primary" />
              {isAr
                ? "مستكشف فنون القتال العالمية (١٤ فنّاً)"
                : "Martial Arts Explorer (14 Global Traditions)"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "معلومات ثقافية وتاريخية وأخلاقية وتعليمية موثقة دون تضخيم أسطوري."
                : "Honest historical origins, philosophy, safety equipment, and ethics without myths or fighting tutorials."}
            </p>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              data-testid="dojo-explorer-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? "ابحث عن فن أو ثقافة..." : "Search discipline or origin..."}
              className="h-9 ps-8 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categoryTabs.map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => setCategory(ct.id)}
              className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                category === ct.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? ct.ar : ct.en}
            </button>
          ))}
        </div>
      </div>

      {/* Discipline Cards + Inspector */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:col-span-5 content-start">
          {filtered.length === 0 ? (
            <p className="col-span-2 rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
              {isAr ? "لا توجد فنون مطابقة لبحثك." : "No disciplines match your search filter."}
            </p>
          ) : (
            filtered.map((art) => {
              const active = art.id === activeArt.id;
              const saved = savedDisciplineIds.includes(art.id);
              return (
                <button
                  key={art.id}
                  type="button"
                  data-testid={`discipline-card-${art.id}`}
                  onClick={() => setSelectedId(art.id)}
                  className={`flex min-h-[76px] flex-col justify-between rounded-xl border p-3.5 text-start transition-colors ${
                    active
                      ? "border-primary bg-primary/15"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="font-display text-sm font-bold text-foreground">
                      {isAr ? art.name.ar : art.name.en}
                    </span>
                    {saved && <Bookmark className="size-3.5 shrink-0 fill-primary text-primary" />}
                  </div>
                  <span className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                    {isAr ? art.origin.ar : art.origin.en}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div
          className="surface-card space-y-4 p-5 lg:col-span-7"
          data-testid="discipline-inspector"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                {isAr ? activeArt.name.ar : activeArt.name.en}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isAr ? activeArt.origin.ar : activeArt.origin.en}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleSaveDiscipline(activeArt.id)}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                savedDisciplineIds.includes(activeArt.id)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-foreground hover:border-primary/40"
              }`}
            >
              <Bookmark className="size-3.5" />
              {savedDisciplineIds.includes(activeArt.id)
                ? isAr
                  ? "محفوظ في اهتماماتي"
                  : "Saved to Profile"
                : isAr
                  ? "حفظ الاهتمام"
                  : "Save Interest"}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="size-4 shrink-0 text-primary mt-0.5" />
            <div>
              <strong className="text-foreground">
                {isAr ? "ملاحظة الأمانة التاريخية:" : "Historical Transparency:"}
              </strong>{" "}
              {isAr ? activeArt.originNote.ar : activeArt.originNote.en}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
              <div className="font-bold text-foreground">
                {isAr ? "الفلسفة والقيم" : "Philosophy"}
              </div>
              <p className="text-muted-foreground">
                {isAr ? activeArt.philosophy.ar : activeArt.philosophy.en}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
              <div className="font-bold text-foreground">
                {isAr ? "طبيعة التمرين والبيئة" : "Training Focus & Environment"}
              </div>
              <p className="text-muted-foreground">
                {isAr ? activeArt.trainingFocus.ar : activeArt.trainingFocus.en} —{" "}
                {isAr ? activeArt.trainingEnvironment.ar : activeArt.trainingEnvironment.en}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
              <div className="font-bold text-foreground">
                {isAr ? "معدات السلامة" : "Protective Equipment"}
              </div>
              <p className="text-muted-foreground">
                {isAr ? activeArt.equipment.ar : activeArt.equipment.en}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
              <div className="font-bold text-foreground">
                {isAr ? "المهارات البدنية والذهنية" : "Fitness & Mental Skills"}
              </div>
              <p className="text-muted-foreground">
                {isAr ? activeArt.fitnessAndMentalSkills.ar : activeArt.fitnessAndMentalSkills.en}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
              <div className="font-bold text-foreground">
                {isAr ? "اعتبارات السلامة" : "Safety Considerations"}
              </div>
              <p className="text-muted-foreground">
                {isAr ? activeArt.safetyConsiderations.ar : activeArt.safetyConsiderations.en}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
              <div className="font-bold text-foreground">
                {isAr ? "مفاهيم خاطئة شائعة" : "Common Misconceptions"}
              </div>
              <p className="text-muted-foreground">
                {isAr ? activeArt.misconceptions.ar : activeArt.misconceptions.en}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground">
            <strong className="text-foreground">
              {isAr ? "مراجع معترف بها:" : "Neutral References:"}
            </strong>{" "}
            {activeArt.references.join(" · ")}
          </div>
        </div>
      </div>

      {/* Non-Aggressive Side-by-Side Comparison Explorer */}
      <div className="surface-card space-y-4 p-5" data-testid="non-aggressive-comparison">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
              <Scale className="size-4.5 text-primary" />
              {isAr
                ? "مقارنة تعليمية متزنة بين الفنون (دون تصنيف قتالي)"
                : "Non-Aggressive Side-by-Side Comparison"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "مقارنة للثقافة والحركة والتجهيز فقط — لا يوجد فن «أفضل» أو «أقوى»."
                : "Compares movement focus, training format, rules, and protective gear—never ranks styles as 'best' or 'deadliest'."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              {isAr ? "التخصص الأول" : "Discipline A"}
            </label>
            <select
              aria-label="Discipline A"
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
            >
              {MARTIAL_ARTS_DISCIPLINES.map((d) => (
                <option key={d.id} value={d.id}>
                  {isAr ? d.name.ar : d.name.en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              {isAr ? "التخصص الثاني" : "Discipline B"}
            </label>
            <select
              aria-label="Discipline B"
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
            >
              {MARTIAL_ARTS_DISCIPLINES.map((d) => (
                <option key={d.id} value={d.id}>
                  {isAr ? d.name.ar : d.name.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-start">
                <th className="py-2 pe-3 font-semibold text-muted-foreground">
                  {isAr ? "المحور" : "Dimension"}
                </th>
                <th className="py-2 px-3 font-bold text-primary">
                  {isAr ? artA.name.ar : artA.name.en}
                </th>
                <th className="py-2 ps-3 font-bold text-primary">
                  {isAr ? artB.name.ar : artB.name.en}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-2.5 pe-3 font-semibold text-foreground">
                  {isAr ? "التركيز الحركي" : "Movement Focus"}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {isAr ? artA.comparison.movementFocus.ar : artA.comparison.movementFocus.en}
                </td>
                <td className="py-2.5 ps-3 text-muted-foreground">
                  {isAr ? artB.comparison.movementFocus.ar : artB.comparison.movementFocus.en}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pe-3 font-semibold text-foreground">
                  {isAr ? "هيكل التدريب" : "Training Format"}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {isAr ? artA.comparison.trainingFormat.ar : artA.comparison.trainingFormat.en}
                </td>
                <td className="py-2.5 ps-3 text-muted-foreground">
                  {isAr ? artB.comparison.trainingFormat.ar : artB.comparison.trainingFormat.en}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pe-3 font-semibold text-foreground">
                  {isAr ? "إطار القوانين" : "Ruleset & Etiquette"}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {isAr ? artA.comparison.rulesetFocus.ar : artA.comparison.rulesetFocus.en}
                </td>
                <td className="py-2.5 ps-3 text-muted-foreground">
                  {isAr ? artB.comparison.rulesetFocus.ar : artB.comparison.rulesetFocus.en}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pe-3 font-semibold text-foreground">
                  {isAr ? "معدات الحماية" : "Protective Gear"}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {isAr ? artA.comparison.protectiveGear.ar : artA.comparison.protectiveGear.en}
                </td>
                <td className="py-2.5 ps-3 text-muted-foreground">
                  {isAr ? artB.comparison.protectiveGear.ar : artB.comparison.protectiveGear.en}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
