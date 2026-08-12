// Clean line icons for the nursing landing page. Stroke-based, inherit color
// via currentColor, sized by the caller with a className. Deliberately simple
// so they read as a real product, not AI-generated art.

type P = { className?: string };

const base = (className?: string) => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
});

export const ShieldCheck = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const GradCap = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 5l9 4-9 4-9-4 9-4z" />
    <path d="M7 11v4c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4" />
  </svg>
);

export const Refresh = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M20 11a8 8 0 0 0-14-4.5L4 8" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14 4.5L20 16" />
    <path d="M20 20v-4h-4" />
  </svg>
);

export const Clipboard = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <path d="M9 4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v.5H9V4z" />
    <path d="M9 11h6M9 15h4" />
  </svg>
);

export const UserSearch = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M4 20c0-3.3 2.7-6 6-6 1.2 0 2.3.35 3.2.95" />
    <circle cx="17" cy="16" r="2.5" />
    <path d="M19 18l2 2" />
  </svg>
);

export const BookOff = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5V5.5z" />
    <path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19" />
    <path d="M4 4l16 16" />
  </svg>
);

export const CalendarX = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 9h16M8 3v4M16 3v4" />
    <path d="M10 14l4 4M14 14l-4 4" />
  </svg>
);

export const EyeOff = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c5 0 9 5 9 6a12 12 0 0 1-2.2 2.7" />
    <path d="M6.3 7.9C4 9.3 3 11.4 3 12c0 1 4 6 9 6 1.2 0 2.3-.3 3.3-.7" />
    <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
  </svg>
);

export const HandHeart = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 13l3-1 4 2.5a2 2 0 0 1-2 3L4 16" />
    <path d="M8 17l6 2 6-2.5c1-.5.6-2-1-2h-4" />
    <path d="M14.5 4.6a2.2 2.2 0 0 0-2.5-.4c-1-.7-2.2-.4-2.8.6-.5.9-.2 1.9.6 2.6L12 10l2.2-2c.9-.8 1.1-1.9.3-2.9a2 2 0 0 0-.1-.5z" />
  </svg>
);

export const Syringe = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M17 3l4 4M18.5 5.5L13 11M6 18l-2 2M8.5 13.5l4 4" />
    <path d="M13 11l-8 8H3v-2l8-8 2 2z" />
    <path d="M14.5 7.5l2 2" />
  </svg>
);

export const Activity = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 12h4l2.5-6 4 12L16 12h5" />
  </svg>
);

export const Brain = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M9 4a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 0 5 11c0 1 .5 1.8 1.3 2.3A2.6 2.6 0 0 0 9 18c.8 0 1.3-.3 1.5-.6V4.6C10.3 4.2 9.8 4 9 4z" />
    <path d="M15 4a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 19 11c0 1-.5 1.8-1.3 2.3A2.6 2.6 0 0 1 15 18c-.8 0-1.3-.3-1.5-.6V4.6C13.7 4.2 14.2 4 15 4z" />
  </svg>
);

export const HeartPulse = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-.4 1-1 2-1.8 2.9" />
    <path d="M8 12h2l1.5-3 2 5 1.5-2h4" />
  </svg>
);

export const HomeIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 11l8-6 8 6" />
    <path d="M6 10v9h12v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

export const Lungs = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 4v9" />
    <path d="M12 8c-.5 1.5-2 2-3 2.5C7 11.5 6 13 6 16a3 3 0 0 0 4 2.8c.7-.3 1-.9 1-1.8v-6c0-1.5-.5-2-1-3z" />
    <path d="M12 8c.5 1.5 2 2 3 2.5 2 1 3 2.5 3 5.5a3 3 0 0 1-4 2.8c-.7-.3-1-.9-1-1.8v-6c0-1.5.5-2 1-3z" />
  </svg>
);

export const HelpCircle = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 3.5-1.8c1.5.7 1.4 2.6 0 3.3-.9.5-1.5 1-1.5 2" />
    <path d="M12 17.5h.01" />
  </svg>
);

export const CheckMini = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M5 12l4.5 4.5L19 7" />
  </svg>
);
