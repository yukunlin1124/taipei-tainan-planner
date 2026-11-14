// Offline support: keep a copy of the planner on the phone.
// CACHE and SHELL are written by scripts/build_site.py; do not edit them by hand.
const CACHE = "planner-47abeb81f2";
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        // Also keep web fonts once they have been downloaded.
        if (res.ok && /fonts\.(googleapis|gstatic)\.com/.test(req.url)) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
