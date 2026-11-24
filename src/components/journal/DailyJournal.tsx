import { useMemo, useState } from "react";
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileJson,
  Flame,
  ListPlus,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import { useToast } from "@/components/common/ToastProvider";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useJournalActions, useJournalEntries, useStudyActions } from "@/hooks/use-modules";
import { useTaskActions } from "@/hooks/use-nexora";
import type { GrowthArea, JournalEntryRow, JournalMood } from "@/lib/firestore-data";
import { AREA_CONFIG, AREAS, type Area } from "@/lib/growth";
import { downloadTextFile } from "@/lib/safe-file";
import {
  buildJournalActivityHeatmap,
  computeJournalLongestStreak,
  computeJournalMoodBreakdown,
  countWordsAndReadingMinutes,
  DAILY_JOURNAL_PROMPTS,
  extractHashtags,
  filterJournalEntries,
  formatJournalJsonExport,
  formatJournalMarkdownExport,
  groupJournalEntriesByDate,
  JOURNAL_MOODS,
  summarizeJournalInsights,
} from "@/lib/journal";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export function DailyJournal() {
  const { t, lang, locale } = usePrefs();
  const toast = useToast();
  const { data: entries = [], isLoading } = useJournalEntries();
  const { addJournalEntry, updateJournalEntry, deleteJournalEntry } = useJournalActions();
  const { addTask } = useTaskActions();
  const { addStudyItem } = useStudyActions();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Composer state
  const [editingEntry, setEditingEntry] = useState<JournalEntryRow | null>(null);
  const [entryDate, setEntryDate] = useState(todayIso);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<GrowthArea>("academic");
  const [subject, setSubject] = useState("");
  const [mood, setMood] = useState<JournalMood>("focused");
  const [studyMinutes, setStudyMinutes] = useState("");
  const [reflection, setReflection] = useState("");
  const [keyWin, setKeyWin] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [blocker, setBlocker] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showDeepFields, setShowDeepFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter & timeline state
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState<GrowthArea | "all">("all");
  const [filterMood, setFilterMood] = useState<JournalMood | "all">("all");
  const [jumpDate, setJumpDate] = useState("");
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const insights = useMemo(() => summarizeJournalInsights(entries, todayIso), [entries, todayIso]);
  const longestStreak = useMemo(() => computeJournalLongestStreak(entries), [entries]);
  const heatmapCells = useMemo(
    () => buildJournalActivityHeatmap(entries, todayIso, 14),
    [entries, todayIso],
  );
  const moodStats = useMemo(() => computeJournalMoodBreakdown(entries), [entries]);
  const composerCounts = useMemo(() => countWordsAndReadingMinutes(reflection), [reflection]);

  const filteredEntries = useMemo(() => {
    const base = filterJournalEntries(entries, {
      search,
      area: filterArea,
      mood: filterMood,
    });
    if (!jumpDate) return base;
    return base.filter((e) => e.entry_date.slice(0, 10) === jumpDate);
  }, [entries, search, filterArea, filterMood, jumpDate]);

  const dateGroups = useMemo(
    () => groupJournalEntriesByDate(filteredEntries, todayIso),
    [filteredEntries, todayIso],
  );

  const resetForm = () => {
    setEditingEntry(null);
    setEntryDate(todayIso);
    setTitle("");
    setArea("academic");
    setSubject("");
    setMood("focused");
    setStudyMinutes("");
    setReflection("");
    setKeyWin("");
    setNextStep("");
    setBlocker("");
    setGratitude("");
    setTagsInput("");
    setShowDeepFields(false);
  };

  const handleLoadEdit = (entry: JournalEntryRow) => {
    setEditingEntry(entry);
    setEntryDate(entry.entry_date);
    setTitle(entry.title);
    setArea(entry.area);
    setSubject(entry.subject ?? "");
    setMood(entry.mood);
    setStudyMinutes(entry.study_minutes != null ? String(entry.study_minutes) : "");
    setReflection(entry.reflection);
    setKeyWin(entry.key_win ?? "");
    setNextStep(entry.next_step ?? "");
    setBlocker(entry.blocker ?? "");
    setGratitude(entry.gratitude ?? "");
    setTagsInput((entry.tags ?? []).join(", "));
    if (entry.blocker || entry.gratitude || (entry.tags && entry.tags.length > 0)) {
      setShowDeepFields(true);
    }
  };

  const handleApplyPrompt = (promptId: string) => {
    const template = DAILY_JOURNAL_PROMPTS.find((p) => p.id === promptId);
    if (!template) return;
    const promptText = t(template.promptKey);
    setArea(template.area);
    if (!title.trim()) {
      setTitle(lang === "ar" ? template.defaultTitleAr : template.defaultTitleEn);
    }
    setReflection((prev) => (prev.trim() ? `${promptText}\n\n${prev}` : `${promptText}\n`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reflection.trim()) return;
    setSubmitting(true);
    const parsedMinutes = studyMinutes.trim() ? Number(studyMinutes) : null;
    const manualTags = tagsInput
      .split(/[,\s]+/)
      .map((s) => s.trim().replace(/^#/, "").toLowerCase())
      .filter(Boolean);
    const inlineTags = extractHashtags(reflection);
    const mergedTags = Array.from(new Set([...manualTags, ...inlineTags])).slice(0, 8);

    try {
      if (editingEntry) {
        await updateJournalEntry(editingEntry, {
          entryDate,
          title: title.trim(),
          reflection: reflection.trim(),
          keyWin: keyWin.trim() || null,
          nextStep: nextStep.trim() || null,
          subject: subject.trim() || null,
          area,
          mood,
          studyMinutes:
            parsedMinutes !== null && !Number.isNaN(parsedMinutes) ? parsedMinutes : null,
          tags: mergedTags,
          blocker: blocker.trim() || null,
          gratitude: gratitude.trim() || null,
        });
        toast.success(t("journal.toastUpdated"));
      } else {
        await addJournalEntry({
          entryDate,
          title: title.trim(),
          reflection: reflection.trim(),
          keyWin: keyWin.trim() || null,
          nextStep: nextStep.trim() || null,
          subject: subject.trim() || null,
          area,
          mood,
          studyMinutes:
            parsedMinutes !== null && !Number.isNaN(parsedMinutes) ? parsedMinutes : null,
          tags: mergedTags,
          blocker: blocker.trim() || null,
          gratitude: gratitude.trim() || null,
        });
        toast.success(t("journal.toastSaved"));
      }
      resetForm();
    } catch {
      toast.error(t("journal.toastErr"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      if (editingEntry?.id === id) {
        resetForm();
      }
      toast.info(t("journal.toastDeleted"));
    } catch {
      toast.error(t("journal.toastErr"));
    }
  };

  const handleTurnIntoTask = async (entry: JournalEntryRow) => {
    try {
      await addTask({
        title: (entry.next_step || entry.title).slice(0, 200),
        details: entry.reflection.slice(0, 400),
        area: entry.area,
        subject: entry.subject,
        priority: "medium",
      });
      toast.success(t("journal.taskCreated"));
    } catch {
      toast.error(t("journal.toastErr"));
    }
  };

  const handleSaveAsNote = async (entry: JournalEntryRow) => {
    try {
      await addStudyItem({
        kind: "note",
        subject: entry.subject || "General",
        title: entry.title,
        content: entry.reflection,
        difficulty: "medium",
      });
      toast.success(t("journal.noteCreated"));
    } catch {
      toast.error(t("journal.toastErr"));
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    downloadTextFile(content, filename, mime);
  };

  const handleExportMarkdown = () => {
    if (entries.length === 0) return;
    downloadFile(
      formatJournalMarkdownExport(entries),
      `${BRAND.shortName.toLowerCase()}-journal-${todayIso}.md`,
      "text/markdown;charset=utf-8",
    );
  };

  const handleExportJson = () => {
    if (entries.length === 0) return;
    downloadFile(
      formatJournalJsonExport(entries),
      `${BRAND.shortName.toLowerCase()}-journal-${todayIso}.json`,
      "application/json;charset=utf-8",
    );
  };

  const toggleDateGroup = (dateIso: string) => {
    setCollapsedDates((prev) => ({ ...prev, [dateIso]: !prev[dateIso] }));
  };

  return (
    <div data-testid="daily-journal-section" className="space-y-6">
      {/* Header & Summary Strip */}
      <div className="surface-card p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4.5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                {t("journal.title")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("journal.sub")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <FeatureGuideTrigger featureId="daily-journal" />
            <span className="border-s-2 border-xp ps-2.5 text-xs font-semibold text-xp">
              {t("journal.xpBadge")}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExportMarkdown}
              disabled={entries.length === 0}
              data-testid="journal-export-btn"
            >
              <Download className="size-3.5" />
              <span>{t("journal.export")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExportJson}
              disabled={entries.length === 0}
              data-testid="journal-export-json-btn"
            >
              <FileJson className="size-3.5" />
              <span>{t("journal.exportJson")}</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("journal.stat.entries")}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-foreground">
              {formatNumber(insights.totalEntries, lang)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="flex items-center gap-1 text-[0.7rem] font-medium text-muted-foreground">
              <Flame className="size-3 text-xp" />
              <span>{t("journal.stat.streak")}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2 font-display text-xl font-bold tabular-nums text-foreground">
              <span>{formatNumber(insights.streakDays, lang)}d</span>
              {longestStreak > insights.streakDays && (
                <span className="text-[0.65rem] font-normal text-muted-foreground">
                  / {formatNumber(longestStreak, lang)}d
                </span>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("journal.stat.words")}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-foreground">
              {formatNumber(insights.totalWords, lang)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("journal.stat.minutes")}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-primary">
              {formatNumber(insights.totalStudyMinutes, lang)} {t("pomo.minutesUnit")}
            </div>
          </div>
        </div>

        {/* 14-Day Activity Heatmap & Mindset Breakdown */}
        <div className="mt-4 grid gap-4 border-t border-border/70 pt-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[0.72rem] font-semibold text-muted-foreground">
              <span>{t("journal.heatmap")}</span>
              <span className="tabular-nums">{formatNumber(heatmapCells.length, lang)}d</span>
            </div>
            <div className="grid grid-cols-14 gap-1" data-testid="journal-heatmap">
              {heatmapCells.map((cell) => {
                const bg =
                  cell.level === 4
                    ? "bg-primary border-primary"
                    : cell.level === 3
                      ? "bg-primary/70 border-primary/70"
                      : cell.level === 2
                        ? "bg-primary/45 border-primary/40"
                        : cell.level === 1
                          ? "bg-primary/20 border-primary/25"
                          : "bg-surface-2 border-border";
                return (
                  <button
                    key={cell.dateIso}
                    type="button"
                    onClick={() =>
                      setJumpDate((prev) => (prev === cell.dateIso ? "" : cell.dateIso))
                    }
                    title={`${cell.dateIso}: ${cell.count} · ${cell.minutes}m`}
                    aria-label={`${cell.dateIso}: ${cell.count}`}
                    className={`h-5 rounded-sm border transition-transform hover:scale-105 ${bg} ${
                      jumpDate === cell.dateIso ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[0.72rem] font-semibold text-muted-foreground">
              {t("journal.moodBreakdown")}
            </div>
            {moodStats.length === 0 ? (
              <div className="text-xs text-muted-foreground">—</div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex h-2.5 w-full overflow-hidden rounded-sm bg-surface-2">
                  {moodStats.map((stat) => {
                    const meta = JOURNAL_MOODS.find((m) => m.id === stat.mood);
                    return (
                      <div
                        key={stat.mood}
                        style={{
                          width: `${Math.max(stat.pct, 4)}%`,
                          backgroundColor: meta?.accentColor ?? "var(--primary)",
                        }}
                        title={`${t(meta?.labelKey ?? "journal.mood.focused")}: ${stat.pct}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-muted-foreground">
                  {moodStats.map((stat) => {
                    const meta = JOURNAL_MOODS.find((m) => m.id === stat.mood);
                    return (
                      <span key={stat.mood} className="inline-flex items-center gap-1 tabular-nums">
                        <span
                          className="size-2 rounded-sm"
                          style={{ backgroundColor: meta?.accentColor }}
                        />
                        <span>{t(meta?.labelKey ?? "journal.mood.focused")}</span>
                        <span className="font-semibold text-foreground">{stat.pct}%</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-column workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          data-testid="journal-form"
          className="surface-card space-y-4 p-5 lg:col-span-5"
        >
          <div className="space-y-2 border-b border-border/70 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {t("journal.promptsTitle")}
              </span>
              {editingEntry && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                  <span>{t("journal.cancelEdit")}</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DAILY_JOURNAL_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPrompt(p.id)}
                  className="rounded-md border border-border bg-surface-2 px-2.5 py-1 text-start text-[0.7rem] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {lang === "ar" ? p.defaultTitleAr : p.defaultTitleEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="jn-date" className="text-xs">
                {t("journal.field.date")}
              </Label>
              <Input
                id="jn-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jn-minutes" className="text-xs">
                {t("journal.field.minutes")}
              </Label>
              <Input
                id="jn-minutes"
                type="number"
                min={0}
                max={720}
                value={studyMinutes}
                onChange={(e) => setStudyMinutes(e.target.value)}
                placeholder="45"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="jn-title" className="text-xs">
              {t("journal.field.title")}
            </Label>
            <Input
              id="jn-title"
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("journal.field.titlePh")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="jn-area" className="text-xs">
                {t("journal.field.area")}
              </Label>
              <ModernSelect
                id="jn-area"
                value={area}
                onValueChange={(v) => setArea(v as GrowthArea)}
                ariaLabel={t("journal.field.area")}
                options={AREAS.map((a) => ({ value: a, label: t(AREA_CONFIG[a].labelKey) }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jn-subject" className="text-xs">
                {t("journal.field.subject")}
              </Label>
              <Input
                id="jn-subject"
                maxLength={60}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("journal.field.subjectPh")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-foreground">{t("journal.field.mood")}</span>
            <div className="grid grid-cols-3 gap-1.5">
              {JOURNAL_MOODS.map((m) => {
                const active = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    aria-pressed={active}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(m.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="jn-reflection" className="text-xs">
                {t("journal.field.reflection")}
              </Label>
              <span className="text-[0.68rem] tabular-nums text-muted-foreground">
                {formatNumber(composerCounts.words, lang)} {t("journal.wordCount")}
                {composerCounts.readingMinutes > 0
                  ? ` · ${formatNumber(composerCounts.readingMinutes, lang)} ${t("journal.readMin")}`
                  : ""}
              </span>
            </div>
            <textarea
              id="jn-reflection"
              required
              rows={4}
              maxLength={4000}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={t("journal.field.reflectionPh")}
              className="w-full rounded-md border border-input bg-surface-2 px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="jn-win" className="text-xs">
                {t("journal.field.keyWin")}
              </Label>
              <Input
                id="jn-win"
                maxLength={300}
                value={keyWin}
                onChange={(e) => setKeyWin(e.target.value)}
                placeholder={t("journal.field.keyWinPh")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jn-next" className="text-xs">
                {t("journal.field.nextStep")}
              </Label>
              <Input
                id="jn-next"
                maxLength={300}
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder={t("journal.field.nextStepPh")}
              />
            </div>
          </div>

          {/* Optional Structured Prompts (Blocker / Gratitude / Tags) */}
          <div className="border-t border-border/60 pt-2">
            <button
              type="button"
              onClick={() => setShowDeepFields((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              {showDeepFields ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              <span>
                {t("journal.field.blocker")} / {t("journal.field.gratitude")} /{" "}
                {t("journal.field.tags")}
              </span>
            </button>

            {showDeepFields && (
              <div className="mt-3 space-y-2.5">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="jn-blocker" className="text-xs">
                      {t("journal.field.blocker")}
                    </Label>
                    <Input
                      id="jn-blocker"
                      maxLength={300}
                      value={blocker}
                      onChange={(e) => setBlocker(e.target.value)}
                      placeholder={t("journal.field.blockerPh")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="jn-gratitude" className="text-xs">
                      {t("journal.field.gratitude")}
                    </Label>
                    <Input
                      id="jn-gratitude"
                      maxLength={300}
                      value={gratitude}
                      onChange={(e) => setGratitude(e.target.value)}
                      placeholder={t("journal.field.gratitudePh")}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jn-tags" className="text-xs">
                    {t("journal.field.tags")}
                  </Label>
                  <Input
                    id="jn-tags"
                    maxLength={120}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="#algebra, #deepwork"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="glow"
            className="w-full"
            disabled={submitting}
            data-testid="journal-submit-btn"
          >
            {editingEntry ? <CheckCircle2 className="size-4" /> : <Plus className="size-4" />}
            <span>{editingEntry ? t("journal.update") : t("journal.save")}</span>
          </Button>
        </form>

        {/* Entries Timeline Grouped by Date + Filters */}
        <div className="space-y-4 lg:col-span-7">
          <div className="surface-card flex flex-col gap-2.5 p-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-44 flex-1">
              <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("journal.filter.search")}
                aria-label={t("journal.filter.search")}
                className="ps-8 text-xs"
              />
            </div>
            <ModernSelect
              ariaLabel={t("journal.field.area")}
              value={filterArea}
              onValueChange={(v) => setFilterArea(v as GrowthArea | "all")}
              className="w-auto min-w-[130px]"
              options={[
                { value: "all", label: t("journal.filter.allAreas") },
                ...AREAS.map((a) => ({ value: a, label: t(AREA_CONFIG[a].labelKey) })),
              ]}
            />
            <ModernSelect
              ariaLabel={t("journal.field.mood")}
              value={filterMood}
              onValueChange={(v) => setFilterMood(v as JournalMood | "all")}
              className="w-auto min-w-[130px]"
              options={[
                { value: "all", label: t("journal.filter.allMoods") },
                ...JOURNAL_MOODS.map((m) => ({ value: m.id, label: t(m.labelKey) })),
              ]}
            />
            <div className="flex items-center gap-1">
              <Input
                type="date"
                aria-label={t("journal.jumpDate")}
                title={t("journal.jumpDate")}
                value={jumpDate}
                onChange={(e) => setJumpDate(e.target.value)}
                className="h-9 w-36 text-xs"
              />
              {jumpDate && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setJumpDate("")}
                  aria-label={t("common.clear")}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="surface-card p-6 text-xs text-muted-foreground">…</div>
          ) : dateGroups.length === 0 ? (
            <div
              data-testid="journal-empty-state"
              className="surface-card flex flex-col items-center justify-center gap-2 p-8 text-center"
            >
              <BookOpen className="size-7 text-muted-foreground" />
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                {t("journal.empty")}
              </p>
            </div>
          ) : (
            <div className="space-y-5" data-testid="journal-entries-list">
              {dateGroups.map((group) => {
                const collapsed = Boolean(collapsedDates[group.dateIso]);
                const dateLabel =
                  group.relativeKind === "today"
                    ? `${t("prod.cal.today")} · ${formatDate(
                        `${group.dateIso}T12:00:00Z`,
                        { lang, calendar: locale.calendar },
                        "medium",
                      )}`
                    : group.relativeKind === "yesterday"
                      ? `${t("journal.yesterday")} · ${formatDate(
                          `${group.dateIso}T12:00:00Z`,
                          { lang, calendar: locale.calendar },
                          "medium",
                        )}`
                      : formatDate(
                          `${group.dateIso}T12:00:00Z`,
                          { lang, calendar: locale.calendar },
                          "long",
                        );

                return (
                  <section
                    key={group.dateIso}
                    data-testid={`journal-date-group-${group.dateIso}`}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-1.5">
                      <button
                        type="button"
                        onClick={() => toggleDateGroup(group.dateIso)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary"
                        aria-expanded={!collapsed}
                      >
                        <CalendarIcon className="size-3.5 text-primary" />
                        <span>{dateLabel}</span>
                        <span className="font-normal text-muted-foreground tabular-nums">
                          ({formatNumber(group.entries.length, lang)})
                        </span>
                      </button>

                      <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                        {group.totalStudyMinutes > 0 && (
                          <span className="font-semibold tabular-nums text-primary">
                            {formatNumber(group.totalStudyMinutes, lang)} {t("pomo.minutesUnit")}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleDateGroup(group.dateIso)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={t("journal.collapseDay")}
                        >
                          {collapsed ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronUp className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {!collapsed && (
                      <div className="space-y-3">
                        {group.entries.map((entry) => {
                          const areaCfg = AREA_CONFIG[entry.area as Area] ?? AREA_CONFIG.academic;
                          const moodCfg =
                            JOURNAL_MOODS.find((m) => m.id === entry.mood) ?? JOURNAL_MOODS[0]!;

                          return (
                            <article
                              key={entry.id}
                              data-testid={`journal-card-${entry.id}`}
                              className="surface-card space-y-3 p-4 md:p-5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2 text-[0.72rem] text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 font-medium tabular-nums text-foreground">
                                      <CalendarIcon className="size-3 text-primary" />
                                      {formatDate(
                                        `${entry.entry_date}T12:00:00Z`,
                                        { lang, calendar: locale.calendar },
                                        "medium",
                                      )}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span
                                      className="font-semibold"
                                      style={{ color: areaCfg.accentColor }}
                                    >
                                      {t(areaCfg.labelKey)}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span style={{ color: moodCfg.accentColor }}>
                                      {t(moodCfg.labelKey)}
                                    </span>
                                    {entry.subject && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span>{entry.subject}</span>
                                      </>
                                    )}
                                    {typeof entry.study_minutes === "number" &&
                                      entry.study_minutes > 0 && (
                                        <>
                                          <span aria-hidden="true">·</span>
                                          <span className="tabular-nums">
                                            {formatNumber(entry.study_minutes, lang)}{" "}
                                            {t("pomo.minutesUnit")}
                                          </span>
                                        </>
                                      )}
                                  </div>
                                  <h3 className="font-display text-sm font-bold text-foreground md:text-base">
                                    {entry.title}
                                  </h3>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleLoadEdit(entry)}
                                    aria-label={t("journal.edit")}
                                  >
                                    <Pencil className="size-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(entry.id)}
                                    aria-label={t("common.delete")}
                                  >
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/90 sm:text-sm">
                                {entry.reflection}
                              </p>

                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-medium text-primary">
                                  {entry.tags.map((tg) => (
                                    <button
                                      key={tg}
                                      type="button"
                                      onClick={() => setSearch(tg)}
                                      className="hover:underline"
                                    >
                                      #{tg}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {(entry.key_win ||
                                entry.next_step ||
                                entry.blocker ||
                                entry.gratitude) && (
                                <div className="grid grid-cols-1 gap-2 border-t border-border/70 pt-3 sm:grid-cols-2">
                                  {entry.key_win && (
                                    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs">
                                      <span className="font-semibold text-success">
                                        {t("journal.field.keyWin")}:{" "}
                                      </span>
                                      <span className="text-foreground/90">{entry.key_win}</span>
                                    </div>
                                  )}
                                  {entry.next_step && (
                                    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs">
                                      <span className="font-semibold text-primary">
                                        {t("journal.field.nextStep")}:{" "}
                                      </span>
                                      <span className="text-foreground/90">{entry.next_step}</span>
                                    </div>
                                  )}
                                  {entry.blocker && (
                                    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs">
                                      <span className="font-semibold text-xp">
                                        {t("journal.field.blocker")}:{" "}
                                      </span>
                                      <span className="text-foreground/90">{entry.blocker}</span>
                                    </div>
                                  )}
                                  {entry.gratitude && (
                                    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs">
                                      <span className="font-semibold text-foreground">
                                        {t("journal.field.gratitude")}:{" "}
                                      </span>
                                      <span className="text-foreground/90">{entry.gratitude}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Convert Reflection Actions */}
                              <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[0.7rem]"
                                  onClick={() => handleTurnIntoTask(entry)}
                                >
                                  <ListPlus className="size-3" />
                                  <span>{t("journal.toTask")}</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[0.7rem]"
                                  onClick={() => handleSaveAsNote(entry)}
                                >
                                  <NotebookPen className="size-3" />
                                  <span>{t("journal.toNote")}</span>
                                </Button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
