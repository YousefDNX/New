import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useOptionalAuth } from "@/lib/auth.tsx";
import { useOptionalPrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export interface LoadingOverlayProps {
  forceShow?: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ forceShow = false, message, className }: LoadingOverlayProps) {
  const auth = useOptionalAuth();
  const isAuthInitializing = auth ? !auth.isInitialized : false;
  const isMutating = useIsMutating();
  const prefs = useOptionalPrefs();
  const isArabic = prefs?.lang === "ar";
  const reduceMotion = prefs?.a11y.reduceMotion ?? false;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isProtectedPath =
    mounted &&
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/app") ||
      window.location.pathname.startsWith("/onboarding"));
  const showAuthInitOverlay = isAuthInitializing && isProtectedPath;

  // Smooth debouncing so rapid 50ms fetches don't flicker, and SSR stays hydration-safe
  const [visible, setVisible] = useState(forceShow);

  useEffect(() => {
    if (!mounted) return undefined;
    if (forceShow || showAuthInitOverlay) {
      setVisible(true);
      return undefined;
    }

    // Only show if network mutation activity persists for over 400ms
    if (isMutating > 0) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }

    setVisible(false);
    return undefined;
  }, [mounted, forceShow, showAuthInitOverlay, isMutating]);

  if (!visible) return null;

  const defaultMessage = isAuthInitializing
    ? isArabic
      ? "استعادة الجلسة ومزامنة خريطة النمو..."
      : "Restoring session & synchronizing Growth Map..."
    : isArabic
      ? "جاري تحميل البيانات..."
      : "Loading workspace data...";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs transition-opacity duration-300",
        className,
      )}
    >
      <div className="relative flex size-16 items-center justify-center">
        {/* Pulsating outer ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl bg-primary/20",
            !reduceMotion && "animate-ping opacity-50 duration-1000",
          )}
        />
        {/* Glowing border card */}
        <div className="relative flex size-12 items-center justify-center rounded-xl border border-primary/40 bg-card shadow-lg shadow-primary/10">
          <div
            className={cn(
              "size-6 rounded-full border-2 border-primary border-t-transparent",
              !reduceMotion && "animate-spin",
            )}
          />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium tracking-wide text-foreground/80">
        {message || defaultMessage}
      </p>
    </div>
  );
}
