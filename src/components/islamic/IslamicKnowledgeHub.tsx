import React, { useMemo, useState } from "react";
import {
  AQEEDAH_FOUNDATIONS_CATALOG,
  DAILY_SUNNAH_PRACTICES,
  FIQH_TOPICS_CATALOG,
  ISLAMIC_KNOWLEDGE_QUIZZES,
  ISLAMIC_LEARNING_PATHS,
  SEASONAL_AND_AKHLAQ_CATALOG,
  SEERAH_AND_HISTORY_CATALOG,
  type FiqhMadhhab,
  type FiqhRulingType,
  type FiqhTopicEntry,
} from "@/data/islamic-knowledge-catalog";
import {
  BTC_EDITORIAL_DISCLOSURE,
  EDITORIAL_STATUS_META,
  ISLAMIC_MODULE_VERIFICATION_REGISTRY,
} from "@/lib/islamic-editorial";
import {
  loadIslamicLearningState,
  saveIslamicLearningState,
  toggleStringInList,
  type IslamicStudyDashboardState,
} from "@/lib/islamic-learning-store";
import { evaluateIslamicStudyQuery } from "@/lib/islamic-search";
import type { GlobalCountryCode } from "@/lib/quran-reciters-directory";
import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  Circle,
  Compass,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  History,
  Landmark,
  Loader2,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";

export type KnowledgeHubSubSection =
  | "fiqh"
  | "sunnah"
  | "aqeedah"
  | "seerah"
  | "ramadan_akhlaq"
  | "paths_quizzes"
  | "dashboard_registry_ai";

interface IslamicKnowledgeHubProps {
  lang?: string;
  initialSection?: KnowledgeHubSubSection;
  onNavigateTab?: (
    tab: string,
    payload?: {
      countryCode?: GlobalCountryCode;
      reciterId?: string;
      surahId?: number;
      subSection?: string;
    },
  ) => void;
}

const RULING_LABEL: Record<FiqhRulingType, { ar: string; en: string; cls: string }> = {
  obligatory: {
    ar: "واجب / فرض",
    en: "Obligatory (Fard/Wajib)",
    cls: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  recommended: {
    ar: "مستحب / سنة",
    en: "Recommended (Mustahabb)",
    cls: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  permissible: {
    ar: "مباح",
    en: "Permissible (Mubah)",
    cls: "bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30",
  },
  disliked: {
    ar: "مكروه",
    en: "Disliked (Makruh)",
    cls: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  prohibited: {
    ar: "محرم",
    en: "Prohibited (Haram)",
    cls: "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30",
  },
  scholarly_difference: {
    ar: "خلاف فقهي معتبر",
    en: "Scholarly Difference (Ikhtilaf)",
    cls: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
  },
};

export const IslamicKnowledgeHub: React.FC<IslamicKnowledgeHubProps> = ({
  lang = "ar",
  initialSection = "fiqh",
  onNavigateTab,
}) => {
  const isAr = lang === "ar";
  const [section, setSection] = useState<KnowledgeHubSubSection>(initialSection);

  // Fiqh filters
  const [fiqhCategory, setFiqhCategory] = useState<"all" | FiqhTopicEntry["category"]>("all");
  const [madhhab, setMadhhab] = useState<FiqhMadhhab>("general");

  // Private study state
  const [studyState, setStudyState] = useState<IslamicStudyDashboardState>(() =>
    loadIslamicLearningState(),
  );
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  // Knowledge quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Grounded AI Study Helper state
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{
    status: "allowed" | "fatwa_redirect" | "fabrication_blocked";
    message: string;
    sources: Array<{ id: string; title: string; ref: string; targetTab: string }>;
  } | null>(null);

  React.useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const filteredFiqh = useMemo(
    () =>
      fiqhCategory === "all"
        ? FIQH_TOPICS_CATALOG
        : FIQH_TOPICS_CATALOG.filter((f) => f.category === fiqhCategory),
    [fiqhCategory],
  );

  const togglePathStep = (stepId: string) => {
    setStudyState((prev) => {
      const next = {
        ...prev,
        completedPathStepIds: toggleStringInList(prev.completedPathStepIds, stepId),
      };
      saveIslamicLearningState(next);
      return next;
    });
  };

  const toggleRamadanItem = (itemId: string) => {
    setStudyState((prev) => {
      const next = {
        ...prev,
        ramadanPrivateChecklistIds: toggleStringInList(prev.ramadanPrivateChecklistIds, itemId),
      };
      saveIslamicLearningState(next);
      return next;
    });
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    const entry = {
      id: `ref-${Date.now()}`,
      topicTitle: noteTitle.trim() || (isAr ? "تأمل إيماني خاص" : "Personal Study Reflection"),
      note: noteBody.trim(),
      createdAt: new Date().toISOString(),
    };
    setStudyState((prev) => {
      const next = {
        ...prev,
        personalReflectionNotes: [entry, ...prev.personalReflectionNotes].slice(0, 40),
      };
      saveIslamicLearningState(next);
      return next;
    });
    setNoteTitle("");
    setNoteBody("");
  };

  const handleDeleteReflection = (id: string) => {
    setStudyState((prev) => {
      const next = {
        ...prev,
        personalReflectionNotes: prev.personalReflectionNotes.filter((n) => n.id !== id),
      };
      saveIslamicLearningState(next);
      return next;
    });
  };

  const handleAskGroundedHelper = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = aiQuery.trim();
    if (!trimmed) return;

    const evaluation = evaluateIslamicStudyQuery(trimmed);
    const mappedSources = evaluation.matchedSources.map((s) => ({
      id: s.id,
      title: isAr ? s.titleAr : s.titleEn,
      ref: s.sourceRef,
      targetTab: s.targetTab,
    }));

    if (evaluation.status !== "allowed") {
      setAiAnswer({
        status: evaluation.status,
        message: (isAr ? evaluation.safeRefusalAr : evaluation.safeRefusalEn) ?? "",
        sources: mappedSources,
      });
      return;
    }

    setAiLoading(true);
    const offlineSummary =
      mappedSources.length > 0
        ? isAr
          ? `استناداً إلى المصادر الموثقة في المركز الإسلامي، أشارت نتائج البحث إلى: ${mappedSources
              .map((m) => `${m.title} (${m.ref})`)
              .join("، ")}.`
          : `Grounded in BTC's verified catalog entries: ${mappedSources
              .map((m) => `${m.title} (${m.ref})`)
              .join("; ")}.`
        : isAr
          ? "لم يُعثر على مدخل مطابق تماماً في الفهرس الحالي. يُرجى استخدام البحث الشامل أو استشارة معلم مختص دون افتراض نصوص غير موثقة."
          : "No exact catalog match was found for this phrasing. Please check Unified Search or consult a qualified teacher rather than guessing.";

    try {
      const excerptContext = evaluation.matchedSources
        .map((m) => `${m.titleEn} [${m.sourceRef}]: ${m.subtitleEn}`)
        .join("\n");

      const res = await fetch("/api/ai/structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "simplify",
          subject: "Islamic Studies (Strict Grounded Sources Only)",
          prompt: `Question: "${trimmed}". Rules: 1) NEVER invent Quran verses, Hadith numbers, or issue personal Fatwas. 2) Cite only verified catalog entries provided below or say clearly if more info is needed. 3) Respond in ${isAr ? "Arabic" : "English"}.\nCatalog matches:\n${excerptContext || "None"}`,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          summary?: string;
          explanation?: string;
          text?: string;
        };
        const text = data.explanation || data.summary || data.text;
        if (text && text.trim()) {
          setAiAnswer({
            status: "allowed",
            message: text.trim(),
            sources: mappedSources,
          });
          setAiLoading(false);
          return;
        }
      }
    } catch {
      // Fallback cleanly to offline verified catalog synthesis
    }

    setAiAnswer({
      status: "allowed",
      message: offlineSummary,
      sources: mappedSources,
    });
    setAiLoading(false);
  };

  const tabs: Array<{
    id: KnowledgeHubSubSection;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "fiqh", labelAr: "الفقه والمذاهب", labelEn: "Fiqh & Rulings", icon: Scale },
    { id: "sunnah", labelAr: "السنن اليومية", labelEn: "Daily Sunnah", icon: Sun },
    { id: "aqeedah", labelAr: "العقيدة والإحسان", labelEn: "Aqeedah & Faith", icon: ShieldCheck },
    { id: "seerah", labelAr: "السيرة والحضارة", labelEn: "Seerah & History", icon: History },
    {
      id: "ramadan_akhlaq",
      labelAr: "رمضان والأخلاق",
      labelEn: "Ramadan & Akhlaq",
      icon: HeartHandshake,
    },
    {
      id: "paths_quizzes",
      labelAr: "مسارات واختبارات",
      labelEn: "Paths & Quizzes",
      icon: GraduationCap,
    },
    {
      id: "dashboard_registry_ai",
      labelAr: "لوحتي والتوثيق والمساعد",
      labelEn: "Study Log, Registry & Helper",
      icon: FileCheck2,
    },
  ];

  const quizCorrectCount = ISLAMIC_KNOWLEDGE_QUIZZES.filter(
    (q) => quizAnswers[q.id] === q.correctIndex,
  ).length;

  return (
    <div className="space-y-5" dir={isAr ? "rtl" : "ltr"} data-testid="islamic-knowledge-hub">
      {/* Navigation Sub-bar */}
      <div className="w-full max-w-full">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = section === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSection(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? t.labelAr : t.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: EDUCATIONAL FIQH & RULINGS */}
      {section === "fiqh" && (
        <div className="space-y-4" data-testid="knowledge-fiqh-section">
          <div
            data-testid="fiqh-scholar-referral"
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-stone-800 dark:text-stone-100"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {isAr
                ? "تنبيه فقهي هام: هذا القسم مرجع تعليمي عام يعرض الأصول المتفق عليها وأقوال المذاهب المعتبرة باحترام؛ ولا يُغني عن استشارة عالم مؤهل أو دار إفتاء في المسائل الشخصية والنوازل."
                : "Educational Reference Notice: This module presents foundational Sunni jurisprudence and respected Madhhab perspectives strictly for learning. It never issues personal Fatwas — consult a qualified scholar for individual rulings."}
            </span>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: "all", labelAr: "الكل", labelEn: "All Topics" },
                  { id: "taharah", labelAr: "الطهارة", labelEn: "Taharah" },
                  { id: "salah", labelAr: "الصلاة", labelEn: "Prayer" },
                  { id: "siyam", labelAr: "الصيام", labelEn: "Fasting" },
                  { id: "zakah", labelAr: "الزكاة", labelEn: "Zakah" },
                  {
                    id: "digital_student_ethics",
                    labelAr: "أمانة الطالب والرقمنة",
                    labelEn: "Student & Digital Ethics",
                  },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFiqhCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap ${
                    fiqhCategory === cat.id
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs">
              <span className="font-bold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                {isAr ? "عرض المذهب:" : "Madhhab View:"}
              </span>
              <select
                value={madhhab}
                onChange={(e) => setMadhhab(e.target.value as FiqhMadhhab)}
                aria-label={isAr ? "اختيار المذهب الفقهي" : "Select Madhhab"}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                <option value="general">
                  {isAr ? "كل المذاهب الأربعة (مقارن)" : "All Four Schools (Comparative)"}
                </option>
                <option value="hanafi">{isAr ? "المذهب الحنفي" : "Hanafi"}</option>
                <option value="maliki">{isAr ? "المذهب المالكي" : "Maliki"}</option>
                <option value="shafii">{isAr ? "المذهب الشافعي" : "Shafi'i"}</option>
                <option value="hanbali">{isAr ? "المذهب الحنبلي" : "Hanbali"}</option>
              </select>
            </label>
          </div>

          <div className="space-y-4">
            {filteredFiqh.map((topic) => {
              const rMeta = RULING_LABEL[topic.rulingType];
              const notesToShow =
                madhhab === "general"
                  ? topic.madhhabNotes
                  : topic.madhhabNotes.filter((n) => n.school === madhhab);
              return (
                <article
                  key={topic.id}
                  data-testid={`fiqh-card-${topic.id}`}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {isAr ? topic.titleAr : topic.titleEn}
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${rMeta.cls}`}
                    >
                      {isAr ? rMeta.ar : rMeta.en}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {isAr ? topic.summaryAr : topic.summaryEn}
                  </p>
                  <ul className="list-disc ps-5 space-y-1 text-xs text-stone-700 dark:text-stone-200">
                    {(isAr ? topic.keyConditionsAr : topic.keyConditionsEn).map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>

                  {notesToShow.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {notesToShow.map((mn) => (
                        <div
                          key={mn.school}
                          className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-3 text-[11px]"
                        >
                          <div className="font-bold text-emerald-800 dark:text-emerald-300">
                            {isAr ? mn.schoolLabelAr : mn.schoolLabelEn}
                          </div>
                          <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                            {isAr ? mn.noteAr : mn.noteEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
                    <span>
                      {isAr ? topic.scholarReferralNoticeAr : topic.scholarReferralNoticeEn}
                    </span>
                    <span className="font-mono">
                      {isAr ? topic.citation.sourceBookAr : topic.citation.sourceBookEn}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: DAILY SUNNAH & RULING DISTINCTION */}
      {section === "sunnah" && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="knowledge-sunnah-section"
        >
          {DAILY_SUNNAH_PRACTICES.map((entry) => {
            const isObligatory = entry.rulingDistinction === "obligatory_foundation";
            return (
              <article
                key={entry.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? entry.titleAr : entry.titleEn}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                      isObligatory
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                        : "bg-teal-500/15 text-teal-800 dark:text-teal-300"
                    }`}
                  >
                    {isObligatory
                      ? isAr
                        ? "أصل واجب"
                        : "Obligatory Foundation"
                      : isAr
                        ? "سنة مستحبة"
                        : "Recommended Sunnah"}
                  </span>
                </div>
                <p className="text-xs font-serif leading-relaxed text-emerald-950 dark:text-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                  {isAr ? entry.hadithSummaryAr : entry.hadithSummaryEn}
                </p>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <strong>{isAr ? "التطبيق اليومي: " : "Daily Application: "}</strong>
                  {isAr ? entry.dailyActionAr : entry.dailyActionEn}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-1">
                  <span>{isAr ? entry.authenticSourceAr : entry.authenticSourceEn}</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">
                    {entry.grade}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* SECTION 3: AQEEDAH & FAITH FOUNDATIONS */}
      {section === "aqeedah" && (
        <div className="space-y-4" data-testid="knowledge-aqeedah-section">
          {AQEEDAH_FOUNDATIONS_CATALOG.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? item.titleAr : item.titleEn}
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  {isAr ? item.proofReferenceAr : item.proofReferenceEn}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {isAr ? item.summaryAr : item.summaryEn}
              </p>
              <ul className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200">
                {(isAr ? item.corePointsAr : item.corePointsEn).map((pt, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-stone-50 dark:bg-stone-800/60 px-3 py-2 border border-stone-200/80 dark:border-stone-700"
                  >
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {/* SECTION 4: SEERAH, PROPHETS & ISLAMIC CIVILIZATION */}
      {section === "seerah" && (
        <div className="space-y-4" data-testid="knowledge-seerah-section">
          {SEERAH_AND_HISTORY_CATALOG.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-2.5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" />
                  {isAr ? entry.periodOrEraAr : entry.periodOrEraEn}
                </span>
                <span className="text-[11px] text-stone-500">
                  {isAr ? entry.verifiedReferenceAr : entry.verifiedReferenceEn}
                </span>
              </div>
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {isAr ? entry.titleAr : entry.titleEn}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {isAr ? entry.summaryAr : entry.summaryEn}
              </p>
              <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-950 dark:text-emerald-100">
                <strong>{isAr ? "الدرس التربوي: " : "Key Takeaway: "}</strong>
                {isAr ? entry.takeawayAr : entry.takeawayEn}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* SECTION 5: RAMADAN, SEASONAL WORSHIP & AKHLAQ */}
      {section === "ramadan_akhlaq" && (
        <div className="space-y-4" data-testid="knowledge-ramadan-section">
          {SEASONAL_AND_AKHLAQ_CATALOG.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? item.titleAr : item.titleEn}
                </h4>
                <span className="text-[11px] font-mono text-stone-500">
                  {isAr ? item.sourceNoteAr : item.sourceNoteEn}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {isAr ? item.descriptionAr : item.descriptionEn}
              </p>
              <div className="space-y-1.5">
                {(isAr ? item.practicalStepsAr : item.practicalStepsEn).map((step, idx) => {
                  const key = `${item.id}-${idx}`;
                  const checked = studyState.ramadanPrivateChecklistIds.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleRamadanItem(key)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-start hover:border-emerald-500"
                    >
                      {checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                      <span
                        className={
                          checked
                            ? "line-through text-stone-400"
                            : "text-stone-800 dark:text-stone-200"
                        }
                      >
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* SECTION 6: STRUCTURED LEARNING PATHS & QUIZZES */}
      {section === "paths_quizzes" && (
        <div className="space-y-6" data-testid="knowledge-paths-section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ISLAMIC_LEARNING_PATHS.map((path) => {
              const completedInPath = path.steps.filter((s) =>
                studyState.completedPathStepIds.includes(s.id),
              ).length;
              return (
                <div
                  key={path.id}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                      {completedInPath}/{path.steps.length} {isAr ? "خطوات" : "steps"}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {isAr ? path.titleAr : path.titleEn}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {isAr ? path.audienceAr : path.audienceEn}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {path.steps.map((step) => {
                      const done = studyState.completedPathStepIds.includes(step.id);
                      return (
                        <div
                          key={step.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => togglePathStep(step.id)}
                            className="flex items-center gap-2 text-start flex-1"
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-400 shrink-0" />
                            )}
                            <span className={done ? "line-through text-stone-400" : ""}>
                              {isAr ? step.titleAr : step.titleEn}
                            </span>
                          </button>
                          {onNavigateTab && step.recommendedTab !== "knowledge" && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab(step.recommendedTab)}
                              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                            >
                              {isAr ? "فتح" : "Open"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comprehensive Knowledge Quiz */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  {isAr
                    ? "اختبار العلوم الشرعية الشامل"
                    : "Comprehensive Islamic Studies Self-Check"}
                </span>
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {quizCorrectCount}/{ISLAMIC_KNOWLEDGE_QUIZZES.length}{" "}
                {isAr ? "إجابات صحيحة" : "Correct"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ISLAMIC_KNOWLEDGE_QUIZZES.map((q) => {
                const picked = quizAnswers[q.id];
                const answered = picked !== undefined;
                const opts = isAr ? q.optionsAr : q.optionsEn;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-4 space-y-2.5 text-xs"
                  >
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      {isAr ? q.questionAr : q.questionEn}
                    </div>
                    <div className="space-y-1.5">
                      {opts.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [q.id]: idx,
                            }))
                          }
                          className={`w-full p-2 rounded-lg border text-start transition-colors ${
                            !answered
                              ? "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-500"
                              : idx === q.correctIndex
                                ? "border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold"
                                : picked === idx
                                  ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                                  : "border-stone-200 dark:border-stone-800 opacity-60"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {answered && (
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        {isAr ? q.explanationAr : q.explanationEn} ({q.sourceRef})
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: PRIVATE DASHBOARD, EDITORIAL REGISTRY & GROUNDED AI HELPER */}
      {section === "dashboard_registry_ai" && (
        <div className="space-y-6" data-testid="knowledge-dashboard-registry-section">
          {/* Private Study Reflection Notebook */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3">
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <span>
                  {isAr ? "مذكرة التدبر والتأملات الخاصة" : "Private Study Reflections & Notes"}
                </span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {isAr
                  ? "محفوظة محلياً في متصفحك فقط، ولا تدخل في أي لوحات نقاط أو منافسات."
                  : "Stored strictly locally in your browser. Never scored or shared."}
              </p>

              <form onSubmit={handleSaveReflection} className="space-y-2.5 text-xs">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder={
                    isAr ? "عنوان الفائدة أو الآية (اختياري)" : "Topic or Verse title (optional)"
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={3}
                  placeholder={
                    isAr
                      ? "اكتب خلاصة ما تعلمته أو تأملك..."
                      : "Write a personal takeaway or reflection..."
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isAr ? "حفظ التأمل محلياً" : "Save Private Note"}
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                {studyState.personalReflectionNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-3 text-xs flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {note.topicTitle}
                      </div>
                      <p className="text-stone-600 dark:text-stone-300">{note.note}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteReflection(note.id)}
                      aria-label={isAr ? "حذف الملاحظة" : "Delete reflection"}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grounded Islamic AI Study Helper */}
            <div
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3"
              data-testid="islamic-ai-study-helper"
            >
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {isAr
                    ? "مساعد المراجعة الشرعية المنضبط بالمصادر"
                    : "Grounded Islamic Study Helper"}
                </span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                {isAr
                  ? "يبحث في مصادر المركز الموثقة ويلخص المفاهيم التعليمية فقط — ويرفض الفتاوى الشخصية أو اختراع أي آيات أو أحاديث."
                  : "Retrieves verified BTC catalog sources strictly — automatically blocks personal Fatwa requests or scriptural fabrication."}
              </p>

              <form onSubmit={handleAskGroundedHelper} className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? "اسأل عن درس تجويد، حديث، أركان الوضوء..."
                      : "Ask about Tajweed rules, Sunnah grades, or Wudu pillars..."
                  }
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold whitespace-nowrap"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isAr ? (
                    "بحث وتلخيص"
                  ) : (
                    "Ask"
                  )}
                </button>
              </form>

              {aiAnswer && (
                <div
                  data-testid="islamic-ai-answer-box"
                  className={`rounded-xl border p-3.5 space-y-2 text-xs ${
                    aiAnswer.status === "allowed"
                      ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/25"
                      : "border-amber-500/40 bg-amber-500/10"
                  }`}
                >
                  {aiAnswer.status !== "allowed" && (
                    <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        {aiAnswer.status === "fatwa_redirect"
                          ? isAr
                            ? "إحالة لأهل الفتوى والعلم"
                            : "Scholar Referral Enforced"
                          : isAr
                            ? "حماية الأصالة النصية"
                            : "Textual Authenticity Safeguard"}
                      </span>
                    </div>
                  )}
                  <p className="leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-line">
                    {aiAnswer.message}
                  </p>
                  {aiAnswer.sources.length > 0 && (
                    <div className="pt-2 border-t border-current/15 space-y-1">
                      <div className="text-[10px] font-bold text-stone-500">
                        {isAr ? "المصادر المستشهد بها في المركز:" : "Cited BTC Catalog Sources:"}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnswer.sources.map((src) => (
                          <button
                            key={src.id}
                            type="button"
                            onClick={() => onNavigateTab?.(src.targetTab)}
                            className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-emerald-700 dark:text-emerald-300 hover:underline"
                          >
                            {src.title} ({src.ref})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editorial Verification Registry & Honest Governance Disclosure */}
          <div
            data-testid="editorial-verification-registry"
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4"
          >
            <div className="space-y-1">
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>
                  {isAr
                    ? "سجل التوثيق التحريري وحوكمة المصادر"
                    : "Editorial Verification Registry & Governance"}
                </span>
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {isAr
                  ? BTC_EDITORIAL_DISCLOSURE.disclosureAr
                  : BTC_EDITORIAL_DISCLOSURE.disclosureEn}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ISLAMIC_MODULE_VERIFICATION_REGISTRY.map((mod) => {
                const statusMeta = EDITORIAL_STATUS_META[mod.status];
                return (
                  <div
                    key={mod.moduleId}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-3.5 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-stone-900 dark:text-stone-100">
                        {isAr ? mod.moduleNameAr : mod.moduleNameEn}
                      </strong>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 shrink-0">
                        {isAr ? statusMeta.labelAr : statusMeta.labelEn}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-300">
                      {isAr ? mod.primarySourcesAr : mod.primarySourcesEn}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {isAr ? mod.coverageScopeAr : mod.coverageScopeEn}
                    </div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400">
                      {isAr ? mod.limitationsAr : mod.limitationsEn}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
