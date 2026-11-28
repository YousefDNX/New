/* BTC — BE THE CHANGE Service Worker (TanStack Start Safe · Robust Offline PWA) */
const CACHE_VERSION = "btc-shell-v7";
const SHELL_ASSETS = [
  "/",
  "/app",
  "/app/ai",
  "/app/study",
  "/app/quran",
  "/app/tasks",
  "/app/english",
  "/app/care",
  "/app/skills",
  "/app/future",
  "/app/opportunities",
  "/app/help",
  "/app/settings",
  "/manifest.webmanifest",
  "/favicon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("btc-") && k !== CACHE_VERSION)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isSensitiveOrDynamicRequest(url) {
  const href = url.href;
  const pathname = url.pathname;
  const search = url.search;
  if (pathname.startsWith("/api/ai/live-ws")) return true;
  if (pathname.startsWith("/_serverFn")) return true;
  if (pathname.startsWith("/node_modules/")) return true;
  if (pathname.startsWith("/@vite/")) return true;
  if (pathname.startsWith("/@react-refresh")) return true;
  if (pathname.startsWith("/@tanstack-start/")) return true;
  if (pathname.startsWith("/@id/")) return true;
  if (pathname.startsWith("/@fs/")) return true;
  if (pathname.startsWith("/src/")) return true;
  if (search.includes("v=") || search.includes("t=")) return true;
  if (
    pathname.endsWith(".ts") ||
    pathname.endsWith(".tsx") ||
    pathname.endsWith(".jsx") ||
    pathname.endsWith(".mjs")
  ) {
    return true;
  }
  if (href.includes("googleapis.com")) return true;
  if (href.includes("firebaseio.com")) return true;
  if (href.includes("identitytoolkit")) return true;
  if (href.includes("securetoken")) return true;
  if (href.includes("firestore.googleapis.com")) return true;
  return false;
}

function isStaticAsset(url) {
  const p = url.pathname;
  return (
    p.startsWith("/assets/") ||
    p.endsWith(".png") ||
    p.endsWith(".jpg") ||
    p.endsWith(".jpeg") ||
    p.endsWith(".webp") ||
    p.endsWith(".svg") ||
    p.endsWith(".woff2") ||
    p.endsWith(".css") ||
    p === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isSensitiveOrDynamicRequest(url)) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              const clone = response.clone();
              void caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
            }
            return response;
          })
          .catch(() => cached || Response.error());
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            void caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedMatch =
            (await caches.match(request)) ||
            (await caches.match("/app")) ||
            (await caches.match("/"));
          if (cachedMatch) return cachedMatch;
          return new Response(
            "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>BTC — Offline</title><style>body{font-family:system-ui,sans-serif;background:#0e1522;color:#f1f5f9;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:1.5rem;text-align:center}button{margin-top:1rem;padding:0.625rem 1.25rem;border-radius:0.625rem;border:0;background:#14b8a6;color:#042f2e;font-weight:700;cursor:pointer}</style></head><body><main><h1>BTC — BE THE CHANGE</h1><p>You are currently offline. Your saved workspace notes, flashcards, tasks and chat sessions are stored locally and fully accessible.</p><button onclick='location.reload()'>Retry connection</button></main></body></html>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
