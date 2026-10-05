"use client";

import { useEffect } from "react";

/**
 * Registers the site service worker in production builds.
 * Skipped on localhost to avoid sticky caches during development.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
    if (isLocal && process.env.NODE_ENV !== "production") return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;
        registration.update().catch(() => {
          /* ignore update probe failures */
        });
      } catch {
        /* Registration can fail on insecure origins; installability requires HTTPS. */
      }
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
