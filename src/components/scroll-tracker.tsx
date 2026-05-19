"use client";

import { useEffect } from "react";

import { pushDataLayer } from "@/lib/gtm";

// Fires the `scroll_90` event once when the visitor has scrolled past 90%
// of the document height. Useful as an engagement signal in GA4.

export function ScrollTracker() {
  useEffect(() => {
    let fired = false;

    function onScroll() {
      if (fired) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total <= 0) return;
      if (scrolled / total >= 0.9) {
        fired = true;
        pushDataLayer("scroll_90", { scroll_depth: 90 });
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
