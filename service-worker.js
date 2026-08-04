const CACHE='valhalla-v0.6.1';
const ASSETS=['./','./index.html','./manifest.json','./assets/css/styles.css','./assets/images/logo-vikingos.png','./assets/js/data.js','./assets/js/finance.js','./assets/js/app.js','./docs/VISION.md','./docs/ROADMAP.md','./docs/BACKLOG.md','./docs/ARCHITECTURE.md','./docs/DATABASE.md','./docs/CODING_RULES.md','./docs/AI.md','./docs/CHANGELOG.md'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
