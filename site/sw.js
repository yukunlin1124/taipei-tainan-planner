// Offline support: keep a copy of the planner on the phone.
// CACHE and SHELL are written by scripts/build_site.py; do not edit them by hand.
const CACHE = "planner-c65be05386";
const SHELL = [
  "./",
  "./data.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.ico",
  "./index.html",
  "./manifest.webmanifest",
  "./matcher.js",
];

self.addEventListener("install", e => {
  // cache: "reload" skips the browser's HTTP cache, so a new version never saves old files.
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The planner's own files: network first (revalidated with the server), so opening or
// refreshing with internet always shows the newest version. Offline, or if the network takes
// longer than 3 s, the copy saved on the phone is used. Web fonts: saved copy first.
const NETWORK_WAIT_MS = 3000;

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    const fresh = (req.mode === "navigate" ? fetch(req.url, { cache: "no-cache" }) : fetch(req, { cache: "no-cache" }))
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./" : req, copy));
        }
        return res;
      });
    const saved = () => caches.match(req.mode === "navigate" ? "./" : req, { ignoreSearch: true });
    e.respondWith(new Promise(resolve => {
      let done = false;
      const finish = r => { if (!done && r) { done = true; resolve(r); } };
      fresh.then(finish, () => saved().then(hit => hit ? finish(hit) : finish(Response.error())));
      setTimeout(() => saved().then(finish), NETWORK_WAIT_MS);   // slow network: use the saved copy
    }));
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && /fonts\.(googleapis|gstatic)\.com/.test(req.url)) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
