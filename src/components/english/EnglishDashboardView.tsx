import {
  AlertCircle,
  ArrowRight,
  Award,
  CalendarPlus,
  CheckCircle2,
  Compass,
  Flame,
  Info,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AcademyWorkspaceId } from "@/data/english-curriculum";
import {
  computeDailyMissionProgress,
  computeDashboardSummary,
  computeEnglishRecommendations,
  type EnglishRecommendation,
  type EnglishWorldState,
} from "@/lib/english-world";
import { BRAND } from "@/config/brand";

export function EnglishDashboardView({
  englishState,
  onNavigateRecommendation,
  onAddRecommendationToTasks,
  onClaimDailyMission,
  onMarkMistakeReviewed,
  onOpenExams,
}: {
  englishState: EnglishWorldState;
  onNavigateRecommendation: (rec: EnglishRecommendation) => void;
  onAddRecommendationToTasks: (rec: EnglishRecommendation) => void;
  onClaimDailyMission: (claimKey: string, title: string, xpBonus: number) => void;
  onMarkMistakeReviewed: (mistakeId: string) => void;
  onOpenExams: () => void;
}) {
  const summary = computeDashboardSummary(englishState);
  const recommendations = computeEnglishRecommendations(englishState);
  const missions = computeDailyMissionProgress(englishState);

  return (
    <div className="space-y-5">
      {/* Top 4 Core Metric Tiles */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Current Estimated Level</div>
          <div className="font-display text-2xl font-bold text-primary">
            {summary.currentCefrBand}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Informal {BRAND.shortName} indicator (not official CEFR certificate)
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Curriculum Lessons</div>
          <div className="font-display text-2xl font-bold text-foreground">
            {summary.completedLessonsCount} / {summary.totalLessonsCount}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Across Pre-A1 Foundation through C1–C2
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Vocabulary Mastery</div>
          <div className="font-display text-2xl font-bold text-foreground">
            {summary.masteredWordsCount} mastered
          </div>
          <p className="text-[11px] text-muted-foreground">
            {summary.practicingWordsCount} practicing · {summary.revisionWordsCount} needs revision
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground">English XP & Streak</div>
          <div className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <span>{englishState.englishXp} XP</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              <Flame className="size-4" />
              {englishState.streakDays}d
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {summary.certificatesCount} completion certificate
            {summary.certificatesCount === 1 ? "" : "s"} earned
          </p>
        </div>
      </div>

      {/* Personalized Adaptive Recommendations + Daily Learning Missions */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="surface-card space-y-3 p-5 lg:col-span-7">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <Compass className="size-4" />
            <span>Personalized Next Steps (Why Each Fits You)</span>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-foreground">{rec.title}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {rec.whyRecommended}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    +{rec.xpReward} XP
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={() => onNavigateRecommendation(rec)}
                    className="min-h-[40px] gap-1 text-xs"
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onAddRecommendationToTasks(rec)}
                    className="min-h-[40px] gap-1 text-xs"
                  >
                    <CalendarPlus className="size-3.5" />
                    <span>Save to Tasks</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Learning Missions */}
        <div className="surface-card space-y-3 p-5 lg:col-span-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <Trophy className="size-4" />
            <span>Today's English Missions</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Gentle daily targets that never punish breaks—build steady progress at your pace.
          </p>
          <div className="space-y-2.5">
            {missions.map(({ mission, current, completed, claimed, claimKey }) => (
              <div
                key={mission.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">{mission.title}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Progress: {current}/{mission.targetCount} · +{mission.xpBonus} XP bonus
                  </div>
                </div>
                {claimed ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="size-3.5" />
                    Claimed
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant={completed ? "glow" : "outline"}
                    disabled={!completed}
                    onClick={() => onClaimDailyMission(claimKey, mission.title, mission.xpBonus)}
                    className="min-h-[40px] shrink-0 text-xs"
                  >
                    {completed ? "Claim XP" : "In Progress"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Progress Breakdown */}
      <div className="surface-card space-y-3 p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Skill Academy Progress Breakdown
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summary.skillBreakdown.map((item) => (
            <div
              key={item.skill}
              className="rounded-lg border border-border bg-surface-2 p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>{item.label}</span>
                <span className="text-primary">{item.scorePct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${item.scorePct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Review Queue & Internal Certificates */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <AlertCircle className="size-4" />
              <span>English Mistake Review Queue ({summary.openMistakesCount} open)</span>
            </div>
          </div>

          {englishState.mistakes.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Any incorrect item during lessons, reading, listening, or grammar drills appears here
              automatically with its explanation so you can revise cleanly.
            </p>
          ) : (
            <div className="max-h-[280px] space-y-2.5 overflow-y-auto pr-1">
              {englishState.mistakes.slice(0, 12).map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-border bg-surface-2 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-foreground">
                      {m.skill.toUpperCase()} · {m.itemTitle}
                    </strong>
                    {m.reviewed ? (
                      <span className="text-success font-medium">Reviewed</span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkMistakeReviewed(m.id)}
                        className="min-h-[38px] text-[11px]"
                      >
                        Mark Reviewed
                      </Button>
                    )}
                  </div>
                  <p className="text-foreground">{m.prompt}</p>
                  <p className="text-muted-foreground">
                    Your answer: <span className="text-destructive">{m.userAnswer}</span> ·
                    Accepted: <span className="text-success">{m.correctAnswer}</span>
                  </p>
                  <p className="text-muted-foreground">{m.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earned Internal Certificates */}
        <div className="surface-card space-y-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <Award className="size-4" />
              <span>{BRAND.shortName} Completion Certificates</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onOpenExams}
              className="min-h-[40px] text-xs"
            >
              Take Level Exams
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-2.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              Internal {BRAND.shortName} completion records celebrate verified assessment milestones
              on the platform—not external official CEFR exams.
            </span>
          </div>

          {englishState.certificates.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Pass any Level Mastery Exam (Foundation, A2, B1–B2, or C1–C2 Mastery) inside Placement
              & Exams to unlock your internal completion certificate.
            </p>
          ) : (
            <div className="space-y-2.5">
              {englishState.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-xl border border-success/40 bg-success/10 p-3.5 space-y-1"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Sparkles className="size-4 text-success" />
                    <span>{cert.title}</span>
                  </div>
                  <div className="text-xs text-foreground">
                    Score Achieved: <strong>{cert.scorePct}%</strong> · Earned{" "}
                    {new Date(cert.earnedAt).toLocaleDateString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{cert.disclaimer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
