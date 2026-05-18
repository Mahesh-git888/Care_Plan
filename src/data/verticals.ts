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
  testimonials: Testimonial[];
  faqs: FaqItem[];
  theme: PageTheme;
  whatsAppMessage: string;
};

const sharedFaqs: FaqItem[] = [
  {
    question: "How quickly will someone get back to us?",
    answer:
      "If the family needs help soon, a Portea care manager usually calls within 4 hours. If you are planning ahead, the callback is usually within 24 hours. The chatbot intake helps us prepare for that first conversation so you don't have to repeat the story.",
  },
  {
    question: "Will we have one person guiding us through the process?",
    answer:
      "A single care manager (an MBBS doctor or a senior clinical professional) owns the family relationship end-to-end: discovery call, care plan, caregiver oversight, weekly updates, escalations. You won't be bouncing between agents.",
  },
  {
    question: "How are caregivers selected and trained?",
    answer:
      "Caregivers are matched to the elder's routine, condition, language and home, and read the full care plan before they walk in on day one. For dementia placements we run them through a mandatory 80-point scoring sheet co-designed with the Dementia India Alliance first.",
  },
  {
    question: "How do we know what's happening at home?",
    answer:
      "You'll be added to a private WhatsApp group with your care manager. You'll receive structured care updates twice a week (daily for the first week of dementia or post-surgery cases) plus a weekly call from the care manager. The caregiver doesn't run the family conversation. The CM does.",
  },
  {
    question: "What does this cost?",
    answer:
      "Costs depend on the care plan: caregiver hours, nurse visits, equipment, physiotherapy and so on. Your care manager will share an itemised weekly price after the discovery call. There are no signup fees and no contracts. You can stop care any week.",
  },
  {
    question: "Is Portea available in our city?",
    answer:
      "Portea operates in 40+ Indian cities including Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur and Chandigarh. If we don't directly cover your pin code, the care manager will tell you on the first call.",
  },
];

const sharedTrustBadges: TrustBadge[] = [
  {
    title: "Designed by Portea doctors",
    description:
      "Clinical protocols co-authored by Dr. Kavitha (17+ yrs) and Dr. Allia (11 yrs). Every care plan reviewed by a CM before it reaches the family.",
  },
  {
    title: "One care manager per family",
    description:
      "An MBBS doctor or senior clinical lead handles your discovery call, the plan and the weekly updates. The same person, week after week.",
  },
  {
    title: "Updates twice a week on WhatsApp",
    description:
      "Specific notes on meals, meds, mood and what changed. Plus a weekly call with the CM and a monthly plan review.",
  },
  {
    title: "10 lakh+ patients across 40+ cities",
    description:
      "India's largest organised home healthcare provider, with 7 lakh+ home visits a year and 63 hospital partnerships.",
  },
];

const elderCareTrustBadges: TrustBadge[] = sharedTrustBadges;

const dementiaTrustBadges: TrustBadge[] = [
  {
    title: "Trained by the Dementia India Alliance",
    description:
      "Caregivers go through specialist dementia training and a mandatory pre-placement scoring sheet before they ever set foot in your home.",
  },
  {
    title: "Designed by Portea doctors",
    description:
      "Dementia protocols co-owned by Dr. Allia (Clinical Head, South) and Dr. Kavitha. Every plan reviewed before it reaches the family.",
  },
  {
    title: "Daily updates in week one",
    description:
      "New dementia placements get a daily WhatsApp update for the first seven days (patterns, triggers, what helped). After that it eases to twice a week.",
  },
  {
    title: "One care manager per family",
    description:
      "A doctor or senior clinical lead who actually knows your parent's case. Same person from day one onward.",
  },
];

const postDischargeTrustBadges: TrustBadge[] = [
  {
    title: "Care plan ready before discharge day",
    description:
      "Tell us the discharge date and we'll have a plan, equipment and team scheduled before the patient is home.",
  },
  {
    title: "Designed by Portea doctors",
    description:
      "Post-discharge protocols authored by Dr. Kavitha. Each plan reviewed by a CM before going to the family.",
  },
  {
    title: "Nurse, physio and caregiver under one plan",
    description:
      "No juggling three vendors. One care manager schedules every visit and keeps the family in one WhatsApp loop.",
  },
  {
    title: "Daily updates for the first 7 days",
    description:
      "Week one is the highest-risk stretch. You get a daily WhatsApp summary, then it eases to twice a week.",
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
    headline: "Doctor-designed elder care that comes home to your parents",
    accentPhrase: "comes home",
    subheadline:
      "One doctor-led care manager. A caregiver matched to your parent's routine and language. Twice-a-week WhatsApp updates that say what actually happened: meals, meds, mood, what changed.",
    heroLabel: "Managed elder care",
    overview:
      "For families who need help with the everyday: walking, bathing, meals, the medication tray, the small things that have started to slip. The plan is shaped around your parent's actual routine and your home's actual layout.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "Share a few details and a Portea care manager will call within 4 hours. No call-centre, no scripts. A doctor or senior clinician will speak with you directly.",
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
      "One doctor-led care manager per family",
      "Caregivers matched to routine, language & mobility",
      "Structured WhatsApp updates 2× a week",
      "Cancel any week, no lock-in",
    ],
    highlights: [
      {
        title: "Help with everyday routines",
        description:
          "Support across movement, bathing, meals, companionship, medication reminders and the parts of the day that quietly become harder over time.",
      },
      {
        title: "One care manager. Not a call centre.",
        description:
          "An MBBS doctor or senior clinical professional owns your family's relationship end-to-end, from the first call to weekly updates.",
      },
      {
        title: "A better fit at home",
        description:
          "Caregiver matching takes language, schedule, mobility needs, gender preference and home dynamics into account before care starts.",
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
          "Use the chatbot, WhatsApp or a phone call. Share your name, the elder's condition, city and what would help most.",
      },
      {
        title: "2. Discovery call with a care manager",
        description:
          "Within 4 hours, an MBBS doctor or senior clinician calls you. The 15–30 min call covers routine, mobility, medications and home dynamics.",
      },
      {
        title: "3. Personalised care plan and pricing",
        description:
          "You receive a written care plan on WhatsApp the same day, daily schedule, care team, equipment and itemised weekly price.",
      },
      {
        title: "4. Caregiver placed & continuous updates",
        description:
          "A trained caregiver is matched and placed. You get structured updates twice a week, a weekly CM call, and a monthly plan review.",
      },
    ],
    whatToExpect: [
      {
        title: "A 15–30 minute first call",
        description:
          "You do not need to have everything figured out before reaching out. We start with what is happening right now and what feels most difficult.",
      },
      {
        title: "Practical next steps",
        description:
          "Families come away knowing what support makes sense now, how quickly it can start, and exactly what Day 1 will look like.",
      },
      {
        title: "Less chasing, more clarity",
        description:
          "One WhatsApp group, one CM, twice-a-week updates, useful when siblings in three time zones are all trying to keep track.",
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
    testimonials: [
      {
        quote:
          "We live in the US and could not be there every day. Portea's care manager became our eyes and ears at home in Bangalore. The weekly updates and the care plan made everything easier.",
        author: "Anita R.",
        context: "Daughter of an 82-year-old in Bangalore",
      },
      {
        quote:
          "What I appreciated most was that one doctor was responsible for my mother's care. No bouncing around between agents. We trusted her, and she stayed with us through every change.",
        author: "Suresh M.",
        context: "Son of a 76-year-old in Mumbai",
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
      "Specialist dementia care at home. Caregivers trained by the Dementia India Alliance, an 80-point scoring sheet before placement, daily WhatsApp updates in week one, one MBBS care manager throughout.",
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
      "Caregivers trained on dementia behaviour, sundowning, repetition, resistance, matched through a mandatory scoring sheet. One MBBS care manager owns the plan and tells you what's working week by week.",
    heroLabel: "Specialist dementia care",
    overview:
      "For families dealing with confusion, repetition, wandering risk, agitation, sundowning or the emotional strain that often comes with dementia at home.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "Tell us what's been hardest in the past week. A Portea care manager (a doctor or senior clinician) will call within 4 hours, no scripts, no rush.",
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
      "Mandatory pre-placement scoring per case",
      "Doctor-reviewed care plan every month",
      "Daily updates for the first week of placement",
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
        "You need a caregiver who brings calm, not friction.",
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
          "Use the chatbot, WhatsApp or a phone call. Tell us what triggered the inquiry, wandering, agitation, refusal to eat, or exhaustion.",
      },
      {
        title: "2. Discovery call with a doctor-led care manager",
        description:
          "Within 4 hours, a clinician calls you. We cover routine breakdowns, behaviour patterns, safety risks and what would actually help at home.",
      },
      {
        title: "3. Dementia-specific care plan",
        description:
          "Daily schedule built around the elder's triggers and communication style. Caregiver match using our pre-placement scoring sheet.",
      },
      {
        title: "4. Daily updates in the first week",
        description:
          "Daily WhatsApp updates for the first seven days, then 2× a week. Weekly care manager call and a monthly clinical review.",
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
        title: "Photos and specifics, not generic updates",
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
    testimonials: [
      {
        quote:
          "You have been a constant source of guidance and support over the past few months and you did your utmost to make mummy's last days so comfortable. You cared for her like family, and we will always be thankful. Your compassion made all the difference.",
        author: "Family of a dementia patient under Dr. Kavitha's care",
        context: "Hand-written note received by Portea",
      },
      {
        quote:
          "My father stopped recognising names but he recognised the Portea didi. That calmed everyone in the house. The care manager helped us understand his pattern instead of fighting it.",
        author: "Priya N.",
        context: "Daughter, Pune",
      },
    ],
    faqs: [
      ...sharedFaqs,
      {
        question: "Can this help if evenings are the hardest time of day?",
        answer:
          "The discovery call captures when confusion or agitation tends to rise. From there the plan and caregiver schedule are shaped around your home's specific pattern.",
      },
      {
        question: "Will the family still stay involved after care starts?",
        answer:
          "Absolutely. You are added to a WhatsApp group with your care manager. You stay closely informed and the plan adjusts as the real picture at home becomes clearer.",
      },
      {
        question: "Are caregivers really trained in dementia care?",
        answer:
          "Our caregivers receive specialised dementia training co-developed with the Dementia India Alliance, and every dementia placement uses a mandatory pre-placement scoring sheet to match the caregiver to the case.",
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
      "Nurse visits, home physio and a trained caregiver, scheduled before discharge day, run from one plan, with daily WhatsApp updates through week one. Equipment delivered before the patient is home.",
    heroLabel: "Recovery at home",
    overview:
      "For families who know discharge is only the beginning and want a safer, better-organised start to recovery, wound care, medication, mobility, follow-up coordination and home physiotherapy under one plan.",
    ctaLabel: "Talk to a care manager",
    responseNote:
      "If discharge is in the next 72 hours or the patient is already home, share the details now, a care manager will call within 4 hours.",
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
      "Daily updates for the first 7 days",
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
          "Share the discharge context, condition and city. The faster we get the basics, the faster we can prepare.",
      },
      {
        title: "2. Discovery call with a care manager",
        description:
          "A clinician calls you within 4 hours. We turn the discharge papers into practical next steps you can actually use at home.",
      },
      {
        title: "3. Plan, equipment & team in place by Day 1",
        description:
          "Care plan on WhatsApp same day. Caregiver, nurse visits and physiotherapy scheduled. Equipment delivered before the patient is home.",
      },
      {
        title: "4. Daily updates through the first week",
        description:
          "Daily WhatsApp updates for the first seven days, then twice a week. Weekly CM call. Plan adjusts as recovery progresses.",
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
        title: "“It felt like proper support, not discharge-day advice.”",
        description:
          "The real difference is the second week, when most home recovery setups go quiet, your CM is still on the line and the physio still shows up.",
      },
    ],
    testimonials: [
      {
        quote:
          "        quote:
          "My father came home after a hip surgery and we were terrified about the first week. Portea's nurse, physio and caregiver arrived like clockwork. Within four days he was walking with a walker.",
        author: "Ramesh K.",
        context: "Son, Hyderabad",
      },
      {
        quote:
          "The care manager called every single day in the first week. We always knew what was next. That was a different kind of healthcare experience.",
        author: "Latha S.",
        context: "Wife of a stroke patient, Chennai",
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
          "If pain, mobility, wound routines or daily support look different in real life, the plan is adjusted. That's exactly what the monthly review and weekly CM call are for.",
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
    value: "10L+",
    label: "patients served across India",
  },
  {
    value: "7L+",
    label: "annual home visits",
  },
  {
    value: "40+",
    label: "cities covered",
  },
  {
    value: "63",
    label: "hospital partnerships",
  },
];

export const homeTrustBadges: TrustBadge[] = sharedTrustBadges;
] = sharedTrustBadges;
