import { CURRICULUM_UNITS } from "@/data/curriculum-and-challenges";
import { GRADE_9_UNIT_3_WORDS, UNIT_3_QUIZZES } from "@/data/grade9-unit3-vocab";
import type { StudyItemRow } from "@/lib/firestore-data";

export type ChallengeFormat =
  "mcq" | "missing_word" | "true_false" | "short_answer" | "pronunciation";

export type ChallengeSourceKind = "study_item" | "unit3_vocab" | "unit3_quiz" | "curriculum_unit";

export interface PrimeChallengeItem {
  id: string;
  format: ChallengeFormat;
  sourceKind: ChallengeSourceKind;
  sourceLabelEn: string;
  sourceLabelAr: string;
  subject: string;
  promptEn: string;
  promptAr: string;
  options?: string[];
  correctIndex?: number;
  expectedAnswer?: string;
  acceptedKeywords?: string[];
  referenceNoteEn?: string;
  referenceNoteAr?: string;
  hasObjectiveKey: boolean;
  explanationEn: string;
  explanationAr: string;
}

export interface ChallengeEvaluationResult {
  outcome: "correct" | "incorrect" | "self_review";
  feedbackEn: string;
  feedbackAr: string;
}

export function normalizeChallengeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildEligibleChallengePool(params: {
  studyItems: StudyItemRow[];
  speechRecognitionAvailable: boolean;
  includeCatalogSources?: boolean;
  subjectFilter?: string;
}): PrimeChallengeItem[] {
  const includeCatalog = params.includeCatalogSources ?? true;
  const filterSubj =
    params.subjectFilter && params.subjectFilter !== "all"
      ? params.subjectFilter.toLowerCase()
      : null;

  const pool: PrimeChallengeItem[] = [];

  // 1. Real user Study Items (notes, flashcards, mistakes)
  const matchingStudyItems = params.studyItems.filter(
    (item) => !filterSubj || (item.subject || "General").toLowerCase() === filterSubj,
  );

  for (const item of matchingStudyItems) {
    const subj = item.subject?.trim() || "General";
    const ans = item.answer?.trim() || "";
    const content = item.content?.trim() || "";
    if (!item.title.trim() && !content) continue;

    if (item.kind === "flashcard" && ans) {
      pool.push({
        id: `si_short_${item.id}`,
        format: "short_answer",
        sourceKind: "study_item",
        sourceLabelEn: `Your ${subj} Flashcard`,
        sourceLabelAr: `بطاقة الاستذكار الخاصة بك (${subj})`,
        subject: subj,
        promptEn: `Recall from your flashcard "${item.title}": ${content || "Write the key answer."}`,
        promptAr: `تذكّر من بطاقتك "${item.title}": ${content || "اكتب الإجابة الأساسية."}`,
        expectedAnswer: ans,
        acceptedKeywords: normalizeChallengeText(ans)
          .split(" ")
          .filter((w) => w.length >= 3),
        hasObjectiveKey: true,
        explanationEn: `Your recorded answer: ${ans}`,
        explanationAr: `إجابتك المسجلة: ${ans}`,
      });
    } else if (item.kind === "mistake") {
      pool.push({
        id: `si_mistake_${item.id}`,
        format: "short_answer",
        sourceKind: "study_item",
        sourceLabelEn: `Mistake Notebook · ${subj}`,
        sourceLabelAr: `دفتر الأخطاء · ${subj}`,
        subject: subj,
        promptEn: `Review your logged mistake "${item.title}": ${content}`,
        promptAr: `راجع الخطأ المسجّل "${item.title}": ${content}`,
        ...(ans
          ? {
              expectedAnswer: ans,
              acceptedKeywords: normalizeChallengeText(ans)
                .split(" ")
                .filter((w) => w.length >= 3),
            }
          : {}),
        referenceNoteEn: content,
        referenceNoteAr: content,
        hasObjectiveKey: Boolean(ans),
        explanationEn: ans
          ? `Recorded correction: ${ans}`
          : "Open review item: verify your explanation against your study notes.",
        explanationAr: ans
          ? `التصحيح المسجّل: ${ans}`
          : "مراجعة ذاتية: قارن إجابتك بملاحظاتك الدراسية.",
      });
    } else if (item.kind === "note" && content) {
      pool.push({
        id: `si_note_${item.id}`,
        format: "short_answer",
        sourceKind: "study_item",
        sourceLabelEn: `Study Note · ${subj}`,
        sourceLabelAr: `ملاحظة دراسية · ${subj}`,
        subject: subj,
        promptEn: `Explain the main takeaway from your note "${item.title}" in your own words.`,
        promptAr: `اشرح الفكرة الرئيسية من ملاحظتك "${item.title}" بأسلوبك.`,
        ...(ans ? { expectedAnswer: ans } : {}),
        referenceNoteEn: content,
        referenceNoteAr: content,
        hasObjectiveKey: Boolean(ans),
        explanationEn: `Reference note: ${content.slice(0, 220)}`,
        explanationAr: `النص المرجعي: ${content.slice(0, 220)}`,
      });
    }
  }

  if (!includeCatalog) {
    return pool;
  }

  // 2. Real NEXORA Curriculum Unit Checks
  for (const unit of CURRICULUM_UNITS) {
    if (filterSubj && unit.subject.toLowerCase() !== filterSubj) continue;
    pool.push({
      id: `cur_mcq_${unit.id}`,
      format: "mcq",
      sourceKind: "curriculum_unit",
      sourceLabelEn: `${unit.subject} · ${unit.grade}`,
      sourceLabelAr: `${unit.subject} · ${unit.grade}`,
      subject: unit.subject,
      promptEn: unit.sampleCheck.question,
      promptAr: unit.sampleCheck.question,
      options: [...unit.sampleCheck.options],
      correctIndex: unit.sampleCheck.correctIndex,
      hasObjectiveKey: true,
      explanationEn: unit.sampleCheck.explanation,
      explanationAr: unit.sampleCheck.explanation,
    });
  }

  // 3. Real Grade 9 Unit 3 Quizzes & Vocabulary Challenges (when matching English or all)
  const allowEnglishCatalog = !filterSubj || filterSubj === "english";
  if (allowEnglishCatalog) {
    for (const tier of UNIT_3_QUIZZES) {
      for (const q of tier.questions.slice(0, 4)) {
        pool.push({
          id: `u3_quiz_${tier.id}_${q.id}`,
          format: "mcq",
          sourceKind: "unit3_quiz",
          sourceLabelEn: `English Unit 3 (${tier.id})`,
          sourceLabelAr: `الإنجليزي الوحدة ٣ (${tier.id})`,
          subject: "English",
          promptEn: q.questionEn,
          promptAr: q.questionAr ?? q.questionEn,
          options: [...q.options],
          correctIndex: q.correctIndex,
          hasObjectiveKey: true,
          explanationEn: q.explanationEn,
          explanationAr: q.explanationAr,
        });
      }
    }

    // Missing Word (Cloze) from GRADE_9_UNIT_3_WORDS real example sentences
    for (const w of GRADE_9_UNIT_3_WORDS.slice(0, 12)) {
      const regex = new RegExp(`\\b${escapeRegExp(w.word)}\\b`, "i");
      if (regex.test(w.exampleEn)) {
        const blanked = w.exampleEn.replace(regex, "_____");
        pool.push({
          id: `u3_cloze_${w.id}`,
          format: "missing_word",
          sourceKind: "unit3_vocab",
          sourceLabelEn: `Unit 3 Vocabulary · ${w.partOfSpeech}`,
          sourceLabelAr: `مفردات الوحدة ٣ · ${w.meaningAr}`,
          subject: "English",
          promptEn: `Type the missing Unit 3 word: "${blanked}" (Hint: ${w.definitionEn})`,
          promptAr: `اكتب الكلمة الناقصة من الوحدة ٣: "${blanked}" (تلميح: ${w.meaningAr})`,
          expectedAnswer: w.word,
          acceptedKeywords: [w.word.toLowerCase()],
          hasObjectiveKey: true,
          explanationEn: `Complete sentence: "${w.exampleEn}"`,
          explanationAr: `الجملة الكاملة: "${w.exampleEn}" (${w.meaningAr})`,
        });
      }
    }

    // True or False from verified Unit 3 definitions (alternating accurate vs swapped definitions)
    const vocabSlice = GRADE_9_UNIT_3_WORDS.slice(0, 10);
    vocabSlice.forEach((w, idx) => {
      const isTrueStatement = idx % 2 === 0;
      const other = vocabSlice[(idx + 3) % vocabSlice.length]!;
      const shownDef = isTrueStatement ? w.definitionEn : other.definitionEn;
      const shownAr = isTrueStatement ? w.meaningAr : other.meaningAr;

      pool.push({
        id: `u3_tf_${w.id}`,
        format: "true_false",
        sourceKind: "unit3_vocab",
        sourceLabelEn: "English Unit 3 Verification",
        sourceLabelAr: "التحقق من مفردات الوحدة ٣",
        subject: "English",
        promptEn: `True or False: "${w.word}" means "${shownDef}"`,
        promptAr: `صح أم خطأ: كلمة "${w.word}" تعني "${shownAr}"؟`,
        options: ["True / صحيح", "False / خطأ"],
        correctIndex: isTrueStatement ? 0 : 1,
        hasObjectiveKey: true,
        explanationEn: `"${w.word}" means: ${w.definitionEn}`,
        explanationAr: `المعنى الصحيح لكلمة "${w.word}": ${w.meaningAr}`,
      });
    });

    // Short Answer from verified Unit 3 definitions
    for (const w of GRADE_9_UNIT_3_WORDS.slice(0, 8)) {
      pool.push({
        id: `u3_short_${w.id}`,
        format: "short_answer",
        sourceKind: "unit3_vocab",
        sourceLabelEn: "Unit 3 Recall Check",
        sourceLabelAr: "استرجاع مفردات الوحدة ٣",
        subject: "English",
        promptEn: `Which English Unit 3 word (${w.partOfSpeech}) fits this definition: "${w.definitionEn}"?`,
        promptAr: `ما الكلمة الإنجليزية من الوحدة ٣ التي تعني: "${w.meaningAr}"؟`,
        expectedAnswer: w.word,
        acceptedKeywords: [w.word.toLowerCase(), ...w.synonyms.map((s) => s.toLowerCase())],
        hasObjectiveKey: true,
        explanationEn: `Target word: ${w.word} (${w.phonetic}) — ${w.exampleEn}`,
        explanationAr: `الكلمة المطلوبة: ${w.word} — ${w.exampleAr}`,
      });
    }

    // Pronunciation Challenge ONLY when real browser SpeechRecognition exists
    if (params.speechRecognitionAvailable) {
      for (const w of GRADE_9_UNIT_3_WORDS.slice(0, 6)) {
        pool.push({
          id: `u3_pron_${w.id}`,
          format: "pronunciation",
          sourceKind: "unit3_vocab",
          sourceLabelEn: "English Speaking Practice",
          sourceLabelAr: "تحدي النطق الإنجليزي",
          subject: "English",
          promptEn: `Speak the word clearly: "${w.word}" (${w.phonetic})`,
          promptAr: `انطق الكلمة بوضوح: "${w.word}" (${w.phonetic})`,
          expectedAnswer: w.word,
          acceptedKeywords: [w.word.toLowerCase()],
          hasObjectiveKey: true,
          explanationEn: `Example usage: "${w.exampleEn}"`,
          explanationAr: `مثال: "${w.exampleEn}"`,
        });
      }
    }
  }

  return pool;
}

export function drawNextChallenge(
  pool: PrimeChallengeItem[],
  usedIds: Set<string>,
  randomFn: () => number = Math.random,
): PrimeChallengeItem | null {
  if (pool.length === 0) return null;
  const remaining = pool.filter((item) => !usedIds.has(item.id));
  const candidates = remaining.length > 0 ? remaining : pool;
  const idx = Math.min(candidates.length - 1, Math.floor(randomFn() * candidates.length));
  return candidates[idx] ?? null;
}

export function evaluateChallengeResponse(
  challenge: PrimeChallengeItem,
  response: { selectedIndex?: number | null; textAnswer?: string },
): ChallengeEvaluationResult {
  if (challenge.format === "mcq" || challenge.format === "true_false") {
    const picked = response.selectedIndex;
    if (typeof picked !== "number" || typeof challenge.correctIndex !== "number") {
      return {
        outcome: "incorrect",
        feedbackEn: "Select an option before submitting.",
        feedbackAr: "اختر إجابة قبل الإرسال.",
      };
    }
    const ok = picked === challenge.correctIndex;
    return {
      outcome: ok ? "correct" : "incorrect",
      feedbackEn: ok
        ? `Correct! ${challenge.explanationEn}`
        : `Not quite. ${challenge.explanationEn}`,
      feedbackAr: ok
        ? `إجابة صحيحة! ${challenge.explanationAr}`
        : `ليست الإجابة الصحيحة. ${challenge.explanationAr}`,
    };
  }

  const cleanInput = normalizeChallengeText(response.textAnswer ?? "");
  if (!cleanInput) {
    return {
      outcome: "incorrect",
      feedbackEn: "Please enter a response before checking.",
      feedbackAr: "يرجى كتابة إجابتك قبل التحقق.",
    };
  }

  if (!challenge.hasObjectiveKey) {
    return {
      outcome: "self_review",
      feedbackEn:
        "Self-review recorded. Compare your explanation with your original study note above (open notes do not carry an auto-graded answer key).",
      feedbackAr:
        "تم تسجيل المراجعة الذاتية. قارن شرحك بملاحظتك الأصلية (الملاحظات المفتوحة لا تحتوي على مفتاح تصحيح آلي).",
    };
  }

  const target = normalizeChallengeText(challenge.expectedAnswer ?? "");
  const keywords = (challenge.acceptedKeywords ?? []).map(normalizeChallengeText).filter(Boolean);

  const exactMatch = Boolean(target && cleanInput === target);
  const containsTarget = Boolean(target && target.length >= 3 && cleanInput.includes(target));
  const keywordHitCount = keywords.filter((kw) => cleanInput.includes(kw)).length;
  const keywordMatch =
    keywords.length > 0 && keywordHitCount >= Math.max(1, Math.ceil(keywords.length * 0.5));

  const isCorrect = exactMatch || containsTarget || keywordMatch;
  return {
    outcome: isCorrect ? "correct" : "incorrect",
    feedbackEn: isCorrect
      ? `Well done! ${challenge.explanationEn}`
      : `Expected answer: "${challenge.expectedAnswer}". ${challenge.explanationEn}`,
    feedbackAr: isCorrect
      ? `أحسنت! ${challenge.explanationAr}`
      : `الإجابة المتوقعة: "${challenge.expectedAnswer}". ${challenge.explanationAr}`,
  };
}
