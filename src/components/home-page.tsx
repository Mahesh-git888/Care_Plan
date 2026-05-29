import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ChatbotTrigger } from "@/components/chatbot-trigger";
import { FloatingContactButtons } from "@/components/contact-actions";
import { DoctorsSection } from "@/components/doctors-section";
import { HandwrittenNote } from "@/components/handwritten-note";
import { IntakeChatbot } from "@/components/intake-chatbot";
import {
  AlertTriangleIcon,
  AppleIcon,
  ArrowUpRightIcon,
  BedIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  FlaskIcon,
  LayersIcon,
  LifeBuoyIcon,
  PhoneIcon,
  StethoscopeIcon,
  SyringeIcon,
  UsersIcon,
  WhatsAppIcon,
} from "@/components/ui-icons";
import { LeadForm } from "@/components/lead-form";
import { MobileMenu } from "@/components/mobile-menu";
import { StatsStrip } from "@/components/stats-strip";
import { verticalList } from "@/data/verticals";
import { getPhoneContact, getWhatsAppContact } from "@/lib/contact";

const HOME_NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#services", label: "Services" },
  { href: "#programs", label: "Programs" },
  { href: "#pricing", label: "Pricing" },
];

const PROBLEMS = [
  {
    Icon: PhoneIcon,
    title: "You're coordinating over phone calls",
    body: "Managing 4 to 5 providers (doctor, physio, pharmacy, domestic help, hospital) across WhatsApp messages and missed calls.",
  },
  {
    Icon: LayersIcon,
    title: "No one has the full picture",
    body: "The cardiologist doesn't know what the endocrinologist prescribed. The physio doesn't know about the fall last month.",
  },
  {
    Icon: ClockIcon,
    title: "You find out late",
    body: "Your parent fell two weeks ago and didn't tell you. The maid noticed a rash but didn't know who to call.",
  },
  {
    Icon: AlertTriangleIcon,
    title: "Emergencies are chaos",
    body: "No one knows the blood type, the medication list, or which hospital to go to at 2am.",
  },
];

const STEPS = [
  {
    title: "You tell us about your parent",
    body: "Fill a short form or call us. Share their health situation, location, and what support you're looking for.",
  },
  {
    title: "Your care manager visits the home",
    body: "A licensed clinician conducts a structured assessment: health, functional capacity, cognitive state, home safety.",
  },
  {
    title: "They build a care plan",
    body: "Based on the assessment, your care manager identifies exactly which services your parent needs and how often.",
  },
  {
    title: "Care begins at home",
    body: "Your care manager coordinates every provider, trains caregivers on your parent's needs, and sends you updates weekly.",
  },
];

const SERVICES = [
  {
    Icon: UsersIcon,
    title: "Caregiver",
    body: "Trained nursing attendant, 12h or 24h. Your care manager trains them on your parent's specific condition and routines.",
  },
  {
    Icon: SyringeIcon,
    title: "Nursing",
    body: "Wound care, vitals monitoring, injections, catheter management, infusions. Scheduled visits or on-call.",
  },
  {
    Icon: StethoscopeIcon,
    title: "Doctor visits",
    body: "Teleconsults or home visits. Geriatrician, GP, or specialist referrals based on your parent's conditions.",
  },
  {
    Icon: DumbbellIcon,
    title: "Physiotherapy",
    body: "At-home sessions for mobility, post-surgical rehab, chronic pain, fall prevention, and strength building.",
  },
  {
    Icon: FlaskIcon,
    title: "Labs and diagnostics",
    body: "Blood work, HbA1c, thyroid panels, cardiac markers. Collected at home, reports sent to your care manager and family.",
  },
  {
    Icon: BedIcon,
    title: "Equipment",
    body: "Hospital bed, wheelchair, oxygen concentrator, BP monitor, pulse oximeter. Rental or purchase, delivered and set up.",
  },
  {
    Icon: AppleIcon,
    title: "Nutrition",
    body: "Dietitian assessment and meal planning. Condition-specific guidance for diabetes, cardiac, renal, or post-surgical recovery.",
  },
  {
    Icon: LifeBuoyIcon,
    title: "Counselor",
    body: "For the patient and the family. Managing anxiety, depression, grief, caregiver burnout, and cognitive decline.",
  },
];

const FAQS = [
  {
    q: "What does the care manager actually do?",
    a: "Your care manager is a licensed clinician (a physiotherapist or nurse with geriatric training). They visit your parent's home, conduct a structured health and safety assessment, identify exactly which services are needed, build a personalized care plan, and then coordinate everything: scheduling providers, training caregivers on your parent's specific condition, and sending your family WhatsApp updates every week. If something changes, like a fall, a new diagnosis or a medication change, they adjust the care plan.",
  },
  {
    q: "What's included in the ₹1,999/month?",
    a: "The monthly fee covers your dedicated care manager: the home assessment, the personalized care plan, coordinating and scheduling every service, training your caregivers, and weekly WhatsApp updates to your family. Clinical services, caregivers, and equipment are recommended in your care plan and billed separately, so you only pay for what your parent actually needs.",
  },
  {
    q: "I live abroad. Can I manage my parent's care through this?",
    a: "Yes. Many of the families we support have children living abroad. Your care manager becomes your single point of contact, sends weekly written updates with photos, and is reachable on WhatsApp. You stay fully informed about your parent's care without needing to be in the same city or country.",
  },
  {
    q: "How is this different from hiring a caregiver directly?",
    a: "A caregiver carries out daily tasks. A care manager runs the whole picture: a clinician assesses your parent, decides which services are needed, sources and schedules them, trains the caregiver on your parent's specific condition, watches for changes, and keeps your family updated. If a caregiver needs replacing or your parent's needs change, your care manager handles it. You manage one relationship instead of five.",
  },
  {
    q: "Which cities are you in?",
    a: "Portea operates across 135+ cities in India. Tell us your parent's location when you reach out and we'll confirm availability for your area right away.",
  },
  {
    q: "Is there a lock-in or contract?",
    a: "No lock-in. Care management is month to month and clinical services follow your care plan. You can adjust, pause, or stop care at the end of any week. Your care manager walks you through everything before any cost is incurred.",
  },
];

export function HomePage() {
  const [elderCare, dementiaCare, postDischargeCare] = verticalList;
  const phone = getPhoneContact();
  const whatsapp = getWhatsAppContact(
    "Hi Portea, I'd like a free care assessment for my parent.",
  );

  // Specialized programs reuse the vertical images so the cards look like the
  // previous version's program cards.
  const specialized = [
    {
      name: "Dementia and memory care",
      body: "Structured cognitive support, trained attendants, family psychologist access, and safety planning for moderate-stage patients.",
      href: "/dementia",
      image: dementiaCare.images[0],
    },
    {
      name: "Post-surgical recovery",
      body: "Discharge coordination, physio and nursing at home, wound care, medication management, and return-to-function tracking.",
      href: "/post-discharge",
      image: postDischargeCare.images[0],
    },
    {
      name: "Daily elder care",
      body: "A dedicated care manager, trained caregivers, nursing, physiotherapy and nutrition for ageing parents, all under one plan.",
      href: "/elder-care",
      image: elderCare.images[0],
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f9fa] pb-20 text-[#10242b]">
      {/* Care assistant chatbot, opened by the assessment buttons */}
      <IntakeChatbot vertical={elderCare} />

      {/* Floating call / WhatsApp / chat, constant across scroll */}
      <FloatingContactButtons vertical={elderCare} />

      {/* Announcement bar */}
      <div className="gradient-banner text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2 text-xs font-semibold sm:px-6 lg:px-10">
          <p className="truncate">
            India&apos;s largest home healthcare company · One care manager per family · 135+ Indian cities
          </p>
          <a href={phone.href} className="hidden items-center gap-2 sm:inline-flex">
            <PhoneIcon className="h-3.5 w-3.5" />
            <span>{phone.label}</span>
          </a>
        </div>
      </div>

      {/* Sticky nav, constant across scroll */}
      <header className="sticky top-0 z-40 border-b border-[#e2eef0] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 sm:px-6 lg:px-10">
          <BrandLogo />
          <nav
            className="hidden flex-wrap items-center gap-3 text-sm font-semibold text-[#4b656d] lg:flex"
            aria-label="Primary"
          >
            {HOME_NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-[#10242b]">
                {link.label}
              </a>
            ))}
            <ChatbotTrigger
              vertical={elderCare}
              triggerClassName="inline-flex items-center gap-2 rounded-full bg-[#0f9aa8] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#0b7c87]"
              triggerContent={<span>Get a care assessment</span>}
            />
          </nav>
          <MobileMenu
            links={HOME_NAV_LINKS}
            phoneHref={phone.href}
            phoneLabel={phone.label}
            whatsappHref={whatsapp?.href}
          />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10">
          <div className="grid gap-10 pb-14 pt-4 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe4e7] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f9aa8]" />
                India&apos;s largest home healthcare company · 2M+ patients served
              </span>
              <h1 className="mt-5 text-[2.7rem] font-semibold leading-[1] tracking-[-0.055em] text-[#0f2028] sm:text-[3.4rem] lg:text-[4.4rem]">
                Your parent&apos;s care, <span className="text-[#0f9aa8]">coordinated</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-9 text-[#445d66]">
                One dedicated care manager who assesses your parent&apos;s needs, builds a
                personalized care plan, and coordinates every service they need at home.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <ChatbotTrigger
                  vertical={elderCare}
                  triggerClassName="inline-flex items-center gap-2 rounded-full bg-[#0f9aa8] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(15,154,168,0.9)] transition hover:bg-[#0b7c87]"
                  triggerContent={
                    <>
                      <ChatIcon className="h-4 w-4" />
                      <span>Talk to a care manager</span>
                    </>
                  }
                />
                <a
                  href={phone.href}
                  className="inline-flex items-center gap-2 rounded-full border border-[#0f9aa8] bg-white px-6 py-4 text-sm font-semibold text-[#0b7c87] transition hover:border-[#0b7c87] hover:bg-[#f0fafb]"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call {phone.label}
                </a>
                {whatsapp ? (
                  <a
                    href={whatsapp.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(37,211,102,0.85)] transition hover:bg-[#1da851]"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-white" />
                    WhatsApp us
                  </a>
                ) : null}
              </div>

              <p className="mt-4 text-sm font-medium text-[#54727a]">
                Care management starts at{" "}
                <span className="font-semibold text-[#10242b]">₹1,999/month</span>. Clinical
                services based on your care plan.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  "Designed by doctors",
                  "Trained by Dementia India Alliance",
                  "One care manager per family",
                ].map((pill) => (
                  <div
                    key={pill}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d7e8ea] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#29424a] shadow-sm"
                  >
                    <CheckIcon className="h-4 w-4 text-[#0f9aa8]" />
                    <span>{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.22)]">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={elderCare.images[0].src}
                    alt={elderCare.images[0].alt}
                    width={1400}
                    height={980}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: elderCare.images[0].position ?? "center center" }}
                    priority
                  />
                </div>
              </div>
              <div id="callback" className="scroll-mt-24">
                <LeadForm
                  vertical={elderCare}
                  verticalOptions={verticalList}
                  headline="Get a free care assessment"
                  helperText="Share three quick details. A doctor-led care manager will call you back within 12 hours."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portea Medical stats */}
      <div className="mx-auto max-w-7xl px-5 pt-12 text-center sm:px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
          Portea Medical
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10242b] sm:text-3xl">
          India&apos;s largest home healthcare company since 2013
        </h2>
      </div>
      <div className="mt-8">
        <StatsStrip />
      </div>

      {/* The reality today: problem + solution */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              The reality today
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
              Nobody is in charge of your parent&apos;s care
            </h2>
            <div className="mt-8 space-y-5">
              {PROBLEMS.map(({ Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-[#fff1ec] text-[#ff5b2e]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold tracking-[-0.02em] text-[#10242b]">
                      {title}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-7 text-[#576b73]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#0f8a96] p-8 text-white shadow-[0_30px_60px_-30px_rgba(15,138,150,0.7)]">
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">
              What if one person handled all of this?
            </h3>
            <p className="mt-4 text-base leading-8 text-white/90">
              Your Portea care manager is a licensed clinician who becomes your parent&apos;s
              single point of contact. They assess needs, build a care plan, coordinate every
              service, train your caregivers, and keep your family informed every week.
            </p>
            <p className="mt-4 text-base font-semibold leading-8 text-white">
              They don&apos;t just check in. They run your parent&apos;s care.
            </p>
            <div className="mt-6 border-t border-white/20 pt-5">
              <p className="text-sm text-white/80">Care management starts at</p>
              <p className="text-3xl font-semibold tracking-[-0.03em]">₹1,999/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
              From first call to care at home
            </h2>
            <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
              Getting started takes one conversation. Your care manager handles the rest.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, idx) => (
              <li
                key={step.title}
                className="relative rounded-[1.9rem] border border-[#d8e8ea] bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f9aa8] text-sm font-bold text-white shadow-md">
                  {idx + 1}
                </span>
                <p className="mt-4 text-base font-semibold leading-7 tracking-[-0.03em] text-[#10242b]">
                  {step.title}
                </p>
                <p className="mt-2 text-sm font-medium leading-7 text-[#455e67]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What your care manager coordinates */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            What your care manager coordinates
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            Every service your parent needs, in one place
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
            Your care plan identifies exactly what&apos;s needed. Your care manager sources it,
            schedules it, and makes sure it happens.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ Icon, title, body }) => (
            <article
              key={title}
              className="rounded-[1.7rem] border border-[#d7e7ea] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f6f7] text-[#0f9aa8]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold tracking-[-0.02em] text-[#10242b]">
                {title}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#455e67]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Specialized care programs -> verticals */}
      <section id="programs" className="bg-[#f7fbfb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
              Specialized care programs
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
              Already know what your parent is dealing with?
            </h2>
            <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
              We have condition-specific care programs with trained care managers and tailored
              protocols.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {specialized.map((program) => (
              <article
                key={program.href}
                className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#d7e7ea] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(16,42,49,0.24)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image
                    src={program.image.src}
                    alt={program.image.alt}
                    width={1200}
                    height={825}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: program.image.position ?? "center center" }}
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#10242b]">
                    {program.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm font-medium leading-7 text-[#455e67]">
                    {program.body}
                  </p>
                  <Link
                    href={program.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b7c87] transition hover:text-[#0f9aa8]"
                  >
                    Learn more <ArrowUpRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Simple pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            Simple pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            One fee for your care manager
          </h2>
          <p className="mt-4 text-base font-medium leading-8 text-[#445d66]">
            Everything else is based on your care plan.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-[#d7e7ea] bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b7c87]">
            Care management
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#10242b]">
            ₹1,999<span className="text-xl font-medium text-[#54727a]">/month</span>
          </p>
          <p className="mt-4 text-sm font-medium leading-7 text-[#455e67]">
            A dedicated care manager who assesses your parent&apos;s needs, builds a personalized
            care plan, coordinates all services, trains caregivers, and sends your family weekly
            updates.
          </p>
          <p className="mt-3 text-sm font-medium leading-7 text-[#576b73]">
            Clinical services, caregivers, and equipment are recommended based on your
            parent&apos;s care plan and priced separately. Your care manager walks you through
            everything before any cost is incurred.
          </p>
          <div className="mt-6">
            <ChatbotTrigger
              vertical={elderCare}
              triggerClassName="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f9aa8] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b7c87]"
              triggerContent={<span>Get a free care assessment</span>}
            />
          </div>
        </div>
      </section>

      {/* Meet the doctors */}
      <DoctorsSection />

      {/* A real note from a real family */}
      <section id="reviews" className="bg-[#fdf8f3]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a66a35]">
                A real note from a real family
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#3a2c14] sm:text-4xl">
                The notes that mean the most are the ones we don&apos;t ask for.
              </h2>
              <p className="mt-4 text-base font-medium leading-8 text-[#5c4a2c]">
                A real note of thanks from a family the Portea team supported. Names changed on
                request; the words are their own.
              </p>
              <div className="mt-7 rounded-[1.5rem] border border-[#e9d9c1] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#5a4724]">What we promise every family</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[#3a2c14]">
                  <li className="flex gap-3">
                    <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#ff5b2e]" />
                    The same care manager from your first call all the way through.
                  </li>
                  <li className="flex gap-3">
                    <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#ff5b2e]" />
                    Caregivers who treat your parent like their own family.
                  </li>
                  <li className="flex gap-3">
                    <CheckIcon className="mt-1 h-4 w-4 flex-none text-[#ff5b2e]" />
                    A plan that adjusts as life at home changes. Stop care any week.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <HandwrittenNote note={elderCare.appreciationNote} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:px-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0b7c87]">
            Common questions
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10242b] sm:text-4xl">
            Questions families ask us
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-[#d7e7ea] bg-white p-5 shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#10242b] [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="flex-none text-[#0f9aa8] transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm font-medium leading-7 text-[#455e67]">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <ChatbotTrigger
            vertical={elderCare}
            triggerClassName="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f9aa8] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b7c87]"
            triggerContent={<span>Get a free care assessment</span>}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10242b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr_1fr] lg:px-10">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
              Portea is India&apos;s largest organised home healthcare provider, with doctor-led
              elder care, dementia care and post-hospital recovery across 135+ cities.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Programs
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {verticalList.map((v) => (
                <li key={v.slug}>
                  <Link href={`/${v.slug}`} className="hover:text-white/80">
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Reach us
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={phone.href} className="inline-flex items-center gap-2 hover:text-white/80">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{phone.label}</span>
                </a>
              </li>
              {whatsapp ? (
                <li>
                  <a
                    href={whatsapp.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 hover:text-white/80"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    <span>WhatsApp a care manager</span>
                  </a>
                </li>
              ) : null}
              <li className="text-white/70">Mon to Sat, 8:00 AM to 8:00 PM IST</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-5 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-10">
            <p>© {new Date().getFullYear()} Portea Medical. All rights reserved.</p>
            <p>Doctor-led home care, trusted by families across 135+ Indian cities.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
