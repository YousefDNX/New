import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();
let swRegistration: ServiceWorkerRegistration | null = null;
let updateWaiting = false;
const swListeners = new Set<() => void>();
let swInitialized = false;

function notifyInstallListeners() {
  for (const listener of installListeners) listener();
}

function notifySwListeners() {
  for (const listener of swListeners) listener();
}

export function resetPwaStateForTests() {
  deferredInstallPrompt = null;
  updateWaiting = false;
  swRegistration = null;
  swInitialized = false;
  notifyInstallListeners();
  notifySwListeners();
}

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const matchStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const iosStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone,
  );
  return matchStandalone || iosStandalone;
}

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || swInitialized) return;
  swInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    notifyInstallListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    notifyInstallListeners();
  });

  if (!("serviceWorker" in navigator)) return;

  const isViteDevBrowser = Boolean(import.meta.env?.DEV && !import.meta.env?.["VITEST"]);
  if (isViteDevBrowser) {
    void navigator.serviceWorker
      .getRegistrations?.()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => undefined);
    if (typeof caches !== "undefined") {
      void caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((k) => k.startsWith("btc-")).map((k) => caches.delete(k))),
        )
        .catch(() => undefined);
    }
    return;
  }

  void navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      swRegistration = registration;
      if (registration.waiting) {
        updateWaiting = true;
        notifySwListeners();
      }
      registration.addEventListener("updatefound", () => {
        const nextWorker = registration.installing;
        if (!nextWorker) return;
        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
            updateWaiting = true;
            notifySwListeners();
          }
        });
      });
    })
    .catch(() => {
      // Service worker unavailable in restricted iframe/test mode — degrade cleanly
    });
}

export function usePWA() {
  const [canInstall, setCanInstall] = useState<boolean>(() => deferredInstallPrompt !== null);
  const [installed, setInstalled] = useState<boolean>(() => isStandaloneMode());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [hasUpdate, setHasUpdate] = useState<boolean>(() => updateWaiting);

  useEffect(() => {
    registerServiceWorker();

    const syncInstall = () => {
      setCanInstall(deferredInstallPrompt !== null);
      setInstalled(isStandaloneMode());
    };
    const syncSw = () => setHasUpdate(updateWaiting);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    installListeners.add(syncInstall);
    swListeners.add(syncSw);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    mq?.addEventListener?.("change", syncInstall);

    return () => {
      installListeners.delete(syncInstall);
      swListeners.delete(syncSw);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      mq?.removeEventListener?.("change", syncInstall);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferredInstallPrompt) return "unavailable";
    try {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        deferredInstallPrompt = null;
        setCanInstall(false);
        setInstalled(true);
      }
      return choice.outcome;
    } catch {
      return "unavailable";
    }
  }, []);

  const applyUpdate = useCallback(() => {
    updateWaiting = false;
    setHasUpdate(false);
    if (typeof window === "undefined") return;

    let reloaded = false;
    const doReload = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    if (swRegistration?.waiting && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", doReload, { once: true });
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.setTimeout(doReload, 600);
      return;
    }

    doReload();
  }, []);

  return {
    canInstall,
    installed,
    isOnline,
    hasUpdate,
    swSupported: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    promptInstall,
    applyUpdate,
  };
}
