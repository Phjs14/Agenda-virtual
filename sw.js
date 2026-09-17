// Service worker da Agenda — deixa o app instalável e utilizável sem internet.
// Só cuida de carregar o "casco" do app (HTML/CSS/JS/ícones); os dados
// continuam vivendo no localStorage e, se estiver logado, no Supabase.

var CACHE_ESTATICO = "agenda-estatico-v1";
var CACHE_RUNTIME = "agenda-runtime-v1";

var PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./privacidade.html",
  "./termos.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function(evento){
  evento.waitUntil(
    caches.open(CACHE_ESTATICO)
      .then(function(cache){ return cache.addAll(PRECACHE); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(evento){
  evento.waitUntil(
    caches.keys().then(function(chaves){
      return Promise.all(
        chaves
          .filter(function(k){ return k!==CACHE_ESTATICO && k!==CACHE_RUNTIME; })
          .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(evento){
  var req = evento.request;
  if(req.method!=="GET") return;

  // navegação (abrir/recarregar o app): tenta a rede primeiro pra pegar
  // sempre a versão mais nova; se estiver offline, cai pro HTML salvo.
  if(req.mode==="navigate"){
    evento.respondWith(
      fetch(req).then(function(resp){
        var copia=resp.clone();
        caches.open(CACHE_ESTATICO).then(function(c){ c.put("./index.html",copia); });
        return resp;
      }).catch(function(){
        return caches.match("./index.html");
      })
    );
    return;
  }

  // outros arquivos (CSS/JS/fontes/ícones): usa o que já tem guardado e,
  // por trás, atualiza o cache pra próxima vez.
  evento.respondWith(
    caches.match(req).then(function(emCache){
      var buscar = fetch(req).then(function(resp){
        if(resp && (resp.ok || resp.type==="opaque")){
          var copia=resp.clone();
          caches.open(CACHE_RUNTIME).then(function(c){ c.put(req,copia); });
        }
        return resp;
      }).catch(function(){ return emCache; });
      return emCache || buscar;
    })
  );
});
