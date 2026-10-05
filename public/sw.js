/* RJGC service worker — installable PWA with safe offline fallback.
 * Never caches auth, admin, member portal, or API responses.
 */
const VERSION = "rjgc-pwa-v1";
const PRECACHE = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/brand/logo.png",
];

const NEVER_CACHE_PATH =
  /^\/(api|admin|member|login|auth|design-system)(\/|$)/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PRECACHE && key !== RUNTIME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/videos/") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".webmanifest")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;
  if (NEVER_CACHE_PATH.test(url.pathname)) return;

  // Navigations: network first, offline offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok) {
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match("/offline");
          return offline || Response.error();
        }),
    );
    return;
  }

  // Immutable / media assets: cache first.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response.ok) return response;
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          return response;
        });
      }),
    );
  }
});
