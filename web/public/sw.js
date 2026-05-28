// Offline cache: last 50 viewed wines
const CACHE = "adega-v1";
const MAX = 50;

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (!url.pathname.startsWith("/wine/") && !url.pathname.startsWith("/api/wines/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(event.request);
        cache.put(event.request, res.clone());
        const keys = await cache.keys();
        if (keys.length > MAX) await cache.delete(keys[0]);
        return res;
      } catch {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        return new Response("Offline", { status: 503 });
      }
    })(),
  );
});
