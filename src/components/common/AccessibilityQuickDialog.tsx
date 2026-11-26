import React, { useState, useEffect } from "react";
import {
  Accessibility,
  Eye,
  Type,
  Volume2,
  Sparkles,
  Sliders,
  RotateCcw,
  BookOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/lib/preferences";

export type TextScaleLevel = "normal" | "large" | "extra";

interface AccessibilityQuickDialogProps {
  trigger?: React.ReactNode;
  lang?: string;
}

export const AccessibilityQuickDialog: React.FC<AccessibilityQuickDialogProps> = ({
  trigger,
  lang: propLang,
}) => {
  const {
    lang: prefsLang,
    a11y,
    setA11y,
    speakText,
    stopSpeaking,
    speechState,
    speechSupported,
  } = usePrefs();

  const lang = propLang ?? prefsLang;
  const isAr = lang === "ar";
  const [isOpen, setIsOpen] = useState(false);

  // Focus reading ruler for ADHD & dyslexia reading tracking
  const [focusRuler, setFocusRuler] = useState<boolean>(() => {
    try {
      return localStorage.getItem("btc_a11y_focus_ruler") === "true";
    } catch {
      return false;
    }
  });

  const [mouseY, setMouseY] = useState(300);

  useEffect(() => {
    try {
      localStorage.setItem("btc_a11y_focus_ruler", String(focusRuler));
    } catch {
      // Storage unavailable
    }

    if (!focusRuler) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [focusRuler]);

  const handleReadAloud = () => {
    if (speechState === "playing") {
      stopSpeaking();
    } else {
      const main = document.getElementById("main-content") ?? document.body;
      const text = main.innerText?.slice(0, 5000);
      if (text) {
        speakText(text);
      }
    }
  };

  const handleResetA11y = () => {
    setA11y({
      contrast: false,
      fontScale: 1.0,
      reduceMotion: false,
      dyslexia: false,
      readAloud: false,
    });
    setFocusRuler(false);
  };

  const currentScaleLevel: TextScaleLevel =
    a11y.fontScale >= 1.4 ? "extra" : a11y.fontScale >= 1.2 ? "large" : "normal";

  const handleScaleChange = (level: TextScaleLevel) => {
    const scaleMap: Record<TextScaleLevel, number> = {
      normal: 1.0,
      large: 1.25,
      extra: 1.5,
    };
    setA11y({ fontScale: scaleMap[level] });
  };

  return (
    <>
      {/* Focus Reading Ruler Overlay for ADHD / Visual tracking */}
      {focusRuler && (
        <div
          data-testid="focus-reading-ruler-overlay"
          className="pointer-events-none fixed inset-x-0 z-50 h-10 -translate-y-1/2 border-y-2 border-emerald-500/60 bg-emerald-500/10 backdrop-contrast-125 transition-transform duration-75"
          style={{ top: `${mouseY}px` }}
          aria-hidden="true"
        />
      )}

      {trigger ? (
        <span onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="accessibility-quick-trigger"
          onClick={() => setIsOpen(true)}
          className="min-h-[38px] gap-1.5 px-3 text-xs font-semibold cursor-pointer"
          title={
            isAr ? "أدوات إمكانية الوصول وذوي الاحتياجات الخاصة" : "Accessibility & Assistive Tools"
          }
          aria-label={isAr ? "أدوات إمكانية الوصول" : "Accessibility Tools"}
        >
          <Accessibility className="size-3.5 text-primary" />
          <span className="hidden sm:inline">{isAr ? "إمكانية الوصول" : "Accessibility"}</span>
        </Button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-dialog-title"
          data-testid="accessibility-quick-dialog"
          dir={isAr ? "rtl" : "ltr"}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Accessibility className="size-4" />
                </span>
                <div>
                  <h3 id="a11y-dialog-title" className="text-sm font-bold text-foreground truncate">
                    {isAr
                      ? "أدوات الوصول وذوي الاحتياجات الخاصة"
                      : "Accessibility & Assistive Tools"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {isAr
                      ? "مصمم لخدمة الجميع: ضعاف البصر، عسر القراءة، وتشتت الانتباه"
                      : "Assistive features for low-vision, dyslexia, and ADHD"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-testid="accessibility-dialog-close"
                onClick={() => setIsOpen(false)}
                className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Options Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* 1. Text Scaling */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border bg-surface-2/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Type className="size-4 text-primary" />
                    <span>{isAr ? "حجم الخط والنصوص" : "Text Size Scale"}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {currentScaleLevel === "large"
                      ? "125%"
                      : currentScaleLevel === "extra"
                        ? "150%"
                        : "100%"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(["normal", "large", "extra"] as TextScaleLevel[]).map((scale) => {
                    const isSelected = currentScaleLevel === scale;
                    const label =
                      scale === "normal"
                        ? isAr
                          ? "قياسي (100%)"
                          : "Default"
                        : scale === "large"
                          ? isAr
                            ? "كبير (125%)"
                            : "Large"
                          : isAr
                            ? "ضخم (150%)"
                            : "Extra Large";
                    return (
                      <button
                        key={scale}
                        type="button"
                        data-testid={`a11y-scale-${scale}`}
                        onClick={() => handleScaleChange(scale)}
                        className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-xs"
                            : "border-border bg-surface hover:border-primary/40 text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dyslexia Font Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-2/40 gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    <span>
                      {isAr ? "خط مخصص لعسر القراءة (Dyslexia)" : "Dyslexia-Friendly Font"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {isAr
                      ? "يساعد الطلاب الذين يعانون من صعوبات القراءة وتداخل الحروف"
                      : "Weighted base characters to assist readers with dyslexia"}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="a11y-toggle-dyslexia"
                  onClick={() => setA11y({ dyslexia: !a11y.dyslexia })}
                  aria-pressed={a11y.dyslexia}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    a11y.dyslexia
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {a11y.dyslexia ? (isAr ? "مفعّل ✓" : "Active ✓") : isAr ? "تفعيل" : "Enable"}
                </button>
              </div>

              {/* 3. High Contrast Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-2/40 gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <Eye className="size-4 text-primary shrink-0" />
                    <span>{isAr ? "التباين البصري العالي" : "High Contrast Mode"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {isAr
                      ? "يزيد وضوح النصوص والحدود لمساعدة ضعاف البصر والحد من الإجهاد"
                      : "Amplifies text borders and contrast for low-vision accessibility"}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="a11y-toggle-contrast"
                  onClick={() => setA11y({ contrast: !a11y.contrast })}
                  aria-pressed={a11y.contrast}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    a11y.contrast
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {a11y.contrast ? (isAr ? "مفعّل ✓" : "Active ✓") : isAr ? "تفعيل" : "Enable"}
                </button>
              </div>

              {/* 4. Audio Screen Reader / Read Aloud */}
              {speechSupported && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-2/40 gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <Volume2 className="size-4 text-primary shrink-0" />
                      <span>
                        {isAr ? "قارئ الشاشة الصوتي (نطق الصفحة)" : "Read Aloud / Text-to-Speech"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {isAr
                        ? "قراءة محتوى الصفحة الحالية بصوت طبيعي لدعم ذوي الإعاقة البصرية"
                        : "Speaks current screen text aloud for visually impaired learners"}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="a11y-toggle-speech"
                    onClick={handleReadAloud}
                    className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      speechState === "playing"
                        ? "bg-amber-600 text-white animate-pulse"
                        : "bg-surface border border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    {speechState === "playing"
                      ? isAr
                        ? "إيقاف القراءة"
                        : "Stop Reading"
                      : isAr
                        ? "بدء النطق"
                        : "Read Page"}
                  </button>
                </div>
              )}

              {/* 5. Reduce Motion */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-2/40 gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <Sliders className="size-4 text-primary shrink-0" />
                    <span>{isAr ? "تقليل الحركة والانتقالات" : "Reduce Motion & Animations"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {isAr
                      ? "يوقف الحركات والتأثيرات البصرية السريعة لمنع الدوار والحساسية"
                      : "Disables transitions for vestibular sensitivity"}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="a11y-toggle-motion"
                  onClick={() => setA11y({ reduceMotion: !a11y.reduceMotion })}
                  aria-pressed={a11y.reduceMotion}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    a11y.reduceMotion
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {a11y.reduceMotion ? (isAr ? "مفعّل ✓" : "Active ✓") : isAr ? "تفعيل" : "Enable"}
                </button>
              </div>

              {/* 6. Focus Reading Ruler */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-2/40 gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <span>
                      {isAr
                        ? "مسطرة القراءة لفرط الحركة وتشتت الانتباه (ADHD)"
                        : "Focus Reading Ruler"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {isAr
                      ? "تظليل السطور وتوجيه النظر أثناء القراءة لدعم التركيز"
                      : "Guided visual ruler for ADHD and reading focus"}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="a11y-toggle-ruler"
                  onClick={() => setFocusRuler(!focusRuler)}
                  aria-pressed={focusRuler}
                  className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    focusRuler
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {focusRuler ? (isAr ? "مفعّل ✓" : "Active ✓") : isAr ? "تفعيل" : "Enable"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2">
              <button
                type="button"
                onClick={handleResetA11y}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>{isAr ? "استعادة الإعدادات الافتراضية" : "Reset to default"}</span>
              </button>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="min-h-[36px] px-4 text-xs font-semibold"
              >
                {isAr ? "تم وحفظ" : "Done"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
