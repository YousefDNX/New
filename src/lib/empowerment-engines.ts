import type {
  FocusSessionRow,
  ProfileRow,
  QuizAttemptRow,
  StudyItemRow,
  UserStatsRow,
} from "@/lib/firestore-data";
import type { ReferenceOpportunityItem } from "@/lib/recommendations";
import type { GoalRow, TaskRow } from "@/hooks/use-nexora";
import { analyzeMisconceptions, detectLearningGaps } from "@/lib/learning-intelligence";
import { computeAchievementEvidence, type StudentEcosystemState } from "@/lib/student-ecosystem";
import { BRAND } from "@/config/brand";

/* -------------------------------------------------------------------------- */
/* #41 OPPORTUNITY ELIGIBILITY CHECKER                                        */
/* -------------------------------------------------------------------------- */

export interface OpportunityEligibilityResult {
  fitScore: number;
  status: "strong_match" | "partial_match" | "prepare_first";
  matchedCriteria: string[];
  missingCriteria: string[];
  recommendedSteps: string[];
}

export function evaluateOpportunityEligibility(params: {
  opportunity: ReferenceOpportunityItem;
  profile: ProfileRow | null | undefined;
  state: StudentEcosystemState;
  currentStreak?: number;
}): OpportunityEligibilityResult {
  const { opportunity, profile, state, currentStreak = 0 } = params;
  const matchedCriteria: string[] = [];
  const missingCriteria: string[] = [];
  const recommendedSteps: string[] = [];
  let score = 40; // Baseline open student eligibility

  const region = profile?.region ?? "kuwait";
  if (
    opportunity.region_scope === "global" ||
    opportunity.region_scope === region ||
    (opportunity.region_scope === "gcc" && (region === "kuwait" || region === "gcc"))
  ) {
    score += 22;
    matchedCriteria.push(`Regional scope aligns (${opportunity.region_scope.toUpperCase()})`);
  } else {
    missingCriteria.push(
      `Geographic scope (${opportunity.region_scope.toUpperCase()}) differs from your current profile region (${region.toUpperCase()})`,
    );
    recommendedSteps.push(
      "Verify residency or international nominee exceptions on official portal.",
    );
  }

  const gradeStr = (profile?.grade_level || state.curriculumSelection.grade || "").toLowerCase();
  const elig = opportunity.eligibility.toLowerCase();
  if (
    elig.includes("all students") ||
    elig.includes("secondary") ||
    elig.includes("grades") ||
    elig.includes("youth") ||
    (gradeStr.includes("12") && elig.includes("12")) ||
    (gradeStr.includes("9") && (elig.includes("7") || elig.includes("9") || elig.includes("13")))
  ) {
    score += 18;
    matchedCriteria.push(
      `Grade/age band compatible (${profile?.grade_level || state.curriculumSelection.grade})`,
    );
  } else {
    missingCriteria.push(`Confirm exact grade/age window: "${opportunity.eligibility}"`);
    recommendedSteps.push("Ask your school counselor to confirm grade-level nomination timing.");
  }

  const hasEnglishPlacement = Boolean(
    state.placement || state.englishWorld.placementHistory.length > 0,
  );
  if (elig.includes("english") || elig.includes("ielts") || elig.includes("toefl")) {
    if (hasEnglishPlacement) {
      score += 10;
      matchedCriteria.push(`English proficiency baseline recorded in ${BRAND.shortName}`);
    } else {
      missingCriteria.push("English readiness baseline not yet assessed");
      recommendedSteps.push("Complete the English Placement Diagnostic in Study / English World.");
    }
  } else {
    score += 8;
    matchedCriteria.push("No external language certificate blocker flagged");
  }

  const portfolioCount = state.portfolio.projects.length + state.scienceFairProjects.length;
  if (
    opportunity.category === "competition" ||
    opportunity.category === "scholarship" ||
    opportunity.category === "program"
  ) {
    if (portfolioCount >= 1) {
      score += 10;
      matchedCriteria.push(`${portfolioCount} documented project artifact(s) ready for evidence`);
    } else {
      missingCriteria.push("No portfolio project or evidence essay documented yet");
      recommendedSteps.push(
        "Complete one Real-World Challenge or Portfolio entry in Future Studio to strengthen evidence.",
      );
    }
  }

  if (currentStreak >= 3) {
    score += 2;
    matchedCriteria.push(`${currentStreak}-day study consistency streak logged`);
  }

  const clamped = Math.max(0, Math.min(100, score));
  const status: OpportunityEligibilityResult["status"] =
    clamped >= 78 ? "strong_match" : clamped >= 55 ? "partial_match" : "prepare_first";

  if (recommendedSteps.length === 0) {
    recommendedSteps.push(
      "Add deadline reminder to Tasks and verify official dates before applying.",
    );
  }

  return {
    fitScore: clamped,
    status,
    matchedCriteria,
    missingCriteria,
    recommendedSteps,
  };
}

/* -------------------------------------------------------------------------- */
/* #14 ACADEMIC PROGRESS REPORT (PRIVACY-RESPECTING, NO CARE JOURNAL LEAKS)  */
/* -------------------------------------------------------------------------- */

export interface AcademicProgressReport {
  generatedAt: string;
  studentAlias: string;
  gradeAndTrack: string;
  privacySnapshot: StudentEcosystemState["reportPrivacy"];
  careExclusionGuarantee: string;
  overview: {
    xp: number;
    level: number;
    streakDays: number;
    completedTasks: number;
    completedGoals: number;
    focusMinutes: number;
    averageQuizPct: number | null;
  };
  masterySection: {
    included: boolean;
    cefrEstimate: string;
    skillLessonsCompleted: number;
    adaptivePathStepsMastered: number;
    recentExamScores: Array<{ subject: string; scorePct: number; date: string }>;
  };
  gapSection: {
    included: boolean;
    activeGaps: Array<{ title: string; missingPrerequisite: string; severity: string }>;
    resolvedGapCount: number;
  };
  portfolioSection: {
    included: boolean;
    artifacts: Array<{ title: string; category: string }>;
  };
  milestoneSection: {
    included: boolean;
    verifiedEvidenceCount: number;
    unlockedMilestones: string[];
  };
}

export function buildAcademicProgressReport(params: {
  state: StudentEcosystemState;
  profile: ProfileRow | null | undefined;
  stats: UserStatsRow | null | undefined;
  studyItems: StudyItemRow[];
  quizAttempts: QuizAttemptRow[];
  focusSessions: FocusSessionRow[];
  tasks: TaskRow[];
  goals: GoalRow[];
}): AcademicProgressReport {
  const { state, profile, stats, studyItems, quizAttempts, focusSessions, tasks, goals } = params;
  const privacy = state.reportPrivacy;

  const avgQuiz =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce(
            (acc, q) =>
              acc + (q.total_questions > 0 ? (q.correct_count / q.total_questions) * 100 : 0),
            0,
          ) / quizAttempts.length,
        )
      : null;

  const focusMinutes = focusSessions.reduce((acc, f) => acc + (f.duration_minutes || 0), 0);

  const gapReport = detectLearningGaps({
    studyItems,
    quizAttempts,
    masteredNodeIds: state.masteredKnowledgeNodes,
    resolvedGapIds: state.resolvedGapIds,
    englishWeakSkill: null,
  });

  const evidence = computeAchievementEvidence(state);

  const report: AcademicProgressReport = {
    generatedAt: new Date().toISOString(),
    studentAlias: profile?.display_name || `${BRAND.shortName} Student`,
    gradeAndTrack: `${state.curriculumSelection.grade} · ${state.curriculumSelection.country}`,
    privacySnapshot: { ...privacy },
    // Explicit architectural guarantee: Private Care wellbeing check-ins and personal mood journals are NEVER included.
    careExclusionGuarantee:
      "Private Wellbeing / Care journals, mood check-ins, and personal counseling reflections are permanently excluded from Academic Progress Reports.",
    overview: {
      xp: stats?.xp ?? 0,
      level: stats?.level ?? 1,
      streakDays: stats?.current_streak ?? 0,
      completedTasks: tasks.filter((t) => t.status === "done").length,
      completedGoals: goals.filter((g) => g.status === "completed").length,
      focusMinutes,
      averageQuizPct: avgQuiz,
    },
    masterySection: privacy.shareMasteryBreakdown
      ? {
          included: true,
          cefrEstimate:
            state.englishWorld.placementHistory[state.englishWorld.placementHistory.length - 1]
              ?.overallBand ??
            state.placement?.dimensions.find(
              (d) => d.dimension === state.placement?.strongestDimension,
            )?.cefr ??
            "Assessed on Start",
          skillLessonsCompleted: state.completedSkillLessons.length,
          adaptivePathStepsMastered: state.masteredPathSteps.length,
          recentExamScores: state.examHistory.slice(0, 5).map((e) => ({
            subject: e.subject,
            scorePct: e.scorePct,
            date: e.date.slice(0, 10),
          })),
        }
      : {
          included: false,
          cefrEstimate: "Hidden by student privacy toggle",
          skillLessonsCompleted: 0,
          adaptivePathStepsMastered: 0,
          recentExamScores: [],
        },
    gapSection: privacy.shareGapSummary
      ? {
          included: true,
          activeGaps: gapReport.gaps.map((g) => ({
            title: g.targetTopic,
            missingPrerequisite:
              g.missingPrerequisites.map((p) => p.title).join(", ") || "Core foundation review",
            severity: g.severity,
          })),
          resolvedGapCount: state.resolvedGapIds.length,
        }
      : {
          included: false,
          activeGaps: [],
          resolvedGapCount: 0,
        },
    portfolioSection: privacy.sharePortfolioArtifacts
      ? {
          included: true,
          artifacts: state.portfolio.projects.map((p) => ({
            title: p.title,
            category: p.category,
          })),
        }
      : {
          included: false,
          artifacts: [],
        },
    milestoneSection: privacy.shareMilestones
      ? {
          included: true,
          verifiedEvidenceCount: evidence.totalVerifiedArtifacts,
          unlockedMilestones: evidence.milestones.filter((m) => m.unlocked).map((m) => m.title),
        }
      : {
          included: false,
          verifiedEvidenceCount: 0,
          unlockedMilestones: [],
        },
  };

  return report;
}

export function formatAcademicReportMarkdown(report: AcademicProgressReport): string {
  const lines: string[] = [
    `# ${BRAND.shortName} Academic Progress Report`,
    `- **Student:** ${report.studentAlias}`,
    `- **Track:** ${report.gradeAndTrack}`,
    `- **Generated:** ${report.generatedAt.slice(0, 10)}`,
    ``,
    `> ${report.careExclusionGuarantee}`,
    ``,
    `## Learning Activity Summary`,
    `- Level: ${report.overview.level} (${report.overview.xp} XP, ${report.overview.streakDays}-day streak)`,
    `- Focus Study Time: ${report.overview.focusMinutes} minutes`,
    `- Completed Tasks: ${report.overview.completedTasks} | Completed Goals: ${report.overview.completedGoals}`,
    `- Average Quiz Score: ${report.overview.averageQuizPct !== null ? `${report.overview.averageQuizPct}%` : "No quizzes logged yet"}`,
    ``,
  ];

  if (report.masterySection.included) {
    lines.push(
      `## Academic Mastery`,
      `- English Band: ${report.masterySection.cefrEstimate}`,
      `- Skill Lessons Completed: ${report.masterySection.skillLessonsCompleted}`,
      `- Adaptive Path Steps Mastered: ${report.masterySection.adaptivePathStepsMastered}`,
      ...(report.masterySection.recentExamScores.length > 0
        ? report.masterySection.recentExamScores.map(
            (e) => `- Exam (${e.date}): ${e.subject} — ${e.scorePct}%`,
          )
        : ["- No exam simulations recorded yet"]),
      ``,
    );
  }

  if (report.gapSection.included) {
    lines.push(
      `## Learning Gaps & Prerequisites`,
      `- Resolved Gaps: ${report.gapSection.resolvedGapCount}`,
      ...(report.gapSection.activeGaps.length > 0
        ? report.gapSection.activeGaps.map(
            (g) =>
              `- [${g.severity.toUpperCase()}] ${g.title} (Prerequisite: ${g.missingPrerequisite})`,
          )
        : ["- No active prerequisite gaps detected"]),
      ``,
    );
  }

  if (report.portfolioSection.included) {
    lines.push(
      `## Portfolio Artifacts`,
      ...(report.portfolioSection.artifacts.length > 0
        ? report.portfolioSection.artifacts.map((a) => `- ${a.title} (${a.category})`)
        : ["- No public portfolio entries saved yet"]),
      ``,
    );
  }

  if (report.milestoneSection.included) {
    lines.push(
      `## Verified Achievement Milestones (${report.milestoneSection.verifiedEvidenceCount} total artifacts)`,
      ...(report.milestoneSection.unlockedMilestones.length > 0
        ? report.milestoneSection.unlockedMilestones.map((m) => `- Unlocked: ${m}`)
        : ["- Milestones in progress"]),
    );
  }

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* #42 PERSONAL ACHIEVEMENT TIMELINE                                          */
/* -------------------------------------------------------------------------- */

export interface AchievementTimelineItem {
  id: string;
  dateIso: string;
  category: "exam" | "simulation" | "portfolio" | "challenge" | "research" | "classroom";
  title: string;
  detail: string;
}

export function buildPersonalAchievementTimeline(
  state: StudentEcosystemState,
): AchievementTimelineItem[] {
  const items: AchievementTimelineItem[] = [];

  for (const ex of state.examHistory) {
    items.push({
      id: `tl_ex_${ex.id}`,
      dateIso: ex.date,
      category: "exam",
      title: `Exam Simulation: ${ex.subject}`,
      detail: `Scored ${ex.correct}/${ex.total} (${ex.scorePct}%)`,
    });
  }

  for (const p of state.portfolio.projects) {
    items.push({
      id: `tl_port_${p.id}`,
      dateIso: p.createdAt,
      category: "portfolio",
      title: `Portfolio Artifact: ${p.title}`,
      detail: `${p.category} · ${p.stepsCompleted}/${p.totalSteps} steps`,
    });
  }

  for (const [cid, rec] of Object.entries(state.completedRealChallenges)) {
    items.push({
      id: `tl_rwc_${cid}`,
      dateIso: rec.completedAt,
      category: "challenge",
      title: `Real-World Challenge Completed`,
      detail: rec.evidenceSummary.slice(0, 90),
    });
  }

  for (const [wk, rec] of Object.entries(state.weeklyChallengeLogs)) {
    items.push({
      id: `tl_wk_${wk}`,
      dateIso: rec.submittedAt,
      category: "challenge",
      title: `Challenge of the Week (${rec.weekKey})`,
      detail: rec.correct ? "Verified accurate solution" : "Submitted reflection & attempt",
    });
  }

  for (const exp of state.experimentDesigns) {
    items.push({
      id: `tl_exp_${exp.id}`,
      dateIso: exp.createdAt,
      category: "research",
      title: `Experiment Design: ${exp.title}`,
      detail: `IV: ${exp.iv} → DV: ${exp.dv} (${exp.trials.length} trials)`,
    });
  }

  for (const log of state.problemSolvingLogs) {
    items.push({
      id: `tl_ps_${log.id}`,
      dateIso: log.createdAt,
      category: "research",
      title: `Problem Solving Arena: ${log.title}`,
      detail: `${log.stepsDone}/7 reasoning steps completed`,
    });
  }

  return items.sort((a, b) => b.dateIso.localeCompare(a.dateIso)).slice(0, 24);
}

/* -------------------------------------------------------------------------- */
/* #12 SAFE STUDY GROUP MATCHER & #40 GLOBAL EXCHANGE COHORTS                 */
/* -------------------------------------------------------------------------- */

export interface SafeStudyCohort {
  id: string;
  aliasName: string;
  subject: string;
  gradeBand: string;
  language: string;
  pace: "gentle" | "balanced" | "intensive";
  sharedGoal: string;
  exchangePrompt: string;
  inviteCode: string;
  moderatorVerified: boolean;
}

export const SAFE_STUDY_COHORTS: SafeStudyCohort[] = [
  {
    id: "coh_kw_eng9",
    aliasName: "Academic English Peer Lab",
    subject: "English",
    gradeBand: "Grades 8–10",
    language: "en",
    pace: "balanced",
    sharedGoal: "Master academic vocabulary & paragraph cohesion together without cramming.",
    exchangePrompt: "Co-author a 150-word bilingual community sustainability newsletter.",
    inviteCode: "ENG-COH9",
    moderatorVerified: true,
  },
  {
    id: "coh_stem_bio",
    aliasName: "Desert & Coastal Ecology Guild",
    subject: "Science",
    gradeBand: "Grades 8–10",
    language: "en",
    pace: "balanced",
    sharedGoal: "Design controlled school-safe water filtration and solar cooling investigations.",
    exchangePrompt: "Compare regional water conservation strategies with partner school teams.",
    inviteCode: "SCI-ECO9",
    moderatorVerified: true,
  },
  {
    id: "coh_math_alg",
    aliasName: "Algebra & Number Sense Circle",
    subject: "Mathematics",
    gradeBand: "Grades 7–9",
    language: "ar",
    pace: "gentle",
    sharedGoal: "Eliminate negative-number and proportional-ratio prerequisite gaps step-by-step.",
    exchangePrompt: "Exchange real-world unit-rate pricing puzzles from local markets.",
    inviteCode: "MTH-BASE",
    moderatorVerified: true,
  },
  {
    id: "coh_code_udl",
    aliasName: "Accessible Web & Logic Builders",
    subject: "Coding & AI",
    gradeBand: "Grades 9–12",
    language: "en",
    pace: "intensive",
    sharedGoal:
      "Build assistive tools, screen-reader-friendly notes, and trace algorithms accurately.",
    exchangePrompt: "Review each other's accessibility checklists on educational web prototypes.",
    inviteCode: "COD-UDL1",
    moderatorVerified: true,
  },
];

export interface CohortMatchResult {
  cohort: SafeStudyCohort;
  compatibilityScore: number;
  matchReasons: string[];
}

export function matchSafeStudyCohorts(params: {
  subjects: string[];
  gradeBand: string;
  preferredPace: "gentle" | "balanced" | "intensive";
  language: string;
  blockedCohortIds: string[];
}): CohortMatchResult[] {
  const blocked = new Set(params.blockedCohortIds);
  return SAFE_STUDY_COHORTS.filter((c) => !blocked.has(c.id))
    .map((cohort) => {
      let score = 35;
      const reasons: string[] = [];

      if (params.subjects.some((s) => cohort.subject.toLowerCase().includes(s.toLowerCase()))) {
        score += 35;
        reasons.push(`Matches subject focus (${cohort.subject})`);
      }
      if (cohort.gradeBand === params.gradeBand) {
        score += 15;
        reasons.push(`Same grade band (${cohort.gradeBand})`);
      }
      if (cohort.pace === params.preferredPace) {
        score += 10;
        reasons.push(`Matches ${cohort.pace} pacing`);
      }
      if (cohort.language === params.language) {
        score += 5;
        reasons.push(`Language match (${cohort.language.toUpperCase()})`);
      }

      return {
        cohort,
        compatibilityScore: Math.min(100, score),
        matchReasons: reasons.length > 0 ? reasons : ["Moderated cross-disciplinary study cohort"],
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/* -------------------------------------------------------------------------- */
/* #27 FINANCIAL LITERACY ACADEMY ENGINES                                     */
/* -------------------------------------------------------------------------- */

export interface FinancialScenario {
  id: string;
  title: string;
  context: string;
  options: string[];
  bestIndex: number;
  explanation: string;
}

export const STUDENT_FINANCIAL_SCENARIOS: FinancialScenario[] = [
  {
    id: "fin_scam_urgent",
    title: "Urgent Scholarship Fee Message",
    context:
      "You receive a social media message saying you won an international youth grant, but you must transfer a 15 KWD 'processing fee' via gift card within 2 hours.",
    options: [
      "Pay immediately so you do not lose the spot",
      "Decline, block, and verify through official institution domains only — legitimate scholarships never charge emergency gift-card fees",
      "Send half now and negotiate later",
    ],
    bestIndex: 1,
    explanation:
      "Advance-fee urgency using gift cards or unofficial transfers is a classic financial scam indicator.",
  },
  {
    id: "fin_unit_price",
    title: "Smart Unit-Price Comparison",
    context:
      "A single notebook costs 0.900 KWD (100 pages). A twin pack of identical 100-page notebooks costs 1.500 KWD, while a mini 40-page designer pad costs 0.700 KWD.",
    options: [
      "Twin pack (0.750 KWD per 100 pages — lowest unit cost if you need 2 notebooks)",
      "Mini designer pad (lowest sticker price)",
      "Single notebook because smaller spend always saves money",
    ],
    bestIndex: 0,
    explanation:
      "Comparing cost per 100 pages avoids falling for lower sticker prices on smaller quantities, provided you avoid overbuying items you won't use.",
  },
  {
    id: "fin_subscription_creep",
    title: "Free-Trial Subscription Trap",
    context:
      "A study app offers a '7-day free trial' that automatically bills 4.5 KWD/month afterwards unless canceled 24 hours before renewal.",
    options: [
      "Enable auto-renew and hope you remember next semester",
      "Set a calendar cancellation alert on Day 5 OR use free built-in tools before sharing payment credentials",
      "Create multiple accounts endlessly",
    ],
    bestIndex: 1,
    explanation:
      "Tracking recurring charges prevents invisible monthly leaks from compounding out of your student allowance.",
  },
];

export interface BudgetHealthSummary {
  totalAllocated: number;
  needsTotal: number;
  wantsTotal: number;
  savingsAmount: number;
  remainingBalance: number;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  status: "balanced" | "tight" | "deficit";
  advice: string;
}

export function computeBudgetHealth(params: {
  monthlyAllowance: number;
  monthlySavings: number;
  expenses: Array<{ amount: number; category: "needs" | "wants" | "savings" }>;
}): BudgetHealthSummary {
  const allowance = Math.max(1, params.monthlyAllowance);
  let needsTotal = 0;
  let wantsTotal = 0;
  let extraSavings = Math.max(0, params.monthlySavings);

  for (const e of params.expenses) {
    const val = Math.max(0, e.amount);
    if (e.category === "needs") needsTotal += val;
    else if (e.category === "wants") wantsTotal += val;
    else extraSavings += val;
  }

  const totalAllocated = needsTotal + wantsTotal + extraSavings;
  const remainingBalance = Number((allowance - totalAllocated).toFixed(2));
  const needsPct = Math.round((needsTotal / allowance) * 100);
  const wantsPct = Math.round((wantsTotal / allowance) * 100);
  const savingsPct = Math.round((extraSavings / allowance) * 100);

  if (remainingBalance < 0) {
    return {
      totalAllocated,
      needsTotal,
      wantsTotal,
      savingsAmount: extraSavings,
      remainingBalance,
      needsPct,
      wantsPct,
      savingsPct,
      status: "deficit",
      advice: `Spending exceeds allowance by ${Math.abs(remainingBalance).toFixed(2)}. Trim optional 'wants' first.`,
    };
  }
  if (wantsPct > 35 || savingsPct < 15) {
    return {
      totalAllocated,
      needsTotal,
      wantsTotal,
      savingsAmount: extraSavings,
      remainingBalance,
      needsPct,
      wantsPct,
      savingsPct,
      status: "tight",
      advice:
        "Good coverage of essentials, but aim for at least 15–20% savings and keep 'wants' under 30%.",
    };
  }

  return {
    totalAllocated,
    needsTotal,
    wantsTotal,
    savingsAmount: extraSavings,
    remainingBalance,
    needsPct,
    wantsPct,
    savingsPct,
    status: "balanced",
    advice: "Healthy 50/30/20-aligned student budget with protected savings!",
  };
}

export function computeCompoundSavings(params: {
  initialPrincipal: number;
  monthlyContribution: number;
  annualRatePct: number;
  months: number;
}): { finalBalance: number; totalContributed: number; growthEarned: number } {
  const principal = Math.max(0, params.initialPrincipal);
  const monthly = Math.max(0, params.monthlyContribution);
  const months = Math.max(1, Math.min(120, Math.round(params.months)));
  const monthlyRate = Math.max(0, params.annualRatePct) / 100 / 12;

  let balance = principal;
  for (let m = 0; m < months; m++) {
    balance = (balance + monthly) * (1 + monthlyRate);
  }
  const totalContributed = Number((principal + monthly * months).toFixed(2));
  const finalBalance = Number(balance.toFixed(2));
  const growthEarned = Number((finalBalance - totalContributed).toFixed(2));

  return { finalBalance, totalContributed, growthEarned };
}

/* -------------------------------------------------------------------------- */
/* #29 7-STEP PROBLEM SOLVING ARENA                                           */
/* -------------------------------------------------------------------------- */

export interface ProblemSolvingChallenge {
  id: string;
  domain: string;
  title: string;
  prompt: string;
  constraints: string[];
  targetCheckQuestion: string;
  options: string[];
  correctIndex: number;
}

export const PROBLEM_SOLVING_CHALLENGES: ProblemSolvingChallenge[] = [
  {
    id: "ps_water_tank",
    domain: "Applied Mathematics",
    title: "School Courtyard Rainwater Tank Sizing",
    prompt:
      "Your school garden needs 180 L/day during a 5-day week. Existing barrels hold 420 L combined. How many extra 250 L barrels are needed without overflowing a 1,000 L roof limit?",
    constraints: ["Total weekly demand = 900 L", "420 L already available", "Roof limit = 1,000 L"],
    targetCheckQuestion:
      "What is the minimum number of extra 250 L barrels that covers 900 L safely?",
    options: ["1 extra barrel (670 L)", "2 extra barrels (920 L)", "3 extra barrels (1,170 L)"],
    correctIndex: 1,
  },
  {
    id: "ps_study_bottleneck",
    domain: "Systems Thinking",
    title: "Debugging Slow Exam Revision",
    prompt:
      "A student spends 3 hours rereading Biology highlights yet still scores 58% on practice questions. What is the highest-leverage root change?",
    constraints: [
      "Time budget stays fixed at 3 hours/week",
      "Goal is higher exam recall after 7 days",
    ],
    targetCheckQuestion: "Which strategy swap directly fixes passive recognition bias?",
    options: [
      "Highlight the textbook in a second color",
      "Replace 2 hours of passive rereading with active closed-book recall + spaced error log",
      "Read twice as fast",
    ],
    correctIndex: 1,
  },
];

export const SEVEN_PROBLEM_STEPS = [
  "1. Define Problem & Constraints",
  "2. Decompose into Sub-Parts",
  "3. Brainstorm 2+ Candidate Strategies",
  "4. Select Strategy & Hypothesize",
  "5. Execute & Solve",
  "6. Verify Against Edge Cases",
  "7. Reflect on Reusable Lesson",
] as const;

/* -------------------------------------------------------------------------- */
/* #31 SCIENTIFIC PAPER SIMPLIFIER (LOCAL STRUCTURED IMRAD PARSER)            */
/* -------------------------------------------------------------------------- */

export interface SimplifiedPaperResult {
  title: string;
  question: string;
  method: string;
  findings: string;
  limitations: string[];
}

export function simplifyScientificPaperLocally(
  rawText: string,
  title = "Research Abstract Summary",
): SimplifiedPaperResult {
  const sentences = rawText
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const qSentence =
    sentences.find((s) => /\b(investigate|examine|test|whether|aim|purpose|question)\b/i.test(s)) ??
    sentences[0] ??
    "Identify the core variable relationship tested by the authors.";

  const mSentence =
    sentences.find((s) =>
      /\b(sample|participants|trials|measured|randomly|control|days|students|method)\b/i.test(s),
    ) ??
    sentences[1] ??
    "Check how data was collected, sample size, and whether a control group existed.";

  const fSentence =
    sentences.find((s) =>
      /\b(found|showed|increased|decreased|higher|lower|result|significant)\b/i.test(s),
    ) ??
    sentences[sentences.length - 1] ??
    "Review numeric comparison between experimental and control groups.";

  const limitations: string[] = [];
  if (!/\brandom|control/i.test(rawText)) {
    limitations.push(
      "No clear randomized control group mentioned — check for confounding variables.",
    );
  }
  if (/\bcorrelat|associat/i.test(rawText)) {
    limitations.push(
      "Association/correlation reported — avoid assuming direct causation automatically.",
    );
  }
  if (/\bsmall sample|\bpilot|\bshort-term|\bweek/i.test(rawText)) {
    limitations.push("Short study duration or pilot sample size may limit broad generalization.");
  }
  if (limitations.length === 0) {
    limitations.push(
      "Verify sample size, measurement tools, and replication before citing broadly.",
    );
  }

  return {
    title: title.trim() || "Research Abstract Summary",
    question: qSentence,
    method: mSentence,
    findings: fSentence,
    limitations,
  };
}

/* -------------------------------------------------------------------------- */
/* #32 EXPERIMENT DESIGN STUDIO VALIDATOR                                     */
/* -------------------------------------------------------------------------- */

const UNSAFE_MATERIAL_PATTERNS = [
  /\bbleach\b/i,
  /\bammonia\b/i,
  /\bhydrochloric\b/i,
  /\bsulfuric\b/i,
  /\bopen flame\b/i,
  /\bexplosive\b/i,
  /\bgunpowder\b/i,
  /\bmercury\b/i,
];

export interface ExperimentEvaluation {
  valid: boolean;
  safetyBlocked: boolean;
  issues: string[];
  trialCount: number;
  mean: number | null;
  range: number | null;
}

export function evaluateExperimentDesign(params: {
  title: string;
  iv: string;
  dv: string;
  controls: string[];
  materials: string;
  trials: number[];
  hazardChecked: boolean;
}): ExperimentEvaluation {
  const issues: string[] = [];
  const safetyBlocked = UNSAFE_MATERIAL_PATTERNS.some((re) => re.test(params.materials));

  if (safetyBlocked) {
    issues.push(
      "Safety Gate: Hazardous chemicals or open flames require certified supervised school lab equipment and cannot be approved for home tests.",
    );
  }
  if (!params.hazardChecked) {
    issues.push("Confirm the school-safe materials & adult supervision checklist before saving.");
  }
  if (!params.title.trim() || !params.iv.trim() || !params.dv.trim()) {
    issues.push(
      "Specify Title, Independent Variable (changed), and Dependent Variable (measured).",
    );
  }
  const cleanControls = params.controls.map((c) => c.trim()).filter(Boolean);
  if (cleanControls.length < 1) {
    issues.push("Add at least 1 Controlled Variable kept constant across every trial.");
  }

  const validTrials = params.trials.filter((n) => Number.isFinite(n));
  const mean =
    validTrials.length > 0
      ? Number((validTrials.reduce((a, b) => a + b, 0) / validTrials.length).toFixed(2))
      : null;
  const range =
    validTrials.length > 1
      ? Number((Math.max(...validTrials) - Math.min(...validTrials)).toFixed(2))
      : 0;

  if (validTrials.length < 2) {
    issues.push("Log at least 2 repeat trials so random measurement noise can be evaluated.");
  }

  return {
    valid: issues.length === 0,
    safetyBlocked,
    issues,
    trialCount: validTrials.length,
    mean,
    range: validTrials.length > 0 ? range : null,
  };
}

/* -------------------------------------------------------------------------- */
/* #33–#35 SMART CLASSROOM, EDUCATOR COPILOT & CLASS ANALYTICS                */
/* -------------------------------------------------------------------------- */

export interface SmartClassroomRecord {
  id: string;
  code: string;
  title: string;
  subject: string;
  grade: string;
  teacherAlias: string;
  announcement: string;
  assignments: Array<{
    id: string;
    title: string;
    dueLabel: string;
    kind: "quiz" | "reading" | "project";
    targetRoute: string;
  }>;
}

export const SEEDED_SMART_CLASSROOMS: SmartClassroomRecord[] = [
  {
    id: "cls_stem9",
    code: "BTC-STEM9",
    title: "Grade 9 STEM Inquiry & Algebra",
    subject: "Science & Math",
    grade: "Grade 9",
    teacherAlias: "Faculty STEM Lead",
    announcement:
      "This week: Focus on identifying controlled variables and closing negative-number prerequisites.",
    assignments: [
      {
        id: "asg_stem_1",
        title: "Experiment Design: 3-Trial Control Variable Check",
        dueLabel: "Due Friday",
        kind: "project",
        targetRoute: "/app/study",
      },
      {
        id: "asg_stem_2",
        title: "Diagnostic Exam Sim (Mathematics Foundation)",
        dueLabel: "Recommended This Week",
        kind: "quiz",
        targetRoute: "/app/study",
      },
    ],
  },
  {
    id: "cls_eng9",
    code: "BTC-ENG9",
    title: "Academic English & Global Communication",
    subject: "English",
    grade: "Grade 9",
    teacherAlias: "Academic Writing Coach",
    announcement:
      "Complete your Unit 3 cohesion drill and review passive vs. active voice in Writing Academy.",
    assignments: [
      {
        id: "asg_eng_1",
        title: "Listening & Reading Unit 3 Practice",
        dueLabel: "Due Thursday",
        kind: "reading",
        targetRoute: "/app/english",
      },
    ],
  },
];

export interface EducatorDraftOutput {
  title: string;
  objectives: string[];
  differentiatedActivities: {
    foundation: string;
    standard: string;
    extension: string;
  };
  exitQuestion: string;
  requiresEducatorReview: true;
}

export function generateTeacherDraftLocally(params: {
  subject: string;
  grade: string;
  topic: string;
}): EducatorDraftOutput {
  const topic = params.topic.trim() || "Core Concept Inquiry";
  const subject = params.subject.trim() || "General Studies";
  const grade = params.grade.trim() || "Grade 9";

  return {
    title: `${grade} ${subject}: ${topic}`,
    objectives: [
      `Define ${topic} accurately using clear ${subject} terminology.`,
      `Distinguish common misconceptions from verified principles in ${topic}.`,
      `Apply ${topic} to one unfamiliar real-world scenario.`,
    ],
    differentiatedActivities: {
      foundation: `Guided worked example + prerequisite vocabulary check for ${topic} (visual step prompts).`,
      standard: `5-question mixed practice with peer explanation of why distractors fail.`,
      extension: `Open-ended transfer challenge connecting ${topic} to a cross-curricular sustainability or design constraint.`,
    },
    exitQuestion: `In 2–3 sentences, explain the single most important rule governing ${topic} and one mistake to avoid.`,
    requiresEducatorReview: true,
  };
}

export interface ClassKnowledgeAnalyticsReport {
  sampleSizeNotice: string;
  averageExamPct: number | null;
  topMisconceptions: Array<{ label: string; count: number }>;
  strongestSubject: string | null;
  priorityInterventionTopic: string | null;
}

export function computeClassKnowledgeAnalytics(params: {
  state: StudentEcosystemState;
  studyItems: StudyItemRow[];
  quizAttempts: QuizAttemptRow[];
}): ClassKnowledgeAnalyticsReport {
  const { state, studyItems, quizAttempts } = params;
  const misconceptions = analyzeMisconceptions({
    studyItems,
    quizAttempts,
    examWeakTopics: state.examHistory.flatMap((e) => e.weakTopics),
  });

  const avgExam =
    state.examHistory.length > 0
      ? Math.round(
          state.examHistory.reduce((acc, e) => acc + e.scorePct, 0) / state.examHistory.length,
        )
      : null;

  const subjectScores: Record<string, number[]> = {};
  for (const ex of state.examHistory) {
    const key = ex.subject.split("(")[0]!.trim();
    if (!subjectScores[key]) subjectScores[key] = [];
    subjectScores[key]!.push(ex.scorePct);
  }

  let strongestSubject: string | null = null;
  let bestAvg = -1;
  for (const [subj, scores] of Object.entries(subjectScores)) {
    const a = scores.reduce((x, y) => x + y, 0) / scores.length;
    if (a > bestAvg) {
      bestAvg = a;
      strongestSubject = subj;
    }
  }

  return {
    sampleSizeNotice:
      "Aggregated cohort insights only — individual student rankings and private Care reflections are strictly excluded.",
    averageExamPct: avgExam,
    topMisconceptions: misconceptions.map((m) => ({ label: m.title, count: m.count })),
    strongestSubject,
    priorityInterventionTopic: misconceptions[0]?.title ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* #43 CHALLENGE OF THE WEEK & #48/#50 COMMUNITY KNOWLEDGE LIBRARY            */
/* -------------------------------------------------------------------------- */

export interface WeeklyEmpowermentChallenge {
  id: string;
  weekKey: string;
  theme: string;
  title: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  reflectionPrompt: string;
}

const WEEKLY_CHALLENGES_POOL: Omit<WeeklyEmpowermentChallenge, "weekKey">[] = [
  {
    id: "wk_energy_audit",
    theme: "Sustainability & Quantitative Reasoning",
    title: "Classroom Standby Power Challenge",
    prompt:
      "12 idle computer monitors draw 4W each for 16 hours overnight (5 nights/week). How much standby energy (Wh) is wasted per week if left switched on?",
    options: ["960 Wh", "3,840 Wh", "1,920 Wh"],
    correctIndex: 1,
    reflectionPrompt:
      "Name one practical classroom habit your team could pilot to reduce standby waste.",
  },
  {
    id: "wk_source_check",
    theme: "Media Literacy & Evidence",
    title: "Viral Infographic Fact-Check",
    prompt:
      "A viral chart claims a study supplement boosts exam grades by 40%, citing '8 volunteer friends over 3 days' with no control group. What is the decisive flaw?",
    options: [
      "The chart color palette is bright",
      "Tiny non-randomized sample, short duration, and zero control group make causal claims invalid",
      "The PDF loaded slowly",
    ],
    correctIndex: 1,
    reflectionPrompt: "What minimum evidence standard do you require before sharing study advice?",
  },
];

export function getCurrentWeeklyChallenge(
  dateIso = new Date().toISOString().slice(0, 10),
): WeeklyEmpowermentChallenge {
  const d = new Date(`${dateIso.slice(0, 10)}T00:00:00Z`);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((d.getTime() - yearStart.getTime()) / 86400000);
  const weekNum = Math.max(1, Math.ceil((dayOfYear + 1) / 7));
  const weekKey = `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  const item = WEEKLY_CHALLENGES_POOL[weekNum % WEEKLY_CHALLENGES_POOL.length]!;
  return {
    ...item,
    weekKey,
  };
}

export const CURATED_COMMUNITY_GUIDES = [
  {
    id: "com_guide_negatives",
    title: "Visualizing Negative Numbers with Elevator Floors",
    subject: "Mathematics",
    grade: "Grades 7–9",
    summary:
      "Think of 0 as the ground lobby, positive integers as upper floors, and negative integers as basement levels (-1, -2, -3). Subtracting a negative means canceling a basement drop (moving upward).",
    steps: [
      "Start at your first number on a vertical number line.",
      "Adding a positive moves UP; subtracting a positive moves DOWN.",
      "Subtracting a negative reverses direction UPWARD (e.g., 3 - (-2) = 5).",
    ],
    authorAlias: "Peer Math Mentor · Verified",
    status: "approved" as const,
    votes: 14,
    createdAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "com_guide_paragraph",
    title: "PEEL Paragraph Check in 60 Seconds",
    subject: "English",
    grade: "Grades 8–10",
    summary:
      "Before submitting any academic essay paragraph, check Point, Evidence, Explanation, and Link to thesis.",
    steps: [
      "Point: Does sentence 1 make one specific arguable claim?",
      "Evidence: Did you include a concrete fact, quote, or data point?",
      "Explanation: Did you explain WHY that evidence proves your point?",
      "Link: Does the final phrase connect back to the essay thesis?",
    ],
    authorAlias: "Writing Circle · Verified",
    status: "approved" as const,
    votes: 19,
    createdAt: "2026-10-05T00:00:00Z",
  },
];

const PII_SAFETY_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(\+?\d[\d\s-]{6,}\d))/;

export function validateSafeCommunityContribution(
  params:
    | string
    | {
        title: string;
        summary: string;
        stepsText: string;
      },
): { ok: boolean; reason?: string } {
  if (typeof params === "string") {
    const trimmed = params.trim();
    if (trimmed.length < 3) {
      return {
        ok: false,
        reason: "Please provide a clear, helpful message (at least 3 characters).",
      };
    }
    if (PII_SAFETY_REGEX.test(trimmed)) {
      return {
        ok: false,
        reason:
          "Minor Safety Block: Never include email addresses, phone numbers, or personal contact details in community posts.",
      };
    }
    return { ok: true };
  }
  const combined = `${params.title} ${params.summary} ${params.stepsText}`;
  if (params.title.trim().length < 5 || params.summary.trim().length < 15) {
    return {
      ok: false,
      reason: "Provide a clear title (5+ chars) and helpful explanation (15+ chars).",
    };
  }
  if (PII_SAFETY_REGEX.test(combined)) {
    return {
      ok: false,
      reason:
        "Minor Safety Block: Never include email addresses, phone numbers, or personal contact details in community study guides.",
    };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* #51 LITERACY & LEARNING ACCESS INITIATIVE                                  */
/* -------------------------------------------------------------------------- */

export interface LiteracyAccessLesson {
  id: string;
  step: number;
  title: string;
  titleAr: string;
  focusSkill: string;
  readAloudScript: string;
  plainLanguageTip: string;
  checkQuestion: string;
  options: string[];
  correctIndex: number;
}

export const LITERACY_ACCESS_LESSONS: LiteracyAccessLesson[] = [
  {
    id: "lit_1_signs",
    step: 1,
    title: "Everyday Signs, Forms & Health Labels",
    titleAr: "قراءة اللوحات اليومية والنماذج الأساسية",
    focusSkill: "Functional Reading & High-Frequency Action Words",
    readAloudScript:
      "Read slowly from left to right. Break long words into small sound parts: en-trance, ex-it, warn-ing, sign here. Always ask: what action is this sign asking me to take safely?",
    plainLanguageTip: "Look for action verbs first: Stop, Enter, Wait, Sign, Call.",
    checkQuestion: "On a school clinic form, what does 'Emergency Contact' mean?",
    options: [
      "Your favorite school subject",
      "A trusted parent or guardian phone number in case urgent help is needed",
      "The school lunch menu",
    ],
    correctIndex: 1,
  },
  {
    id: "lit_2_phonics",
    step: 2,
    title: "Breaking Multi-Syllable Words into Clear Beats",
    titleAr: "تقسيم الكلمات الطويلة إلى مقاطع واضحة",
    focusSkill: "Syllable Chunking & Confidence",
    readAloudScript:
      "Every English syllable has one clear vowel beat. Clap once per beat: im-por-tant (3 beats), in-for-ma-tion (4 beats). Chunking turns intimidating text into easy pieces.",
    plainLanguageTip:
      "Cover the second half of a long word, read the first half, then uncover the rest.",
    checkQuestion: "How many clear vowel beats (syllables) are in the word 're-mem-ber'?",
    options: ["2 beats", "3 beats", "5 beats"],
    correctIndex: 1,
  },
  {
    id: "lit_3_main_idea",
    step: 3,
    title: "Finding the One Big Message in Any Paragraph",
    titleAr: "استخراج الفكرة الرئيسية من أي فقرة ببساطة",
    focusSkill: "Core Comprehension Without Jargon",
    readAloudScript:
      "After reading three sentences, pause and ask yourself: 'Who or what is this mostly about, and what is happening?' If you can say it in 6 simple words, you understood it.",
    plainLanguageTip: "Use Focus Reading overlay + Read Aloud whenever dense text feels tiring.",
    checkQuestion:
      "Read: 'Clean water helps crops grow. Rain barrels save water during dry months. Schools can collect rain from roofs.' What is the big message?",
    options: [
      "Collecting rainwater helps conserve water for dry months",
      "Schools should paint their roofs blue",
      "Rain only falls in winter",
    ],
    correctIndex: 0,
  },
];
