import { LANG_META, type Lang } from "./i18n-dict";

export type DateFormatPref = "auto" | "dmy" | "mdy" | "ymd";
export type TimeFormatPref = "12h" | "24h";
export type CalendarPref = "gregorian" | "hijri";

export interface LocaleFormatOptions {
  lang: Lang;
  timezone?: string | undefined;
  dateFormat?: DateFormatPref | undefined;
  timeFormat?: TimeFormatPref | undefined;
  calendar?: CalendarPref | undefined;
}

export function resolveBcp47(lang: Lang, calendar: CalendarPref = "gregorian"): string {
  const base = LANG_META[lang]?.bcp47 ?? "en-US";
  if (calendar === "hijri") {
    return `${base}-u-ca-islamic-umalqura`;
  }
  return base;
}

export function formatNumber(value: number, lang: Lang): string {
  try {
    return new Intl.NumberFormat(LANG_META[lang]?.bcp47 ?? "en-US").format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(
  input: Date | string | number,
  opts: LocaleFormatOptions,
  style: "short" | "medium" | "long" = "medium",
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const locale = resolveBcp47(opts.lang, opts.calendar);
  const tz = opts.timezone && opts.timezone !== "auto" ? opts.timezone : undefined;

  if (opts.calendar !== "hijri" && opts.dateFormat && opts.dateFormat !== "auto") {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(date);
      const y = parts.find((p) => p.type === "year")?.value ?? "";
      const m = parts.find((p) => p.type === "month")?.value ?? "";
      const d = parts.find((p) => p.type === "day")?.value ?? "";
      if (opts.dateFormat === "dmy") return `${d}/${m}/${y}`;
      if (opts.dateFormat === "mdy") return `${m}/${d}/${y}`;
      if (opts.dateFormat === "ymd") return `${y}-${m}-${d}`;
    } catch {
      // Fallback to Intl below
    }
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: style,
      timeZone: tz,
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatTime(input: Date | string | number, opts: LocaleFormatOptions): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const locale = LANG_META[opts.lang]?.bcp47 ?? "en-US";
  const tz = opts.timezone && opts.timezone !== "auto" ? opts.timezone : undefined;

  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: opts.timeFormat ? opts.timeFormat === "12h" : undefined,
      timeZone: tz,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatDateTime(input: Date | string | number, opts: LocaleFormatOptions): string {
  const d = formatDate(input, opts, "medium");
  const t = formatTime(input, opts);
  return t ? `${d} · ${t}` : d;
}

export function formatRelativeDay(input: Date | string | number, lang: Lang): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);
  try {
    const rtf = new Intl.RelativeTimeFormat(LANG_META[lang]?.bcp47 ?? "en-US", {
      numeric: "auto",
    });
    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.round(diffMs / 3_600_000);
      if (Math.abs(diffHours) < 1) {
        const diffMins = Math.round(diffMs / 60_000);
        return rtf.format(diffMins, "minute");
      }
      return rtf.format(diffHours, "hour");
    }
    return rtf.format(diffDays, "day");
  } catch {
    return date.toLocaleDateString();
  }
}
