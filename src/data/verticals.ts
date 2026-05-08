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

export type PageImage = {
  src: string;
  alt: string;
  aspect: string;
  position?: string;
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
  images: [PageImage, PageImage];
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
    question: "How quickly will someone get back to us?",
    answer:
      "If the family needs help soon, a care manager usually calls within 4 hours. If you are planning ahead, the callback is usually within 24 hours.",
  },
  {
    question: "Will we have one person guiding us through the process?",
    answer:
      "Yes. The aim is for one care manager to understand the family situation, help shape the plan, and stay connected as care begins.",
  },
  {
    question: "What will you ask before the first call?",
    answer:
      "We begin with the basics: your name, phone number, city, what is happening right now, and the kind of support you are exploring.",
  },
];

export const verticals: Record<VerticalSlug, VerticalConfig> = {
  "elder-care": {
    slug: "elder-care",
    name: "Elder Care",
    shortName: "Elder care",
    headline: "Compassionate daily care for your loved one at home",
    accentPhrase: "your loved one at home",
    subheadline:
      "When daily routines start feeling heavy for the family, we help bring in the right caregiver support, one care manager, and steadier follow-through at home.",
    heroLabel: "Managed elder care",
    overview:
      "For families looking for dependable everyday support with mobility, hygiene, meals, routine, and peace of mind at home.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "Share a few details now and a care manager can call you back with the right context already in hand.",
    images: [
      {
        src: "/elder-care-1.webp",
        alt: "A Portea caregiver supporting an older woman in a wheelchair at home.",
        aspect: "16 / 11",
        position: "center center",
      },
      {
        src: "/elder-care-2.png",
        alt: "A Portea caregiver helping an elderly woman walk safely through her home.",
        aspect: "4 / 5",
        position: "center center",
      },
    ],
    quickFacts: [
      "One care manager for the family",
      "Caregiver matching around routine and mobility",
      "Updates that keep everyone informed",
    ],
    highlights: [
      {
        title: "Help with everyday routines",
        description:
          "Support can cover movement, bathing, meals, companionship, and the little parts of the day that quietly become harder over time.",
      },
      {
        title: "A calmer experience for the family",
        description:
          "Instead of managing everything alone, families get one point of contact to help guide the next steps and keep everyone aligned.",
      },
      {
        title: "A better fit at home",
        description:
          "Caregiver matching takes language, schedule, mobility needs, and home dynamics into account before care starts.",
      },
    ],
    trustSignals: [
      "Backed by Portea's years of home healthcare experience",
      "Care manager oversight from the first call onward",
      "A good fit for local families and children coordinating from another city",
      "Built for care that feels steady at home, not improvised",
    ],
    forWho: {
      title: "This is usually right for families who need day-to-day support",
      intro:
        "It is most helpful when someone at home needs consistent assistance and the family wants more confidence around how care is being handled.",
      items: [
        "An older adult needs help with walking, transfers, bathing, meals, or daily routine.",
        "A son, daughter, or spouse is carrying too much of the coordination alone.",
        "The family wants one care manager instead of figuring out every step by themselves.",
      ],
    },
    notForWho: {
      title: "A different option may be better when",
      intro:
        "Sometimes the need is either much lighter or much more urgent than a managed elder-care setup.",
      items: [
        "You only need a one-time service instead of ongoing support at home.",
        "The situation is an emergency and needs immediate hospital or ambulance care.",
        "You are only gathering general information and are not ready to discuss the situation yet.",
      ],
    },
    howItWorks: [
      {
        title: "1. Tell us what is happening at home",
        description:
          "Start with the basics so we understand the family situation, the city, and the kind of daily help being considered.",
      },
      {
        title: "2. Speak with a care manager",
        description:
          "The first conversation focuses on what has become difficult, what support is already in place, and what would make home feel safer and easier.",
      },
      {
        title: "3. Get a recommended care plan",
        description:
          "We help shape the right support and match based on routine, skills needed, timing, and home preferences.",
      },
      {
        title: "4. Settle into care with regular updates",
        description:
          "Once care begins, the family stays in the loop instead of wondering how things are going day to day.",
      },
    ],
    whatToExpect: [
      {
        title: "A warm first conversation",
        description:
          "You do not need to have everything figured out before reaching out. We start with what is happening right now and what feels most difficult.",
      },
      {
        title: "Practical next steps",
        description:
          "Families should come away understanding what support makes sense now, how quickly it can start, and what the first days will look like.",
      },
      {
        title: "Less chasing, more clarity",
        description:
          "The experience should feel organised and reassuring, especially when multiple family members are trying to stay updated.",
      },
    ],
    familyVoices: [
      {
        title: "“It felt like someone finally took charge with us.”",
        description:
          "Families often feel relieved when they no longer have to repeat the same story to different people just to keep care moving.",
      },
      {
        title: "“The updates made a real difference.”",
        description:
          "What matters early on is not just that a caregiver arrives, but that the family feels sure the routine is actually being followed.",
      },
      {
        title: "“Home started feeling manageable again.”",
        description:
          "Good support often shows up as small but meaningful relief: fewer last-minute worries, clearer routines, and more confidence at home.",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can the plan change after care begins?",
        answer:
          "Yes. If the elder settles differently than expected, the care plan can be adjusted around what is actually working at home.",
      },
      {
        question: "What if the caregiver match does not feel right?",
        answer:
          "If the fit is off, the team works on the next step quickly and keeps the family informed about timelines and alternatives.",
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
    headline: "Specialised dementia care by trained caregivers",
    accentPhrase: "trained caregivers",
    subheadline:
      "When memory changes begin affecting routine, mood, or safety at home, we help families bring in care that feels calmer, steadier, and more understanding.",
    heroLabel: "Dementia care",
    overview:
      "For families dealing with confusion, repetition, wandering risk, resistance, or the emotional strain that often comes with dementia at home.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "Start with a short chat and we will help you decide the right next step without making the family explain everything twice.",
    images: [
      {
        src: "/dementia-1.webp",
        alt: "A caregiver gently reassuring an older woman resting in bed.",
        aspect: "16 / 11",
        position: "center center",
      },
      {
        src: "/dementia-2.png",
        alt: "A caregiver and an older man sharing a calm reading moment at home.",
        aspect: "16 / 11",
        position: "center center",
      },
    ],
    quickFacts: [
      "Care built around calm and predictability",
      "Support for both the elder and the family",
      "Updates that help families understand patterns",
    ],
    highlights: [
      {
        title: "A gentler daily rhythm",
        description:
          "The focus is not only on tasks, but on reducing confusion, avoiding unnecessary friction, and helping the elder feel more settled.",
      },
      {
        title: "Caregivers who understand the condition",
        description:
          "Approach matters. Families often need someone who can reassure, redirect, and stay patient when difficult moments happen.",
      },
      {
        title: "More reassurance for the family",
        description:
          "Spouses and children often need support too, especially when they are exhausted, worried, or trying to coordinate care from a distance.",
      },
    ],
    trustSignals: [
      "Care routines shaped for the realities of memory loss at home",
      "One care manager to guide the family and adjust the plan if needed",
      "Matching that considers behaviour, routine, and home dynamics",
      "Designed to bring more calm, dignity, and confidence into the home",
    ],
    forWho: {
      title: "This is usually right when memory changes are affecting daily life",
      intro:
        "Families often come to us when confusion, repetition, mood shifts, or resistance are starting to take over the rhythm of the home.",
      items: [
        "An elder needs support with confusion, repetition, disorientation, or changing moods.",
        "A spouse or child is feeling emotionally drained and needs steadier help at home.",
        "The family wants a caregiver who can bring calm instead of adding to the stress.",
      ],
    },
    notForWho: {
      title: "A different option may be better when",
      intro:
        "Some situations need a different level of urgency or a narrower kind of service.",
      items: [
        "The need is only for a one-time nursing procedure rather than ongoing dementia support.",
        "The elder is in an acute medical crisis and needs emergency care.",
        "The family only wants generic information and is not ready for a real care conversation.",
      ],
    },
    howItWorks: [
      {
        title: "1. Share what feels hardest right now",
        description:
          "Tell us about the current situation, the city, and what the family is struggling with most day to day.",
      },
      {
        title: "2. Speak with a care manager who understands the context",
        description:
          "The first call usually covers routine breakdowns, behaviour changes, safety concerns, and what kind of support would actually help at home.",
      },
      {
        title: "3. Get a plan shaped for the home",
        description:
          "Caregiver matching and planning take likely triggers, communication style, family preference, and home rhythm into account.",
      },
      {
        title: "4. Keep the home loop close",
        description:
          "Early updates matter because families want to know whether the elder seems calmer, safer, and better understood.",
      },
    ],
    whatToExpect: [
      {
        title: "A more understanding approach",
        description:
          "The goal is not just to get through a checklist, but to support the elder with patience and dignity in the moments that are hardest.",
      },
      {
        title: "More useful family conversations",
        description:
          "We focus on what is really happening at home, what tends to trigger distress, and what the family can expect from support.",
      },
      {
        title: "Visible reassurance",
        description:
          "Families often need to feel, not just assume, that care is being delivered with warmth and steadiness.",
      },
    ],
    familyVoices: [
      {
        title: "“We needed someone who would stay calm.”",
        description:
          "For many families, relief begins when difficult moments are handled with patience instead of urgency or confrontation.",
      },
      {
        title: "“We could finally understand the pattern.”",
        description:
          "Updates feel far more helpful when they explain what happened, what helped, and what may need attention next.",
      },
      {
        title: "“The home started feeling less tense.”",
        description:
          "Progress often looks practical: fewer disruptions, smoother routines, and more confidence for everyone involved.",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can this help if evenings are the hardest time of day?",
        answer:
          "Yes. During the first conversation, we try to understand when confusion or agitation tends to rise so the plan is not generic.",
      },
      {
        question: "Will the family still stay involved after care starts?",
        answer:
          "Absolutely. Families stay closely informed, and the plan can be adjusted as the real picture at home becomes clearer.",
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
    headline: "Expert recovery support after hospital discharge",
    accentPhrase: "after hospital discharge",
    subheadline:
      "The first few days at home can feel uncertain. We help families organise recovery with the right support, clearer routines, and one team keeping things on track.",
    heroLabel: "Recovery at home",
    overview:
      "For families who know discharge is only the beginning and want a safer, better-organised start to recovery at home.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "If discharge is close or the patient is already home, share the details now and we can help you move faster.",
    images: [
      {
        src: "/post-discharge-1.png",
        alt: "A caregiver helping an older man with recovery exercises beside a bed and walker.",
        aspect: "16 / 11",
        position: "center center",
      },
      {
        src: "/post-discharge-2.png",
        alt: "A healthcare professional supporting wound care after surgery at home.",
        aspect: "4 / 5",
        position: "center top",
      },
    ],
    quickFacts: [
      "Built for the first recovery phase at home",
      "Support around mobility, routines, and follow-through",
      "Clearer coordination when plans change",
    ],
    highlights: [
      {
        title: "A smoother move from hospital to home",
        description:
          "Support is shaped around what often becomes difficult after discharge: movement, wound routines, medicines, and practical follow-through.",
      },
      {
        title: "More confidence in the first week",
        description:
          "Families get a clearer picture of what to do first, what to watch, and who to turn to when recovery feels harder than expected.",
      },
      {
        title: "Better support for the family too",
        description:
          "Recovery does not only affect the patient. It often leaves the household juggling appointments, caregiving, and constant questions.",
      },
    ],
    trustSignals: [
      "Structured support for the transition from hospital to home",
      "Care planning shaped around the first recovery week",
      "One care manager to help the family stay coordinated",
      "Useful when discharge paperwork feels clear on paper but not in real life",
    ],
    forWho: {
      title: "This is usually right when recovery needs more structure at home",
      intro:
        "Families often reach out when the discharge date is near, the patient is already home, or everyone realises that recovery still needs active support.",
      items: [
        "A patient is coming home after surgery, illness, or hospitalisation and needs help settling safely.",
        "The family is worried about mobility, medicines, fatigue, wound care, or missed follow-ups.",
        "There is a short but urgent window to make the first week at home feel more organised.",
      ],
    },
    notForWho: {
      title: "A different option may be better when",
      intro:
        "Sometimes the need is either very simple or still too medically unstable for home recovery support.",
      items: [
        "You only need a very basic one-time service and no ongoing coordination.",
        "The patient is unstable and should remain under emergency or in-hospital care.",
        "There is no discharge plan or home-recovery timeline in place yet.",
      ],
    },
    howItWorks: [
      {
        title: "1. Tell us where recovery stands",
        description:
          "We begin with the discharge context, city, and what the family is most concerned about once the patient is home.",
      },
      {
        title: "2. Speak with a care manager quickly",
        description:
          "The first call turns the discharge situation into practical next steps the family can actually use at home.",
      },
      {
        title: "3. Start with the right support",
        description:
          "Depending on the recovery picture, support may involve a caregiver, nursing help, mobility support, or a more coordinated mix.",
      },
      {
        title: "4. Stay close through the early days",
        description:
          "The first week usually needs the most reassurance, so updates and adjustments matter even more than usual.",
      },
    ],
    whatToExpect: [
      {
        title: "A clearer first-week plan",
        description:
          "Families should know what happens on day one, what needs attention first, and what can wait until recovery settles.",
      },
      {
        title: "Less uncertainty at home",
        description:
          "Instead of relying only on discharge papers and memory, the family gets a more practical support rhythm.",
      },
      {
        title: "A more joined-up experience",
        description:
          "Care should feel like a proper handover into home recovery, not like the family has been left to figure everything out alone.",
      },
    ],
    familyVoices: [
      {
        title: "“The first week stopped feeling like guesswork.”",
        description:
          "Families often feel immediate relief when there is a clearer structure for what recovery at home should actually look like.",
      },
      {
        title: "“We knew what to watch and who to call.”",
        description:
          "Confidence usually comes from simple things: clearer priorities, better follow-through, and one team staying accountable.",
      },
      {
        title: "“It felt like proper support, not just discharge day advice.”",
        description:
          "The biggest difference is often that recovery continues to feel guided after the patient comes home.",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Is this mainly for the first recovery phase or for longer-term care too?",
        answer:
          "It is especially helpful in the first recovery phase, though the plan can continue or evolve if the family needs longer support.",
      },
      {
        question: "Can the support change if recovery feels more difficult at home?",
        answer:
          "Yes. If needs around pain, mobility, wound routines, or daily support look different at home, the plan can be adjusted accordingly.",
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
