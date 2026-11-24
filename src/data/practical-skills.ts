export interface TypingDrillPrompt {
  id: string;
  level: "beginner" | "academic" | "stem" | "sprint";
  title: string;
  targetWpm: number;
  text: string;
}

export type TypingDeviceMode = "desktop" | "mobile";

export interface TypingMetrics {
  correctChars: number;
  typedChars: number;
  errors: number;
  accuracyPct: number;
  wpm: number;
  progressPct: number;
  completed: boolean;
}

export interface DeviceTypingMetrics extends TypingMetrics {
  deviceMode: TypingDeviceMode;
  adjustedTargetWpm: number;
  meetsTarget: boolean;
}

export interface DigitalSourceCase {
  id: string;
  claim: string;
  sourceLabel: string;
  clues: string[];
  verdict: "reliable_primary" | "needs_verification" | "unreliable_bias";
  explanation: string;
}

export interface CriticalThinkingCase {
  id: string;
  title: string;
  scenario: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  flawName: string;
  explanation: string;
}

export const TYPING_DRILLS: TypingDrillPrompt[] = [
  {
    id: "typ_beg",
    level: "beginner",
    title: "Home Row Clarity",
    targetWpm: 25,
    text: "good study habits start with calm focus and small daily steps keep your eyes on accuracy first",
  },
  {
    id: "typ_acad",
    level: "academic",
    title: "Academic Paragraph Craft",
    targetWpm: 40,
    text: "Effective research requires checking primary evidence, comparing multiple sources, and summarizing arguments clearly in your own words.",
  },
  {
    id: "typ_stem",
    level: "stem",
    title: "STEM & Logic Symbols",
    targetWpm: 35,
    text: "function retentionScore(days, stability = 5.0) { return Math.round(Math.exp(-days / stability) * 100); }",
  },
  {
    id: "typ_sprint",
    level: "sprint",
    title: "Speed Precision Sprint",
    targetWpm: 50,
    text: "Consistent effort compounds over weeks when curiosity meets structured practice, honest feedback, and timely rest.",
  },
];

export function evaluateTypingSession(
  target: string,
  typed: string,
  elapsedMs: number,
): TypingMetrics {
  const safeTarget = target ?? "";
  const safeTyped = typed ?? "";
  const compareLen = Math.min(safeTyped.length, safeTarget.length);
  let correctChars = 0;
  let errors = 0;

  for (let i = 0; i < safeTyped.length; i++) {
    if (i < safeTarget.length && safeTyped[i] === safeTarget[i]) {
      correctChars++;
    } else {
      errors++;
    }
  }

  const accuracyPct =
    safeTyped.length > 0 ? Math.max(0, Math.round((correctChars / safeTyped.length) * 100)) : 100;
  const elapsedMinutes = Math.max(elapsedMs, 1000) / 60_000;
  const wpm = safeTyped.length > 0 ? Math.max(0, Math.round(correctChars / 5 / elapsedMinutes)) : 0;
  const progressPct =
    safeTarget.length > 0 ? Math.min(100, Math.round((compareLen / safeTarget.length) * 100)) : 0;
  const completed = safeTyped === safeTarget && safeTarget.length > 0;

  return {
    correctChars,
    typedChars: safeTyped.length,
    errors,
    accuracyPct,
    wpm,
    progressPct,
    completed,
  };
}

export function getDeviceTypingTargetWpm(
  drill: Pick<TypingDrillPrompt, "targetWpm">,
  deviceMode: TypingDeviceMode,
): number {
  if (deviceMode === "mobile") {
    return Math.max(15, Math.round(drill.targetWpm * 0.65));
  }
  return drill.targetWpm;
}

export function evaluateTypingSessionForDevice(
  target: string,
  typed: string,
  elapsedMs: number,
  deviceMode: TypingDeviceMode,
  desktopTargetWpm = 35,
): DeviceTypingMetrics {
  const base = evaluateTypingSession(target, typed, elapsedMs);
  const adjustedTargetWpm = getDeviceTypingTargetWpm({ targetWpm: desktopTargetWpm }, deviceMode);
  const meetsTarget = base.completed && base.wpm >= adjustedTargetWpm && base.accuracyPct >= 90;
  return {
    ...base,
    deviceMode,
    adjustedTargetWpm,
    meetsTarget,
  };
}

export const DIGITAL_RESEARCH_CASES: DigitalSourceCase[] = [
  {
    id: "res_1",
    claim: "Drinking one cup of blue tea doubles exam memory overnight for 100% of students.",
    sourceLabel: "Sponsored Blog Post — 'MiracleBrainShop.example'",
    clues: [
      "Zero peer-reviewed citations linked",
      "Promotes an affiliate product coupon at the bottom",
      "Claims an extreme '100%' overnight guarantee",
    ],
    verdict: "unreliable_bias",
    explanation:
      "Commercial conflict of interest, extreme universal claim ('100%'), and lack of methodology mark this unreliable.",
  },
  {
    id: "res_2",
    claim: "Spaced repetition improved 30-day vocabulary recall by 24% in a 180-student trial.",
    sourceLabel: "Journal of Educational Psychology — Open Dataset + Methods Appendix",
    clues: [
      "Named institutional researchers & publication year",
      "Control group size and statistical margins reported",
      "Raw dataset protocol documented for replication",
    ],
    verdict: "reliable_primary",
    explanation:
      "Transparent sample size, control comparison, and replication methods indicate reliable primary research.",
  },
  {
    id: "res_3",
    claim: "A news headline states: 'New phone screen mode boosts reading speed by half.'",
    sourceLabel: "General Tech Digest summarizing an unnamed 12-person pilot",
    clues: [
      "Original paper is not linked directly",
      "Pilot tested only 12 participants over 2 days",
    ],
    verdict: "needs_verification",
    explanation:
      "Secondary summaries require locating the original paper and checking small sample limitations before citing.",
  },
];

export function formatAcademicCitation(input: {
  style: "APA" | "MLA";
  author: string;
  year: string;
  title: string;
  publisher: string;
}): string {
  const author = input.author.trim() || "Unknown Author";
  const year = input.year.trim() || "n.d.";
  const title = input.title.trim() || "Untitled Source";
  const pub = input.publisher.trim() || "Publisher";

  if (input.style === "MLA") {
    return `${author}. "${title}." ${pub}, ${year}.`;
  }
  return `${author} (${year}). ${title}. ${pub}.`;
}

export const CRITICAL_THINKING_CASES: CriticalThinkingCase[] = [
  {
    id: "ct_1",
    title: "The Honor Roll Laptop Claim",
    scenario:
      "A survey shows students who own SilverBrand laptops earn 15% higher math grades than peers without them. An ad claims: 'SilverBrand laptops make students smarter at algebra!'",
    question: "What is the hidden reasoning error in this claim?",
    options: [
      "Sample was measured in metric units",
      "Confusing correlation with causation (ignoring family resources or study tutoring)",
      "Mathematics does not use computers",
      "Percent differences cannot be 15%",
    ],
    correctIndex: 1,
    flawName: "Correlation vs. Causation",
    explanation:
      "Higher grades may reflect confounding factors like access to quiet study spaces, internet, or tutoring—not the laptop brand causing intelligence.",
  },
  {
    id: "ct_2",
    title: "The Either-Or Debate",
    scenario:
      "During a club budget meeting, a member argues: 'Either we spend the entire budget on new robots today, or we clearly don't care about STEM innovation at all.'",
    question: "Which logical flaw shapes this statement?",
    options: [
      "False Dilemma (ignoring balanced middle options)",
      "Accurate arithmetic proof",
      "Primary source verification",
      "Chronological ordering",
    ],
    correctIndex: 0,
    flawName: "False Dilemma",
    explanation:
      "The argument forces two extreme choices when partial funding, shared kits, or phased upgrades exist.",
  },
  {
    id: "ct_3",
    title: "Circular Definition Trap",
    scenario:
      "An essay asserts: 'This study method is the best approach because top learners use it, and we know it's superior simply because it produces the highest results.'",
    question: "Why does this argument lack independent evidence?",
    options: [
      "It cites a textbook appendix",
      "Circular reasoning (restating the conclusion as its own proof without data)",
      "It translates Arabic terms",
      "It includes too many graphs",
    ],
    correctIndex: 1,
    flawName: "Circular Reasoning",
    explanation:
      "Claiming X is best because it is superior repeats the premise without supplying test evidence.",
  },
];

export const PRESENTATION_TEMPLATES = [
  {
    id: "pres_science",
    name: "STEM Project Pitch (3–5 min)",
    hookPh:
      "Ask one vivid real-world question (e.g., How much school energy is wasted after 4 PM?)",
    thesisPh:
      "We built a low-cost sensor prototype that flags idle classroom lights automatically.",
    evidencePh:
      "Measured 19% electricity savings across a 5-day classroom log + verified wiring cost under $18.",
    ctaPh: "Approve a 2-week pilot across three science labs starting next Sunday.",
  },
  {
    id: "pres_book",
    name: "Academic Topic Briefing",
    hookPh: "Share one surprising fact or contrast that breaks a common myth.",
    thesisPh: "Clarify the core concept or historical turning point in one plain sentence.",
    evidencePh: "Walk through two concrete historical/textual examples and one visual comparison.",
    ctaPh: "Close with one takeaway question for the audience to reflect on.",
  },
];
