import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutGrid, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveSettings,
} from "@/hooks/use-settings";
import { usePrefs } from "@/lib/preferences";
import {
  DASHBOARD_WIDGET_IDS,
  defaultAppearancePrefs,
  type DashboardWidgetId,
} from "@/lib/settings";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";

const WIDGET_LABELS: Record<DashboardWidgetId, { en: string; ar: string }> = {
  welcome: { en: "Welcome Banner", ar: "لافتة الترحيب" },
  stats: { en: "XP & Streak Stats", ar: "إحصائيات التقدم" },
  pomodoro: { en: "Focus Pomodoro Timer", ar: "مؤقت التركيز بومودورو" },
  areas: { en: "Life & Study Areas", ar: "مجالات التطور" },
  tasks: { en: "Today's Tasks", ar: "مهام اليوم" },
  goals: { en: "Daily Goals", ar: "الأهداف اليومية" },
  activity: { en: "Recent Activity", ar: "النشاط الأخير" },
  hub: { en: "Workspace Module Hub", ar: "مركز الأقسام" },
};

export function DashboardCustomizerBar() {
  const { lang, effectiveAppearance, setAppearance } = usePrefs();
  const saveSettings = useSaveSettings();
  const [open, setOpen] = useState(false);
  const isAr = lang === "ar";

  const order = effectiveAppearance.widgetOrder;
  const hiddenSet = new Set(effectiveAppearance.hiddenWidgets);

  const persistLayout = (nextOrder: DashboardWidgetId[], nextHidden: DashboardWidgetId[]) => {
    const prevOrder = effectiveAppearance.widgetOrder;
    const prevHidden = effectiveAppearance.hiddenWidgets;
    setAppearance({ widgetOrder: nextOrder, hiddenWidgets: nextHidden });

    saveSettings({
      dashboard_widget_order: nextOrder,
      dashboard_hidden_widgets: nextHidden,
    }).catch((err) => {
      if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
        toast.info(isAr ? "تم حفظ ترتيب البطاقات محلياً" : "Dashboard layout saved locally", {
          id: "dash-layout-local",
        });
      } else {
        setAppearance({ widgetOrder: prevOrder, hiddenWidgets: prevHidden });
        toast.error(isAr ? "تعذر حفظ الترتيب على الخادم" : "Failed to save dashboard layout");
      }
    });
  };

  const toggleVisibility = (id: DashboardWidgetId) => {
    // Always preserve at least one core widget visible
    const currentlyHidden = hiddenSet.has(id);
    if (!currentlyHidden && order.filter((w) => !hiddenSet.has(w)).length <= 1) {
      toast.info(
        isAr
          ? "يجب إبقاء بطاقة واحدة على الأقل ظاهرة"
          : "Keep at least one dashboard widget visible",
      );
      return;
    }
    const nextHidden = currentlyHidden
      ? effectiveAppearance.hiddenWidgets.filter((w) => w !== id)
      : [...effectiveAppearance.hiddenWidgets, id];
    persistLayout(order, nextHidden);
  };

  const moveWidget = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const copy = [...order];
    const currentItem = copy[index];
    const swapItem = copy[target];
    if (!currentItem || !swapItem) return;
    copy[index] = swapItem;
    copy[target] = currentItem;
    persistLayout(copy, effectiveAppearance.hiddenWidgets);
  };

  const handleReset = () => {
    persistLayout([...defaultAppearancePrefs.widgetOrder], []);
    toast.success(isAr ? "تمت استعادة التخطيط الافتراضي" : "Restored default dashboard layout");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <FeatureGuideTrigger featureId="dashboard-customizer" iconOnly />
        <Button
          type="button"
          variant={open ? "secondary" : "outline"}
          size="sm"
          onClick={() => setOpen((v) => !v)}
          data-testid="dashboard-customizer-toggle"
          className="h-8 gap-1.5 text-xs"
          aria-expanded={open}
        >
          <LayoutGrid className="size-3.5 text-primary" />
          <span>{isAr ? "تخصيص البطاقات" : "Customize Widgets"}</span>
        </Button>
      </div>

      {open && (
        <div data-testid="dashboard-customizer-panel" className="surface-card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {isAr ? "منشئ لوحة التحكم الشخصية" : "Personal Dashboard Builder"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? "أعد ترتيب البطاقات أو أخفِ ما لا تحتاجه اليوم. تبقى أدوات الوصول السريع وشريط التنقل متاحة دائماً."
                  : "Reorder cards or hide widgets you do not need today. Navigation and accessibility controls remain protected."}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1 text-xs"
            >
              <RotateCcw className="size-3" />
              <span>{isAr ? "استعادة الافتراضي" : "Reset"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {order.map((widgetId, idx) => {
              const isHidden = hiddenSet.has(widgetId);
              const meta = WIDGET_LABELS[widgetId] ?? { en: widgetId, ar: widgetId };
              return (
                <div
                  key={widgetId}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs ${
                    isHidden
                      ? "border-border/50 bg-surface-1/60 text-muted-foreground opacity-75"
                      : "border-border bg-surface-2 text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleVisibility(widgetId)}
                    className="flex items-center gap-1.5 min-w-0 flex-1 text-start"
                    title={isHidden ? (isAr ? "إظهار" : "Show") : isAr ? "إخفاء" : "Hide"}
                  >
                    {isHidden ? (
                      <EyeOff className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <Eye className="size-3.5 shrink-0 text-primary" />
                    )}
                    <span className="truncate font-medium">{isAr ? meta.ar : meta.en}</span>
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveWidget(idx, -1)}
                      aria-label={`Move ${meta.en} up`}
                      className="rounded p-1 hover:bg-surface-1 disabled:opacity-30"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === DASHBOARD_WIDGET_IDS.length - 1}
                      onClick={() => moveWidget(idx, 1)}
                      aria-label={`Move ${meta.en} down`}
                      className="rounded p-1 hover:bg-surface-1 disabled:opacity-30"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
