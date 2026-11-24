import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/preferences";
import {
  GRADE_9_VOCAB_UNITS,
  type Grade9VocabWord,
  type Grade9VocabUnitMeta,
} from "@/data/grade9-vocab-units";
import { Button } from "@/components/ui/button";

export function StudyWorkspace() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  // Check URL parameters for initial unit selection (e.g., ?tab=unit3_vocab or ?unit=3)
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const unitParam = params.get("unit");
    if (unitParam) {
      const parsed = parseInt(unitParam, 10);
      if (parsed >= 1 && parsed <= 4) return parsed;
    }
    const tabParam = params.get("tab");
    if (tabParam === "unit3_vocab") return 3;
    if (tabParam === "unit1_vocab") return 1;
    if (tabParam === "unit2_vocab") return 2;
    if (tabParam === "unit4_vocab") return 4;
    return null;
  });

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isMeaningRevealed, setIsMeaningRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const selectedUnit: Grade9VocabUnitMeta | undefined = GRADE_9_VOCAB_UNITS.find(
    (u) => u.unit === selectedUnitNumber,
  );

  const words: Grade9VocabWord[] = selectedUnit?.words ?? [];
  const currentWord: Grade9VocabWord | undefined = words[currentWordIndex];

  // Reset card state when moving between words or units
  const handleSelectUnit = (unitNum: number) => {
    setSelectedUnitNumber(unitNum);
    setCurrentWordIndex(0);
    setIsMeaningRevealed(false);
  };

  const handleBackToUnits = () => {
    setSelectedUnitNumber(null);
    setCurrentWordIndex(0);
    setIsMeaningRevealed(false);
  };

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((i) => i + 1);
      setIsMeaningRevealed(false);
    }
  }, [currentWordIndex, words.length]);

  const handlePrevWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((i) => i - 1);
      setIsMeaningRevealed(false);
    }
  }, [currentWordIndex]);

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (!selectedUnitNumber) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        if (isAr) handlePrevWord();
        else handleNextWord();
      } else if (e.key === "ArrowLeft") {
        if (isAr) handleNextWord();
        else handlePrevWord();
      } else if (e.key === " " || e.key === "Enter") {
        setIsMeaningRevealed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUnitNumber, isAr, handleNextWord, handlePrevWord]);

  // British English Pronunciation using Web Speech API
  const handlePronounce = (wordText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info(
        isAr
          ? "نطق الصوت غير مدعوم في هذا المتصفح."
          : "Audio pronunciation is not supported in this browser.",
      );
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = "en-GB";
      utterance.rate = 0.88;

      // Prefer British English voice if available
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(
        (v) =>
          v.lang === "en-GB" ||
          v.lang.toLowerCase().includes("gb") ||
          v.name.includes("UK") ||
          v.name.includes("British"),
      );
      if (britishVoice) {
        utterance.voice = britishVoice;
      }

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.info(isAr ? "تعذر تشغيل نطق الكلمة صوتياً." : "Could not play audio pronunciation.");
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      toast.info(
        isAr ? "نطق الصوت غير متاح حالياً." : "Audio pronunciation is currently unavailable.",
      );
    }
  };

  // If no unit is selected, show Study Landing Page (Grade 9 only)
  if (!selectedUnitNumber || !selectedUnit) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-14">
        {/* Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <GraduationCap className="size-4" />
            <span>
              {isAr ? "منهج الصف التاسع — اللغة الإنجليزية" : "Grade 9 — English Curriculum"}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {isAr ? "الصف التاسع" : "Grade 9"}
          </h1>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {isAr
              ? "مفردات الوحدات الأربع المعتمدة لطلاب الصف التاسع. اختر الوحدة لبدء مراجعة البطاقات التعليمية والاستماع للنطق الإنجليزي الصحيح."
              : "Approved vocabulary across the four Grade 9 units. Select a unit to practice flashcards and listen to British English pronunciation."}
          </p>
        </div>

        {/* 4 Unit Cards in Clean Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {GRADE_9_VOCAB_UNITS.map((unitMeta) => {
            const wordCount = unitMeta.words.length;
            return (
              <div
                key={unitMeta.unit}
                className="surface-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 p-6 sm:p-7 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:bg-surface-2/40 cursor-pointer"
                onClick={() => handleSelectUnit(unitMeta.unit)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-lg bg-primary/15 px-3 py-1 font-mono text-xs font-bold text-primary tracking-wider">
                      UNIT {unitMeta.unit}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {isAr ? `${wordCount} كلمة` : `${wordCount} words`}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {isAr ? unitMeta.themeAr : unitMeta.themeEn}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isAr ? unitMeta.themeEn : unitMeta.themeAr}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary group-hover:underline">
                    {isAr ? "بدء المراجعة" : "Start Flashcards"}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ArrowRight className="size-4 rtl-flip" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Unit Flashcards View
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBackToUnits}
          className="gap-2 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="size-4 rtl-flip" />
          <span>{isAr ? "العودة لاختيار الوحدات" : "Back to Units"}</span>
        </Button>

        <div className="text-center">
          <div className="text-xs font-bold text-primary font-mono tracking-wider">
            UNIT {selectedUnit.unit}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
            {isAr ? selectedUnit.themeAr : selectedUnit.themeEn}
          </div>
        </div>

        {/* Position Indicator */}
        <div className="text-xs font-bold text-foreground font-mono bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
          {currentWordIndex + 1} / {words.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Flashcard Container */}
      {currentWord && (
        <div className="surface-card relative overflow-hidden rounded-2xl border-2 border-border/90 p-6 sm:p-9 shadow-md transition-all">
          <div className="space-y-6 text-center">
            {/* Word Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="rounded-md bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {currentWord.partOfSpeech}
                </span>
                {currentWord.phonetic && (
                  <span className="font-mono text-xs text-primary/90">{currentWord.phonetic}</span>
                )}
              </div>

              {/* English Word */}
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground select-all">
                {currentWord.word}
              </h2>
            </div>

            {/* Pronunciation Button */}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePronounce(currentWord.word)}
                disabled={isSpeaking}
                className="gap-2 rounded-full px-4 text-xs font-semibold cursor-pointer border-primary/40 hover:bg-primary/10"
              >
                <Volume2 className={`size-4 text-primary ${isSpeaking ? "animate-pulse" : ""}`} />
                <span>{isAr ? "استمع للنطق (British)" : "Listen (British English)"}</span>
              </Button>
            </div>

            {/* English Definition */}
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-lg mx-auto">
              {currentWord.definitionEn}
            </p>

            {/* Meaning Reveal Section */}
            <div className="pt-2">
              {!isMeaningRevealed ? (
                <Button
                  type="button"
                  variant="glow"
                  size="lg"
                  onClick={() => setIsMeaningRevealed(true)}
                  className="w-full sm:w-auto gap-2 px-8 font-bold cursor-pointer"
                >
                  <Eye className="size-4" />
                  <span>{isAr ? "إظهار المعنى بالعربية" : "Reveal Arabic Meaning"}</span>
                </Button>
              ) : (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-start space-y-3 animate-in fade-in-50 zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <span className="text-xs font-bold text-primary">
                      {isAr ? "المعنى بالعربية" : "Arabic Meaning"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMeaningRevealed(false)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="size-3.5" />
                      <span>{isAr ? "إخفاء" : "Hide"}</span>
                    </button>
                  </div>

                  <div className="font-display text-2xl font-bold text-foreground text-center py-1">
                    {currentWord.meaningAr}
                  </div>

                  {currentWord.exampleEn && (
                    <div className="text-xs space-y-1 pt-2 border-t border-border/40">
                      <div className="text-muted-foreground font-medium">Example:</div>
                      <p className="text-foreground italic">{currentWord.exampleEn}</p>
                      {currentWord.exampleAr && (
                        <p className="text-muted-foreground">{currentWord.exampleAr}</p>
                      )}
                    </div>
                  )}

                  {currentWord.collocations && currentWord.collocations.length > 0 && (
                    <div className="text-xs pt-1 flex flex-wrap gap-1.5 items-center">
                      <span className="text-muted-foreground font-medium">Collocations:</span>
                      {currentWord.collocations.map((c, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-surface-2 px-2 py-0.5 text-foreground font-mono text-[11px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handlePrevWord}
          disabled={currentWordIndex === 0}
          className="flex-1 gap-2 font-semibold cursor-pointer"
        >
          <ChevronLeft className="size-4 rtl-flip" />
          <span>{isAr ? "السابق" : "Previous"}</span>
        </Button>

        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleNextWord}
          disabled={currentWordIndex === words.length - 1}
          className="flex-1 gap-2 font-semibold cursor-pointer"
        >
          <span>{isAr ? "التالي" : "Next"}</span>
          <ChevronRight className="size-4 rtl-flip" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {isAr
          ? "يمكنك استخدام مفاتيح الأسهم (← و →) ومفتاح المسافة للتنقل السريع."
          : "Tip: Use arrow keys (← and →) and Spacebar for rapid flashcard navigation."}
      </p>
    </div>
  );
}
