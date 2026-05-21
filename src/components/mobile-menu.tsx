"use client";

import { useEffect, useState } from "react";

import { MenuIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui-icons";

type NavLink = { href: string; label: string };

type Props = {
  links: NavLink[];
  phoneHref: string;
  phoneLabel: string;
  whatsappHref?: string;
};

export function MobileMenu({ links, phoneHref, phoneLabel, whatsappHref }: Props) {
  const [open, setOpen] = useState(false);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfe4e7] bg-white/90 text-[#10242b] shadow-sm transition hover:bg-white lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
                Menu
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary mobile">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-semibold text-[#10242b] transition hover:bg-[#f4f9fa]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="space-y-3 border-t border-slate-200 px-5 py-4">
              <a
                href={phoneHref}
                data-track="call"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#0f9aa8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b7c87]"
              >
                <PhoneIcon className="h-4 w-4" />
                Call {phoneLabel}
              </a>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1da851]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp us
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
