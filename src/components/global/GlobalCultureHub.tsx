import { useMemo, useState } from "react";
import { BookOpen, Clock, Globe2, Landmark, Languages, Plus, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOK_CLUB_CATALOG,
  GLOBAL_TOPICS,
  HISTORY_TIMELINE_EVENTS,
  LANGUAGE_PHRASES,
  MUSEUM_ARTIFACTS,
  WORLD_CULTURES,
} from "@/data/global-culture";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem, type BookReadingStatus } from "@/lib/student-ecosystem";

type CultureTab = "museum" | "timeline" | "cultures" | "languages" | "global" | "books";

export function GlobalCultureHub() {
  const { lang, speakText, speechSupported } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const [tab, setTab] = useState<CultureTab>("museum");

  // #31 & #46 Timeline filters + custom student timeline
  const [eraFilter, setEraFilter] = useState<
    "All" | "Ancient" | "Golden Age" | "Early Modern" | "Computing"
  >("All");
  const [customTitle, setCustomTitle] = useState("");
  const [customYear, setCustomYear] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const filteredHistory = useMemo(
    () =>
      eraFilter === "All"
        ? HISTORY_TIMELINE_EVENTS
        : HISTORY_TIMELINE_EVENTS.filter((e) => e.era === eraFilter),
    [eraFilter],
  );

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customYear.trim()) return;
    updateEco((prev) => ({
      ...prev,
      customTimelines: [
        ...prev.customTimelines,
        {
          id: `tl_${Date.now().toString(36)}`,
          title: customTitle.trim(),
          yearLabel: customYear.trim(),
          category: "Student Research",
          description: customDesc.trim() || "Added to personal study timeline.",
        },
      ],
    }));
    setCustomTitle("");
    setCustomYear("");
    setCustomDesc("");
    toast.success(isAr ? "تمت إضافة الحدث للخط الزمني" : "Added event to your custom timeline");
  };

  const tabs: Array<{ id: CultureTab; label: string; icon: typeof Landmark }> = [
    { id: "museum", label: isAr ? "المتحف العالمي" : "30. World Museum", icon: Landmark },
    { id: "timeline", label: isAr ? "آلة الزمن والخط الزمني" : "31/46. Timelines", icon: Clock },
    { id: "cultures", label: isAr ? "أطلس الثقافات" : "32. World Cultures", icon: Globe2 },
    { id: "languages", label: isAr ? "اكتشاف اللغات" : "33. Languages", icon: Languages },
    { id: "global", label: isAr ? "قضايا عالمية" : "34. Global Topics", icon: Globe2 },
    { id: "books", label: isAr ? "نادي القراءة" : "35. Book Club", icon: BookOpen },
  ];

  return (
    <div className="surface-card p-5 space-y-4" data-testid="global-culture-hub">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">
            {isAr ? "الثقافة والتاريخ والاستكشاف العالمي" : "Culture, History & Global Discovery"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "متحف افتراضي، خط زمني تفاعلي، أطلس حضارات، عبارات لغوية بالصوت، ونادي القراءة."
              : "Explore historical artifacts with provenance notes, custom study timelines, world cultures, spoken languages, global issues, and curated reading."}
          </p>
        </div>
        <FeatureGuideTrigger featureId="global-culture" />
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                tab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* #30 VIRTUAL WORLD MUSEUM */}
      {tab === "museum" && (
        <div className="grid gap-3 md:grid-cols-2">
          {MUSEUM_ARTIFACTS.map((art) => (
            <article
              key={art.id}
              className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-primary font-semibold">
                  {art.accessionNo}
                </span>
                <span className="text-[11px] text-muted-foreground">{art.era}</span>
              </div>
              <h3 className="text-sm font-bold font-display text-foreground">{art.title}</h3>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Provenance:</strong> {art.provenance}
              </p>
              <p className="text-muted-foreground">{art.context}</p>
              <p className="text-foreground/90 font-medium">Significance: {art.significance}</p>
            </article>
          ))}
        </div>
      )}

      {/* #31 & #46 HISTORY TIME MACHINE + CUSTOM TIMELINES */}
      {tab === "timeline" && (
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {(["All", "Ancient", "Golden Age", "Early Modern", "Computing"] as const).map((era) => (
              <button
                key={era}
                type="button"
                onClick={() => setEraFilter(era)}
                className={`rounded-md border px-2.5 py-1 font-semibold ${
                  eraFilter === era
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground"
                }`}
              >
                {era}
              </button>
            ))}
          </div>
          <div className="space-y-2 border-s-2 border-primary/40 ps-4">
            {filteredHistory.map((ev) => (
              <div
                key={ev.id}
                className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-primary">{ev.yearLabel}</span>
                  <span className="text-[11px] text-muted-foreground">{ev.sourceNote}</span>
                </div>
                <div className="font-bold text-foreground">{ev.title}</div>
                <p className="text-muted-foreground">{ev.summary}</p>
              </div>
            ))}
            {eco.customTimelines.map((ev) => (
              <div
                key={ev.id}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-400">
                    {ev.yearLabel} · Student Custom
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateEco((prev) => ({
                        ...prev,
                        customTimelines: prev.customTimelines.filter((item) => item.id !== ev.id),
                      }))
                    }
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete timeline event"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="font-bold text-foreground">{ev.title}</div>
                <p className="text-muted-foreground">{ev.description}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAddTimelineEvent}
            className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-2"
          >
            <div className="font-bold text-foreground">Add Milestone to Your Study Timeline</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                placeholder="Year / Milestone Date"
                className="text-xs"
              />
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Event title"
                className="text-xs sm:col-span-2"
              />
            </div>
            <div className="flex gap-2">
              <Input
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Short summary or source..."
                className="text-xs flex-1"
              />
              <Button type="submit" size="sm" className="h-9 text-xs">
                <Plus className="size-3.5 me-1" />
                Add Event
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* #32 WORLD CULTURES ATLAS */}
      {tab === "cultures" && (
        <div className="grid gap-3 md:grid-cols-2 text-xs">
          {WORLD_CULTURES.map((cul) => (
            <div
              key={cul.id}
              className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-1.5"
            >
              <div className="text-sm font-bold text-foreground">{cul.region}</div>
              <div className="text-primary font-mono text-[11px]">Languages: {cul.languages}</div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Heritage:</strong> {cul.heritage}
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Culinary & Hospitality:</strong>{" "}
                {cul.cuisineNote}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* #33 LANGUAGE DISCOVERY */}
      {tab === "languages" && (
        <div className="grid gap-3 md:grid-cols-2 text-xs">
          {LANGUAGE_PHRASES.map((item) => (
            <div
              key={item.langName}
              className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-primary">{item.langName}</span>
                {speechSupported && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => speakText(item.phrase)}
                    className="h-7 text-xs"
                  >
                    <Volume2 className="size-3.5 me-1" />
                    Listen
                  </Button>
                )}
              </div>
              <div className="text-base font-bold text-foreground">{item.phrase}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{item.romanized}</div>
              <p className="text-foreground/90">{item.meaning}</p>
            </div>
          ))}
        </div>
      )}

      {/* #34 GLOBAL KNOWLEDGE EXPLORER */}
      {tab === "global" && (
        <div className="space-y-3 text-xs">
          {GLOBAL_TOPICS.map((topic) => (
            <div
              key={topic.id}
              className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">{topic.title}</h3>
                <span className="font-mono text-[11px] text-primary">
                  {topic.disciplines.join(" · ")}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">{topic.citation}</div>
              <p className="text-foreground/90">{topic.takeaway}</p>
            </div>
          ))}
        </div>
      )}

      {/* #35 BOOK DISCOVERY CLUB */}
      {tab === "books" && (
        <div className="grid gap-3 md:grid-cols-2 text-xs">
          {BOOK_CLUB_CATALOG.map((book) => {
            const status = eco.bookReadingList[book.id] ?? "want_to_read";
            const note = eco.bookNotes[book.id] ?? "";
            return (
              <div
                key={book.id}
                className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-foreground">{book.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {book.author} · {book.theme}
                    </div>
                  </div>
                  <ModernSelect
                    ariaLabel={`Reading status for ${book.title}`}
                    size="sm"
                    value={status}
                    className="w-36 shrink-0"
                    onValueChange={(nextStatus) => {
                      updateEco((prev) => ({
                        ...prev,
                        bookReadingList: {
                          ...prev.bookReadingList,
                          [book.id]: nextStatus as BookReadingStatus,
                        },
                      }));
                    }}
                    options={[
                      { value: "want_to_read", label: "Want to Read" },
                      { value: "reading", label: "Reading" },
                      { value: "finished", label: "Finished" },
                    ]}
                  />
                </div>
                <p className="text-muted-foreground">{book.summary}</p>
                <Textarea
                  rows={2}
                  value={note}
                  onChange={(e) =>
                    updateEco((prev) => ({
                      ...prev,
                      bookNotes: { ...prev.bookNotes, [book.id]: e.target.value },
                    }))
                  }
                  placeholder="Write a personal takeaway or discussion question..."
                  className="text-xs"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
