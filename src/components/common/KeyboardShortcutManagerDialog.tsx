import { useState } from "react";
import { Command, Keyboard, Navigation, Sparkles, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GLOBAL_SHORTCUTS, type ShortcutDefinition } from "@/hooks/use-keyboard-shortcuts";
import { usePrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export interface KeyboardShortcutManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutManagerDialog({
  open,
  onOpenChange,
}: KeyboardShortcutManagerDialogProps) {
  const { lang } = usePrefs();
  const [activeTab, setActiveTab] = useState<"all" | "navigation" | "system">("all");

  const filteredShortcuts = GLOBAL_SHORTCUTS.filter((sc) => {
    if (activeTab === "all") return true;
    return sc.category === activeTab;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-surface p-0 shadow-card">
        <DialogHeader className="border-b border-border/80 p-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Keyboard className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  {lang === "ar" ? "مدير اختصارات لوحة المفاتيح" : "Keyboard Shortcuts Manager"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {lang === "ar"
                    ? "تنقل فوري وكفاءة قصوى باستخدام مفاتيح الوصول السريع"
                    : "Instant navigation and peak productivity with direct key commands"}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {lang === "ar" ? "جميع الاختصارات" : "All Shortcuts"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("navigation")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                activeTab === "navigation"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {lang === "ar" ? "التنقل السريع" : "Navigation"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                activeTab === "system"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {lang === "ar" ? "أوامر النظام" : "System Tools"}
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredShortcuts.map((shortcut) => {
              const label = lang === "ar" ? shortcut.actionAr : shortcut.actionEn;
              return (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-2/60 p-3 transition-colors hover:border-primary/40 hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground capitalize">
                      {shortcut.category}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {shortcut.keys.map((k, idx) => (
                      <kbd
                        key={idx}
                        className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] font-bold text-foreground shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-primary">
              {lang === "ar" ? "نصيحة للمحترفين:" : "Pro Tip:"}
            </span>{" "}
            {lang === "ar"
              ? "يمكنك الضغط على حرف G في أي وقت لفتح خريطة النمو، أو S للدراسة، أو Cmd+K للبحث السريع."
              : "Press 'G' anywhere to open the Growth Map, 'S' for Study, or 'Cmd+K' to search anything instantly."}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-border/80 bg-surface-2/40 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            {lang === "ar" ? "إغلاق" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
