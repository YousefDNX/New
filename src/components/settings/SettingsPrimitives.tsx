import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { usePrefs } from "@/lib/preferences";
import type { DictKey } from "@/lib/i18n-dict";

export type SettingsCategoryId =
  | "appearance"
  | "typography"
  | "accessibility"
  | "language_region"
  | "study"
  | "ai"
  | "notifications"
  | "privacy_security"
  | "account";

export interface SettingsSearchEntry {
  category: SettingsCategoryId;
  rowId: string;
  labelKey: DictKey;
  keywords: string;
}

export const SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  // Appearance
  {
    category: "appearance",
    rowId: "row-theme-mode",
    labelKey: "set.theme",
    keywords: "dark light system theme mode color",
  },
  {
    category: "appearance",
    rowId: "row-accent",
    labelKey: "set.accent",
    keywords: "accent hex palette primary color",
  },
  {
    category: "appearance",
    rowId: "row-density",
    labelKey: "set.density",
    keywords: "compact comfortable spacious spacing",
  },
  {
    category: "appearance",
    rowId: "row-corner",
    labelKey: "set.corner",
    keywords: "radius sharp rounded soft",
  },
  {
    category: "appearance",
    rowId: "row-effects",
    labelKey: "set.effects",
    keywords: "blur glass glow effects",
  },
  {
    category: "appearance",
    rowId: "row-reading-layout",
    labelKey: "set.readingLayout",
    keywords: "width focused reading column",
  },

  // Typography & Fonts
  {
    category: "typography",
    rowId: "row-readability-preset",
    labelKey: "set.typo.preset",
    keywords: "readability standard comfortable large compact accessibility",
  },
  {
    category: "typography",
    rowId: "row-font-family",
    labelKey: "set.font",
    keywords: "typography serif sans sora humanist arabic cjk font",
  },
  {
    category: "typography",
    rowId: "row-typo-scale",
    labelKey: "set.textsize",
    keywords: "font scale size zoom larger text",
  },
  {
    category: "typography",
    rowId: "row-heading-scale",
    labelKey: "set.typo.headingScale",
    keywords: "heading size h1 h2 scale typography",
  },
  {
    category: "typography",
    rowId: "row-line-height",
    labelKey: "set.typo.lineHeight",
    keywords: "line height leading spacing",
  },
  {
    category: "typography",
    rowId: "row-letter-spacing",
    labelKey: "set.typo.letterSpacing",
    keywords: "letter spacing tracking arabic rtl",
  },
  {
    category: "typography",
    rowId: "row-font-weight",
    labelKey: "set.typo.fontWeight",
    keywords: "font weight regular medium bold",
  },

  // Language & Region
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.lang",
    keywords: "english arabic japanese french german chinese korean rtl",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.region",
    keywords: "kuwait gcc global country",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.timezone",
    keywords: "time zone utc",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.datefmt",
    keywords: "date dmy mdy ymd",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.timefmt",
    keywords: "12h 24h clock",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.firstday",
    keywords: "week sunday monday saturday",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.calendar",
    keywords: "gregorian hijri islamic calendar",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.units",
    keywords: "metric imperial km miles",
  },
  {
    category: "language_region",
    rowId: "cat-language",
    labelKey: "set.oppscope",
    keywords: "opportunity radar scope local gcc",
  },

  // Accessibility
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.dyslexia",
    keywords: "dyslexia atkinson hyperlegible spacing",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.contrast",
    keywords: "high contrast wcag border",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.motion",
    keywords: "reduce motion animation",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.focusRing",
    keywords: "keyboard focus ring tab outline",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.simplified",
    keywords: "simple calm ui reduce clutter",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.clearLang",
    keywords: "plain language clear hints",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.readAloud",
    keywords: "tts speech synthesis read aloud voice",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.voiceInput",
    keywords: "microphone dictation speech recognition",
  },
  {
    category: "accessibility",
    rowId: "cat-accessibility",
    labelKey: "set.captions",
    keywords: "captions transcripts subtitles",
  },

  // Study
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.explLang",
    keywords: "study explanation language",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.complexity",
    keywords: "simple balanced advanced depth",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.stepByStep",
    keywords: "steps numbered breakdown",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.examplesFirst",
    keywords: "worked examples first",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.visualAids",
    keywords: "diagrams visual tables",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.practiceQ",
    keywords: "practice quiz questions",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.flashcard",
    keywords: "flashcards active recall spaced repetition cloze",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.quizDiff",
    keywords: "quiz difficulty adaptive",
  },
  {
    category: "study",
    rowId: "cat-study",
    labelKey: "set.study.sessionMin",
    keywords: "focus pomodoro timer duration break",
  },

  // AI
  { category: "ai", rowId: "cat-ai", labelKey: "set.ai.lang", keywords: "ai language response" },
  {
    category: "ai",
    rowId: "cat-ai",
    labelKey: "set.ai.tone",
    keywords: "coach calm academic tone",
  },
  {
    category: "ai",
    rowId: "cat-ai",
    labelKey: "set.ai.profile",
    keywords: "ai context share profile tasks growth",
  },
  {
    category: "ai",
    rowId: "cat-ai",
    labelKey: "set.ai.history",
    keywords: "save chat history memory",
  },
  {
    category: "ai",
    rowId: "cat-ai",
    labelKey: "set.ai.clear",
    keywords: "clear ai drafts context",
  },

  // Notifications
  {
    category: "notifications",
    rowId: "cat-notifications",
    labelKey: "set.notif.perm",
    keywords: "browser notification permission alert",
  },
  {
    category: "notifications",
    rowId: "cat-notifications",
    labelKey: "set.notif.reminders",
    keywords: "study task calendar streak reminders",
  },
  {
    category: "notifications",
    rowId: "cat-notifications",
    labelKey: "set.notif.quiet",
    keywords: "quiet hours do not disturb overnight",
  },
  {
    category: "notifications",
    rowId: "cat-notifications",
    labelKey: "set.notif.freq",
    keywords: "instant daily weekly digest",
  },

  // Privacy & Security
  {
    category: "privacy_security",
    rowId: "cat-privacy",
    labelKey: "set.sec.providers",
    keywords: "google email phone login providers",
  },
  {
    category: "privacy_security",
    rowId: "cat-privacy",
    labelKey: "set.sec.phoneStatus",
    keywords: "sms phone link verification",
  },
  {
    category: "privacy_security",
    rowId: "cat-privacy",
    labelKey: "set.sec.session",
    keywords: "session persist sign out password reset",
  },
  {
    category: "privacy_security",
    rowId: "cat-privacy",
    labelKey: "set.sec.visibility",
    keywords: "minor privacy visibility profile circle",
  },
  {
    category: "privacy_security",
    rowId: "cat-privacy",
    labelKey: "set.sec.export",
    keywords: "export download json data",
  },
  {
    category: "privacy_security",
    rowId: "cat-privacy",
    labelKey: "set.sec.delete",
    keywords: "delete account permanently",
  },

  // Account & Profile
  {
    category: "account",
    rowId: "cat-account",
    labelKey: "set.name",
    keywords: "display name full name",
  },
  {
    category: "account",
    rowId: "cat-account",
    labelKey: "set.avatar",
    keywords: "avatar photo image",
  },
  {
    category: "account",
    rowId: "cat-account",
    labelKey: "set.grade",
    keywords: "grade school academic stage",
  },
  {
    category: "account",
    rowId: "cat-account",
    labelKey: "set.subjects",
    keywords: "subjects learning goals",
  },
];

export function SettingsSectionCard({
  id,
  title,
  desc,
  badge,
  children,
}: {
  id?: string | undefined;
  title: string;
  desc?: string | undefined;
  badge?: ReactNode | undefined;
  children: ReactNode;
}) {
  const { effectiveUiExperience } = usePrefs();
  const isEditorial = effectiveUiExperience === "editorial_atelier";
  const isFocus = effectiveUiExperience === "focus_deck";

  return (
    <section
      id={id}
      className={
        isEditorial
          ? "surface-card scroll-mt-6 border-t-2 border-t-foreground/25 p-5 md:p-6"
          : isFocus
            ? "surface-card scroll-mt-6 p-6 md:p-7"
            : "surface-card scroll-mt-6 p-5 md:p-6"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
        </div>
        {badge}
      </div>
      <div className="mt-4 divide-y divide-border">{children}</div>
    </section>
  );
}

export function SettingsRow({
  id,
  rowId,
  highlighted,
  label,
  desc,
  children,
}: {
  id?: string | undefined;
  rowId?: string | undefined;
  highlighted?: boolean | undefined;
  label: string;
  desc?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div
      id={rowId}
      className={`scroll-mt-24 flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 ${
        highlighted ? "settings-search-hit bg-primary/8 px-2.5" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        {id ? (
          <Label htmlFor={id} className="text-sm font-medium leading-snug">
            {label}
          </Label>
        ) : (
          <p className="text-sm font-medium leading-snug">{label}</p>
        )}
        {desc && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function AdvancedDisclosure({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-3.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-2/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
      >
        <span>{label}</span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="mt-3 divide-y divide-border ps-1">{children}</div>}
    </div>
  );
}

export function SegmentedChoice<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { v: T; l: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-border/70 bg-surface-2 p-1"
    >
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.v)}
            className={
              "min-h-[34px] whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm " +
              (active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
