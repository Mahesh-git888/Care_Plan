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

export type Testimonial = {
  quote: string;
  author: string;
  context: string;
};

// The big handwritten-style appreciation note shown at the top of the
// testimonials section, one per vertical.
export type AppreciationNote = {
  scriptTitle: string; // the large cursive recipient line
  body: string[]; // paragraphs
  closing: string; // the emphasised handwritten line
  signature: string; // who wrote it
};

export type TrustBadge = {
  title: string;
  description: string;
};

export type VerticalConfig = {
  slug: VerticalSlug;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
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
  trustBadges: TrustBadge[];
  forWho: AudienceGroup;
  notForWho: AudienceGroup;
  howItWorks: ProcessStep[];
  whatToExpect: ProcessStep[];
  familyVoices: OutcomeCard[];
  appreciationNote: AppreciationNote;
  testimonials: Testimonial[];
  faqs: FaqItem[];
  theme: PageTheme;
  whatsAppMessage: string;
};

const sharedFaqs: FaqItem[] = [
  {
    question: "How soon will someone call us back?",
    answer:
      "If care is needed soon, a care manager usually calls within 12 hours. If you are planning ahead, expect a call within 24 hours. The chatbot gathers a few quick details so the first call gets straight to your situation.",
  },
  {
    question: "Will we have one person guiding us through this?",
    answer:
      "Your care manager is a doctor or senior clinician who handles your first call, your written plan, the caregiver on the ground, the weekly updates and any escalations. The same person stays with your family throughout.",
  },
  {
    question: "How are caregivers chosen and trained?",
    answer:
      "Every caregiver is matched to your parent's routine, condition, language and home. They read the full care plan before day one. For dementia, each caregiver also clears a specialist readiness check co-designed with the Dementia India Alliance.",
  },
  {
    question: "How will we know what is happening at home?",
    answer:
      "You are added to a private WhatsApp group with your care manager. You receive clear updates twice a week, plus a weekly call. The caregiver delivers the care; your care manager is who you talk to.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Pricing depends on what you actually need: caregiver hours, nurse visits, physiotherapy, equipment. After the first call, your care manager shares a written, itemised weekly price. No sign-up fee. No contract. You can stop care any week.",
  },
  {
    question: "Is Portea available in our city?",
    answer:
      "We operate in 40+ Indian cities including Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur and Chandigarh. If we do not cover your pin code directly, your care manager will say so honestly on the first call.",
  },
];

const sharedTrustBadges: TrustBadge[] = [
  {
    title: "A plan written by doctors",
    description:
      "Dr. Kavitha and Dr. Allia co-authored Portea's care protocols, and review your care plan before it's shared with you.",
  },
  {
    title: "One care manager throughout",
    description:
      "A qualified doctor or senior clinician handles your first call, builds your plan and sends your weekly updates. You'll deal with the same person each time.",
  },
  {
    title: "WhatsApp updates twice a week",
    description:
      "Specific notes on meals, medicines, mood and what changed at home, with a weekly call from your care manager and a full plan review every month.",
  },
];

const elderCareTrustBadges: TrustBadge[] = sharedTrustBadges;

const dementiaTrustBadges: TrustBadge[] = [
  {
    title: "Trained by the Dementia India Alliance",
    description:
      "Caregivers go through specialist dementia training and a readiness check before they step into your home.",
  },
  {
    title: "A plan written by doctors",
    description:
      "Dr. Kavitha and Dr. Allia co-authored Portea's care protocols, and review your care plan before it's shared with you.",
  },
  {
    title: "WhatsApp updates twice a week",
    description:
      "Twice-a-week WhatsApp updates on what's working: triggers, what helped, what changed. Plus a weekly call from your care manager.",
  },
  {
    title: "One care manager. The same person.",
    description:
      "A doctor or senior clinician who actually knows your parent's case. The same person from day one.",
  },
];

const postDischargeTrustBadges: TrustBadge[] = [
  {
    title: "Plan ready before discharge day",
    description:
      "Share the discharge date. We have the plan, the equipment and the team scheduled before you bring the patient home.",
  },
  {
    title: "A plan written by doctors",
    description:
      "Dr. Kavitha and Dr. Allia co-authored Portea's care protocols, and review your care plan before it's shared with you.",
  },
  {
    title: "Nurse, physio and caregiver in one plan",
    description:
      "No juggling three vendors. Your care manager schedules every visit and keeps the family in one WhatsApp group.",
  },
  {
    title: "WhatsApp updates twice a week",
    description:
      "Clear WhatsApp updates twice a week on recovery, medicines and mobility, with a weekly call from your care manager.",
  },
];

export const verticals: Record<VerticalSlug, VerticalConfig> = {
  "elder-care": {
    slug: "elder-care",
    name: "Elder Care",
    shortName: "Elder care",
    metaTitle: "Elder Care at Home in India · Doctor-Designed | Portea",
    metaDescription:
      "Portea Elder Care: a trained caregiver at home, one MBBS care manager who knows your parent's case, twice-a-week WhatsApp updates. Mobility, hygiene, meals, medications. 40+ cities.",
    keywords: [
      "elder care at home",
      "home caregiver for parents",
      "senior care India",
      "nursing attendant at home",
      "home care for elderly",
      "geriatric care",
    ],
    headline: "Doctor-designed elder care that comes home",
    accentPhrase: "comes home",
    subheadline:
      "One doctor-led care manager. A caregiver matched to your parent's routine and language. Twice-a-week WhatsApp updates that say what actually happened: meals, meds, mood, what changed.",
    heroLabel: "Managed elder care",
    overview:
      "For families who need help with the everyday: walking, bathing, meals, the medication tray, the small things that have started to slip. The plan is shaped around your parent's actual routine and your home's actual layout.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "Share a few details and a Portea care manager will call within 12 hours. No call-centre, no scripts. A doctor or senior clinician will speak with you directly.",
    whatsAppMessage:
      "Hi Portea, I'd like to learn about elder care at home for my parent.",
    images: [
      {
        src: "/elder-care-1.webp",
        alt: "Portea caregiver supporting an older woman in a wheelchair at home.",
        aspect: "16 / 11",
        position: "center center",
      },
      {
        src: "/elder-care-2.png",
        alt: "Portea caregiver helping an elderly woman walk safely through her home.",
        aspect: "4 / 5",
        position: "center center",
      },
    ],
    quickFacts: [
      "One medically trained care manager per family",
      "Caregivers matched to routine, language & mobility",
      "WhatsApp updates to family 2× a week",
      "Doctor home visits, as needed",
    ],
    highlights: [
      {
        title: "Help with the everyday",
        description:
          "Support with movement, bathing, meals, companionship and the medication tray. The parts of the day that have started to feel harder than they used to.",
      },
      {
        title: "One care manager, every step",
        description:
          "An MBBS doctor or senior clinician handles your family from the first call to the weekly update. The same person, every week.",
      },
      {
        title: "A better fit at home",
        description:
          "Caregiver matching takes language, schedule, mobility, gender preference and home dynamics into account before care begins.",
      },
    ],
    trustSignals: elderCareTrustBadges.map((badge) => badge.title),
    trustBadges: elderCareTrustBadges,
    forWho: {
      title: "Right for families who need day-to-day support at home",
      intro:
        "Most helpful when someone at home needs consistent help and the family wants confidence around how care is being run.",
      items: [
        "An older adult needs help with walking, transfers, bathing, meals or medication routine.",
        "A son, daughter or spouse is carrying too much of the coordination alone.",
        "The family is in a different city and needs a trusted local team plus weekly updates.",
        "You want one doctor-led care manager instead of figuring out every step yourself.",
      ],
    },
    notForWho: {
      title: "When another option may be better",
      intro:
        "Sometimes the need is either much lighter or much more urgent than a managed elder-care setup.",
      items: [
        "You only need a one-time service (single nurse visit, lab draw, equipment rental).",
        "It's an emergency that needs immediate hospital or ambulance care, call 108 first.",
        "You're only gathering general information and aren't ready to discuss your situation yet.",
      ],
    },
    howItWorks: [
      {
        title: "1. Tell us what's happening at home",
        description:
          "Use the chatbot, WhatsApp or call us. Share your name, your parent's condition, your city and what would help the most.",
      },
      {
        title: "2. A doctor calls you back in 12 hours",
        description:
          "A qualified doctor or senior clinician spends 15-30 minutes with you. Routine, mobility, medicines, the layout of the home, the people in it.",
      },
      {
        title: "3. A written plan, same day",
        description:
          "A clear care plan on WhatsApp: the daily schedule, who will be in your home, equipment if needed, and an itemised weekly price.",
      },
      {
        title: "4. Care starts. So do the updates.",
        description:
          "A trained caregiver arrives. WhatsApp updates twice a week, a weekly call with your care manager, a monthly plan review.",
      },
    ],
    whatToExpect: [
      {
        title: "A 15-30 minute first call",
        description:
          "You don't need everything figured out before reaching out. We start with what's happening right now and what feels hardest.",
      },
      {
        title: "Clear next steps",
        description:
          "You walk away knowing what support makes sense, how quickly it can start, and exactly what Day 1 looks like.",
      },
      {
        title: "Less chasing, more clarity",
        description:
          "One WhatsApp group, one care manager, updates twice a week. Useful when siblings in different time zones are all trying to stay in the loop.",
      },
    ],
    familyVoices: [
      {
        title: "“It felt like someone finally took charge with us.”",
        description:
          "You stop having to retell the medication list, the diagnosis and the family backstory every time you want something done.",
      },
      {
        title: "“The updates made a real difference.”",
        description:
          "In the first week, families want proof the routine is actually running: meds at 8am, walk at 5pm, dinner cleared by 8. Photos in the update help.",
      },
      {
        title: "“Home started feeling manageable again.”",
        description:
          "Good support often shows up as small but meaningful relief: fewer last-minute worries, clearer routines, more confidence at home.",
      },
    ],
    appreciationNote: {
      scriptTitle: "Doctor Kavitha",
      body: [
        "Thank you for the strong, loyal and sensitive support given to us by the entire Portea team.",
        "All along, from the doctors to the care manager to the caregivers and everyone working behind the scenes, you made sure my mother and our family were supported throughout.",
        "We were never made to feel like it was a commercial transaction.",
      ],
      closing: "It was truly an extension of family. We are truly grateful.",
      signature: "Ananya R.",
    },
    testimonials: [
      {
        quote:
          "My husband and I are both advancing in age, and a worry can come up late in the evening. I've called Portea after 6:30 pm, and once as an emergency at 9 pm. The care manager answered immediately and gave us a clear solution each time. Knowing the team is always there to respond gives us a genuine sense of security and peace of mind.",
        author: "Meenakshi R.",
        context: "Elderly couple, Bangalore",
      },
      {
        quote:
          "My 88-year-old father was diagnosed with advanced cancer and chose palliative care at home. Portea arranged a round-the-clock qualified nurse, set up the comfort equipment he needed within a day, and Dr Kavitha was available on call throughout. The care was timely, complete and deeply compassionate. They made his final days as comfortable as we could have hoped.",
        author: "Karthik S.",
        context: "Son, palliative care at home",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can the plan change after care begins?",
        answer:
          "The care manager reviews the plan monthly and adjusts whenever something changes: caregiver hours, physiotherapy frequency, nutrition, equipment.",
      },
      {
        question: "What if the caregiver match does not feel right?",
        answer:
          "If the fit is off, replacement is initiated within 48 hours. The system auto-generates a handover summary so the new caregiver arrives prepared, no repeating the medication list.",
      },
    ],
    theme: {
      accent: "bg-[#0f9aa8]",
      accentStrong: "bg-[#0f9aa8] hover:bg-[#0b7c87]",
      accentSoft: "bg-[#e8f6f7]",
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
    metaTitle: "Dementia Care at Home in India · Trained by Dementia Alliance | Portea",
    metaDescription:
      "Specialist dementia care at home. Caregivers trained by the Dementia India Alliance, a specialist readiness check before placement, WhatsApp updates twice a week, one medically trained care manager throughout.",
    keywords: [
      "dementia care at home",
      "Alzheimer's home care India",
      "memory care India",
      "dementia caregiver",
      "Dementia India Alliance",
      "senior dementia support",
    ],
    headline: "Specialist dementia care at home, trained by Dementia India Alliance",
    accentPhrase: "Dementia India Alliance",
    subheadline:
      "A dementia-trained care manager who's worked with others like you. Caregivers trained on dementia behaviour: sundowning, repetition, resistance. Weekly updates on how it's going.",
    heroLabel: "Specialist dementia care",
    overview:
      "For families dealing with confusion, repetition, wandering risk, agitation, sundowning or the emotional strain that often comes with dementia at home.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "Tell us what's been hardest in the past week. A Portea care manager (a doctor or senior clinician) will call within 12 hours.",
    whatsAppMessage:
      "Hi Portea, I'd like to learn about dementia care at home for my parent.",
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
      "Caregivers trained on dementia-specific routines",
      "Specialist readiness check before every placement",
      "Doctor-reviewed care plan every month",
      "WhatsApp updates to family 2× a week",
    ],
    highlights: [
      {
        title: "A schedule built around the rough hours",
        description:
          "The day is built around reducing confusion and friction so the elder ends it more settled than they started it. The schedule serves the person ahead of the checklist.",
      },
      {
        title: "Caregivers who understand the condition",
        description:
          "Trained on dementia behaviour, reassurance, redirection, patience during sundowning, repetition and resistance.",
      },
      {
        title: "Support for the family too",
        description:
          "Spouses and adult children carrying the load get a doctor-led care manager who shares the planning and the calls. The caregiver in the home is one piece of that.",
      },
    ],
    trustSignals: dementiaTrustBadges.map((badge) => badge.title),
    trustBadges: dementiaTrustBadges,
    forWho: {
      title: "Right when memory changes are affecting daily life",
      intro:
        "Families come to us when confusion, repetition, mood shifts or resistance start to take over the rhythm of the home.",
      items: [
        "Confusion, repetition, disorientation or sundowning is escalating at home.",
        "A spouse or child is emotionally drained and needs steadier help.",
        "Wandering, falls, or refusing meals/medication has started becoming a real risk.",
        "You want a caregiver who brings calm into the room.",
      ],
    },
    notForWho: {
      title: "When another option may be better",
      intro:
        "Some situations need a different level of urgency or a narrower kind of service.",
      items: [
        "You only need a one-time nursing procedure rather than ongoing dementia support.",
        "The elder is in an acute medical crisis and needs emergency care.",
        "There is no diagnosis yet, start with a geriatrician consult; we can help you find one.",
      ],
    },
    howItWorks: [
      {
        title: "1. Share what feels hardest right now",
        description:
          "Use the chatbot, WhatsApp or call us. Tell us what made you reach out: wandering, agitation, refusing to eat, or just sheer exhaustion.",
      },
      {
        title: "2. A doctor calls back in 12 hours",
        description:
          "A doctor or senior clinician spends time with you on the phone. Routine breakdowns, behaviour patterns, safety risks, what would actually help at home.",
      },
      {
        title: "3. A plan built for dementia",
        description:
          "A daily schedule shaped around your parent's triggers and the way they communicate. The caregiver is chosen using a specialist readiness check.",
      },
      {
        title: "4. WhatsApp updates twice a week",
        description:
          "WhatsApp updates twice a week on triggers and what's helping, with a weekly call from your care manager and a monthly review.",
      },
    ],
    whatToExpect: [
      {
        title: "A more understanding approach",
        description:
          "Patience and dignity in the moments that are hardest. The plan accounts for the hours that tend to be most difficult at your home.",
      },
      {
        title: "Family conversations that actually help",
        description:
          "We focus on what really triggers distress, what helps and what to expect through the day.",
      },
      {
        title: "Photos and specifics in every update",
        description:
          "Caregiver photos during meals, walks or exercises. NRI families especially value seeing care actually happen.",
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
          "Structured updates help families see triggers, what helps, and what to do next, instead of guessing.",
      },
      {
        title: "“The home started feeling less tense.”",
        description:
          "Progress often looks practical: fewer disruptions, smoother evenings, and more confidence for everyone involved.",
      },
    ],
    appreciationNote: {
      scriptTitle: "The Portea Team",
      body: [
        "Rahul has been with my father since mid-December, and he has cared for him really well.",
        "He handles every difficult situation that dementia brings, day after day, and the medical team kept cross-checking the care throughout.",
        "Having Rahul there has given me genuine peace of mind about my father's daily routine.",
      ],
      closing: "I truly hope his dedication is recognised within Portea.",
      signature: "Vivek K.",
    },
    testimonials: [
      {
        quote:
          "Both my parents are in the early stages of dementia. Portea's team built a plan focused on dementia therapy and brought a therapist home for cognitive stimulation. Within a couple of weeks we saw a real improvement in their cognition and a slowing of the progression. They even began writing down how they feel, something they had never done before.",
        author: "Rohan M.",
        context: "Son, parents in early-stage dementia, Bangalore",
      },
      {
        quote:
          "After each therapy session we feel happier and more relaxed. We had no idea what the sessions would be like at first. Now we look forward to the therapist coming, and her warmth makes the whole day better.",
        author: "An elder in Portea's dementia therapy programme",
        context: "Dementia therapy at home, Bangalore",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can this help if evenings are the hardest time of day?",
        answer:
          "The first call captures when confusion or agitation tends to rise. The schedule and the caregiver's shift are shaped around that pattern at your home.",
      },
      {
        question: "Will the family still stay involved after care starts?",
        answer:
          "You are added to a WhatsApp group with your care manager from day one. The family stays closely informed and the plan adjusts as the picture at home becomes clearer.",
      },
      {
        question: "Are caregivers really trained in dementia care?",
        answer:
          "Our caregivers go through specialist dementia training developed with the Dementia India Alliance. Every dementia caregiver also clears a specialist readiness check before being matched to a family.",
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
    metaTitle: "Post-Hospital Recovery Care at Home in India | Portea",
    metaDescription:
      "Structured recovery support after surgery, stroke or hospitalisation. Nursing, physiotherapy, mobility and medication management, coordinated by one doctor-led care manager in 40+ Indian cities.",
    keywords: [
      "post hospital discharge care",
      "post surgery home care",
      "stroke recovery at home",
      "nurse at home",
      "home physiotherapy",
      "recovery care India",
    ],
    headline: "Safer recovery at home after hospital discharge",
    accentPhrase: "after hospital discharge",
    subheadline:
      "A care manager who has guided families through recoveries like yours. Nurse visits, home physio and a trained caregiver, ready before discharge day. Weekly updates on how recovery is going.",
    heroLabel: "Recovery at home",
    overview:
      "For families who know discharge is only the beginning and want a safer, better-organised start to recovery, wound care, medication, mobility, follow-up coordination and home physiotherapy under one plan.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "If discharge is in the next 72 hours or the patient is already home, share the details now, a care manager will call within 12 hours.",
    whatsAppMessage:
      "Hi Portea, I need post-hospital recovery care at home for a family member.",
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
      "Care plan ready before discharge day",
      "Nurse + caregiver + physio under one plan",
      "Equipment delivered on Day 1",
      "WhatsApp updates to family 2× a week",
    ],
    highlights: [
      {
        title: "A smoother move from hospital to home",
        description:
          "Care is shaped around what often becomes difficult after discharge, wound routines, medications, mobility, follow-ups.",
      },
      {
        title: "More confidence in the first week",
        description:
          "Families get a clearer picture of what to do first, what to watch for, and who to call when something doesn't look right.",
      },
      {
        title: "Better support for the family too",
        description:
          "Recovery doesn't only affect the patient. The care manager coordinates appointments, medication, equipment and questions.",
      },
    ],
    trustSignals: postDischargeTrustBadges.map((badge) => badge.title),
    trustBadges: postDischargeTrustBadges,
    forWho: {
      title: "Right when recovery at home needs more structure",
      intro:
        "Families often reach out when the discharge date is near, the patient is already home, or it's clear that recovery still needs active support.",
      items: [
        "A patient is coming home after surgery, illness or hospitalisation and needs help settling safely.",
        "You're worried about mobility, medications, fatigue, wound care or missed follow-ups.",
        "There's a short but urgent window to make the first week at home feel more organised.",
        "You want one team coordinating nurse, physio, caregiver and equipment.",
      ],
    },
    notForWho: {
      title: "When another option may be better",
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
          "Share the discharge date, the procedure and your city. The earlier we hear, the more we can have ready before the patient comes home.",
      },
      {
        title: "2. A doctor calls back in 12 hours",
        description:
          "A doctor turns the discharge papers into practical next steps and a written plan you can use the same day.",
      },
      {
        title: "3. Plan and team ready by Day 1",
        description:
          "The full plan on WhatsApp the same day. Caregiver, nurse visits and physio scheduled. Equipment delivered before the patient walks in.",
      },
      {
        title: "4. WhatsApp updates twice a week",
        description:
          "WhatsApp updates twice a week on recovery progress, with a weekly call from your care manager. The plan adjusts as recovery progresses.",
      },
    ],
    whatToExpect: [
      {
        title: "A clearer first-week plan",
        description:
          "Day-by-day clarity on what's happening at home, meals, medication, mobility, dressings, follow-ups.",
      },
      {
        title: "Less uncertainty at home",
        description:
          "Instead of relying only on discharge papers and memory, the family follows a real support rhythm with one team accountable.",
      },
      {
        title: "A joined-up experience",
        description:
          "Recovery feels handed-over instead of dumped, the team that planned it is the team running week one.",
      },
    ],
    familyVoices: [
      {
        title: "“The first week stopped feeling like guesswork.”",
        description:
          "Most families exhale on day three. That's when the schedule, the medication tray and the physio cadence start to look like a coordinated plan.",
      },
      {
        title: "“We knew what to watch and who to call.”",
        description:
          "Confidence usually comes from simple things: clearer priorities, better follow-through, one team staying accountable.",
      },
      {
        title: "“It felt like proper support all the way through.”",
        description:
          "The real difference shows up in week two. Most home setups go quiet by then. Your care manager is still on the line and the physio still shows up.",
      },
    ],
    appreciationNote: {
      scriptTitle: "The Portea Team",
      body: [
        "After my mother suffered a brain stroke, she came home on a Ryles feeding tube and a Foley catheter, needing round-the-clock monitoring.",
        "We were skeptical that home care could match a rehab centre. Within a month the feeding tube was removed; after five months, the catheter was no longer needed.",
        "Nurse Rani Lucky stayed with my mother for over seven months and cared for her as if she were her own.",
      ],
      closing: "My mother has now fully recovered. Thank you, the entire Portea team.",
      signature: "Arjun B.",
    },
    testimonials: [
      {
        quote:
          "My mother needed home care after her operation, and our whole family is profusely thankful to Portea. The caregiver supported her recovery for more than five months, and she has now recovered fully. Thank you from the bottom of my heart, a big salute to the Portea team.",
        author: "Deepak J.",
        context: "Son, post-operative home care",
      },
      {
        quote:
          "My father is recovering from a stroke that left him half-paralysed. Portea's nursing and physiotherapy support has been wonderful. The professionals are amicable, patient and genuinely understand what he needs. We were considering a rehab centre, but after seeing the care and the quick response at home, we chose to continue.",
        author: "Nikhil A.",
        context: "Son of a stroke patient",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Is this mainly for the first recovery phase, or longer-term too?",
        answer:
          "It's especially useful in the first recovery phase, but the plan can continue or evolve into managed elder care if recovery uncovers longer-term needs.",
      },
      {
        question: "Can the support change if recovery feels harder at home?",
        answer:
          "If pain, mobility, wound care or daily support look different at home than on paper, the plan is adjusted. The weekly call and monthly review exist for exactly this.",
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

export type StatItem = {
  value: string;
  label: string;
  icon: "users" | "home" | "mapPin" | "hospital";
};

export const homeStats: StatItem[] = [
  {
    value: "10L+",
    label: "patients served across India",
    icon: "users",
  },
  {
    value: "7L+",
    label: "annual home visits",
    icon: "home",
  },
  {
    value: "40+",
    label: "cities covered",
    icon: "mapPin",
  },
  {
    value: "63",
    label: "hospital partnerships",
    icon: "hospital",
  },
];

export const homeTrustBadges: TrustBadge[] = sharedTrustBadges;
