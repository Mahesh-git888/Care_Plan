import { HeartIcon, StethoscopeIcon } from "@/components/ui-icons";

// A faithful, accessible recreation of the handwritten thank-you note that
// Dr. Kavitha and the Portea team received from a real family. We render this
// as styled markup (not an image) so it scales perfectly across devices and
// stays SEO-friendly.

export function HandwrittenNote() {
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
        <p className="script-title mt-2 text-3xl sm:text-4xl">Doctor Kavitha</p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-[#5a4a2a]">
          and entire team
        </p>
      </figcaption>

      <blockquote className="mt-6 space-y-4 text-center text-[0.95rem] leading-7 text-[#4d3a1f]">
        <p>With deepest respect and heartfelt gratitude.</p>
        <p className="font-semibold text-[#3a2c14]">
          I don&apos;t have words to express my gratitude to you.
        </p>
        <p>
          You have been a constant source of guidance and support over the past few
          months and you did your utmost to make mummy&apos;s last days so
          comfortable.
        </p>
        <p className="font-semibold text-[#3a2c14]">
          Thank you from the bottom of my heart.
        </p>
        <p className="handwritten text-base text-[#234a8a]">
          You cared for her like family, and we will always be thankful.
        </p>
      </blockquote>

      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6c3c]">
        With gratitude, respect and prayers for you all.
      </p>

      <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#8a6c3c]/80">
        Hand-written note received by Portea
      </p>
    </figure>
  );
}
