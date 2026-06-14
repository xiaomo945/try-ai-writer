// Service Worker for Try AI Writer
// Provides offline support and caching strategies

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const OFFLINE_CACHE = `offline-${CACHE_VERSION}`;

// Assets to pre-cache
const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo.png",
];

// Install event - pre-cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Pre-caching static assets");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log("[SW] Pre-caching complete");
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error("[SW] Pre-caching failed:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old version caches
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== OFFLINE_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Activated");
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Strategy 1: Static assets (cache-first)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy 2: API calls (network-first)
  if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Strategy 3: Pages (network-first with offline fallback)
  if (isPageRequest(request)) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Strategy 4: Images (cache-first with network fallback)
  if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Default: network only
  event.respondWith(fetch(request));
});

// Helper functions

function isStaticAsset(url) {
  return (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.startsWith("/_next/static/")
  );
}

function isAPIRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isPageRequest(request) {
  return request.mode === "navigate";
}

function isImageRequest(request) {
  return request.destination === "image";
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log("[SW] Serving from cache:", request.url);
      return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("[SW] Cache-first failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Network-first with offline fallback
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Network failed, showing offline page");
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page
    const offlinePage = await caches.match("/offline.html");
    if (offlinePage) {
      return offlinePage;
    }

    return new Response("Offline", { status: 503 });
  }
}

// Background sync (optional feature)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    console.log("[SW] Syncing data...");
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement your sync logic here
  console.log("[SW] Background sync completed");
}

// Push notifications (optional feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log("[SW] Push received:", data);

    event.waitUntil(
      self.registration.showNotification(data.title || "Try AI Writer", {
        body: data.body || "New update available",
        icon: "/logo.png",
        badge: "/badge.png",
        vibrate: [100, 50, 100],
        data: {
          url: data.url || "/",
        },
      })
    );
  }
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(event.notification.data.url || "/");
    })
  );
});

console.log("[SW] Service Worker loaded");
