import { ALL_STUDY_VOCAB_UNITS, type Grade9VocabWord } from "@/data/grade9-vocab-units";

export type ChatbotRoleId = "general" | "vocab" | "stem" | "exam";

function detectArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function findMatchingVocabWords(query: string): Grade9VocabWord[] {
  const lower = query.toLowerCase();
  const matches: Grade9VocabWord[] = [];
  const seen = new Set<string>();

  for (const unit of ALL_STUDY_VOCAB_UNITS) {
    for (const item of unit.words) {
      if (seen.has(item.id)) continue;
      const wordLower = item.word.toLowerCase();
      if (
        lower.includes(wordLower) ||
        (item.meaningAr && query.includes(item.meaningAr.split("/")[0]?.trim() || "__none__"))
      ) {
        matches.push(item);
        seen.add(item.id);
      }
      if (matches.length >= 3) break;
    }
    if (matches.length >= 3) break;
  }

  return matches;
}

export function generateCurriculumAwareReply(params: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  role?: ChatbotRoleId;
  langHint?: string;
}): string {
  const trimmed = params.message.trim();
  const isAr = detectArabic(trimmed) || params.langHint === "ar";
  const lower = trimmed.toLowerCase();

  // 1. Vocabulary word lookup across Grade 9 Units 1-4, Unit 9, and Essential Words
  const vocabHits = findMatchingVocabWords(trimmed);
  if (vocabHits.length > 0) {
    if (isAr) {
      const blocks = vocabHits.map(
        (w) =>
          `• **${w.word}** (${w.partOfSpeech} — ${w.phonetic})\n  - **المعنى**: ${w.meaningAr}\n  - **التعريف**: ${w.definitionEn}\n  - **مثال**: "${w.exampleEn}"\n  - **الترجمة**: ${w.exampleAr}`,
      );
      return `إليك شرح المفردات المطلوبة من منهج الصف التاسع:\n\n${blocks.join("\n\n")}\n\nهل تريد سؤال اختبار قصير (Quiz) على هذه الكلمة؟`;
    }

    const blocks = vocabHits.map(
      (w) =>
        `• **${w.word}** (${w.partOfSpeech}, ${w.phonetic})\n  - **Meaning**: ${w.meaningAr}\n  - **Definition**: ${w.definitionEn}\n  - **Example**: "${w.exampleEn}"\n  - **Collocations**: ${w.collocations.join(", ")}`,
    );
    return `Here is a clear breakdown from the Grade 9 Study Vocabulary library:\n\n${blocks.join("\n\n")}\n\nWould you like a quick multiple-choice practice question on ${vocabHits[0]!.word}?`;
  }

  // 2. Unit 9 / Science & Tech requests
  if (lower.includes("unit 9") || lower.includes("الوحدة 9") || lower.includes("الوحدة التاسعة")) {
    const unit9 = ALL_STUDY_VOCAB_UNITS.find((u) => u.unit === 9);
    const sampleWords = (unit9?.words ?? []).slice(0, 6);
    if (isAr) {
      return `تركّز **الوحدة التاسعة (العلوم والتكنولوجيا وابتكارات المستقبل)** على ٢٤ كلمة أساسية، من أهمها:\n${sampleWords.map((w) => `• **${w.word}**: ${w.meaningAr}`).join("\n")}\n\nيمكنك أيضاً الانتقال إلى قسم **الدراسة (Study)** والضغط على **اختبار الوحدة ٩ التفاعلي** للحصول على تصحيح فوري لكل سؤال!`;
    }
    return `**Grade 9 Unit 9 (Science, Technology & Future Innovations)** covers 24 core terms, including:\n${sampleWords.map((w) => `• **${w.word}** (${w.phonetic}) — ${w.meaningAr}`).join("\n")}\n\nYou can also open the **Unit 9 Interactive Quiz** in the **Study** module for immediate feedback on every question!`;
  }

  // 3. Quiz / Practice request
  if (
    lower.includes("quiz") ||
    lower.includes("test") ||
    lower.includes("اختبار") ||
    lower.includes("سؤال")
  ) {
    if (isAr) {
      return `إليك سؤال تدريب سريع من الوحدة التاسعة:\n\n**السؤال**: ما معنى كلمة **algorithm**؟\nأ) خوارزمية / خطوات برمجية منطقية\nب) لوحة فنية قديمة\nج) تجربة كيميائية عشوائية\n\nاكتب حرف إجابتك وسأصححها لك فوراً مع الشرح!`;
    }
    return `Here is a quick practice question:\n\n**Question**: Which word means "a proposed explanation tested as a starting point for scientific investigation"?\nA) prototype\nB) hypothesis\nC) network\nD) device\n\nReply with A, B, C, or D and I will check your answer immediately!`;
  }

  // 4. Multiple-choice single-letter answer follow-up
  if (/^[a-dأبجده]$/i.test(trimmed) && (params.history?.length ?? 0) > 1) {
    const isCorrect = /^[bأ]$/i.test(trimmed);
    if (isAr) {
      return isCorrect
        ? `أحسنت! إجابة صحيحة. استمر في التدريب — هل تود سؤالاً آخر أم شرح كلمة جديدة؟`
        : `قريب جداً! راجع الخيار الصحيح (أ في سؤال الخوارزمية، أو B لسؤال الفرضية hypothesis). هل تود محاولة سؤال جديد؟`;
    }
    return isCorrect
      ? `Spot on! **B (hypothesis)** is correct — it is a testable proposed explanation used as a starting point for investigation. Ready for another question?`
      : `Good try! The correct answer is **B (hypothesis)** — a testable proposed explanation in scientific research. Want to try another one?`;
  }

  // 5. Role-aware direct helpful response
  const role = params.role ?? "general";
  if (isAr) {
    const roleHeader =
      role === "vocab"
        ? "بصفتي مدرّب المفردات الإنجليزية"
        : role === "stem"
          ? "بصفتي الموجّه العلمي والرياضي"
          : role === "exam"
            ? "بصفتي مدرّب الاستعداد للاختبارات"
            : "بصفتي مساعد BTC الدراسي";

    return `أهلاً بك! ${roleHeader}، يسعدني مساعدتك في سؤالك: **"${trimmed}"**.\n\nإليك طريقة واضحة وسريعة لإتقان هذا الموضوع:\n1. **حدّد المفهوم الأساسي**: لخّص الفكرة في جملة واحدة بسيطة بلغتك.\n2. **اربط بمثال عملي**: طبّق القاعدة أو المصطلح في جملة أو مسألة قصيرة.\n3. **اختبر نفسك (Active Recall)**: أعد شرح الفكرة غيباً ثم تحقق من التفاصيل.\n\nاكتب لي اسم أي كلمة أو قاعدة (مثلاً: \`algorithm\` أو \`hypothesis\` أو \`Unit 9\`) وسأشرحها لك فوراً مع مثال وترجمة.`;
  }

  const roleHeader =
    role === "vocab"
      ? "As your English & Vocabulary Coach"
      : role === "stem"
        ? "As your STEM & Deep Reasoning Mentor"
        : role === "exam"
          ? "As your Exam & Quiz Prep Coach"
          : "As your BTC Study Assistant";

  return `${roleHeader}, here is a structured breakdown for **"${trimmed}"**:\n\n1. **Core Idea**: Start by defining the key term or rule clearly in one sentence.\n2. **Worked Example**: Connect the concept to one concrete example or sentence in context.\n3. **Active Recall Check**: Test yourself without looking at notes, then verify any gaps.\n\nAsk me about any specific vocabulary word (like \`innovate\`, \`sustainable\`, or \`perseverance\`), ask for a **Unit 9 quiz**, or paste a paragraph you want simplified!`;
}
