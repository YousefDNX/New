import { CheckCircle2, Download, Share2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BRAND } from "@/config/brand";
import { usePrefs } from "@/lib/preferences";
import { usePWA } from "@/lib/pwa";
import { cn } from "@/lib/utils";

export function PWAInstallButton({
  className,
  variant = "outline",
  size = "sm",
  showStatusWhenUnavailable = true,
}: {
  className?: string;
  variant?: "default" | "outline" | "glow" | "secondary";
  size?: "sm" | "default";
  showStatusWhenUnavailable?: boolean;
}) {
  const { lang, t } = usePrefs();
  const { canInstall, installed, promptInstall } = usePWA();
  const [busy, setBusy] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isAr = lang === "ar";

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsIOS(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));
  }, []);

  if (installed) {
    if (!showStatusWhenUnavailable) return null;
    return (
      <span
        data-testid="pwa-installed-badge"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success",
          className,
        )}
      >
        <CheckCircle2 className="size-3.5 shrink-0" />
        <span>{t("pwa.installedBadge")}</span>
      </span>
    );
  }

  if (!canInstall && isIOS) {
    return (
      <>
        <Button
          type="button"
          variant={variant}
          size={size}
          data-testid="pwa-ios-install-btn"
          className={cn("gap-1.5", className)}
          onClick={() => setShowIOSGuide(true)}
        >
          <Share2 className="size-3.5 shrink-0" />
          <span>{t("pwa.installOnIos")}</span>
        </Button>

        <Dialog open={showIOSGuide} onOpenChange={setShowIOSGuide}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {isAr
                  ? `تثبيت ${BRAND.shortName} على iPhone / iPad`
                  : `Install ${BRAND.shortName} on iOS`}
              </DialogTitle>
              <DialogDescription>
                {isAr
                  ? "اتبع الخطوتين التاليتين من متصفح Safari:"
                  : "Follow these steps in Safari:"}
              </DialogDescription>
            </DialogHeader>
            <ol className="space-y-2 text-xs text-foreground list-decimal ps-5">
              <li>
                {isAr
                  ? "اضغط على زر المشاركة (Share) في شريط Safari السفلي."
                  : "Tap the Share button in the Safari toolbar."}
              </li>
              <li>
                {isAr
                  ? "اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen)."
                  : "Scroll down and tap Add to Home Screen."}
              </li>
            </ol>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!canInstall) {
    if (!showStatusWhenUnavailable) return null;
    return (
      <div
        data-testid="pwa-install-hint"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground",
          className,
        )}
      >
        <Smartphone className="size-3.5 shrink-0 text-primary" />
        <span>{t("pwa.browserMenuHint")}</span>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={busy}
      data-testid="pwa-install-btn"
      className={cn("gap-1.5", className)}
      onClick={async () => {
        setBusy(true);
        try {
          const outcome = await promptInstall();
          if (outcome === "accepted") {
            toast.success(t("pwa.installOpened"));
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      <Download className="size-3.5 shrink-0" />
      <span>{t("pwa.installApp")}</span>
    </Button>
  );
}
