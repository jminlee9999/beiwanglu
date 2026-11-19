/* 拾光备忘 · 离线缓存 */
const CACHE_VERSION = "shiguang-memo-v1.1.1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  // 代码与样式优先取最新版本，图标等静态资源优先使用缓存。
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        fetch(request)
          .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
          })
          .catch(() => {});
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        if (request.destination === "image") {
          return caches.match("./icons/icon.svg");
        }
        throw error;
      }
    })
  );
});
