/* 口腔健康評価アプリ オフライン用 Service Worker */
/* アプリ本体(index.html)を更新したら、下の数字を1つ上げてください(例 v1→v2)。
   これで全端末が次回オンライン時に新しい版へ自動更新されます。 */
const CACHE = 'koku-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Googleスプレッドシート(GAS)への送信などアプリ外への通信はキャッシュしない
  if (url.origin !== self.location.origin) return;
  // アプリのファイルは「ネット優先・失敗時キャッシュ」=更新を取り込みつつオフラインでも動く
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
