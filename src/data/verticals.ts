export type VerticalSlug = "elder-care" | "dementia" | "post-discharge";

export type VerticalConfig = {
  slug: VerticalSlug;
  name: string;
  headline: string;
  subheadline: string;
  highlights: string[];
  ctaLabel: string;
  theme: {
    accent: string;
    accentStrong: string;
    accentSoft: string;
    surface: string;
    border: string;
    glow: string;
    background: string;
  };
};

export const verticals: Record<VerticalSlug, VerticalConfig> = {
  "elder-care": {
    slug: "elder-care",
    name: "Elder Care",
    headline: "Compassionate daily care for your loved one at home",
    subheadline:
      "Connect with a care coordinator to plan dependable, in-home support for routines, safety, hygiene, and companionship.",
    highlights: [
      "Daily living assistance tailored to home routines",
      "Caregivers matched to family preferences and schedules",
      "Fast follow-up from a local care coordinator",
    ],
    ctaLabel: "Start the care conversation",
    theme: {
      accent: "bg-teal-500",
      accentStrong: "bg-teal-600 hover:bg-teal-500",
      accentSoft: "bg-teal-50 text-teal-800",
      surface: "from-teal-100 via-white to-sky-100",
      border: "border-teal-200",
      glow: "shadow-teal-500/20",
      background: "from-teal-500/20 via-white to-sky-100",
    },
  },
  dementia: {
    slug: "dementia",
    name: "Dementia Care",
    headline: "Specialised dementia care by trained caregivers",
    subheadline:
      "Give your family structured, reassuring support with caregivers trained to handle memory loss, routines, and behavioral changes sensitively.",
    highlights: [
      "Caregivers prepared for memory care routines",
      "Support designed for comfort, calm, and dignity",
      "Practical help for families navigating changing needs",
    ],
    ctaLabel: "Talk to a dementia care guide",
    theme: {
      accent: "bg-amber-500",
      accentStrong: "bg-amber-500 hover:bg-amber-400",
      accentSoft: "bg-amber-50 text-amber-900",
      surface: "from-amber-100 via-white to-rose-100",
      border: "border-amber-200",
      glow: "shadow-amber-500/20",
      background: "from-amber-500/20 via-white to-rose-100",
    },
  },
  "post-discharge": {
    slug: "post-discharge",
    name: "Post-Discharge Care",
    headline: "Expert recovery support after hospital discharge",
    subheadline:
      "Plan a smoother recovery at home with guided support for mobility, medication routines, follow-up visits, and comfort after discharge.",
    highlights: [
      "Short-term recovery support for patients at home",
      "Help coordinating routines after hospital discharge",
      "Responsive intake for urgent recovery needs",
    ],
    ctaLabel: "Request recovery support",
    theme: {
      accent: "bg-sky-500",
      accentStrong: "bg-sky-600 hover:bg-sky-500",
      accentSoft: "bg-sky-50 text-sky-900",
      surface: "from-sky-100 via-white to-emerald-100",
      border: "border-sky-200",
      glow: "shadow-sky-500/20",
      background: "from-sky-500/20 via-white to-emerald-100",
    },
  },
};

export const verticalList = Object.values(verticals);
