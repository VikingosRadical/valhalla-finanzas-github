const CACHE='valhalla-v05';
const ASSETS=['./','./index.html','./manifest.json','./assets/css/styles.css','./assets/js/data.js','./assets/js/finance.js','./assets/js/app.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
