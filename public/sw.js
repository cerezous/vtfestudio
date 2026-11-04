// Mata un service worker viejo registrado en localhost:3000 por otra app.
// Esta aplicación no usa service workers. El script responde 200 para que
// Chrome pueda actualizar el registro y, al activarse, se desinstala.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
    })(),
  );
});
