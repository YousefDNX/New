import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

const EMPTY_VALUE_SENTINEL = "__btc_select_empty__";

export interface ModernSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
  group?: string;
}

export interface ModernSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ModernSelectOption[];
  placeholder?: string;
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
  placeholder,
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
  const { dir } = usePrefs();
  const safeOptions = React.useMemo(() => (Array.isArray(options) ? options : []), [options]);

  const encode = React.useCallback((raw: string) => (raw === "" ? EMPTY_VALUE_SENTINEL : raw), []);
  const decode = React.useCallback(
    (encoded: string) => (encoded === EMPTY_VALUE_SENTINEL ? "" : encoded),
    [],
  );

  const selectedOption = safeOptions.find((o) => o.value === value);
  const normalizedValue = selectedOption ? encode(selectedOption.value) : undefined;

  const grouped = React.useMemo(() => {
    const groups: Array<{ groupName: string | null; items: ModernSelectOption[] }> = [];
    for (const opt of safeOptions) {
      const g = opt.group ?? null;
      const last = groups[groups.length - 1];
      if (!last || last.groupName !== g) {
        groups.push({ groupName: g, items: [opt] });
      } else {
        last.items.push(opt);
      }
    }
    return groups;
  }, [safeOptions]);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Select
        dir={dir}
        {...(normalizedValue !== undefined ? { value: normalizedValue } : {})}
        onValueChange={(next) => onValueChange(decode(next))}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-label={ariaLabel}
          data-testid={dataTestId}
          className={cn(
            "w-full rounded-xl border border-input bg-surface-2/90 px-3.5 text-foreground shadow-xs transition-all",
            "hover:border-primary/45 hover:bg-surface-2 focus:border-primary focus:ring-2 focus:ring-primary/25",
            size === "sm" ? "h-9 text-xs" : "min-h-[42px] py-2 text-sm",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder ?? selectedOption?.label ?? ""}>
            {selectedOption ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium">{selectedOption.label}</span>
                {selectedOption.badge ? (
                  <span className="shrink-0 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {selectedOption.badge}
                  </span>
                ) : null}
              </span>
            ) : (
              (placeholder ?? "")
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          className={cn(
            "z-[80] max-h-80 rounded-xl border border-primary/25 bg-popover/98 p-1 shadow-2xl backdrop-blur-xl",
            contentClassName,
          )}
        >
          {grouped.map((grp, groupIdx) => (
            <React.Fragment key={grp.groupName ?? `group-${groupIdx}`}>
              {groupIdx > 0 ? <SelectSeparator /> : null}
              <SelectGroup>
                {grp.groupName ? (
                  <SelectLabel className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {grp.groupName}
                  </SelectLabel>
                ) : null}
                {grp.items.map((opt) => (
                  <SelectItem
                    key={encode(opt.value)}
                    value={encode(opt.value)}
                    disabled={opt.disabled}
                    className="rounded-lg py-2 ps-3 pe-8 text-sm cursor-pointer data-[highlighted]:bg-primary/12 data-[highlighted]:text-foreground"
                  >
                    <div className="flex flex-col gap-0.5 text-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium leading-snug">{opt.label}</span>
                        {opt.badge ? (
                          <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {opt.badge}
                          </span>
                        ) : null}
                      </div>
                      {opt.description ? (
                        <span className="text-[11px] text-muted-foreground leading-snug">
                          {opt.description}
                        </span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
