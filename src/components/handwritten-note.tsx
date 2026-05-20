import { HeartIcon, StethoscopeIcon } from "@/components/ui-icons";
import type { AppreciationNote } from "@/data/verticals";

// A styled, accessible recreation of a real appreciation note received by the
// Portea team. Rendered as markup (not an image) so it scales across devices
// and stays SEO-friendly. The content is supplied per vertical.

export function HandwrittenNote({ note }: { note: AppreciationNote }) {
  return (
    <figure className="note-card relative mx-auto w-full max-w-md rounded-[2rem] p-8 sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-3 -top-3 text-[#dcb87a] opacity-70 sm:-left-6 sm:-top-6"
      >
        <HeartIcon className="h-7 w-7" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -bottom-3 text-[#dcb87a] opacity-70 sm:-right-6 sm:-bottom-6"
      >
        <StethoscopeIcon className="h-7 w-7" />
      </div>

      <figcaption className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a6c3c]">
          To the wonderful
        </p>
        <p className="script-title mt-2 text-3xl sm:text-4xl">{note.scriptTitle}</p>
      </figcaption>

      <blockquote className="mt-6 space-y-4 text-center text-[0.95rem] leading-7 text-[#4d3a1f]">
        {note.body.map((paragraph, index) => (
          <p key={index} className={index === 0 ? "font-semibold text-[#3a2c14]" : undefined}>
            {paragraph}
          </p>
        ))}
        <p className="handwritten text-base text-[#234a8a]">{note.closing}</p>
      </blockquote>

      <p className="mt-6 text-center text-sm font-semibold text-[#3a2c14]">
        {note.signature}
      </p>

      <p className="mt-3 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#8a6c3c]/80">
        A real note received by Portea
      </p>
    </figure>
  );
}
