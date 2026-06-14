"use client";

import { useEffect } from "react";

/**
 * Service Worker registration component
 * Registers the service worker for offline support and caching
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) {
      console.warn("[SW] Service workers not supported");
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[SW] Registered:", registration.scope);

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("[SW] New content available, refresh to update");
              } else {
                console.log("[SW] Content cached for offline use");
              }
            }
          });
        });
      } catch (error) {
        console.error("[SW] Registration failed:", error);
      }
    };

    // Register after page load to avoid blocking
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }

    return () => {
      window.removeEventListener("load", registerSW);
    };
  }, []);

  return null;
}
