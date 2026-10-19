/* メンバー名簿：アイコン画像をこの端末に保存して、次からは通信せずに表示する（icons フォルダの画像だけが対象） */
var CACHE = "ns-icons-v1";
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== self.location.origin || url.pathname.indexOf("/icons/") < 0) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(req).then(function(hit){
      if(hit) return hit;   /* 保存済みなら通信しない（画像を差し替えるときはファイル名を変える運用） */
      return fetch(req).then(function(res){ if(res && res.ok) c.put(req, res.clone()); return res; });
    });
  }));
});
/* 名簿で使われなくなったアイコンは、端末の保存領域から消す */
self.addEventListener("message", function(e){
  var d = e.data; if(!d || d.type !== "icons" || !d.urls) return;
  var keep = {}; d.urls.forEach(function(u){ keep[u] = 1; });
  caches.open(CACHE).then(function(c){ return c.keys().then(function(ks){ ks.forEach(function(k){ if(!keep[k.url]) c.delete(k); }); }); });
});
