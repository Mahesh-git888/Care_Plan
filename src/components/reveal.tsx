"use client";

// Subtle on-scroll entrance. The children are server-rendered and always in the
// DOM, so search engines and AI crawlers read them regardless of the animation.
// Falls back to visible when IntersectionObserver is missing, and the page's
// <noscript> block forces everything visible when JS is off.

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // @ts-expect-error dynamic tag with ref union is fine at runtime
    <Tag ref={ref} className={`reveal ${shown ? "reveal-in" : ""} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
