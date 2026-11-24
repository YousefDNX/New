import { useState, useEffect, type ReactNode } from "react";
import {
  BookOpen,
  X,
  Type,
  AlignLeft,
  Sun,
  Moon,
  Clock,
  Pause,
  Play,
  Square,
  Volume2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/lib/preferences";
import { extractReadablePageText } from "@/lib/speech-service";
import { cn } from "@/lib/utils";

export interface FocusReadingOverlayProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string | undefined;
}

type BackdropTone = "oled" | "charcoal" | "sepia" | "sage";

export function FocusReadingOverlay({
  title,
  subtitle,
  children,
  isOpen,
  onClose,
  className,
}: FocusReadingOverlayProps) {
  const {
    t,
    lang,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    speechState,
    speechSupported,
  } = usePrefs();

  const [lineSpacing, setLineSpacing] = useState<"standard" | "spacious" | "deep">("spacious");
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2); // 1: 16px, 2: 18px, 3: 20px, 4: 24px
  const [backdropTone, setBackdropTone] = useState<BackdropTone>("charcoal");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "dyslexic">("sans");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when overlay is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      stopSpeaking();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, stopSpeaking]);

  if (!isOpen) return null;

  const fontSizes = ["text-base", "text-lg", "text-xl", "text-2xl"];
  const lineHeights = {
    standard: "leading-relaxed",
    spacious: "leading-[2.2]",
    deep: "leading-[2.7]",
  };

  const backdropColors: Record<BackdropTone, { bg: string; text: string; card: string }> = {
    oled: {
      bg: "bg-[#000000]",
      text: "text-[#f1f5f9]",
      card: "bg-[#090d16] border-slate-800",
    },
    charcoal: {
      bg: "bg-[#0b0f17]",
      text: "text-[#f8fafc]",
      card: "bg-[#131b2a] border-slate-700/50",
    },
    sepia: {
      bg: "bg-[#181411]",
      text: "text-[#fef3c7]",
      card: "bg-[#251e18] border-amber-900/30",
    },
    sage: {
      bg: "bg-[#0c1613]",
      text: "text-[#ecfdf5]",
      card: "bg-[#14231f] border-emerald-900/30",
    },
  };

  const currentTheme = backdropColors[backdropTone];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) {
      setScrollProgress(Math.min(100, Math.round((el.scrollTop / max) * 100)));
    }
  };

  const handleReadAloud = () => {
    if (speechState === "playing") {
      pauseSpeaking();
      return;
    }
    if (speechState === "paused") {
      resumeSpeaking();
      return;
    }
    const container = document.getElementById("focus-reading-content-body");
    const rawText = extractReadablePageText(container, 4000);
    if (rawText) {
      speakText(rawText);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || t("reading.focusOverlayTitle")}
      className={cn(
        "fixed inset-0 z-50 flex flex-col transition-colors duration-300",
        currentTheme.bg,
        currentTheme.text,
      )}
    >
      {/* Top Reading Progress Bar */}
      <div className="h-1 w-full bg-white/10">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Immersive Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <BookOpen className="size-4" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-wide md:text-base">
              {title || (lang === "ar" ? "قراءة دراسية مركزة" : "Academic Focus Reading")}
            </h2>
            {subtitle && <p className="text-xs text-muted-foreground opacity-80">{subtitle}</p>}
          </div>
        </div>

        {/* Focus Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tone Selector */}
          <div className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 sm:flex">
            <button
              type="button"
              onClick={() => setBackdropTone("oled")}
              title="Pitch Dark (OLED)"
              className={cn(
                "size-6 rounded-md bg-black border border-white/20 transition-transform",
                backdropTone === "oled" && "ring-2 ring-primary scale-105",
              )}
            />
            <button
              type="button"
              onClick={() => setBackdropTone("charcoal")}
              title="Charcoal Night"
              className={cn(
                "size-6 rounded-md bg-[#0f172a] border border-white/20 transition-transform",
                backdropTone === "charcoal" && "ring-2 ring-primary scale-105",
              )}
            />
            <button
              type="button"
              onClick={() => setBackdropTone("sepia")}
              title="Warm Sepia"
              className={cn(
                "size-6 rounded-md bg-[#2d1f14] border border-amber-600/30 transition-transform",
                backdropTone === "sepia" && "ring-2 ring-amber-400 scale-105",
              )}
            />
            <button
              type="button"
              onClick={() => setBackdropTone("sage")}
              title="Calm Sage"
              className={cn(
                "size-6 rounded-md bg-[#0f291e] border border-emerald-600/30 transition-transform",
                backdropTone === "sage" && "ring-2 ring-emerald-400 scale-105",
              )}
            />
          </div>

          {/* Line Spacing Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setLineSpacing((prev) =>
                prev === "standard" ? "spacious" : prev === "spacious" ? "deep" : "standard",
              );
            }}
            title="Line Spacing (Standard / Spacious / Deep)"
            className="h-8 gap-1 px-2 text-xs text-inherit hover:bg-white/10"
          >
            <AlignLeft className="size-3.5" />
            <span className="hidden sm:inline">
              {lineSpacing === "standard" ? "1.8x" : lineSpacing === "spacious" ? "2.2x" : "2.7x"}
            </span>
          </Button>

          {/* Font Size Adjusters */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setFontSizeLevel((l) => Math.max(0, l - 1))}
              disabled={fontSizeLevel === 0}
              title="Smaller font"
              className="flex size-7 items-center justify-center rounded text-inherit hover:bg-white/10 disabled:opacity-30"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] opacity-75">
              {fontSizeLevel === 0
                ? "S"
                : fontSizeLevel === 1
                  ? "M"
                  : fontSizeLevel === 2
                    ? "L"
                    : "XL"}
            </span>
            <button
              type="button"
              onClick={() => setFontSizeLevel((l) => Math.min(fontSizes.length - 1, l + 1))}
              disabled={fontSizeLevel === fontSizes.length - 1}
              title="Larger font"
              className="flex size-7 items-center justify-center rounded text-inherit hover:bg-white/10 disabled:opacity-30"
            >
              <ZoomIn className="size-3.5" />
            </button>
          </div>

          {/* Read Aloud */}
          {speechSupported && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleReadAloud}
                title={
                  speechState === "playing"
                    ? t("pomo.pause")
                    : speechState === "paused"
                      ? t("pomo.resume")
                      : t("a11y.readAloud.page")
                }
                aria-label={
                  speechState === "playing"
                    ? t("pomo.pause")
                    : speechState === "paused"
                      ? t("pomo.resume")
                      : t("a11y.readAloud.page")
                }
                className="min-h-[40px] min-w-[40px] text-inherit hover:bg-white/10"
              >
                {speechState === "playing" ? (
                  <Pause className="size-4 text-primary" />
                ) : speechState === "paused" ? (
                  <Play className="size-4 text-primary" />
                ) : (
                  <Volume2 className="size-4 text-primary" />
                )}
              </Button>
              {speechState !== "idle" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={stopSpeaking}
                  title={lang === "ar" ? "إيقاف" : "Stop"}
                  aria-label={lang === "ar" ? "إيقاف" : "Stop"}
                  className="min-h-[40px] min-w-[40px] text-inherit hover:bg-white/10"
                >
                  <Square className="size-3.5 text-rose-400" />
                </Button>
              )}
            </div>
          )}

          {/* Close Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 gap-1.5 border-white/20 bg-white/10 px-3 text-xs font-semibold text-inherit hover:bg-white/20"
          >
            <X className="size-4" />
            <span className="hidden sm:inline">{t("common.close")}</span>
          </Button>
        </div>
      </header>

      {/* Main Focus Content Canvas */}
      <main onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-14">
        <div
          id="focus-reading-content-body"
          className={cn(
            "mx-auto max-w-3xl transition-all duration-200",
            fontSizes[fontSizeLevel],
            lineHeights[lineSpacing],
            fontFamily === "serif" ? "font-serif" : "font-sans",
            className,
          )}
          style={{ letterSpacing: "0.02em" }}
        >
          {children}
        </div>
      </main>

      {/* Bottom Subtle Status Bar */}
      <footer className="flex shrink-0 items-center justify-between border-t border-white/10 px-6 py-2 text-[11px] opacity-70">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3 text-primary" />
          <span>{lang === "ar" ? "وضع القراءة المركزة نشط" : "Focus Reading Mode Active"}</span>
        </span>
        <span>
          {scrollProgress}% {lang === "ar" ? "مقروء" : "Read"} ·{" "}
          <kbd className="rounded border border-white/20 px-1 font-mono">ESC</kbd>{" "}
          {lang === "ar" ? "للخروج" : "to exit"}
        </span>
      </footer>
    </div>
  );
}

/**
 * Reusable button to open the Focus Reading Overlay on any academic section.
 */
export function FocusReadingButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  const { lang } = usePrefs();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-1.5 rounded-lg border-primary/30 bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20",
        className,
      )}
    >
      <BookOpen className="size-3.5" />
      <span>{label || (lang === "ar" ? "قراءة مركزة" : "Focus Reading")}</span>
    </Button>
  );
}
