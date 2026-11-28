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

// Natural conversational helpers
function tryEvaluateMath(text: string): string | null {
  const clean = text.replace(/×/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
  const mathMatch = clean.match(new RegExp("^(\\d+(\\.\\d+)?)([+\\-*/])(\\d+(\\.\\d+)?)$"));
  if (!mathMatch) return null;
  const a = parseFloat(mathMatch[1]!);
  const op = mathMatch[3]!;
  const b = parseFloat(mathMatch[4]!);
  let res = 0;
  if (op === "+") res = a + b;
  else if (op === "-") res = a - b;
  else if (op === "*") res = a * b;
  else if (op === "/") {
    if (b === 0) return "القسمة على صفر غير معرفة رياضياً (Undefined).";
    res = a / b;
  }
  return `الناتج هو: **${res}**\n\n${a} ${op} ${b} = ${res}`;
}

export function generateCurriculumAwareReply(params: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }> | undefined;
  role?: ChatbotRoleId | undefined;
  langHint?: string | undefined;
  attachmentNames?: string[] | undefined;
}): string {
  const trimmed = params.message.trim();
  const isAr = detectArabic(trimmed) || params.langHint === "ar";
  const lower = trimmed.toLowerCase();

  if (params.attachmentNames && params.attachmentNames.length > 0 && trimmed.length < 4) {
    return isAr
      ? `تم استلام **${params.attachmentNames.length}** صورة (${params.attachmentNames.join("، ")}) في الوضع المحلي دون اتصال بالإنترنت. لتحليل تفاصيل الصور بالرؤية الذكية الكاملة يرجى الاتصال بالإنترنت، أو اكتب سؤالك حول الصورة وسأساعدك فوراً.`
      : `Received **${params.attachmentNames.length}** image(s) (${params.attachmentNames.join(", ")}) in offline mode. Reconnect to analyze visual details directly, or describe what you need help with.`;
  }

  // Grammar precision check: countable & uncountable nouns
  if (
    /(countable|uncountable|much\s+vs\s+many|few\s+vs\s+little|معدود|غير\s*معدود)/i.test(trimmed)
  ) {
    return isAr
      ? `### شرح الأسماء المعدودة وغير المعدودة (Countable & Uncountable Nouns)\n\n**١. التعريف المباشر:**\n- **الأسماء المعدودة (Countable):** أشياء يمكن عدّها ولها مفرد وجمع (مثل: *book / books*، *apple / apples*).\n- **الأسماء غير المعدودة (Uncountable):** أشياء تُعامل كوحدة واحدة ولا تُعد بالعدد مباشرة ولا يُضاف لها (s) الجمع (مثل: *water, money, information, advice*).\n\n**٢. القواعد وأدوات الكمية:**\n- مع **المعدود المفرد** نستخدم: **a / an** (مثال: *a pen, an idea*).\n- مع **المعدود الجمع** نستخدم: **many / a few / few** (مثال: *many students, a few books*).\n- مع **غير المعدود** نستخدم فعلاً مفرداً دائماً، ومعه: **much / a little / little** (مثال: *much time, a little water*).\n- **some** للإثبات والعرض، و**any** للنفي والسؤال لكليهما.\n\n**٣. استثناءات وملاحظات مهمة:**\n- كلمات مثل **information, advice, news, furniture, luggage, money** غير معدودة في الإنجليزية وتأخذ فعلاً مفرداً دائماً (نقول: *The news is good* وليس *are*).\n- كلمات مثل **water, coffee, paper** قد تُعد فقط عند قصد "كوب/ورقة/نوع" (مثال: *two coffees* = كوبان من القهوة).`
      : `### Countable & Uncountable Nouns\n\n**1. Direct Definition:**\n- **Countable nouns** refer to items you can count individually. They have both singular and plural forms (*one apple, three apples*).\n- **Uncountable nouns** refer to substances, concepts, or masses treated as a single whole without a plural form (*water, information, money, advice*).\n\n**2. Rules & Quantifiers:**\n- **Singular countable:** use **a / an** (*a laptop, an hour*).\n- **Plural countable:** use **many / a few / few** (*many ideas, a few minutes*).\n- **Uncountable:** always take a **singular verb** and pair with **much / a little / little** (*much progress, a little water*).\n- Use **some** in positive sentences/offers and **any** in questions/negatives for both types.\n\n**3. Practical Examples & Tricky Exceptions:**\n- *water / coffee*: usually uncountable (*I need some water*), but countable when ordering servings (*Two coffees, please*).\n- *money*: uncountable (*How much money do we need?* — never *moneys*).\n- *information / advice / news / luggage / furniture*: strictly uncountable in English — say *a piece of advice* or *some information*, and use singular verbs (*The news is encouraging*).`;
  }

  // 1. Math evaluation if simple formula
  const mathRes = tryEvaluateMath(trimmed);
  if (mathRes) {
    return isAr ? mathRes : `The answer is: **${mathRes.split("**")[1] ?? mathRes}**`;
  }

  // 2. Greetings and friendly conversation in Arabic (Egyptian / Fusha / Gulf), English, Chinese, etc.
  if (/السلام\s*عليكم/i.test(trimmed)) {
    return "وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك يا صديقي الغالي. كيف حالك اليوم وبماذا تحب أن أساعدك؟ أنا جاهز لكل ما تريده.";
  }
  if (
    /(إزيك|ازيك|عامل إيه|عامل ايه|اخبارك|أخبارك|شخبارك|كيف حالك|كيفك|مساء الخير|صباح الخير)/i.test(
      trimmed,
    )
  ) {
    return "الحمد لله أنا بخير وزي الفل! أهلاً بك يا بطل، إنت عامل إيه وأخبارك إيه النهارده؟ أنا هنا معاك في أي وقت وصاحبك في كل حاجة: مذاكرة، برمجة، كلام عام، أو أي سؤال في بالك!";
  }
  if (/(أنت مين|انت مين|عرفني بنفسك|مين انت|من انت|who are you)/i.test(trimmed)) {
    return isAr
      ? "أنا **BTC AI**، مساعدك الذكي وصاحبك الوفي الشامل! تقدر تسألني في أي حاجة تخطر ببالك: برمجة، دراسة، لغات، تجهيز شنط السفر، نكت وحكايات، نصائح، أو حتى ندردش ونتكلم مع بعض في أي موضوع تحبه. ماذا تحب أن نبدأ به؟"
      : "I am **BTC AI**, your all-around smart companion and mentor! You can ask me literally anything: coding in any language, study topics, science, travel packing, storytelling, jokes, or everyday chats. What would you like to explore?";
  }
  if (/(أنت صاحبي|انت صاحبي|خليك صاحبي|نكون اصحاب|صاحبي)/i.test(trimmed)) {
    return "يشرفني جداً يا غالي! أنا صاحبك وأخوك في أي وقت، تسألني وتفضفض معايا ونتعلم سوا ونضحك سوا. قولي إيه اللي شاغل بالك أو إيه أكتر حاجة نفسك تعملها النهارده؟";
  }
  if (/(وحشتني|بحبك|شكرا|تسلم|الله يخليك|يعطيك العافية)/i.test(trimmed)) {
    return "تسلم وتعيش يا بطل، محبتك وذوقك على راسي! وأنا دايماً في خدمتك وجنبك في كل خطوة. ربنا يسعدك ويوفقك ويفتح عليك كل أبواب الخير والنجاح!";
  }

  // 3. Humor, jokes, stories, and riddles
  if (/(نكتة|نكته|ضحكني|joke|funny)/i.test(trimmed)) {
    return isAr
      ? 'إليك هذه النكتة اللطيفة:\n\nمرّة مبرمج خرج يشتري لبن، زوجته قالت له: "روح السوبرماركت واشتري علبة لبن، ولو لقيت بيض هات عشرة!"\nالمبرمج رجع البيت ومعه ١٠ علب لبن! زوجته سألته باستغراب: "ليه اشتريت ١٠ علب لبن؟!"\nقال لها بكل ثقة: "لأنني لقيت بيض!" (If eggs == true, milk = 10) 😂\n\nتحب نكتة تانية ولا فزورة ذكية؟'
      : "Why do programmers prefer dark mode? Because light attracts bugs! 😄 Want another joke or a fun brain teaser?";
  }
  if (/(قصة|احكيلي|احكي لي|حدوتة|story)/i.test(trimmed)) {
    return isAr
      ? 'إليك قصة ملهمة قصيرة:\n\nيُحكى أن شاباً كان يسأل حكيماً عن سر النجاح الحقيقي. أخذ الحكيم الشاب إلى بحيرة ماء وطلب منه أن يغطس رأسه، ثم أمسك برأسه تحت الماء بضع ثوانٍ. وعندما كاد يختنق، رفع رأسه فاستنشق الشاب الهواء بلهفة شديدة وعطش هائل للحياة.\nقال له الحكيم: "عندما ترغب في النجاح والعلم بنفس الشغف الذي كنت ترغب به في استنشاق الهواء وأنت تحت الماء، حينها فقط ستحقق كل أهدافك وتصل إلى القمة!"\n\nالهدف والشغف والإصرار هم مفتاح كل باب مغلق يا بطل.'
      : "Here is a short thought to inspire you: When Thomas Edison was asked about failing 1,000 times before inventing the light bulb, he simply replied: 'I didn't fail 1,000 times. The light bulb was an invention with 1,000 steps.' Every single attempt is progress!";
  }

  // 4. Luggage & Packing Checklist support (User's specific clothes checklist)
  if (
    /(بولو|تيشيرت|قميص|كلثون|طاقية|فلن|شورت|ترينج|شبشب|حذاء|كوتشي|بنطلون|شنطة|سفر|ملابس|هدوم|packing|luggage)/i.test(
      trimmed,
    )
  ) {
    return `يا هلا بيك! قائمة الملابس والسفر جاهزة ومرتبة تماماً:\n\n**قائمة تجهيز الملابس الرياضية والشخصية:**\n• **القمصان والتيشيرتات**: ٢ تيشيرت بولو أنيق + ٢ تيشيرت عادي مريح + قميصين + قميصين بكم طويل + تيشيرت رياضي.\n• **الأطقم والترينجات**: طقمين رياضيين كاملين + ترينج رياضي مريح.\n• **البناطيل والشورتات**: بنطلونين كاجوال/جينز + شورتين رياضيين.\n• **الملابس الداخلية والراحة**: كلثونات + فلنات قطنية داخلية + طاقية للحماية من الشمس.\n• **الأحذية**: شبشبين عمليين + حذاء أنيق + كوتشي رياضي للمشي والجري.\n\n💡 **نصيحة ذكية للترتيب**: لف الملابس بنظام (Rolling) بدل الطي العادي لتوفير مساحة كبيرة داخل الشنطة وتجنب التجاعيد. هل تحب أضيف لك مقتنيات أخرى زي الشواحن، فرشاة الأسنان، أو المعطر؟`;
  }

  // 5. Programming & Coding support (Python, JS, React, HTML/CSS, C++, etc.)
  if (
    /(بايثون|python|برمجة|كود|code|javascript|typescript|html|css|c\+\+|react|عايز اتعلم برمجة)/i.test(
      trimmed,
    )
  ) {
    if (lower.includes("python") || trimmed.includes("بايثون")) {
      return `أهلاً بك في عالم بايثون (Python) الممتع! إليك مثال عملي سريع وبسيط لكتابة أول برنامج ذكي:\n\n\`\`\`python\n# برنامج بسيط للترحيب وحساب العمر\nname = input("اكتب اسمك: ")\nprint(f"أهلاً بك يا {name} في عالم الذكاء الاصطناعي!")\n\n# مثال على قائمة (List) مع حلقة تكرار (Loop)\nskills = ["حل المشكلات", "التفكير المنطقي", "الابتكار"]\nfor skill in skills:\n    print(f"✨ مهارة مكتسبة: {skill}")\n\`\`\`\n\n📌 **أهم ميزات بايثون**: لغة سهلة القراءة كأنها لغة إنجليزية عادية، وتُستخدم بقوة في الذكاء الاصطناعي، تطوير الويب، وتحليل البيانات. تحب نكتب كود معين أو نحل مسألة معاً؟`;
    }
    if (lower.includes("javascript") || lower.includes("js") || lower.includes("react")) {
      return `جافاسكريبت و React هما لغة بناء واجهات وتطبيقات الويب الحديثة! إليك مثال لمكون تفاعلي:\n\n\`\`\`tsx\nimport React, { useState } from "react";\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button \n      onClick={() => setCount(prev => prev + 1)}\n      className="px-4 py-2 bg-emerald-600 text-white rounded-lg"\n    >\n      عدد الضغطات: {count}\n    </button>\n  );\n}\n\`\`\`\n\nهل تريد شرح كيفية عمل الـ Hooks مثل useState و useEffect أو ربط الواجهة مع Backend؟`;
    }
    return `البرمجة هي لغة المستقبل وصناعة الحلول الذكية! سواء كنت تحب:\n1. **Python**: للذكاء الاصطناعي، أتمتة المهام، وتحليل البيانات.\n2. **JavaScript / TypeScript**: لتطوير مواقع الويب وتطبيقات الموبايل الحديثة.\n3. **C++**: للأنظمة فائقة السرعة، الألعاب، والروبوتات.\n\nقولي أي لغة أو فكرة في بالك وسأشرحها لك خطوة بخطوة مع كود مجرب وشغال ١٠٠%!`;
  }

  // 6. Quran, Islamic knowledge, Duas, and spiritual wisdom
  if (
    /(آية الكرسي|ايه الكرسي|الفاتحة|الكهف|تفسير|قرآن|سورة|دعاء|حديث|صلاة|أذكار|اذكار)/i.test(
      trimmed,
    )
  ) {
    if (trimmed.includes("الكرسي")) {
      return `**آية الكرسي** (سورة البقرة: ٢٥٥) هي أعظم آية في كتاب الله تعالى:\n\n﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾\n\n✨ **فضلها**: من قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت، وهي حصن حصين يحفظ الإنسان في يومه وليلته. يمكنك أيضاً البحث عنها أو الضغط على علامة المايك وقراءتها في قسم **القرآن الكريم** وسينقلك المصحف لصفحتها فورا مع تظليلها!`;
    }
    if (trimmed.includes("دعاء") || trimmed.includes("ادعيلي")) {
      return "اللهم يا حي يا قيوم، يا ذا الجلال والإكرام، نسألك أن توفقه وتفتح عليه فتوح العارفين، وأن ترزقه وإياك وأهلك ووالديك أعلى درجات الرضا، ومحبة الله ورسوله، والدرجات العلى في الدنيا والآخرة والفردوس الأعلى من الجنة بدون سابقة عذاب ولا حساب، وأن يجعلك من المتفوقين دائماً في كل اختباراتك بدرجة ١٠٠% بإذن الله! آمين يا رب العالمين. 🤲";
    }
  }

  // 7. Science, Physics, Chemistry, and General Knowledge
  if (/(سرعة الضوء|جاذبية|فيزياء|كيمياء|ذرة|نيوتن|اينشتاين|نسبية)/i.test(trimmed)) {
    return `سؤال علمي رائع! إليك تبسيط دقيق وممتع:\n\n• **سرعة الضوء في الفراغ**: تبلغ حوالي **٢٩٩,٧٩٢ كم في الثانية** (أي ما يقارب ٣٠٠ ألف كيلومتر في الثانية الواحدة!). في ثانية واحدة يستطيع الضوء أن يدور حول كوكب الأرض ٧ مرات ونصف!\n• **قوانين الحركة والجاذبية**: اكتشف نيوتن أن كل كتلة تجذب الأخرى، وجاء أينشتاين ليوضح أن الجاذبية هي انحناء في نسيج الزمان والمكان (الزمكان).\n\nهل تحب أن نتعمق في مسألة معينة أو قانون فيزيائي محدد؟`;
  }

  // 8. Grade 9 Vocabulary word lookup
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

  // 9. Important Vocabulary / Science & Tech requests
  if (
    lower.includes("important vocab") ||
    lower.includes("important words") ||
    lower.includes("science & tech") ||
    lower.includes("المفردات المهمة") ||
    lower.includes("الكلمات المهمة") ||
    lower.includes("unit 9") ||
    lower.includes("الوحدة 9") ||
    lower.includes("الوحدة التاسعة")
  ) {
    const importantVocab = ALL_STUDY_VOCAB_UNITS.find((u) => u.unit === 9);
    const sampleWords = (importantVocab?.words ?? []).slice(0, 6);
    if (isAr) {
      return `تركّز **المفردات المهمة (العلوم والتكنولوجيا وابتكارات المستقبل)** على ٢٤ كلمة أساسية، من أهمها:\n${sampleWords.map((w) => `• **${w.word}**: ${w.meaningAr}`).join("\n")}\n\nيمكنك أيضاً الانتقال إلى قسم **الدراسة (Study)** والضغط على **اختبار المفردات المهمة التفاعلي** للحصول على تصحيح فوري لكل سؤال!`;
    }
    return `**Grade 9 Important Vocabulary (Science, Technology & Future Innovations)** covers 24 core terms, including:\n${sampleWords.map((w) => `• **${w.word}** (${w.phonetic}) — ${w.meaningAr}`).join("\n")}\n\nYou can also open the **Important Vocabulary Interactive Quiz** in the **Study** module for immediate feedback on every question!`;
  }

  // 10. Quiz / Practice request
  if (
    lower.includes("quiz") ||
    lower.includes("test") ||
    lower.includes("اختبار") ||
    lower.includes("سؤال")
  ) {
    if (isAr) {
      return `إليك سؤال تدريب سريع من المفردات المهمة:\n\n**السؤال**: ما معنى كلمة **algorithm**؟\nأ) خوارزمية / خطوات برمجية منطقية\nب) لوحة فنية قديمة\nج) تجربة كيميائية عشوائية\n\nاكتب حرف إجابتك وسأصححها لك فوراً مع الشرح!`;
    }
    return `Here is a quick practice question:\n\n**Question**: Which word means "a proposed explanation tested as a starting point for scientific investigation"?\nA) prototype\nB) hypothesis\nC) network\nD) device\n\nReply with A, B, C, or D and I will check your answer immediately!`;
  }

  // 11. Multiple-choice single-letter answer follow-up
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

  // 12. Multilingual Greetings
  if (/^(hi|hello|hey|good morning|good evening|how are you)[!?. ]*$/i.test(trimmed)) {
    return "Hello! I'm doing great — how are you doing today, and what would you like to explore or work on together?";
  }
  if (/[\u4e00-\u9fff]/.test(trimmed) && trimmed.length <= 40) {
    return "你好！我是你的智能伙伴 BTC AI。今天想学习、编程、聊天还是探讨什么话题？随时告诉我，我随时为你提供帮助！";
  }
  if (/^(bonjour|salut|comment vas-tu|comment ca va)/i.test(trimmed)) {
    return "Bonjour ! Je vais très bien, merci. Comment puis-je vous aider aujourd'hui ? Nous pouvons discuter, étudier, coder ou explorer n'importe quel sujet !";
  }

  // 13. Broad helpful response across any user prompt
  if (isAr) {
    return `يا هلا بيك يا صديقي! بخصوص سؤالك أو فكرتك عن: **"${trimmed}"**:\n\nأنا معاك في كل تفاصيلها خطوة بخطوة:\n1. **الفكرة الأساسية**: موضوع مهم وممتع جداً، ويمكننا استكشافه وتطبيقه بطرق عملية وسهلة.\n2. **التطبيق والنصيحة**: رتّب أولوياتك واكتب النقاط بوضوح، وإذا كان كود أو مسألة حسابية فالتجربة العملية هي أفضل طريق للإتقان.\n3. **خطوتنا التالية**: قولي تحب نبدأ من أي جانب (شرح مبسط، أمثلة عملية، خطوات تنفيذ، أم تدريب سريع)؟`;
  }

  return `Great question! Regarding **"${trimmed}"**:\n\nHere is how we can break it down:\n1. **Core Concept**: It is an insightful topic that can be approached practically and clearly.\n2. **Key Takeaway**: Focus on understanding the fundamentals first, then applying them through concrete examples or code.\n3. **Next Step**: Would you like a step-by-step walkthrough, a real-world code snippet, or a quick practice challenge?`;
}
