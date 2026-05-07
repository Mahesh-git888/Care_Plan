export type VerticalSlug = "elder-care" | "dementia" | "post-discharge";

export type PageTheme = {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentText: string;
  border: string;
  surface: string;
  background: string;
  tint: string;
};

export type Highlight = {
  title: string;
  description: string;
};

export type AudienceGroup = {
  title: string;
  intro: string;
  items: string[];
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type OutcomeCard = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type VerticalConfig = {
  slug: VerticalSlug;
  name: string;
  shortName: string;
  headline: string;
  accentPhrase: string;
  subheadline: string;
  heroLabel: string;
  overview: string;
  ctaLabel: string;
  responseNote: string;
  image: {
    src: string;
    alt: string;
  };
  imageAspect: string;
  imagePosition: string;
  imageSlotLabel: string;
  quickFacts: string[];
  highlights: Highlight[];
  trustSignals: string[];
  forWho: AudienceGroup;
  notForWho: AudienceGroup;
  howItWorks: ProcessStep[];
  whatToExpect: ProcessStep[];
  familyVoices: OutcomeCard[];
  faqs: FaqItem[];
  theme: PageTheme;
};

const sharedFaqs: FaqItem[] = [
  {
    question: "How quickly will someone call after we submit the form?",
    answer:
      "For an active family inquiry, the goal is to call back within 4 hours. For a planning inquiry, the goal is within 24 hours.",
  },
  {
    question: "Will one person coordinate the family through the journey?",
    answer:
      "Yes. A care manager is intended to be the family's single point of contact for triage, care planning, caregiver coordination, updates, and escalation.",
  },
  {
    question: "What details will you ask for before the first call?",
    answer:
      "We begin with the basic picture: the elder's name, phone number, city, the care situation, and which kind of support is needed most right now.",
  },
];

export const verticals: Record<VerticalSlug, VerticalConfig> = {
  "elder-care": {
    slug: "elder-care",
    name: "Elder Care",
    shortName: "Elder care",
    headline: "Daily elder care at home, with one team guiding every step.",
    accentPhrase: "with one team guiding every step.",
    subheadline:
      "A dedicated care manager, trained caregivers, dependable routines, and updates that help the whole family feel more in control from the very first week.",
    heroLabel: "Managed elder care",
    overview:
      "For families who want dependable day-to-day support and a care manager who can keep everyone aligned from the very first call.",
    ctaLabel: "Talk to a care manager",
    responseNote: "A care manager will usually call back within 4 hours for active inquiries.",
    image: {
      src: "/elder-care-home.webp",
      alt: "A Portea caregiver supporting an older woman at home.",
    },
    imageAspect: "5 / 4",
    imagePosition: "center 58%",
    imageSlotLabel: "Reserved for another elder-care image or a family moment.",
    quickFacts: [
      "Single care manager for the family",
      "Day 1 caregiver briefing and placement check",
      "Twice-weekly updates once care stabilises",
    ],
    highlights: [
      {
        title: "Doctor-guided care planning",
        description:
          "Care pathways are designed to feel practical at home while still giving families clinical confidence.",
      },
      {
        title: "Caregiver matching around real life",
        description:
          "Language, shift preference, mobility needs, and household rhythm are considered before placement.",
      },
      {
        title: "Updates that reduce chasing",
        description:
          "Families should not have to coordinate five people to know what is happening at home.",
      },
    ],
    trustSignals: [
      "Home-care planning shaped around safety, comfort, and continuity",
      "Family communication routed through one care manager instead of fragmented follow-ups",
      "Escalation paths for routine, urgent, and emergency situations",
      "Useful for both local families and children coordinating care from another city",
    ],
    forWho: {
      title: "Who this is for",
      intro: "This fits best when the need is steady, daily, and home-based.",
      items: [
        "An older adult needs help with routines, walking, transfers, hygiene, or meals.",
        "The family wants a single care manager instead of coordinating care on their own.",
        "Children in another city need reliable updates and visibility into what is happening at home.",
      ],
    },
    notForWho: {
      title: "Who this may not be for",
      intro: "This is not the best fit when the requirement is much narrower.",
      items: [
        "You only need a one-time standalone service rather than an ongoing managed care relationship.",
        "The situation is an emergency that needs immediate hospital or ambulance support.",
        "The family is only exploring information and is not yet ready for a guided care conversation.",
      ],
    },
    howItWorks: [
      {
        title: "1. Tell us what is happening",
        description:
          "Share the basics through the chatbot so a care manager can understand the urgency, city, and the kind of daily support being considered.",
      },
      {
        title: "2. Discovery call and triage",
        description:
          "The first call focuses on the elder's routine, family context, mobility, goals, and any risks that could affect care at home.",
      },
      {
        title: "3. Care plan and caregiver match",
        description:
          "The family receives a recommended plan, next steps, and a caregiver match based on skills, schedule, and household needs.",
      },
      {
        title: "4. Day 1 check and ongoing updates",
        description:
          "After placement, the care manager checks the start, follows up, and keeps the family informed as care settles into a rhythm.",
      },
    ],
    whatToExpect: [
      {
        title: "A warmer first conversation",
        description:
          "The early call is not only about services. It is about what is hard right now, what the family has already tried, and what would make home feel safer.",
      },
      {
        title: "Concrete recommendations",
        description:
          "Families should understand what support is essential now, what is recommended, and what the first week will actually look like.",
      },
      {
        title: "Clear family communication",
        description:
          "The care manager remains the coordination layer so the family is not left managing delivery, caregiver queries, and status updates separately.",
      },
    ],
    familyVoices: [
      {
        title: "\"We finally stopped coordinating everything ourselves.\"",
        description:
          "Families often value having one person who knows the case, answers questions, and follows through instead of repeating the same story again and again.",
      },
      {
        title: "\"The first-week updates helped us relax.\"",
        description:
          "What matters most early on is not just the caregiver arriving, but the family feeling sure the routine is actually being followed.",
      },
      {
        title: "\"It felt more personal than a service booking.\"",
        description:
          "The experience works better when care planning acknowledges the home's pace, relationships, and preferences, not only the checklist.",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can the plan change after the first week?",
        answer:
          "Yes. If the elder settles differently than expected, the care manager can revise the plan based on what the family and caregiver observe.",
      },
      {
        question: "What if the caregiver match is not working?",
        answer:
          "If the fit is poor or a replacement is needed unexpectedly, the replacement process is initiated and the family is updated on timing and interim coverage.",
      },
    ],
    theme: {
      accent: "bg-[#0f8f86]",
      accentStrong: "bg-[#0f8f86] hover:bg-[#0c7b73]",
      accentSoft: "bg-[#dff5f2]",
      accentText: "text-[#0b5c56]",
      border: "border-[#b8e4df]",
      surface: "from-[#f6fffd] via-white to-[#eef9f8]",
      background: "from-[#f1fbfa] via-[#fbfdfd] to-[#eef7f7]",
      tint: "rgba(15,143,134,0.12)",
    },
  },
  dementia: {
    slug: "dementia",
    name: "Dementia Care",
    shortName: "Dementia care",
    headline: "Dementia care at home, by a team that understands the condition.",
    accentPhrase: "by a team that understands the condition.",
    subheadline:
      "A dedicated care manager, dementia-aware caregiver, calmer routines, safety cues, and family support designed for the realities of memory loss at home.",
    heroLabel: "Dementia care",
    overview:
      "For families navigating confusion, repetition, wandering risk, resistance, or the need for more predictable calm at home.",
    ctaLabel: "Talk to a care manager",
    responseNote: "A care manager will usually call back within 4 hours for active inquiries.",
    image: {
      src: "/dementia-care-home.png",
      alt: "A Portea caregiver helping an older woman walk through her home.",
    },
    imageAspect: "4 / 3",
    imagePosition: "center center",
    imageSlotLabel: "Reserved for a second dementia-care image or family moment.",
    quickFacts: [
      "Care routines built around calm and predictability",
      "Matching that considers behaviour triggers and home dynamics",
      "Family updates shaped for nearby and NRI caregivers",
    ],
    highlights: [
      {
        title: "Routine-led support",
        description:
          "Predictable rhythms, familiar cues, and a calmer approach help reduce friction for both the elder and the family.",
      },
      {
        title: "Behaviour-aware caregiving",
        description:
          "Caregiving is shaped around redirection, reassurance, and safety rather than confrontation or rushed handling.",
      },
      {
        title: "Support for the family too",
        description:
          "The emotional load on spouses and children is acknowledged, not treated like a side note in the care conversation.",
      },
    ],
    trustSignals: [
      "Dementia-aware routines adapted for the home, not a generic attendant flow",
      "One care manager for questions, plan changes, and escalation",
      "Structured matching to reduce avoidable caregiver-family friction",
      "Useful for repetition, confusion, resistance, wandering risk, or sundowning patterns",
    ],
    forWho: {
      title: "Who this is for",
      intro: "This is most useful when memory loss is starting to shape daily life at home.",
      items: [
        "The elder needs support with repetition, disorientation, mood shifts, or resistance to routine.",
        "A spouse or child is carrying too much emotional and practical burden alone.",
        "The family needs a caregiver who can bring steadiness instead of increasing agitation.",
      ],
    },
    notForWho: {
      title: "Who this may not be for",
      intro: "Some situations need a narrower or more urgent care path.",
      items: [
        "The need is only for a single nursing procedure rather than ongoing dementia-aware home support.",
        "The elder is in an acute medical crisis that needs immediate emergency care.",
        "The family wants only a broad information handout without a personalised triage conversation.",
      ],
    },
    howItWorks: [
      {
        title: "1. Share the current picture",
        description:
          "We begin with the elder's city, the care situation, and what is currently most difficult for the family day to day.",
      },
      {
        title: "2. Condition-specific triage",
        description:
          "The first call explores routine breakdowns, behaviour changes, safety concerns, family support, and what the household is trying to solve.",
      },
      {
        title: "3. Match and prepare",
        description:
          "The caregiver brief and match are shaped around likely triggers, communication style, schedule, and the family's preferences.",
      },
      {
        title: "4. Keep the loop tight",
        description:
          "The early updates matter even more here, because trust depends on whether the elder seems calmer, safer, and better understood.",
      },
    ],
    whatToExpect: [
      {
        title: "A calmer home setup",
        description:
          "The goal is not only to cover tasks but to reduce confusion and avoid avoidable stress around daily routines.",
      },
      {
        title: "More practical conversations",
        description:
          "The discussion usually centres on what triggers agitation, what helps, and how the family can recognise early warning signs.",
      },
      {
        title: "Visible family reassurance",
        description:
          "Families often need proof that care is happening with patience and dignity, especially when they cannot be there all day themselves.",
      },
    ],
    familyVoices: [
      {
        title: "\"We needed someone who would not escalate every difficult moment.\"",
        description:
          "What families often care about most is whether the caregiver can stay steady when repetition, confusion, or refusal show up.",
      },
      {
        title: "\"The updates helped us understand the pattern, not just the event.\"",
        description:
          "Useful care feels specific: when restlessness happens, what helped, and what the family should expect next.",
      },
      {
        title: "\"The home felt calmer once the routine became more predictable.\"",
        description:
          "Progress in dementia care often looks less dramatic and more practical: fewer abrupt disruptions, less guesswork, and more confidence at home.",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can this help if the elder becomes restless or resistive in the evening?",
        answer:
          "Yes. The first call and the care plan should surface patterns such as evening confusion or routine resistance so the support approach is not generic.",
      },
      {
        question: "Do families still get involved after the caregiver starts?",
        answer:
          "Absolutely. The care manager remains in the loop, shares updates, and adjusts the plan with the family as real-world behaviour becomes clearer.",
      },
    ],
    theme: {
      accent: "bg-[#15726d]",
      accentStrong: "bg-[#15726d] hover:bg-[#105c58]",
      accentSoft: "bg-[#e1f3f1]",
      accentText: "text-[#114e4c]",
      border: "border-[#c4e5e1]",
      surface: "from-[#f8fffe] via-white to-[#eef8f5]",
      background: "from-[#eff8f6] via-[#fbfdfc] to-[#f2f7f4]",
      tint: "rgba(21,114,109,0.12)",
    },
  },
  "post-discharge": {
    slug: "post-discharge",
    name: "Post-Discharge Care",
    shortName: "Post-discharge care",
    headline: "Recovery at home, planned properly after hospital discharge.",
    accentPhrase: "planned properly after hospital discharge.",
    subheadline:
      "For the uncertain first days at home after surgery or hospitalisation, with care planning that covers routines, mobility, wound support, medication follow-through, and family reassurance.",
    heroLabel: "Recovery at home",
    overview:
      "For families who know discharge is not the end of care and want a guided transition from hospital to home.",
    ctaLabel: "Talk to a care manager",
    responseNote: "A care manager will usually call back within 4 hours for active recovery inquiries.",
    image: {
      src: "/post-discharge-home.webp",
      alt: "A Portea caregiver checking an older man's blood pressure at home.",
    },
    imageAspect: "4 / 3",
    imagePosition: "center 42%",
    imageSlotLabel: "Reserved for another recovery-at-home photograph.",
    quickFacts: [
      "Designed for the uncertain first week after discharge",
      "Built to align family, caregiver, and follow-up needs quickly",
      "Escalation support for medical concerns and practical disruptions",
    ],
    highlights: [
      {
        title: "Hospital-to-home continuity",
        description:
          "The transition is handled like a care handover, not just a booking, so the family knows what to watch for in the first week.",
      },
      {
        title: "Closer early follow-up",
        description:
          "This vertical is designed for tighter check-ins while routines, mobility, wound care, and medication patterns are still settling.",
      },
      {
        title: "Less discharge-day confusion",
        description:
          "Families get clarity on what support starts first, what the timeline looks like, and where to escalate if something changes.",
      },
    ],
    trustSignals: [
      "Structured support for the transition from hospital to home",
      "Care planning designed to reduce gaps in the first recovery week",
      "Care manager oversight for changes, setbacks, or service alignment",
      "Helpful when mobility, follow-up visits, or medication routines need more structure",
    ],
    forWho: {
      title: "Who this is for",
      intro: "This works best when the discharge may look simple on paper but demanding at home.",
      items: [
        "The patient is coming home after surgery, illness, or a hospital admission and needs guided recovery support.",
        "The family is worried about mobility, fatigue, medication routines, wound-care coordination, or missed follow-ups.",
        "There is a short-term but urgent need to make the first week at home feel safe and organised.",
      ],
    },
    notForWho: {
      title: "Who this may not be for",
      intro: "A different path may be better when the need is much lighter or much more acute.",
      items: [
        "You only need a simple one-time service without coordination across the week.",
        "The patient is unstable and should remain under emergency or in-hospital care.",
        "There is no immediate timeline for discharge or start of home recovery planning.",
      ],
    },
    howItWorks: [
      {
        title: "1. Tell us where recovery stands",
        description:
          "We start with the city, discharge context, and what the family is most anxious about once the patient gets home.",
      },
      {
        title: "2. Rapid care alignment",
        description:
          "The care manager helps convert the hospital discharge into a practical home plan with priorities, risks, and first-week expectations.",
      },
      {
        title: "3. Start with the right support",
        description:
          "The recommended plan can include caregiver assistance, nursing, mobility help, or other support depending on the recovery picture.",
      },
      {
        title: "4. Watch the first week closely",
        description:
          "The early days are where families usually need the most reassurance, so communication and plan adjustments matter more than usual.",
      },
    ],
    whatToExpect: [
      {
        title: "A practical first-week plan",
        description:
          "Families should leave the first conversation knowing what to do on day one, what is included, and what might need escalation.",
      },
      {
        title: "Less uncertainty at home",
        description:
          "Instead of trying to manage recovery through memory and discharge paperwork alone, the family gets a clearer support rhythm.",
      },
      {
        title: "Visible coordination",
        description:
          "The care experience should feel joined up across caregiver placement, updates, and any concerns that appear during recovery.",
      },
    ],
    familyVoices: [
      {
        title: "\"The first week stopped feeling like guesswork.\"",
        description:
          "Families often value having a clear structure once the patient is finally home and everyone realises recovery still needs active planning.",
      },
      {
        title: "\"We knew who to call when something changed.\"",
        description:
          "A smoother recovery usually depends on simple confidence: who owns the plan, who answers, and what happens next when concerns show up.",
      },
      {
        title: "\"It felt like a handover, not a drop-off.\"",
        description:
          "The best transition home feels continuous, with enough follow-through that discharge does not turn into family confusion.",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Is this mainly for long-term care or for the first recovery phase?",
        answer:
          "It is especially useful for the first recovery phase after discharge, though the plan can evolve if the family needs longer support.",
      },
      {
        question: "Can the plan include additional services if recovery becomes harder than expected?",
        answer:
          "Yes. The care manager can recommend adjustments when the patient's mobility, pain, fatigue, or care needs look different at home than they did on discharge day.",
      },
    ],
    theme: {
      accent: "bg-[#0c7b95]",
      accentStrong: "bg-[#0c7b95] hover:bg-[#09677d]",
      accentSoft: "bg-[#def2f7]",
      accentText: "text-[#0b5365]",
      border: "border-[#c1e3ec]",
      surface: "from-[#f7fdff] via-white to-[#eef8fb]",
      background: "from-[#eef8fc] via-[#fbfdfd] to-[#eef5f7]",
      tint: "rgba(12,123,149,0.12)",
    },
  },
};

export const verticalList = Object.values(verticals);

export const homeStats = [
  {
    value: "10,00,000+",
    label: "patients served successfully",
  },
  {
    value: "7,00,000+",
    label: "annual patient visits across India",
  },
  {
    value: "63",
    label: "hospital partnerships",
  },
  {
    value: "40+",
    label: "cities supported",
  },
];

export const homePrinciples = [
  {
    title: "Care starts with triage, not a generic form fill",
    description:
      "Each vertical is built to guide families into the right first conversation quickly, especially when urgency and uncertainty are high.",
  },
  {
    title: "One point of coordination changes the experience",
    description:
      "Families are more likely to trust care when one care manager stays accountable across planning, placement, updates, and escalation.",
  },
  {
    title: "Home care has to feel warm and operationally sound",
    description:
      "The experience should reassure emotionally while still making the logistics, updates, and next steps concrete.",
  },
];
