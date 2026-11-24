import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PreferencesProvider } from "@/lib/preferences";
import { ExperienceModeProvider } from "@/lib/experience-mode";
import { auth } from "@/lib/firebase";
import { isGoogleSignInInFlight, waitForAuthReady } from "@/lib/firebase-auth";
import { GMP_QUOTA_DOCS_URL, GMP_QUOTA_EVENT, initGmpQuotaDefense } from "@/lib/maps-quota";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SEOProvider } from "@/components/seo/SEOProvider";
import { ToastProvider } from "@/components/common/ToastProvider";
import { CommandPalette } from "@/components/common/CommandPalette";
import { ConfettiCelebration } from "@/components/common/ConfettiCelebration";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clearCachedBootstrappedProfile } from "@/lib/auth-bootstrap";
import { clearSettingsMemoryCache } from "@/hooks/use-settings";

import appCss from "../styles.css?url";

import { translate, useOptionalPrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";
import { registerServiceWorker } from "@/lib/pwa";
import { initFirebaseAnalytics } from "@/lib/analytics";

function NotFoundComponent() {
  const docLang = useOptionalPrefs()?.lang ?? "en";
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {translate(docLang, "common.notfound.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate(docLang, "common.notfound.desc")}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {translate(docLang, "common.notfound.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const docLang = useOptionalPrefs()?.lang ?? "en";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {translate(docLang, "common.error.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate(docLang, "common.error.desc")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {translate(docLang, "common.error.retry")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {translate(docLang, "common.notfound.home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND.name} — ${BRAND.fullName} | Student Innovation & Growth Platform` },
      {
        name: "description",
        content: BRAND.mission,
      },
      { name: "theme-color", content: "#0e1522" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: BRAND.shortName },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className="dark"
      data-theme="dark"
      data-ui-theme="classic"
      data-density="comfortable"
      data-bg-style="ambient"
      data-shadow-level="soft"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    void initFirebaseAnalytics();
  }, []);

  useEffect(() => {
    const cleanupTrap = initGmpQuotaDefense();
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener(GMP_QUOTA_EVENT, onQuotaExceeded);
    return () => {
      window.removeEventListener(GMP_QUOTA_EVENT, onQuotaExceeded);
      cleanupTrap();
    };
  }, []);

  useEffect(() => {
    let active = true;
    let prevUid = auth.currentUser?.uid ?? null;
    const unsubscribe = auth.onIdTokenChanged((user) => {
      const nextUid = user?.uid ?? null;
      if (nextUid !== prevUid) {
        prevUid = nextUid;
        const flushInvalidation = () => {
          if (!active) return;
          void router.invalidate();
          if (auth.currentUser?.uid) {
            void queryClient.invalidateQueries();
          } else {
            clearCachedBootstrappedProfile();
            clearSettingsMemoryCache();
            queryClient.clear();
          }
        };
        if (nextUid && isGoogleSignInInFlight()) {
          void waitForAuthReady().finally(flushInvalidation);
          return;
        }
        flushInvalidation();
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <SEOProvider>
        <AuthProvider>
          <PreferencesProvider>
            <ExperienceModeProvider>
              <ThemeProvider>
                <FeatureGuideProvider>
                  <TooltipProvider delayDuration={200}>
                    <ToastProvider>
                      {mapsQuotaExceeded && (
                        <div
                          role="alert"
                          className="sticky top-0 z-50 border-b border-amber-500/35 bg-surface/95 px-4 py-2 text-xs text-foreground backdrop-blur-md shadow-sm"
                        >
                          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
                            <span>
                              Google Maps demo quota reached or authentication failed. Maps features
                              may be temporarily rate-limited.
                            </span>
                            <div className="flex items-center gap-3">
                              <a
                                href={GMP_QUOTA_DOCS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-amber-600 dark:text-amber-400 underline hover:opacity-80"
                              >
                                Learn how to resolve quota limits
                              </a>
                              <button
                                type="button"
                                onClick={() => setMapsQuotaExceeded(false)}
                                className="rounded-md px-2 py-0.5 font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                      <Outlet />
                      <ConfettiCelebration />
                      <CommandPalette />
                      <LoadingOverlay />
                      <Toaster position="top-center" />
                    </ToastProvider>
                  </TooltipProvider>
                </FeatureGuideProvider>
              </ThemeProvider>
            </ExperienceModeProvider>
          </PreferencesProvider>
        </AuthProvider>
      </SEOProvider>
    </QueryClientProvider>
  );
}
