"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { readAttribution } from "@/lib/utm";

// Fires a lightweight beacon to /api/v1/track on each landing-page view so the
// marketing dashboard can show traffic. Skips admin pages and the post-submit
// thank-you page. Best-effort: a failed beacon never affects the visitor.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname === "/thank-you") return;

    const vertical =
      pathname === "/" ? "home" : pathname.replace(/^\/+/, "").split("/")[0];

    const payload = JSON.stringify({
      kind: "page_view",
      path: pathname,
      vertical,
      attribution: readAttribution(),
    });

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        const blob = new Blob([payload], { type: "application/json" });
        if (navigator.sendBeacon("/api/v1/track", blob)) return;
      }
      void fetch("/api/v1/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    } catch {
      /* best-effort; never block the page */
    }
  }, [pathname]);

  return null;
}
