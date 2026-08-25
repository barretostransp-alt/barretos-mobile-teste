// Service Worker — roda em segundo plano no navegador, independente da
// aba/app estar aberto. É essa a peça que recebe o push do sistema
// operacional e manda mostrar a notificação, mesmo com o celular
// bloqueado ou o app fechado.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var dados = {};
  try { dados = event.data ? event.data.json() : {}; } catch (e) {}

  var titulo = dados.title || "Barreto's";
  var opcoes = {
    body: dados.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: dados.url || 'mobile.html' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

// Ao clicar na notificação: se já tiver uma aba do app aberta, só foca
// nela (e navega pra tela do alerta); senão, abre uma nova.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var relativo = (event.notification.data && event.notification.data.url) || 'mobile.html';
  var urlAbsoluta = new URL(relativo, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      for (var i = 0; i < lista.length; i++) {
        var cliente = lista[i];
        if (cliente.url.indexOf('mobile.html') !== -1 && 'focus' in cliente) {
          return cliente.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlAbsoluta);
    })
  );
});
