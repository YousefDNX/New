import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Compass,
  GraduationCap,
  Layers,
  Lock,
  Rocket,
  Search,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { EnglishAdventureWorld } from "@/components/english/EnglishAdventureWorld";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZERO_TO_HERO_JOURNEYS } from "@/data/curriculum-and-challenges";
import { FOUNDATIONAL_LEARNING_TRACKS } from "@/data/open-learning-library";
import { ADAPTIVE_LEARNING_PATHS } from "@/data/skill-academy";
import { LITERACY_ACCESS_LESSONS } from "@/lib/empowerment-engines";
import { computeLearningPathState } from "@/lib/skill-academy";
import { speakEnglishText } from "@/lib/english-speech";
import { playCorrectSound, playIncorrectSound } from "@/lib/sound-effects";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type SkillDirectoryCategory =
  "all" | "language" | "academic_thinking" | "digital" | "personal_practical";

interface SkillDirectoryItem {
  id: string;
  category: Exclude<SkillDirectoryCategory, "all">;
  categoryLabel: string;
  title: string;
  subSkills: string[];
  actionLabel: string;
  viewModeTarget?: "english_world" | "adaptive_paths" | "zero_to_hero" | "literacy_access";
  studyTabTarget?: "flashcards" | "unit3_vocab" | "quiz";
  routeTarget?: "/app/english" | "/app/study" | "/app/level-up";
}

const BTC_SKILL_DIRECTORY: SkillDirectoryItem[] = [
  {
    id: "dir_english_academies",
    category: "language",
    categoryLabel: "Language",
    title: "7 Dedicated English Academies",
    subSkills: [
      "Listening",
      "Reading",
      "Writing",
      "Vocabulary",
      "Grammar",
      "Speaking",
      "Pronunciation",
    ],
    actionLabel: "Open English World",
    viewModeTarget: "english_world",
  },
  {
    id: "dir_unit3_vocab",
    category: "language",
    categoryLabel: "Language",
    title: "Grade 9 Unit 3 British Vocabulary",
    subSkills: [
      "24 Words",
      "Flavour & Fibre Spelling",
      "Conditional Arabic Audio",
      "5 Graded Quizzes",
    ],
    actionLabel: "Open Unit 3 Arena",
    studyTabTarget: "unit3_vocab",
    routeTarget: "/app/study",
  },
  {
    id: "dir_zero_to_hero",
    category: "academic_thinking",
    categoryLabel: "Academic & Thinking",
    title: "From Zero to Hero & Foundational Center",
    subSkills: ["STEM Reasoning", "Math From Zero", "Critical Logic", "Study Strategies"],
    actionLabel: "Open Adaptive Paths",
    viewModeTarget: "adaptive_paths",
  },
  {
    id: "dir_literacy_foundations",
    category: "academic_thinking",
    categoryLabel: "Academic & Thinking",
    title: "Literacy & 10 Equal-Access Foundations",
    subSkills: ["Syllable Chunking", "Slow Read-Aloud", "Worked Examples", "Diagnostic Checks"],
    actionLabel: "Open Foundations",
    viewModeTarget: "literacy_access",
  },
  {
    id: "dir_typing_research",
    category: "digital",
    categoryLabel: "Digital",
    title: "Desktop & Mobile Typing + Digital Research",
    subSkills: [
      "10-Finger Typing",
      "Touch Typing WPM",
      "Source Verification",
      "APA & MLA Citations",
    ],
    actionLabel: "Open Practical Lab",
    routeTarget: "/app/study",
  },
  {
    id: "dir_ai_explorer",
    category: "digital",
    categoryLabel: "Digital",
    title: "Citadel Adventure World & Portfolio Readiness",
    subSkills: [
      "Interactive 5-Zone Quest",
      "Project Building",
      "Time Matrix",
      "Financial Literacy",
    ],
    actionLabel: "Explore Citadel",
    routeTarget: "/app/level-up",
  },
  {
    id: "dir_communication_finance",
    category: "personal_practical",
    categoryLabel: "Personal & Practical",
    title: "Public Speaking, Financial & Life Skills",
    subSkills: [
      "PREP Speaking",
      "Presentation Outliner",
      "Student Budgeting",
      "Eisenhower Prioritization",
    ],
    actionLabel: "Open Skills & Level-Up",
    routeTarget: "/app/level-up",
  },
];

export function SkillAcademyWorkspace({
  onNavigateStudyTab,
}: {
  onNavigateStudyTab?: (tab: "flashcards" | "unit3_vocab" | "quiz") => void;
}) {
  const { state, update } = useStudentEcosystem();
  const [viewMode, setViewMode] = useState<
    "english_world" | "adaptive_paths" | "zero_to_hero" | "literacy_access"
  >("english_world");
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [directoryCategory, setDirectoryCategory] = useState<SkillDirectoryCategory>("all");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [litAnswers, setLitAnswers] = useState<Record<string, number>>({});
  const [selectedFoundationId, setSelectedFoundationId] = useState<string>(
    FOUNDATIONAL_LEARNING_TRACKS[0]!.id,
  );
  const [foundationAnswers, setFoundationAnswers] = useState<Record<string, number>>({});
  const [activeCheckStepId, setActiveCheckStepId] = useState<string | null>(null);
  const [stepCheckChoice, setStepCheckChoice] = useState<number | null>(null);

  const filteredDirectory = useMemo(() => {
    const q = directoryQuery.trim().toLowerCase();
    return BTC_SKILL_DIRECTORY.filter((item) => {
      if (directoryCategory !== "all" && item.category !== directoryCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.subSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [directoryCategory, directoryQuery]);

  const pathEvaluation = useMemo(
    () =>
      computeLearningPathState({
        pathId: state.activeLearningPathId,
        masteredSteps: state.masteredPathSteps,
        viewedSteps: state.viewedPathSteps,
        stepScores: state.pathStepScores,
        placement: state.placement,
      }),
    [
      state.activeLearningPathId,
      state.masteredPathSteps,
      state.viewedPathSteps,
      state.pathStepScores,
      state.placement,
    ],
  );

  const handleMarkStepViewed = (stepId: string) => {
    update((prev) => {
      if (prev.viewedPathSteps.includes(stepId)) return prev;
      return {
        ...prev,
        viewedPathSteps: [...prev.viewedPathSteps, stepId],
      };
    });
  };

  const handleSubmitPathCheck = (stepId: string, minMasteryScore: number, correctIndex: number) => {
    if (stepCheckChoice === null) return;
    const passed = stepCheckChoice === correctIndex;
    const score = passed ? 100 : 40;
    update((prev) => {
      const viewed = prev.viewedPathSteps.includes(stepId)
        ? prev.viewedPathSteps
        : [...prev.viewedPathSteps, stepId];
      const prevBest = prev.pathStepScores[stepId] ?? 0;
      const best = Math.max(prevBest, score);
      const shouldMaster = best >= minMasteryScore;
      const mastered =
        shouldMaster && !prev.masteredPathSteps.includes(stepId)
          ? [...prev.masteredPathSteps, stepId]
          : prev.masteredPathSteps;
      return {
        ...prev,
        viewedPathSteps: viewed,
        pathStepScores: { ...prev.pathStepScores, [stepId]: best },
        masteredPathSteps: mastered,
      };
    });
    if (passed) {
      playCorrectSound();
      toast.success("Mastery check passed! Next unlocked stage ready.");
      setActiveCheckStepId(null);
      setStepCheckChoice(null);
    } else {
      playIncorrectSound();
      toast.error(
        `Scored 40% (below ${minMasteryScore}% threshold). Review the summary and retry!`,
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "english_world" ? "glow" : "outline"}
            onClick={() => setViewMode("english_world")}
            className="h-9 gap-1.5 text-xs"
          >
            <GraduationCap className="size-3.5" />
            <span>English Adventure World & Academies</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "adaptive_paths" ? "glow" : "outline"}
            onClick={() => setViewMode("adaptive_paths")}
            className="h-9 gap-1.5 text-xs"
          >
            <Compass className="size-3.5" />
            <span>Cross-Subject Adaptive Paths (English, STEM &amp; Future)</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "zero_to_hero" ? "glow" : "outline"}
            onClick={() => setViewMode("zero_to_hero")}
            className="h-9 gap-1.5 text-xs"
          >
            <Rocket className="size-3.5" />
            <span>From Zero to Hero Journeys</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "literacy_access" ? "glow" : "outline"}
            onClick={() => setViewMode("literacy_access")}
            className="h-9 gap-1.5 text-xs"
          >
            <BookOpenCheck className="size-3.5" />
            <span>Foundational Center &amp; Literacy &amp; Learning Access</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={directoryOpen ? "glow" : "outline"}
            onClick={() => setDirectoryOpen((v) => !v)}
            className="h-9 gap-1.5 text-xs"
            data-testid="skill-directory-toggle"
          >
            <Layers className="size-3.5" />
            <span>Skill Directory (4 Categories)</span>
            <ChevronDown
              className={`size-3.5 transition-transform ${directoryOpen ? "rotate-180" : ""}`}
            />
          </Button>
          <Link
            to="/app/english"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Open Dedicated English Page</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {directoryOpen && (
        <div className="surface-card space-y-3 p-4 text-xs" data-testid="skill-academy-directory">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: "All Categories" },
                  { id: "language", label: "Language" },
                  { id: "academic_thinking", label: "Academic & Thinking" },
                  { id: "digital", label: "Digital" },
                  { id: "personal_practical", label: "Personal & Practical" },
                ] as const
              ).map((cat) => (
                <Button
                  key={cat.id}
                  type="button"
                  size="sm"
                  variant={directoryCategory === cat.id ? "glow" : "outline"}
                  onClick={() => setDirectoryCategory(cat.id)}
                  className="h-7 text-[11px]"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-80 lg:w-96">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={directoryQuery}
                onChange={(e) => setDirectoryQuery(e.target.value)}
                placeholder="Search skills or sub-skills..."
                className="h-8 ps-8 text-xs"
                aria-label="Search skills directory"
              />
            </div>
          </div>

          {filteredDirectory.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface-2 p-3 text-muted-foreground">
              No skills matched &ldquo;{directoryQuery}&rdquo;. Try clearing the search filter.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredDirectory.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-3.5 space-y-2"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.categoryLabel}
                    </div>
                    <div className="font-display text-sm font-bold text-foreground">
                      {item.title}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.subSkills.map((sub) => (
                        <span
                          key={sub}
                          className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1">
                    {item.viewModeTarget ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-full justify-between text-[11px]"
                        onClick={() => setViewMode(item.viewModeTarget!)}
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    ) : item.studyTabTarget && onNavigateStudyTab ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-full justify-between text-[11px]"
                        onClick={() => onNavigateStudyTab(item.studyTabTarget!)}
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    ) : (
                      <Link
                        to={item.routeTarget ?? "/app/study"}
                        className="inline-flex h-7 w-full items-center justify-between rounded-md border border-border bg-surface px-2.5 text-[11px] font-medium text-foreground hover:border-primary/50"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === "english_world" ? (
        <EnglishAdventureWorld {...(onNavigateStudyTab ? { onNavigateStudyTab } : {})} />
      ) : viewMode === "zero_to_hero" ? (
        <div className="space-y-4" data-testid="zero-to-hero-panel">
          <div className="surface-card space-y-1 p-5 text-xs">
            <h3 className="font-display text-base font-bold text-foreground">
              From Zero to Hero — Structured Mastery Journeys
            </h3>
            <p className="text-muted-foreground">
              Go from complete beginner to confident practitioner with verified diagnostic, map,
              practice, and portfolio stages.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ZERO_TO_HERO_JOURNEYS.map((journey) => {
              const doneStages = state.zeroToHeroProgress[journey.id] ?? [];
              const pct = Math.round((doneStages.length / journey.stages.length) * 100);
              return (
                <div key={journey.id} className="surface-card space-y-3 p-5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {journey.skillDomain}
                      </div>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        {journey.title}
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-primary">
                      {doneStages.length}/{journey.stages.length} ({pct}%)
                    </span>
                  </div>
                  <p className="text-muted-foreground">{journey.summary}</p>
                  <div className="space-y-2">
                    {journey.stages.map((st) => {
                      const completed = doneStages.includes(st.stageNumber);
                      const unlocked =
                        st.stageNumber === 1 || doneStages.includes(st.stageNumber - 1);
                      return (
                        <div
                          key={st.stageNumber}
                          className={`rounded-xl border p-3 ${
                            completed
                              ? "border-success/40 bg-success/5"
                              : unlocked
                                ? "border-border bg-surface-2"
                                : "border-border/50 bg-surface-2/40 opacity-75"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">
                              Stage {st.stageNumber}: {st.label}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              disabled={!unlocked && !completed}
                              variant={completed ? "outline" : "glow"}
                              className="h-7 text-[11px]"
                              onClick={() => {
                                update((prev) => {
                                  const cur = prev.zeroToHeroProgress[journey.id] ?? [];
                                  const next = cur.includes(st.stageNumber)
                                    ? cur
                                    : [...cur, st.stageNumber];
                                  return {
                                    ...prev,
                                    zeroToHeroProgress: {
                                      ...prev.zeroToHeroProgress,
                                      [journey.id]: next,
                                    },
                                  };
                                });
                                toast.success(
                                  `Stage ${st.stageNumber} verified for ${journey.skillDomain}!`,
                                );
                              }}
                            >
                              {completed
                                ? "Verified"
                                : unlocked
                                  ? "Complete Stage"
                                  : "Complete Prior Stage"}
                            </Button>
                          </div>
                          <p className="mt-1 text-muted-foreground">{st.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === "literacy_access" ? (
        <div className="space-y-4" data-testid="literacy-access-panel">
          <div className="surface-card space-y-2 p-5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Literacy &amp; Foundational Learning Access Initiative
                </h3>
                <p className="text-muted-foreground">
                  Jargon-free reading foundations, syllable chunking, everyday forms comprehension,
                  and on-device Read-Aloud voice support.
                </p>
              </div>
              <span className="font-mono font-bold text-primary">
                {state.literacyTrackProgress.completedModuleIds.length}/
                {LITERACY_ACCESS_LESSONS.length} Completed
              </span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {LITERACY_ACCESS_LESSONS.map((les) => {
              const done = state.literacyTrackProgress.completedModuleIds.includes(les.id);
              const picked = litAnswers[les.id];
              return (
                <div
                  key={les.id}
                  className="surface-card flex flex-col justify-between space-y-3 p-5 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                      <span>STEP {les.step}</span>
                      <span>{les.focusSkill}</span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-foreground">{les.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{les.titleAr}</p>
                    <p className="rounded-lg border border-border bg-surface-2 p-2.5 leading-relaxed text-foreground">
                      {les.readAloudScript}
                    </p>
                    <p className="text-[11px] text-primary">Tip: {les.plainLanguageTip}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 w-full text-[11px]"
                      onClick={() => {
                        const ok = speakEnglishText(les.readAloudScript, {
                          rate: 0.9,
                          lang: "en-GB",
                        });
                        if (ok) {
                          update((prev) => ({
                            ...prev,
                            literacyTrackProgress: {
                              ...prev.literacyTrackProgress,
                              readAloudCount: prev.literacyTrackProgress.readAloudCount + 1,
                            },
                          }));
                        } else {
                          toast.info(
                            "Read-Aloud speech synthesis is not supported in this browser.",
                          );
                        }
                      }}
                    >
                      <Volume2 className="size-3.5" />
                      <span>Listen Read-Aloud (Slow Clear Pace)</span>
                    </Button>
                  </div>

                  <div className="space-y-1.5 border-t border-border pt-2.5">
                    <div className="font-semibold text-foreground">{les.checkQuestion}</div>
                    {les.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setLitAnswers((prev) => ({ ...prev, [les.id]: idx }));
                          if (idx === les.correctIndex) {
                            update((prev) => ({
                              ...prev,
                              literacyTrackProgress: {
                                ...prev.literacyTrackProgress,
                                completedModuleIds:
                                  prev.literacyTrackProgress.completedModuleIds.includes(les.id)
                                    ? prev.literacyTrackProgress.completedModuleIds
                                    : [...prev.literacyTrackProgress.completedModuleIds, les.id],
                              },
                            }));
                            toast.success(`Completed: ${les.title}`);
                          }
                        }}
                        className={`w-full rounded-md border px-2.5 py-1.5 text-start text-[11px] ${
                          typeof picked === "number"
                            ? idx === les.correctIndex
                              ? "border-success bg-success/15 font-semibold"
                              : picked === idx
                                ? "border-destructive bg-destructive/15"
                                : "border-border bg-surface-2 opacity-70"
                            : "border-border bg-surface-2 hover:border-primary/40"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                    {done && <div className="font-semibold text-success">Module verified!</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 10 FOUNDATIONAL LEARNING CENTER TRACKS (Section 3B) */}
          <div className="surface-card space-y-4 p-5 text-xs" data-testid="foundational-10-tracks">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Foundational Learning Center — 10 Core Equal-Access Tracks
                </h3>
                <p className="text-muted-foreground">
                  Start from zero in any subject with gentle worked examples, bilingual titles, and
                  progress without shame.
                </p>
              </div>
              <span className="font-mono font-semibold tabular-nums text-primary">
                {
                  FOUNDATIONAL_LEARNING_TRACKS.filter(
                    (tr) => (state.foundationalPathProgress[tr.id]?.length ?? 0) >= tr.steps.length,
                  ).length
                }
                /{FOUNDATIONAL_LEARNING_TRACKS.length} Tracks Mastered
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {FOUNDATIONAL_LEARNING_TRACKS.map((tr) => {
                const doneCount = (state.foundationalPathProgress[tr.id] ?? []).length;
                const active = selectedFoundationId === tr.id;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setSelectedFoundationId(tr.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-start text-[11px] font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {doneCount >= tr.steps.length ? "✓ " : ""}
                    {tr.title}
                  </button>
                );
              })}
            </div>

            {(() => {
              const activeTrack =
                FOUNDATIONAL_LEARNING_TRACKS.find((tr) => tr.id === selectedFoundationId) ??
                FOUNDATIONAL_LEARNING_TRACKS[0]!;
              const doneSteps = state.foundationalPathProgress[activeTrack.id] ?? [];
              return (
                <div className="space-y-3 rounded-xl border border-border bg-surface-2/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        {activeTrack.title} · {activeTrack.titleAr}
                      </h4>
                      <p className="text-[11px] text-primary">{activeTrack.encouragementNote}</p>
                    </div>
                    <Link
                      to={activeTrack.targetRoute}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      <span>Open Full Module</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {activeTrack.steps.map((st) => {
                      const stepDone = doneSteps.includes(st.id);
                      const picked = foundationAnswers[st.id];
                      return (
                        <div
                          key={st.id}
                          className="rounded-lg border border-border bg-surface p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{st.title}</span>
                            {stepDone && (
                              <span className="text-[11px] font-semibold text-emerald-500">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{st.concept}</p>
                          <div className="rounded border border-border/70 bg-surface-2 p-2 text-[11px]">
                            <strong className="text-foreground">Worked Example: </strong>
                            <span className="text-muted-foreground">{st.workedExample}</span>
                          </div>
                          <div className="space-y-1 pt-1">
                            <div className="font-semibold text-foreground">{st.checkQuestion}</div>
                            {st.options.map((opt, oIdx) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setFoundationAnswers((prev) => ({ ...prev, [st.id]: oIdx }));
                                  if (oIdx === st.correctIndex) {
                                    update((prev) => {
                                      const cur =
                                        prev.foundationalPathProgress[activeTrack.id] ?? [];
                                      if (cur.includes(st.id)) return prev;
                                      return {
                                        ...prev,
                                        foundationalPathProgress: {
                                          ...prev.foundationalPathProgress,
                                          [activeTrack.id]: [...cur, st.id],
                                        },
                                      };
                                    });
                                    toast.success(`Verified foundation step: ${st.title}`);
                                  }
                                }}
                                className={`w-full rounded-md border px-2.5 py-1.5 text-start text-[11px] ${
                                  typeof picked === "number"
                                    ? oIdx === st.correctIndex
                                      ? "border-success bg-success/15 font-semibold"
                                      : picked === oIdx
                                        ? "border-destructive bg-destructive/15"
                                        : "border-border bg-surface-2 opacity-70"
                                    : "border-border bg-surface-2 hover:border-primary/40"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {ADAPTIVE_LEARNING_PATHS.map((p) => {
              const active = p.id === pathEvaluation.path.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => update((prev) => ({ ...prev, activeLearningPathId: p.id }))}
                  className={`surface-card space-y-1.5 p-4 text-start transition-colors ${
                    active ? "border-primary bg-primary/10" : "hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[0.68rem] font-bold uppercase text-primary">
                    <span>{p.domain}</span>
                    {state.placement?.recommendedPathId === p.id && <span>Recommended Fit</span>}
                  </div>
                  <div className="font-display text-sm font-bold text-foreground">{p.title}</div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </button>
              );
            })}
          </div>

          <div className="surface-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {pathEvaluation.path.title} · {pathEvaluation.path.titleAr}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Mastery Progress: {pathEvaluation.masteredCount}/
                  {pathEvaluation.evaluatedSteps.length} steps mastered (
                  {pathEvaluation.completionPct}%)
                </p>
              </div>
              <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full bg-gradient-primary transition-all"
                  style={{ width: `${pathEvaluation.completionPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {pathEvaluation.evaluatedSteps.map((ev, idx) => {
                const isNext = pathEvaluation.nextRecommendedStepId === ev.step.id;
                const checkOpen = activeCheckStepId === ev.step.id;
                return (
                  <div
                    key={ev.step.id}
                    className={`space-y-2.5 rounded-xl border p-4 text-xs ${
                      ev.status === "mastered"
                        ? "border-success/40 bg-success/5"
                        : ev.status === "locked"
                          ? "border-border/60 bg-surface-2/40 opacity-75"
                          : isNext
                            ? "border-primary bg-primary/10"
                            : "border-border bg-surface-2"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ev.status === "locked" ? (
                          <Lock className="size-4 text-muted-foreground" />
                        ) : ev.status === "mastered" ? (
                          <CheckCircle2 className="size-4 text-success" />
                        ) : (
                          <Compass className="size-4 text-primary" />
                        )}
                        <span className="font-display text-sm font-bold text-foreground">
                          Step {idx + 1}: {ev.step.title}
                        </span>
                      </div>
                      <span className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-[0.68rem] uppercase text-foreground">
                        {ev.status}
                        {ev.bestScore !== null ? ` · ${ev.bestScore}%` : ""}
                      </span>
                    </div>

                    <p className="text-muted-foreground">{ev.step.summary}</p>
                    <div className="rounded-lg border border-border/70 bg-surface px-3 py-2 text-[0.72rem] text-foreground">
                      <span className="font-semibold text-primary">Why / Gate Status: </span>
                      {ev.whyRecommended}
                    </div>

                    {ev.status !== "locked" && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {ev.status === "available" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            onClick={() => handleMarkStepViewed(ev.step.id)}
                          >
                            Mark Viewed (Not Yet Mastered)
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant={ev.status === "mastered" ? "outline" : "glow"}
                          className="h-7 text-[0.7rem]"
                          onClick={() => {
                            setActiveCheckStepId(checkOpen ? null : ev.step.id);
                            setStepCheckChoice(null);
                          }}
                        >
                          {checkOpen
                            ? "Close Check"
                            : `Take Mastery Check (${ev.step.minMasteryScore}%+)`}
                        </Button>
                        <Link
                          to={ev.step.targetRoute}
                          className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-primary hover:underline"
                        >
                          <span>Practice in Module</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    )}

                    {checkOpen && (
                      <div className="mt-2 space-y-2 rounded-lg border border-primary/30 bg-surface p-3">
                        <div className="font-semibold text-foreground">
                          {ev.step.checkQuestion.prompt}
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {ev.step.checkQuestion.options.map((opt, cIdx) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setStepCheckChoice(cIdx)}
                              className={`rounded-md border px-2.5 py-1.5 text-start text-xs ${
                                stepCheckChoice === cIdx
                                  ? "border-primary bg-primary/15 text-primary font-semibold"
                                  : "border-border bg-surface-2 text-foreground"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="glow"
                          disabled={stepCheckChoice === null}
                          onClick={() =>
                            handleSubmitPathCheck(
                              ev.step.id,
                              ev.step.minMasteryScore,
                              ev.step.checkQuestion.correctIndex,
                            )
                          }
                        >
                          Verify Mastery
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
