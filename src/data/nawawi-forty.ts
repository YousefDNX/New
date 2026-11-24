export interface HadithRecord {
  id: string;
  collection: "nawawi_forty" | "sahih_bukhari" | "sahih_muslim";
  numberInCollection: number;
  titleAr: string;
  titleEn: string;
  narrator: string;
  matnArabic: string;
  translationEn: string;
  sourceReference: string;
  authenticityGrade: "Sahih" | "Muttafaq Alayh" | "Hasan";
  keyMoralLessons: string[];
}

export const COMPLETE_NAWAWI_FORTY_HADITHS: HadithRecord[] = [
  {
    id: "nawawi_01",
    collection: "nawawi_forty",
    numberInCollection: 1,
    titleAr: "إنما الأعمال بالنيات",
    titleEn: "Actions are by Intentions",
    narrator: "أمير المؤمنين عمر بن الخطاب رضي الله عنه",
    matnArabic:
      "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».",
    translationEn:
      "I heard the Messenger of Allah (ﷺ) say: 'Actions are judged by motives, so each man will have what he intended. Thus, he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated.'",
    sourceReference: "صحيح البخاري (رقم 1)، صحيح مسلم (رقم 1907)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "الإخلاص لله أساس قبول كل عمل صالح.",
      "النية تميز العبادة عن العادة وتميز مراتب العبادات.",
      "ثواب العمل مرتبط بصدق القصد ووجهته.",
    ],
  },
  {
    id: "nawawi_02",
    collection: "nawawi_forty",
    numberInCollection: 2,
    titleAr: "مراتب الدين: الإسلام والإيمان والإحسان",
    titleEn: "The Hadith of Gabriel (Pillars of Islam, Iman & Ihsan)",
    narrator: "عمر بن الخطاب رضي الله عنه",
    matnArabic:
      "«بَيْنَمَا نَحْنُ عِنْدَ رَسُولِ اللَّهِ ﷺ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعَرِ... قَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلاَمِ؟... قَالَ: فَأَخْبِرْنِي عَنِ الإِيمَانِ؟... قَالَ: فَأَخْبِرْنِي عَنِ الإِحْسَانِ؟ قَالَ: أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ... قَالَ: هَذَا جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ».",
    translationEn:
      "While we were sitting with the Messenger of Allah (ﷺ) one day, there appeared before us a man with very white clothes and very black hair... He asked about Islam, Iman, Ihsan, and the Hour... Then the Prophet said: 'That was Gabriel who came to teach you your religion.'",
    sourceReference: "صحيح مسلم (رقم 8)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "بيان أركان الإسلام الخمسة وأركان الإيمان الستة.",
      "مقام الإحسان هو أعلى مراتب الدين واستشعار مراقبة الله.",
      "آداب طالب العلم وحسن الهيئة والإنصات.",
    ],
  },
  {
    id: "nawawi_03",
    collection: "nawawi_forty",
    numberInCollection: 3,
    titleAr: "بني الإسلام على خمس",
    titleEn: "Islam is Built Upon Five Pillars",
    narrator: "عبد الله بن عمر بن الخطاب رضي الله عنهما",
    matnArabic:
      "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ البَيْتِ، وَصَوْمِ رَمَضَانَ».",
    translationEn:
      "I heard the Messenger of Allah (ﷺ) say: 'Islam is built on five: Testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, performing the prayer, paying the Zakat, making pilgrimage to the House, and fasting Ramadan.'",
    sourceReference: "صحيح البخاري (رقم 8)، صحيح مسلم (رقم 16)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "التشديد على وجوب هذه الأركان الخمسة كدعائم للإسلام.",
      "الشهادتان هما الأصل العقائدي الذي تنبني عليه سائر الأعمال.",
      "ترابط الجوانب الروحية والمالية والبدنية في الشريعة.",
    ],
  },
  {
    id: "nawawi_04",
    collection: "nawawi_forty",
    numberInCollection: 4,
    titleAr: "أطوار خلق الإنسان والقدر",
    titleEn: "Creation of Man and the Divine Decree",
    narrator: "عبد الله بن مسعود رضي الله عنه",
    matnArabic:
      "حَدَّثَنَا رَسُولُ اللَّهِ ﷺ وَهُوَ الصَّادِقُ المَصْدُوقُ: «إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ المَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ، وَأَجَلِهِ، وَعَمَلِهِ، وَشَقِيٌّ أَوْ سَعِيدٌ...».",
    translationEn:
      "The Messenger of Allah (ﷺ), the truthful and confirmed, narrated to us: 'Each one of you is constituted in the womb of his mother for forty days, then he becomes a clot of blood for a similar period, then a morsel of flesh for a similar period, then the angel is sent to him and breathes the spirit into him...'",
    sourceReference: "صحيح البخاري (رقم 3208)، صحيح مسلم (رقم 2643)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "الإيمان بقضاء الله وقدره وسابق علمه بالخلائق.",
      "حرمة الاعتداء على الجنين بعد نفخ الروح.",
      "العبرة بالخواتيم والالتجاء إلى الله بالثبات وحسن الختام.",
    ],
  },
  {
    id: "nawawi_05",
    collection: "nawawi_forty",
    numberInCollection: 5,
    titleAr: "النهي عن الابتداع في الدين",
    titleEn: "Rejection of Innovations in Religion",
    narrator: "أم المؤمنين عائشة رضي الله عنها",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ فِيهِ فَهُوَ رَدٌّ»، وفي رواية لمسلم: «مَنْ عَمِلَ عَمَلًا لَيْسَ عَلَيْهِ أَمْرُنَا فَهُوَ رَدٌّ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'He who innovates something in this matter of ours that is not of it will have it rejected.' In Muslim: 'He who does an act which our matter is not in accordance with will have it rejected.'",
    sourceReference: "صحيح البخاري (رقم 2697)، صحيح مسلم (رقم 1718)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "شرط قبول العمل هو المتابعة لسنة النبي ﷺ مع الإخلاص.",
      "حفظ الشريعة من التحريف والابتداع والزيادة والنقصان.",
      "الأصل في العبادات التوقيف على النص الشرعي.",
    ],
  },
  {
    id: "nawawi_06",
    collection: "nawawi_forty",
    numberInCollection: 6,
    titleAr: "الحلال بيّن والحرام بيّن وصلاح القلب",
    titleEn: "The Halal is Clear and the Haram is Clear",
    narrator: "النعمان بن بشير رضي الله عنهما",
    matnArabic:
      "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّ الحَلاَلَ بَيِّنٌ، وَإِنَّ الحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا مُشْتَبِهَاتٌ لاَ يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ... أَلاَ وَإِنَّ فِي الجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الجَسَدُ كُلُّهُ، أَلاَ وَهِيَ القَلْبُ».",
    translationEn:
      "I heard the Messenger of Allah (ﷺ) say: 'That which is lawful is clear and that which is unlawful is clear, and between the two of them are doubtful matters about which many people do not know. Thus he who avoids doubtful matters clears himself in regard to his religion and his honor... Truly, in the body there is a morsel of flesh which, if it be whole, all the body is whole, and which, if it be diseased, all of it is diseased. Truly, it is the heart.'",
    sourceReference: "صحيح البخاري (رقم 52)، صحيح مسلم (رقم 1599)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "الورع وترك الشبهات حفظاً للدين والعرض.",
      "القلب هو موضع الإيمان وصلاحه صلاح لسائر الجوارح.",
      "حماية حدود الله وسد الذرائع المفضية إلى الحرام.",
    ],
  },
  {
    id: "nawawi_07",
    collection: "nawawi_forty",
    numberInCollection: 7,
    titleAr: "الدين النصيحة",
    titleEn: "The Religion is Sincerity (Nasihah)",
    narrator: "تميم بن أوس الداري رضي الله عنه",
    matnArabic:
      "أَنَّ النَّبِيَّ ﷺ قَالَ: «الدِّينُ النَّصِيحَةُ». قُلْنَا: لِمَنْ؟ قَالَ: «لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلأَئِمَّةِ المُسْلِمِينَ، وَعَامَّتِهِمْ».",
    translationEn:
      "The Prophet (ﷺ) said: 'The religion is sincerity.' We said: 'To whom?' He said: 'To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.'",
    sourceReference: "صحيح مسلم (رقم 55)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "النصيحة عماد الدين وجوهر الإيمان الحق.",
      "النصح للأئمة بالمعاونة على الحق والدعاء لهم بالصلاح.",
      "النصح لعامة المسلمين بإرشادهم وإعانتهم وحب الخير لهم.",
    ],
  },
  {
    id: "nawawi_08",
    collection: "nawawi_forty",
    numberInCollection: 8,
    titleAr: "حرمة دم المسلم وماله",
    titleEn: "Sanctity of a Muslim's Blood and Wealth",
    narrator: "عبد الله بن عمر رضي الله عنهما",
    matnArabic:
      "أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلاَةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إِلاَّ بِحَقِّ الإِسْلاَمِ، وَحِسَابُهُمْ عَلَى اللَّهِ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'I have been ordered to fight the people until they testify that there is no god but Allah and that Muhammad is the Messenger of Allah, and establish prayer and pay Zakat. If they do that, they have protected their blood and their wealth from me, except by the right of Islam, and their reckoning is with Allah.'",
    sourceReference: "صحيح البخاري (رقم 25)، صحيح مسلم (رقم 22)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "عصمة دم المسلم وماله وعرضه بإعلانه التوحيد.",
      "الحكم على الناس بالظواهر وتفويض السرائر إلى الله تعالى.",
      "أهمية الصلاة والزكاة كأعظم فرائض الإسلام الظاهرة.",
    ],
  },
  {
    id: "nawawi_09",
    collection: "nawawi_forty",
    numberInCollection: 9,
    titleAr: "التكليف بما يستطاع وترك كثرة السؤال",
    titleEn: "Obligations are According to Capacity",
    narrator: "أبو هريرة عبد الرحمن بن صخر رضي الله عنه",
    matnArabic:
      "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلاَفُهُمْ عَلَى أَنْبِيَائِهِمْ».",
    translationEn:
      "I heard the Messenger of Allah (ﷺ) say: 'What I have forbidden you, avoid. What I have ordered you [to do], do as much of it as you can. For what destroyed those who came before you was only the number of their questions and their disagreements with their prophets.'",
    sourceReference: "صحيح البخاري (رقم 7288)، صحيح مسلم (رقم 1337)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "النهي يقتضي الترك الكامل دون تهاون.",
      "الأمر منوط بالاستطاعة والقدرة (المشقة تجلب التيسير).",
      "ذم التكلف والأسئلة النظرية غير النافعة.",
    ],
  },
  {
    id: "nawawi_10",
    collection: "nawawi_forty",
    numberInCollection: 10,
    titleAr: "الطيبات وأثر أكل الحلال في استجابة الدعاء",
    titleEn: "Consuming Pure Food and Acceptance of Dua",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ اللَّهَ تَعَالَى طَيِّبٌ لاَ يَقْبَلُ إِلاَّ طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ المُؤْمِنِينَ بِمَا أَمَرَ بِهِ المُرْسَلِينَ... ثُمَّ ذَكَرَ الرَّجُلَ يُطِيلُ السَّفَرَ أَشْعَثَ أَغْبَرَ يَمُدُّ يَدَيْهِ إِلَى السَّمَاءِ: يَا رَبِّ يَا رَبِّ، وَمَطْعَمُهُ حَرَامٌ، وَمَشْرَبُهُ حَرَامٌ، وَمَلْبَسُهُ حَرَامٌ، وَغُذِيَ بِالحَرَامِ، فَأَنَّى يُسْتَجَابُ لِذَلِكَ؟».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Allah the Almighty is Pure and accepts only that which is pure. And Allah has commanded the believers as He commanded the messengers... Then he mentioned a man who, having journeyed far, is disheveled and dusty, who spreads out his hands to the sky: 'O Lord! O Lord!' while his food is unlawful, his drink is unlawful, his clothing is unlawful, and he is nourished with the unlawful, so how could he be answered?'",
    sourceReference: "صحيح مسلم (رقم 1015)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "التحري الشديد في كسب المال الحلال والابتعاد عن الشبهات.",
      "أكل الحرام من أعظم موانع إجابة الدعاء.",
      "الله طيب منزه عن كل عيب ونقص ولا يقبل من الأعمال إلا ما كان خالصاً طيباً.",
    ],
  },
  {
    id: "nawawi_11",
    collection: "nawawi_forty",
    numberInCollection: 11,
    titleAr: "دع ما يريبك إلى ما لا يريبك",
    titleEn: "Leave That Which Makes You Doubt",
    narrator: "الحسن بن علي بن أبي طالب رضي الله عنهما",
    matnArabic:
      "حَفِظْتُ مِنْ رَسُولِ اللَّهِ ﷺ: «دَعْ مَا يَرِيبُكَ إِلَى مَا لاَ يَرِيبُكَ، فَإِنَّ الصِّدْقَ طُمَأْنِينَةٌ، وَإِنَّ الكَذِبَ رِيبَةٌ».",
    translationEn:
      "I memorized from the Messenger of Allah (ﷺ): 'Leave that which makes you doubt for that which does not make you doubt. For truthfulness is tranquility, and lying is doubt.'",
    sourceReference: "سنن الترمذي (رقم 2518)، سنن النسائي (رقم 5711)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "قاعدة عظيمة في الورع واجتناب الشكوك والشبهات.",
      "الصدق والاستقامة تورث طمأنينة وراحة في القلب.",
      "الحرام والريب يورثان القلق والاضطراب الداخلي.",
    ],
  },
  {
    id: "nawawi_12",
    collection: "nawawi_forty",
    numberInCollection: 12,
    titleAr: "من حسن إسلام المرء تركه ما لا يعنيه",
    titleEn: "Part of Good Islam is Leaving What Does Not Concern You",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic: "قَالَ رَسُولُ اللَّهِ ﷺ: «مِنْ حُسْنِ إِسْلاَمِ المَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Part of the perfection of a person's Islam is his leaving that which does not concern him.'",
    sourceReference: "سنن الترمذي (رقم 2317)، سنن ابن ماجه (رقم 3976)",
    authenticityGrade: "Hasan",
    keyMoralLessons: [
      "حفظ الوقت والعمر فيما ينفع في المعاش والمعاد.",
      "اجتناب التطفل والغيبة وتتبع عورات الناس وفضول الكلام.",
      "التركيز على إصلاح النفس وتطوير المهارات وبناء الأثر.",
    ],
  },
  {
    id: "nawawi_13",
    collection: "nawawi_forty",
    numberInCollection: 13,
    titleAr: "حب الخير للآخرين كمال الإيمان",
    titleEn: "Loving for Your Brother What You Love for Yourself",
    narrator: "أنس بن مالك رضي الله عنه",
    matnArabic: "عَنِ النَّبِيِّ ﷺ قَالَ: «لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ».",
    translationEn:
      "The Prophet (ﷺ) said: 'None of you truly believes until he loves for his brother what he loves for himself.'",
    sourceReference: "صحيح البخاري (رقم 13)، صحيح مسلم (رقم 45)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "سلامة الصدر من الغل والحسد والبغضاء.",
      "حب الخير والنجاح والهداية لكل إنسان في المجتمع.",
      "التكافل والمواساة والإيثار في المعاملات اليومية.",
    ],
  },
  {
    id: "nawawi_14",
    collection: "nawawi_forty",
    numberInCollection: 14,
    titleAr: "حرمة دم المسلم إلا بثلاث",
    titleEn: "Cases Permitting the Blood of a Muslim",
    narrator: "عبد الله بن مسعود رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «لاَ يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ، يَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنِّي رَسُولُ اللَّهِ، إِلاَّ بِإِحْدَى ثَلاَثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ المُفَارِقُ لِلْجَمَاعَةِ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'It is not permissible to spill the blood of a Muslim who testifies that there is no god but Allah and that I am the Messenger of Allah, except in one of three cases: the married person who commits adultery, a life for a life, and the one who forsakes his religion and leaves the community.'",
    sourceReference: "صحيح البخاري (رقم 6878)، صحيح مسلم (رقم 1676)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "عظم حرمة الدماء في ميزان الشريعة الإسلامية.",
      "القصاص حياة للمجتمع ورادع عن الجرائم الكبرى.",
      "تنفيذ الأحكام الشرعية حق حصري للقضاء وولي الأمر وليس للأفراد.",
    ],
  },
  {
    id: "nawawi_15",
    collection: "nawawi_forty",
    numberInCollection: 15,
    titleAr: "الكلمة الطيبة وإكرام الجار والضيف",
    titleEn: "Good Speech and Honoring Neighbor & Guest",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic:
      "أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'He who believes in Allah and the Last Day, let him speak good or remain silent. He who believes in Allah and the Last Day, let him honor his neighbor. And he who believes in Allah and the Last Day, let him honor his guest.'",
    sourceReference: "صحيح البخاري (رقم 6018)، صحيح مسلم (رقم 47)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "حفظ اللسان والتفكير في عواقب الكلام قبل النطق به.",
      "حق الجار المؤكد في الإسلام وكف الأذى عنه.",
      "كرم الضيافة والترحيب بالزائرين.",
    ],
  },
  {
    id: "nawawi_16",
    collection: "nawawi_forty",
    numberInCollection: 16,
    titleAr: "النهي عن الغضب",
    titleEn: "Do Not Get Angry",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic: "أَنَّ رَجُلًا قَالَ لِلنَّبِيِّ ﷺ: أَوْصِنِي، قَالَ: «لاَ تَغْضَبْ». فَرَدَّدَ مِرَارًا، قَالَ: «لاَ تَغْضَبْ».",
    translationEn:
      "A man said to the Prophet (ﷺ): 'Advise me.' He said: 'Do not become angry.' The man repeated his request several times, and each time he said: 'Do not become angry.'",
    sourceReference: "صحيح البخاري (رقم 6116)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الغضب مفتاح كل شر وسبب تفكك الأسر وخراب العلاقات.",
      "الحث على ضبط النفس والتحلي بالصبر والحلم عند الاستفزاز.",
      "تكرار الوصية يدل على عظيم أثرها وأهميتها في الحياة اليومية.",
    ],
  },
  {
    id: "nawawi_17",
    collection: "nawawi_forty",
    numberInCollection: 17,
    titleAr: "الأمر بالإحسان في كل شيء حتى في الذبح",
    titleEn: "Excellence and Compassion in All Things",
    narrator: "شداد بن أوس رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ اللَّهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا القِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذَّبْحَ، وَلْيُحِدَّ أَحَدُكُمْ شَفْرَتَهُ، وَلْيُرِحْ ذَبِيحَتَهُ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Verily Allah has prescribed excellence in everything. So when you kill, kill with excellence; and when you slaughter, slaughter with excellence. Let each one of you sharpen his blade and bring ease to his animal.'",
    sourceReference: "صحيح مسلم (رقم 1955)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الإتقان والإحسان فريضة شاملة لكل عمل ومهنة وعلاقة.",
      "الرفق بالحيوان ومراعاة الرحمة حتى عند الذبح.",
      "الإسلام دين الرحمة والشفقة في أدق التفاصيل.",
    ],
  },
  {
    id: "nawawi_18",
    collection: "nawawi_forty",
    numberInCollection: 18,
    titleAr: "تقوى الله وحسن الخلق",
    titleEn: "Fear Allah Wherever You Are and Follow Evil with Good",
    narrator: "أبو ذر ومعاذ بن جبل رضي الله عنهما",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Fear Allah wherever you may be; follow up an evil deed with a good one which will wipe it out; and behave well toward the people.'",
    sourceReference: "جامع الترمذي (رقم 1987)",
    authenticityGrade: "Hasan",
    keyMoralLessons: [
      "ملازمة التقوى في الخلوة والجلوة.",
      "فعل الحسنات والاستغفار يمحو آثار السيئات.",
      "حسن الخلق هو أثقل ما يوضع في ميزان العبد يوم القيامة.",
    ],
  },
  {
    id: "nawawi_19",
    collection: "nawawi_forty",
    numberInCollection: 19,
    titleAr: "احفظ الله يحفظك (وصية ابن عباس)",
    titleEn: "Preserve Allah and He Will Preserve You",
    narrator: "عبد الله بن عباس رضي الله عنهما",
    matnArabic:
      "كُنْتُ خَلْفَ النَّبِيِّ ﷺ يَوْمًا، فَقَالَ: «يَا غُلاَمُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ، وَاعْلَمْ أَنَّ الأُمَّةَ لَوِ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلاَّ بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ... رُفِعَتِ الأَقْلاَمُ وَجَفَّتِ الصُّحُفُ».",
    translationEn:
      "One day I was behind the Prophet (ﷺ) and he said: 'Young man, I shall teach you some words: Be mindful of Allah, and He will protect you. Be mindful of Allah, and you will find Him before you. If you ask, ask of Allah; if you seek help, seek help of Allah. Know that if the whole nation were to gather to benefit you with something, they could not benefit you except with what Allah had already written for you... The pens have been lifted and the pages have dried.'",
    sourceReference: "جامع الترمذي (رقم 2516)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "تربية النشء على التوحيد واليقين والتوكل المطلق على الله.",
      "من حفظ أوامر الله حفظه الله في دينه وبدنه وأهله ودنياه.",
      "النفع والضر بيد الله وحده فلا خوف من الخلق ولا طمع فيهم.",
    ],
  },
  {
    id: "nawawi_20",
    collection: "nawawi_forty",
    numberInCollection: 20,
    titleAr: "إن لم تستحِ فاصنع ما شئت",
    titleEn: "If You Feel No Shame, Do Whatever You Wish",
    narrator: "أبو مسعود عقبة بن عمرو الأنصاري البدري رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلاَمِ النُّبُوَّةِ الأُولَى: إِذَا لَمْ تَسْتَحْيِ فَاصْنَعْ مَا شِئْتَ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Among the things that people have found from the words of the early prophecy is: If you feel no shame, then do whatever you wish.'",
    sourceReference: "صحيح البخاري (رقم 3484)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الحياء رأس الأخلاق ومحرك الضمير الحي.",
      "فقدان الحياء يؤدي إلى التجرؤ على المعاصي والمجاهرة بالمنكرات.",
      "الحياء كله خير ولا يأتي إلا بخير.",
    ],
  },
  {
    id: "nawawi_21",
    collection: "nawawi_forty",
    numberInCollection: 21,
    titleAr: "قل آمنت بالله ثم استقم",
    titleEn: "Say: I Believe in Allah, Then Stand Firm",
    narrator: "سفيان بن عبد الله الثقفي رضي الله عنه",
    matnArabic:
      "قُلْتُ: يَا رَسُولَ اللَّهِ، قُلْ لِي فِي الإِسْلاَمِ قَوْلًا لاَ أَسْأَلُ عَنْهُ أَحَدًا غَيْرَكَ، قَالَ: «قُلْ: آمَنْتُ بِاللَّهِ، ثُمَّ اسْتَقِمْ».",
    translationEn:
      "I said: 'O Messenger of Allah, tell me something about Islam which I can ask of no one but you.' He said: 'Say: I believe in Allah, and then stand firm.'",
    sourceReference: "صحيح مسلم (رقم 38)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "جوامع كلم النبي ﷺ تجمع أصول الدين في كلمات معدودات.",
      "الإيمان لا يكتمل إلا بالاستقامة المستمرة على الطاعة.",
      "الاستقامة ثبات على الحق والبعد عن التلون في الدين.",
    ],
  },
  {
    id: "nawawi_22",
    collection: "nawawi_forty",
    numberInCollection: 22,
    titleAr: "الطريق إلى الجنة بالمحافظة على الفرائض",
    titleEn: "Entering Paradise by Fulfilling Obligations",
    narrator: "جابر بن عبد الله الأنصاري رضي الله عنهما",
    matnArabic:
      "أَنَّ رَجُلًا سَأَلَ رَسُولَ اللَّهِ ﷺ، فَقَالَ: أَرَأَيْتَ إِذَا صَلَّيْتُ المَكْتُوبَاتِ، وَصُمْتُ رَمَضَانَ، وَأَحْلَلْتُ الحَلاَلَ، وَحَرَّمْتُ الحَرَامَ، وَلَمْ أَزِدْ عَلَى ذَلِكَ شَيْئًا، أَأَدْخُلُ الجَنَّةَ؟ قَالَ: «نَعَمْ».",
    translationEn:
      "A man asked the Messenger of Allah (ﷺ): 'Do you see that if I perform the prescribed prayers, fast Ramadan, treat the lawful as lawful and the unlawful as unlawful, and do not increase upon that at all, shall I enter Paradise?' He said: 'Yes.'",
    sourceReference: "صحيح مسلم (رقم 15)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الفرائض هي أحب ما يتقرب به العبد إلى الله وهي طريق الجنة.",
      "التزام الحلال واجتناب الحرام أصل السلامة في الدين.",
      "تيسير الشريعة وعدم تكليف العباد بما لا يطيقون.",
    ],
  },
  {
    id: "nawawi_23",
    collection: "nawawi_forty",
    numberInCollection: 23,
    titleAr: "الطهور شطر الإيمان وجوامع الخير",
    titleEn: "Purity is Half of Faith",
    narrator: "أبو مالك الحارث بن عاصم الأشعري رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «الطُّهُورُ شَطْرُ الإِيمَانِ، وَالحَمْدُ لِلَّهِ تَمْلأُ المِيزَانَ، وَسُبْحَانَ اللَّهِ وَالحَمْدُ لِلَّهِ تَمْلآنِ - أَوْ تَمْلأُ - مَا بَيْنَ السَّمَاءِ وَالأَرْضِ، وَالصَّلاَةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ، كُلُّ النَّاسِ يَغْدُو فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Purity is half of faith, and Al-hamdu lillah (praise be to Allah) fills the scale, and Subhan Allah and Al-hamdu lillah fill what is between heaven and earth. Prayer is a light, charity is a proof, patience is illumination, and the Quran is an argument for you or against you. Every human being goes out in the morning and sells himself, thereby liberating it or destroying it.'",
    sourceReference: "صحيح مسلم (رقم 223)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "فضل الطهارة والوضوء وأثرها في تطهير البدن والنفس.",
      "عظيم ثواب التسبيح والتحميد في ميزان الحسنات.",
      "القرآن حجة للإنسان بتلاوته والعمل به أو حجة عليه بالإعراض عنه.",
    ],
  },
  {
    id: "nawawi_24",
    collection: "nawawi_forty",
    numberInCollection: 24,
    titleAr: "تحريم الظلم (الحديث القدسي الجليل)",
    titleEn: "Prohibition of Oppression (Hadith Qudsi)",
    narrator: "أبو ذر الغفاري رضي الله عنه عن النبي ﷺ فيما روى عن الله تبارك وتعالى",
    matnArabic:
      "«يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلاَ تَظَالَمُوا... يَا عِبَادِي كُلُّكُمْ ضَالٌّ إِلاَّ مَنْ هَدَيْتُهُ فَاسْتَهْدُونِي أَهْدِكُمْ، يَا عِبَادِي كُلُّكُمْ جَائِعٌ إِلاَّ مَنْ أَطْعَمْتُهُ فَاسْتَطْعِمُونِي أُطْعِمْكُمْ... يَا عِبَادِي لَوْ أَنَّ أَوَّلَكُمْ وَآخِرَكُمْ وَإِنْسَكُمْ وَجِنَّكُمْ كَانُوا عَلَى أَتْقَى قَلْبِ رَجُلٍ وَاحِدٍ مِنْكُمْ مَا زَادَ ذَلِكَ فِي مُلْكِي شَيْئًا... إِنَّمَا هِيَ أَعْمَالُكُمْ أُحْصِيهَا لَكُمْ ثُمَّ أُوَفِّيكُمْ إِيَّاهَا، فَمَنْ وَجَدَ خَيْرًا فَلْيَحْمَدِ اللَّهَ، وَمَنْ وَجَدَ غَيْرَ ذَلِكَ فَلاَ يَلُومَنَّ إِلاَّ نَفْسَهُ».",
    translationEn:
      "From Abu Dharr, that the Prophet (ﷺ) said, among what he relates from Allah, the Blessed and Exalted, that He said: 'O My servants, I have forbidden oppression for Myself and have made it forbidden amongst you, so do not oppress one another... It is only your deeds that I count up for you and then recompense you for. So let him who finds good praise Allah, and let him who finds other than that blame no one but himself.'",
    sourceReference: "صحيح مسلم (رقم 2577)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الظلم ظلمات يوم القيامة والله حرمه على نفسه وعلى خلقه.",
      "افتقار سائر الخلائق إلى الله في الهداية والرزق والمغفرة.",
      "طاعة الخلق لا تنفع الله ومعصيتهم لا تضره وهو الغني الحميد.",
    ],
  },
  {
    id: "nawawi_25",
    collection: "nawawi_forty",
    numberInCollection: 25,
    titleAr: "ذهب أهل الدثور بالأجور وسعة أبواب الصدقة",
    titleEn: "The Rich Have Taken the Rewards (Varieties of Charity)",
    narrator: "أبو ذر الغفاري رضي الله عنه",
    matnArabic:
      "أَنَّ نَاسًا قَالُوا: يَا رَسُولَ اللَّهِ، ذَهَبَ أَهْلُ الدُّثُورِ بِالأُجُورِ... قَالَ: «أَوَلَيْسَ قَدْ جَعَلَ اللَّهُ لَكُمْ مَا تَصَّدَّقُونَ؟ إِنَّ بِكُلِّ تَسْبِيحَةٍ صَدَقَةً، وَكُلِّ تَكْبِيرَةٍ صَدَقَةً، وَكُلِّ تَحْمِيدَةٍ صَدَقَةً، وَكُلِّ تَهْلِيلَةٍ صَدَقَةً، وَأَمْرٌ بِالمَعْرُوفِ صَدَقَةٌ، وَنَهْيٌ عَنْ مُنْكَرٍ صَدَقَةٌ، وَفِي بُضْعِ أَحَدِكُمْ صَدَقَةٌ»...",
    translationEn:
      "Some people said: 'O Messenger of Allah, the rich have taken all the rewards...' He said: 'Has not Allah made for you that which you may give as charity? In every tasbih (Subhan Allah) there is a charity, in every takbir (Allahu Akbar) there is a charity, in every tahmid (Alhamdulillah) there is a charity, in every tahlil (La ilaha illallah) there is a charity, enjoining good is a charity, forbidding evil is a charity, and in a man's intimacy with his wife is a charity.'",
    sourceReference: "صحيح مسلم (رقم 1006)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "أبواب الصدقة واسعة ولا تقتصر على المال بل تشمل كل عمل طيب.",
      "التسبيح والذكر والأمر بالمعروف وكف الأذى كلها صدقات يثاب عليها المسلم.",
      "احتساب النية الصالحة في المباحات يحولها إلى عبادات مأجورة.",
    ],
  },
  {
    id: "nawawi_26",
    collection: "nawawi_forty",
    numberInCollection: 26,
    titleAr: "الصدقة اليومية على مفاصل الجسد وصلاة الضحى",
    titleEn: "Daily Charity Due Upon Every Joint",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ: تَعْدِلُ بَيْنَ الاِثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إِلَى الصَّلاَةِ صَدَقَةٌ، وَتُمِيطُ الأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Every joint of every person owes charity every day the sun rises: judging fairly between two is a charity; helping a man onto his mount or lifting his goods onto it is a charity; a good word is a charity; every step you take to prayer is a charity; and removing harmful obstacles from the path is a charity.'",
    sourceReference: "صحيح البخاري (رقم 2989)، صحيح مسلم (رقم 1009)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "شكر نعم الله وسلامة المفاصل والأعضاء بالعمل الصالح اليومي.",
      "خدمة الناس وإماطة الأذى والسعي إلى المساجد من شعب الإيمان.",
      "تجزئ ركعتان من الضحى عن صدقة جميع مفاصل الجسد (360 مفصلاً).",
    ],
  },
  {
    id: "nawawi_27",
    collection: "nawawi_forty",
    numberInCollection: 27,
    titleAr: "البر حسن الخلق والإثم ما حاك في الصدر",
    titleEn: "Righteousness is Good Character",
    narrator: "النواس بن سمعان ووابصة بن معبد رضي الله عنهما",
    matnArabic:
      "عَنِ النَّبِيِّ ﷺ قَالَ: «البِرُّ حُسْنُ الخُلُقِ، وَالإِثْمُ مَا حَاكَ فِي صَدْرِكَ، وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ». وقال لوابصة: «اسْتَفْتِ قَلْبَكَ، البِرُّ مَا اطْمَأَنَّتْ إِلَيْهِ النَّفْسُ، وَاطْمَأَنَّ إِلَيْهِ القَلْبُ، وَالإِثْمُ مَا حَاكَ فِي النَّفْسِ وَتَرَدَّدَ فِي الصَّدْرِ، وَإِنْ أَفْتَاكَ النَّاسُ وَأَفْتَوْكَ».",
    translationEn:
      "The Prophet (ﷺ) said: 'Righteousness is good character, and sin is that which wavers in your heart and you dislike that people should find out about it.' And he said to Wabisah: 'Consult your heart. Righteousness is that with which the soul feels tranquil and the heart feels tranquil, and sin is that which wavers in the soul and vacillates in the chest, even if people have given you their verdicts.'",
    sourceReference: "صحيح مسلم (رقم 2553)، مسند أحمد (رقم 18035)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "حسن الخلق هو جوهر البر وميزان الصلاح.",
      "الفطرة النقية تستشعر الإثم وتنفر من الحرام.",
      "فتاوى الناس لا تحل حراماً في باطن الأمر إذا كان القلب غير مطمئن.",
    ],
  },
  {
    id: "nawawi_28",
    collection: "nawawi_forty",
    numberInCollection: 28,
    titleAr: "التمسك بالسنة والسمع والطاعة (موعظة العرباض)",
    titleEn: "Adhere to the Sunnah and Avoid Innovations",
    narrator: "العرباض بن سارية رضي الله عنه",
    matnArabic:
      "«وَعَظَنَا رَسُولُ اللَّهِ ﷺ مَوْعِظَةً وَجِلَتْ مِنْهَا القُلُوبُ وَذَرِفَتْ مِنْهَا العُيُونُ... فَقَالَ: أُوصِيكُمْ بِتَقْوَى اللَّهِ وَالسَّمْعِ وَالطَّاعَةِ وَإِنْ تَأَمَّرَ عَلَيْكُمْ عَبْدٌ، فَإِنَّهُ مَنْ يَعِشْ مِنْكُمْ بَعْدِي فَسَيَرَى اخْتِلاَفًا كَثِيرًا، فَعَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الخُلَفَاءِ الرَّاشِدِينَ المَهْدِيِّينَ عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الأُمُورِ فَإِنَّ كُلَّ بِدْعَةٍ ضَلاَلَةٌ».",
    translationEn:
      "The Messenger of Allah (ﷺ) gave us a sermon by which our hearts were filled with fear and our eyes shed tears... He said: 'I counsel you to have Taqwa (fear of Allah) and to listen and obey, even if a slave becomes your leader. Verily he among you who lives long will see much controversy; so hold fast to my Sunnah and the Sunnah of the Rightly-Guided Caliphs; bite onto it with your molars, and beware of newly-invented matters, for every newly-invented matter is an innovation and every innovation is a misguidance.'",
    sourceReference: "سنن أبي داود (رقم 4607)، جامع الترمذي (رقم 2676)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الاعتصام بالكتاب والسنة سبيل النجاة عند الفتن والافتراق.",
      "لزوم هدي الخلفاء الراشدين في الفهم والتطبيق.",
      "الحذر الشديد من البدع والمحدثات في العقيدة والشريعة.",
    ],
  },
  {
    id: "nawawi_29",
    collection: "nawawi_forty",
    numberInCollection: 29,
    titleAr: "أبواب الخير وملاك الأمر كله (وصية معاذ)",
    titleEn: "The Doors of Goodness and the Tongue",
    narrator: "معاذ بن جبل رضي الله عنه",
    matnArabic:
      "قُلْتُ: يَا رَسُولَ اللَّهِ، أَخْبِرْنِي بِعَمَلٍ يُدْخِلُنِي الجَنَّةَ وَيُبَاعِدُنِي عَنِ النَّارِ... فَدَلَّهُ عَلَى أَبْوَابِ الخَيْرِ: «الصَّوْمُ جُنَّةٌ، وَالصَّدَقَةُ تُطْفِئُ الخَطِيئَةَ كَمَا يُطْفِئُ المَاءُ النَّارَ، وَصَلاَةُ الرَّجُلِ فِي جَوْفِ اللَّيْلِ»... ثُمَّ قَالَ: «أَلاَ أُخْبِرُكَ بِمَلاَكِ ذَلِكَ كُلِّهِ؟» أَخَذَ بِلِسَانِهِ وَقَالَ: «كُفَّ عَلَيْكَ هَذَا». قُلْتُ: وَإِنَّا لَمُؤَاخَذُونَ بِمَا نَتَكَلَّمُ بِهِ؟ قَالَ: «ثَكِلَتْكَ أُمُّكَ يَا مُعَاذُ، وَهَلْ يَكُبُّ النَّاسَ فِي النَّارِ عَلَى وُجُوهِهِمْ إِلاَّ حَصَائِدُ أَلْسِنَتِهِمْ؟».",
    translationEn:
      "Muadh said: 'Tell me of an action that will admit me to Paradise and keep me away from the Fire...' The Prophet showed him the doors of goodness: fasting is a shield, charity extinguishes sin as water extinguishes fire, and prayer in the depths of night... Then he took hold of his tongue and said: 'Restrain this.' Muadh said: 'Are we to be held accountable for that which we speak with it?' He said: 'May your mother be bereaved of you, O Muadh! Does anything topple people onto their faces in Hell except the harvests of their tongues?'",
    sourceReference: "جامع الترمذي (رقم 2616)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "خطورة اللسان وأنه أعظم أسباب الهلاك ودخول النار.",
      "الصوم جنة ووقاية، والصدقة مكفرة للخطايا، وقيام الليل شرف المؤمن.",
      "الصمت عما لا ينفع طريق النجاة والسلامة.",
    ],
  },
  {
    id: "nawawi_30",
    collection: "nawawi_forty",
    numberInCollection: 30,
    titleAr: "حدود الله وفرائضه ومحارمه",
    titleEn: "The Limits and Obligations of Allah",
    narrator: "أبو ثعلبة الخشني جرثوم بن ناشر رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلاَ تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلاَ تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلاَ تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلاَ تَبْحَثُوا عَنْهَا».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Verily Allah has prescribed obligations, so do not neglect them; and He has set limits, so do not transgress them; and He has forbidden things, so do not violate them; and He has remained silent about things out of mercy for you, not out of forgetfulness, so do not search into them.'",
    sourceReference: "سنن الدارقطني (رقم 4396)، أخرجه النووي وحسنه",
    authenticityGrade: "Hasan",
    keyMoralLessons: [
      "تقسيم الأحكام الشرعية إلى: فرائض، ومحرمات، وحدود، وعفو.",
      "سعة رحمة الله بعدم التضييق على العباد فيما سكت عنه الشارع.",
      "وجوب الالتزام بالأوامر والانتهاء عن النواهي دون ابتداع.",
    ],
  },
  {
    id: "nawawi_31",
    collection: "nawawi_forty",
    numberInCollection: 31,
    titleAr: "حقيقة الزهد في الدنيا ومحبة الله والناس",
    titleEn: "True Asceticism (Zuhd) in This World",
    narrator: "سهل بن سعد الساعدي رضي الله عنه",
    matnArabic:
      "أَتَى النَّبِيَّ ﷺ رَجُلٌ، فَقَالَ: يَا رَسُولَ اللَّهِ، دُلَّنِي عَلَى عَمَلٍ إِذَا عَمِلْتُهُ أَحَبَّنِي اللَّهُ وَأَحَبَّنِي النَّاسُ، فَقَالَ: «ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ».",
    translationEn:
      "A man came to the Prophet (ﷺ) and said: 'O Messenger of Allah, direct me to an act which, if I do it, Allah will love me and people will love me.' He said: 'Renounce the world and Allah will love you, and renounce what people possess and people will love you.'",
    sourceReference: "سنن ابن ماجه (رقم 4102)",
    authenticityGrade: "Hasan",
    keyMoralLessons: [
      "الزهد الحقيقي هو فراغ القلب من التعلق بالدنيا والاعتماد عليها.",
      "الاستغناء عما في أيدي الناس يورث العزة والمحبة والمهابة.",
      "جعل الدنيا في اليد والآخرة في القلب.",
    ],
  },
  {
    id: "nawawi_32",
    collection: "nawawi_forty",
    numberInCollection: 32,
    titleAr: "لا ضرر ولا ضرار",
    titleEn: "No Harm and No Causing Harm",
    narrator: "أبو سعيد سعد بن مالك بن سنان الخدري رضي الله عنه",
    matnArabic: "أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «لاَ ضَرَرَ وَلاَ ضِرَارَ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'There should be neither harming nor reciprocating harm.'",
    sourceReference: "سنن ابن ماجه (رقم 2340)، سنن الدارقطني، موطأ مالك",
    authenticityGrade: "Hasan",
    keyMoralLessons: [
      "قاعدة فقهية كبرى تحكم جميع المعاملات والعلاقات الإنسانية.",
      "تحريم إلحاق أي ضرر بالنفس أو بالآخرين عمداً أو بغير حق.",
      "دفع الضرر مقدم على جلب المصلحة في التشريع الإسلامي.",
    ],
  },
  {
    id: "nawawi_33",
    collection: "nawawi_forty",
    numberInCollection: 33,
    titleAr: "البينة على المدعي واليمين على من أنكر",
    titleEn: "The Burden of Proof is on the Claimant",
    narrator: "عبد الله بن عباس رضي الله عنهما",
    matnArabic:
      "أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «لَوْ يُعْطَى النَّاسُ بِدَعْوَاهُمْ، لاَدَّعَى رِجَالٌ أَمْوَالَ قَوْمٍ وَدِمَاءَهُمْ، لَكِنَّ البَيِّنَةَ عَلَى المُدَّعِي، وَاليَمِينَ عَلَى مَنْ أَنْكَرَ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Were people to be given according to their claims, men would claim the wealth and blood of people; but the onus of proof is on the claimant and the taking of an oath is on him who denies.'",
    sourceReference: "صحيح البخاري ومسلم، سنن البيهقي",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "أصل عظيم من أصول القضاء وإقامة العدالة بين الناس.",
      "حفظ أموال الناس وحقوقهم من الدعاوى الباطلة.",
      "البراءة الأصلية حتى تثبت الإدانة بالدليل القاطع.",
    ],
  },
  {
    id: "nawawi_34",
    collection: "nawawi_forty",
    numberInCollection: 34,
    titleAr: "مراتب تغيير المنكر باليد واللسان والقلب",
    titleEn: "Levels of Changing Evil (Hand, Tongue, Heart)",
    narrator: "أبو سعيد الخدري رضي الله عنه",
    matnArabic:
      "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الإِيمَانِ».",
    translationEn:
      "I heard the Messenger of Allah (ﷺ) say: 'Whosoever of you sees an evil, let him change it with his hand; and if he is not able to do so, then with his tongue; and if he is not able to do so, then with his heart — and that is the weakest of faith.'",
    sourceReference: "صحيح مسلم (رقم 49)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الأمر بالمعروف والنهي عن المنكر صمام أمان المجتمع.",
      "مراعاة المراتب والقدرة وعدم التسبب في منكر أكبر بالحكمة.",
      "إنكار القلب هو الحد الأدنى الواجب على كل مسلم ومفارقة أهل الباطل.",
    ],
  },
  {
    id: "nawawi_35",
    collection: "nawawi_forty",
    numberInCollection: 35,
    titleAr: "أخوة الإسلام وحرمة المسلم",
    titleEn: "Brotherhood of Muslims and Sanctity of Honor",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «لاَ تَحَاسَدُوا، وَلاَ تَنَاجَشُوا، وَلاَ تَبَاغَضُوا، وَلاَ تَدَابَرُوا، وَلاَ يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا، المُسْلِمُ أَخُو المُسْلِمِ لاَ يَظْلِمُهُ وَلاَ يَخْذُلُهُ وَلاَ يَحْقِرُهُ، التَّقْوَى هَاهُنَا - وَيُشِيرُ إِلَى صَدْرِهِ ثَلاَثَ مَرَّاتٍ - بِحَسْبِ امْرِئٍ مِنَ الشَّرِّ أَنْ يَحْقِرَ أَخَاهُ المُسْلِمَ، كُلُّ المُسْلِمِ عَلَى المُسْلِمِ حَرَامٌ: دَمُهُ، وَمَالُهُ، وَعِرْضُهُ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Do not envy one another, do not outbid one another, do not hate one another, do not turn away from one another, and do not enter into a transaction when the other has already entered into it; rather, be servants of Allah, brothers. The Muslim is the brother of a Muslim: he does not oppress him, nor does he fail him, nor does he lie to him, nor does he hold him in contempt. Taqwa (piety) is here' — and he pointed to his chest three times... All of the Muslim is inviolable to another Muslim: his blood, his wealth, and his honor.'",
    sourceReference: "صحيح مسلم (رقم 2564)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "حرمة الغيبة والحسد والكبر واحتقار أي إنسان.",
      "التقوى محلها القلب وثمرتها تظهر في السلوك والمعاملة.",
      "حرمة دم المسلم وماله وعرضه قاعدة أصيلة لا تزول.",
    ],
  },
  {
    id: "nawawi_36",
    collection: "nawawi_forty",
    numberInCollection: 36,
    titleAr: "تفريج الكرب وفضل طلب العلم ومجالس الذكر",
    titleEn: "Relieving Distress, Seeking Knowledge & Circles of Dhikr",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic:
      "عَنِ النَّبِيِّ ﷺ قَالَ: «مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ القِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالآخِرَةِ، وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالآخِرَةِ، وَاللَّهُ فِي عَوْنِ العَبْدِ مَا كَانَ العَبْدُ فِي عَوْنِ أَخِيهِ، وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الجَنَّةِ...».",
    translationEn:
      "The Prophet (ﷺ) said: 'Whosoever removes a worldly grief from a believer, Allah will remove from him one of the griefs of the Day of Judgment. Whosoever alleviates [the lot of] an insolvent person, Allah will alleviate him in this world and the Next. Whosoever shields a Muslim, Allah will shield him in this world and the Next. Allah assists the servant as long as the servant assists his brother. Whosoever treads a path seeking knowledge, Allah makes easy for him a path to Paradise...'",
    sourceReference: "صحيح مسلم (رقم 2699)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الجزاء من جنس العمل فمن فرج عن الناس فرج الله عنه.",
      "فضل طلب العلم الشرعي والنافع وأنه طريق ميسر إلى الجنة.",
      "ستر عورات المسلمين وعدم إشاعة الفواحش بين الناس.",
    ],
  },
  {
    id: "nawawi_37",
    collection: "nawawi_forty",
    numberInCollection: 37,
    titleAr: "فضل الله في كتابة الحسنات والسيئات",
    titleEn: "Allah's Grace in Recording Good and Bad Deeds",
    narrator: "عبد الله بن عباس رضي الله عنهما",
    matnArabic:
      "عَنْ رَسُولِ اللَّهِ ﷺ فِيمَا يَرْوِي عَنْ رَبِّهِ تَبَارَكَ وَتَعَالَى: «إِنَّ اللَّهَ كَتَبَ الحَسَنَاتِ وَالسَّيِّئَاتِ ثُمَّ بَيَّنَ ذَلِكَ: فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ عِنْدَهُ عَشْرَ حَسَنَاتٍ إِلَى سَبْعِمِائَةِ ضِعْفٍ إِلَى أَضْعَافٍ كَثِيرَةٍ، وَإِنْ هَمَّ بِسَيِّئَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ سَيِّئَةً وَاحِدَةً».",
    translationEn:
      "From Ibn Abbas, that the Messenger of Allah (ﷺ), among what he relates from his Lord, said: 'Verily Allah has written down the good deeds and the bad deeds, and then explained them: He who intends to do a good deed and does not do it, Allah records it with Himself as a complete good deed; and if he intends it and does it, Allah records it as ten good deeds up to seven hundred times, or many times more. And if he intends to do an evil deed and does not do it, Allah records it with Himself as a complete good deed; and if he intends it and does it, Allah records it as a single evil deed.'",
    sourceReference: "صحيح البخاري (رقم 6491)، صحيح مسلم (رقم 131)",
    authenticityGrade: "Muttafaq Alayh",
    keyMoralLessons: [
      "سعة رحمة الله وفضله بمضاعفة الحسنات وعدم مضاعفة السيئات.",
      "كتابة الأجر بمجرد النية الصالحة والهم بفعل الخير.",
      "ترك المعصية خوفاً من الله يكتب حسنة كاملة للعبد.",
    ],
  },
  {
    id: "nawawi_38",
    collection: "nawawi_forty",
    numberInCollection: 38,
    titleAr: "ولاية الله والتقرب إليه بالنوافل (حديث الولي)",
    titleEn: "The Hadith of the Wali (Close Servant of Allah)",
    narrator: "أبو هريرة رضي الله عنه",
    matnArabic:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ اللَّهَ تَعَالَى قَالَ: مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالحَرْبِ، وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَلاَ يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحْبَبْتُهُ كُنْتُ سَمْعَهُ الَّذِي يَسْمَعُ بِهِ، وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ، وَيَدَهُ الَّتِي يَبْطِشُ بِهَا، وَرِجْلَهُ الَّتِي يَمْشِي بِهَا، وَلَئِنْ سَأَلَنِي لأُعْطِيَنَّهُ، وَلَئِنِ اسْتَعَاذَنِي لأُعِيذَنَّهُ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Verily Allah the Exalted said: Whosoever shows enmity to a friend of Mine, I have declared war upon him. My servant does not draw near to Me with anything more loved by Me than the religious duties I have obligated upon him, and My servant continues to draw near to Me with optional works so that I shall love him. When I love him, I become his hearing with which he hears, his seeing with which he sees, his hand with which he strikes, and his foot with which he walks. Were he to ask of Me, I would surely give it to him; and were he to seek refuge in Me, I would surely grant it to him.'",
    sourceReference: "صحيح البخاري (رقم 6502)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "عظم شأن أولياء الله الصالحين والتحذير من معاداتهم.",
      "الفرائض هي الأساس والمحبوب الأول عند الله ثم تتبعها النوافل.",
      "ثمرة محبة الله هي التوفيق التام والحفظ واستجابة الدعاء.",
    ],
  },
  {
    id: "nawawi_39",
    collection: "nawawi_forty",
    numberInCollection: 39,
    titleAr: "التجاوز عن الخطأ والنسيان وما استكرهوا عليه",
    titleEn: "Pardon for Mistakes, Forgetfulness and Coercion",
    narrator: "عبد الله بن عباس رضي الله عنهما",
    matnArabic:
      "أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «إِنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي: الخَطَأَ، وَالنِّسْيَانَ، وَمَا اسْتُكْرِهُوا عَلَيْهِ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'Verily Allah has pardoned for my nation: mistakes, forgetfulness, and what they are forced to do under duress.'",
    sourceReference: "سنن ابن ماجه (رقم 2045)، سنن البيهقي",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "رفع الإثم والحرج عن فاقد الإرادة والقصد كالناسي والمخطئ.",
      "سماحة الشريعة الإسلامية ومراعاتها للضعف البشري.",
      "الواجب تدارك الواجبات الفائتة بالنسيان عند التذكر كالصلاة.",
    ],
  },
  {
    id: "nawawi_40",
    collection: "nawawi_forty",
    numberInCollection: 40,
    titleAr: "كن في الدنيا كأنك غريب أو عابر سبيل",
    titleEn: "Be in This World as a Stranger or Traveler",
    narrator: "عبد الله بن عمر رضي الله عنهما",
    matnArabic:
      "أَخَذَ رَسُولُ اللَّهِ ﷺ بِمَنْكِبِي، فَقَالَ: «كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ، أَوْ عَابِرُ سَبِيلٍ». وَكَانَ ابْنُ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا يَقُولُ: «إِذَا أَمْسَيْتَ فَلاَ تَنْتَظِرِ الصَّبَاحَ، وَإِذَا أَصْبَحْتَ فَلاَ تَنْتَظِرِ المَسَاءَ، وَخُذْ مِنْ صِحَّتِكَ لِمَرَضِكَ، وَمِنْ حَيَاتِكَ لِمَوْتِكَ».",
    translationEn:
      "The Messenger of Allah (ﷺ) took me by the shoulder and said: 'Be in this world as though you were a stranger or a wayfarer.' And Ibn Umar used to say: 'When evening comes, do not wait for the morning, and when morning comes, do not wait for the evening; take from your health for your illness, and from your life for your death.'",
    sourceReference: "صحيح البخاري (رقم 6416)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "الدنيا دار ممر وليست دار مقر والمسلم فيها مسافر.",
      "قصر الأمل والمبادرة إلى صالح الأعمال دون تسويف.",
      "اغتنام أوقات الصحة والفراغ قبل نزول المرض والموت.",
    ],
  },
  {
    id: "nawawi_41",
    collection: "nawawi_forty",
    numberInCollection: 41,
    titleAr: "حتى يكون هواه تبعاً لما جئت به",
    titleEn: "Subordinating Desires to Divine Guidance",
    narrator: "عبد الله بن عمرو بن العاص رضي الله عنهما",
    matnArabic: "قَالَ رَسُولُ اللَّهِ ﷺ: «لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يَكُونَ هَوَاهُ تَبَعًا لِمَا جِئْتُ بِهِ».",
    translationEn:
      "The Messenger of Allah (ﷺ) said: 'None of you truly believes until his desires are subservient to that which I have brought.'",
    sourceReference: "شرح السنة للبغوي، أخرجه النووي في الأربعين",
    authenticityGrade: "Hasan",
    keyMoralLessons: [
      "وجوب تحكيم الشريعة والانقياد لأمر الله ورسوله ﷺ.",
      "مجاهدة النفس ليكون حبها وبغضها تبعاً لهدي القرآن والسنة.",
      "الهوى إذا تقدم على الشرع أضل صاحبه عن الصراط المستقيم.",
    ],
  },
  {
    id: "nawawi_42",
    collection: "nawawi_forty",
    numberInCollection: 42,
    titleAr: "سعة مغفرة الله (حديث يا ابن آدم لو بلغت ذنوبك عنان السماء)",
    titleEn: "The Vastness of Allah's Forgiveness",
    narrator: "أنس بن مالك رضي الله عنه",
    matnArabic:
      "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: قَالَ اللَّهُ تَبَارَكَ وَتَعَالَى: «يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلاَ أُبَالِي، يَا ابْنَ آدَمَ لَوْ بَلَغَتْ ذُنُوبُكَ عَنَانَ السَّمَاءِ ثُمَّ اسْتَغْفَرْتَنِي غَفَرْتُ لَكَ وَلاَ أُبَالِي، يَا ابْنَ آدَمَ إِنَّكَ لَوْ أَتَيْتَنِي بِقُرَابِ الأَرْضِ خَطَايَا ثُمَّ لَقِيتَنِي لاَ تُشْرِكُ بِي شَيْئًا لأَتَيْتُكَ بِقُرَابِهَا مَغْفِرَةً».",
    translationEn:
      "I heard the Messenger of Allah (ﷺ) say: 'Allah the Exalted said: O son of Adam, so long as you call upon Me and hope in Me, I forgive you for what you have done and I do not mind. O son of Adam, were your sins to reach the clouds of the sky and then you asked forgiveness of Me, I would forgive you. O son of Adam, were you to come to Me with sins nearly as great as the earth and then you meet Me without associating any partner with Me, I would bring you forgiveness nearly as great as it.'",
    sourceReference: "جامع الترمذي (رقم 3540)",
    authenticityGrade: "Sahih",
    keyMoralLessons: [
      "فضل التوحيد الخالص وأنه أعظم أسباب مغفرة الذنوب.",
      "باب التوبة والاستغفار مفتوح ما لم يغرغر العبد أو تطلع الشمس من مغربها.",
      "الدعاء مع الرجاء وحسن الظن بالله يمحو الخطايا مهما تعاظمت.",
    ],
  },
];
