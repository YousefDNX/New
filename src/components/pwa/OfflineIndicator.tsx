import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/lib/preferences";
import { usePWA } from "@/lib/pwa";

export function OfflineIndicator() {
  const { t } = usePrefs();
  const { isOnline, hasUpdate, applyUpdate } = usePWA();

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          data-testid="offline-status-banner"
          className="border-b border-xp/30 bg-xp/15 px-4 py-2 text-xs text-foreground md:px-8"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-2">
            <WifiOff className="size-3.5 shrink-0 text-xp" />
            <span>{t("nav.offline")}</span>
          </div>
        </div>
      )}

      {isOnline && hasUpdate && (
        <div
          role="status"
          data-testid="pwa-update-banner"
          className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-xs text-foreground md:px-8"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span>{t("pwa.updateReady")}</span>
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={applyUpdate}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              <RefreshCw className="size-3" />
              <span>{t("pwa.reloadToUpdate")}</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
