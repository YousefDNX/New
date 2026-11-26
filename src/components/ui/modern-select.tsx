import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOptionalPrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export interface ModernSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  keywords?: string;
  group?: string;
  disabled?: boolean;
  progressPct?: number;
  icon?: React.ReactNode;
}

export interface ModernSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ModernSelectOption[];
  label?: string;
  helperText?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  searchable?: boolean;
  align?: "start" | "center" | "end";
  leadingIcon?: React.ReactNode;
  renderTriggerValue?: (selected: ModernSelectOption | undefined) => React.ReactNode;
  id?: string;
  ariaLabel?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  size?: "sm" | "md";
  "data-testid"?: string;
}

export function ModernSelect({
  value,
  onValueChange,
  options,
  label,
  helperText,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  searchable,
  align = "start",
  leadingIcon,
  renderTriggerValue,
  id,
  ariaLabel,
  name,
  disabled,
  className,
  triggerClassName,
  contentClassName,
  size = "md",
  "data-testid": dataTestId,
}: ModernSelectProps) {
  const prefs = useOptionalPrefs();
  const dir = prefs?.dir ?? "ltr";
  const isAr = prefs?.lang === "ar";
  const generatedId = React.useId();
  const triggerId = id ?? `btc-select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const labelId = label ? `${triggerId}-label` : undefined;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const safeOptions = React.useMemo(() => (Array.isArray(options) ? options : []), [options]);
  const showSearch = searchable ?? safeOptions.length >= 4;
  const selectedOption = safeOptions.find((o) => o.value === value);

  const filteredOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return safeOptions;
    return safeOptions.filter((opt) => {
      const haystack = [opt.label, opt.description, opt.badge, opt.group, opt.keywords, opt.value]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, safeOptions]);

  const grouped = React.useMemo(() => {
    const buckets = new Map<string, { groupName: string | null; items: ModernSelectOption[] }>();
    const ungroupedKey = "__ungrouped__";
    for (const opt of filteredOptions) {
      const g = opt.group ?? null;
      const mapKey = g ?? ungroupedKey;
      let bucket = buckets.get(mapKey);
      if (!bucket) {
        bucket = { groupName: g, items: [] };
        buckets.set(mapKey, bucket);
      }
      bucket.items.push(opt);
    }
    let flatIndex = 0;
    return Array.from(buckets.values()).map((bucket) => ({
      groupName: bucket.groupName,
      items: bucket.items.map((option) => ({
        option,
        flatIndex: flatIndex++,
      })),
    }));
  }, [filteredOptions]);

  const orderedOptions = React.useMemo(
    () => grouped.flatMap((grp) => grp.items.map((item) => item.option)),
    [grouped],
  );

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(-1);
      return;
    }
    const selectedIdx = orderedOptions.findIndex((o) => o.value === value && !o.disabled);
    const firstEnabled = orderedOptions.findIndex((o) => !o.disabled);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : firstEnabled);
  }, [open, value, orderedOptions]);

  React.useEffect(() => {
    if (open && showSearch) {
      const raf = window.requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open, showSearch]);

  const handleSelectOption = (opt: ModernSelectOption) => {
    if (opt.disabled) return;
    onValueChange(opt.value);
    setOpen(false);
    setQuery("");
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const moveFocusIndex = (direction: 1 | -1) => {
    if (orderedOptions.length === 0) return;
    let next = activeIndex;
    for (let i = 0; i < orderedOptions.length; i++) {
      next = (next + direction + orderedOptions.length) % orderedOptions.length;
      if (!orderedOptions[next]?.disabled) {
        setActiveIndex(next);
        optionRefs.current[next]?.scrollIntoView?.({ block: "nearest" });
        return;
      }
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocusIndex(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocusIndex(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = orderedOptions.findIndex((o) => !o.disabled);
      if (first >= 0) {
        setActiveIndex(first);
        optionRefs.current[first]?.scrollIntoView?.({ block: "nearest" });
      }
    } else if (e.key === "End") {
      e.preventDefault();
      for (let i = orderedOptions.length - 1; i >= 0; i--) {
        if (!orderedOptions[i]?.disabled) {
          setActiveIndex(i);
          optionRefs.current[i]?.scrollIntoView?.({ block: "nearest" });
          break;
        }
      }
    } else if (e.key === "Enter" && activeIndex >= 0 && orderedOptions[activeIndex]) {
      e.preventDefault();
      handleSelectOption(orderedOptions[activeIndex]!);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div dir={dir} className={cn("relative flex w-full min-w-0 flex-col gap-1.5", className)}>
      {label ? (
        <label
          id={labelId}
          htmlFor={triggerId}
          className="text-xs font-semibold leading-snug text-foreground"
        >
          {label}
        </label>
      ) : null}

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-labelledby={ariaLabel ? undefined : labelId}
            aria-label={ariaLabel ?? label}
            data-testid={dataTestId}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              "flex w-full items-center justify-between gap-2.5 rounded-xl border border-input bg-surface-2/90 px-3.5 text-start text-foreground shadow-xs transition-colors cursor-pointer",
              "hover:border-primary/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              open && "border-primary ring-2 ring-primary/20",
              size === "sm" ? "min-h-[40px] py-1.5 text-xs" : "min-h-[44px] py-2.5 text-sm",
              triggerClassName,
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {leadingIcon ? (
                <span className="shrink-0 text-primary" aria-hidden="true">
                  {leadingIcon}
                </span>
              ) : null}
              {renderTriggerValue ? (
                renderTriggerValue(selectedOption)
              ) : selectedOption ? (
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground">
                    {selectedOption.label}
                  </span>
                  {selectedOption.badge ? (
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-primary">
                      {selectedOption.badge}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="truncate text-muted-foreground">
                  {placeholder ?? (isAr ? "اختر خياراً..." : "Select option...")}
                </span>
              )}
            </span>

            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
                open && "rotate-180 text-primary",
              )}
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          dir={dir}
          onKeyDown={handleListKeyDown}
          className={cn(
            "w-auto min-w-[max(20rem,var(--radix-popover-trigger-width))] max-w-[min(36rem,calc(100vw-1.5rem))] overflow-hidden p-0",
            contentClassName,
          )}
        >
          {showSearch ? (
            <div className="border-b border-border/80 bg-surface-2/60 p-2.5">
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute start-3 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder={
                    searchPlaceholder ?? (isAr ? "ابحث في الخيارات..." : "Search options...")
                  }
                  aria-label={searchPlaceholder ?? (isAr ? "ابحث في الخيارات" : "Filter options")}
                  className="min-h-[40px] w-full rounded-lg border border-border bg-background ps-9 pe-8 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                    aria-label={isAr ? "مسح البحث" : "Clear search"}
                    className="absolute end-2 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-muted-foreground tabular-nums">
                <span>
                  {isAr
                    ? `${filteredOptions.length} من ${safeOptions.length} خيارات`
                    : `${filteredOptions.length} of ${safeOptions.length} options`}
                </span>
                {selectedOption ? (
                  <span className="truncate font-medium text-primary max-w-[16rem]">
                    {selectedOption.label}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel ?? label ?? (isAr ? "الخيارات" : "Options")}
            className="max-h-72 overflow-y-auto p-1.5 space-y-1"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                {emptyMessage ??
                  (isAr ? "لا توجد نتائج مطابقة للبحث." : "No matching options found.")}
              </div>
            ) : (
              grouped.map((grp, groupIdx) => (
                <div key={`${grp.groupName ?? "ungrouped"}-${groupIdx}`} className="space-y-1">
                  {groupIdx > 0 ? <div className="my-1.5 h-px bg-border/60" /> : null}
                  {grp.groupName ? (
                    <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                      {grp.groupName}
                    </div>
                  ) : null}
                  {grp.items.map(({ option: opt, flatIndex }) => {
                    const isSelected = opt.value === value;
                    const isActive = flatIndex === activeIndex;
                    return (
                      <button
                        key={opt.value || `opt-${flatIndex}`}
                        ref={(el) => {
                          optionRefs.current[flatIndex] = el;
                        }}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={opt.disabled}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        onClick={() => handleSelectOption(opt)}
                        className={cn(
                          "flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-start text-sm transition-colors cursor-pointer",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45",
                          isSelected
                            ? "bg-primary/14 text-foreground font-semibold"
                            : isActive
                              ? "bg-surface-2 text-foreground"
                              : "text-foreground hover:bg-surface-2/80",
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-2.5">
                          {opt.icon ? (
                            <span className="mt-0.5 shrink-0 text-primary" aria-hidden="true">
                              {opt.icon}
                            </span>
                          ) : null}
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="break-words leading-snug">{opt.label}</span>
                              {opt.badge ? (
                                <span className="shrink-0 font-mono text-[11px] font-medium text-primary">
                                  {opt.badge}
                                </span>
                              ) : null}
                            </div>
                            {opt.description ? (
                              <span className="text-xs leading-snug text-muted-foreground">
                                {opt.description}
                              </span>
                            ) : null}
                            {typeof opt.progressPct === "number" ? (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2 border border-border/50">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{
                                      width: `${Math.max(4, Math.min(100, opt.progressPct))}%`,
                                    }}
                                  />
                                </div>
                                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                  {opt.progressPct}%
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <span className="flex size-4 shrink-0 items-center justify-center">
                          {isSelected ? <Check className="size-4 text-primary" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {helperText ? (
        <p className="text-xs leading-snug text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export const SearchableSelect = ModernSelect;
