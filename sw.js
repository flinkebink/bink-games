const CACHE_NAME = "bink-games-v1";
const BASE = new URL("./", self.registration.scope);
const APP_FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "games/backrooms-brawl/",
  "games/backrooms-brawl/preview.png",
  "games/backrooms-brawl/js/Game.js",
  "games/backrooms-brawl/js/Human.js",
  "games/backrooms-brawl/js/Input.js",
  "games/backrooms-brawl/js/Particle.js",
  "games/backrooms-brawl/js/Player.js",
  "games/backrooms-brawl/js/Renderer.js",
  "games/backrooms-brawl/js/World.js",
  "games/flappy-clucker/",
  "games/flappy-clucker/preview.png",
  "games/headfirst/",
  "games/headfirst/preview.png",
  "games/headfirst/js/Enemy.js",
  "games/headfirst/js/GameLoop.js",
  "games/headfirst/js/Particle.js",
  "games/headfirst/js/Projectile.js",
  "games/headfirst/js/main.js",
  "games/polyfall/",
  "games/polyfall/preview.png",
  "games/polyfall/js/Board.js",
  "games/polyfall/js/Constants.js",
  "games/polyfall/js/Game.js",
  "games/polyfall/js/InputController.js",
  "games/polyfall/js/Particle.js",
  "games/polyfall/js/Piece.js",
  "games/polyfall/js/PieceBag.js",
  "games/polyfall/js/Renderer.js",
  "games/polyfall/js/main.js"
].map(path => new URL(path, BASE).href);

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("bink-games-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(BASE.href)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(request);
        return cached || caches.match(new URL("index.html", BASE).href);
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      if (fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch {
      return Response.error();
    }
  })());
});
