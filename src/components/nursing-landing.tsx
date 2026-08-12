import Image from "next/image";

import { NursingLeadForm } from "@/components/nursing-lead-form";
import { Reveal } from "@/components/reveal";
import {
  Activity,
  BookOff,
  Brain,
  CalendarX,
  CheckMini,
  Clipboard,
  EyeOff,
  GradCap,
  HandHeart,
  HeartPulse,
  HelpCircle,
  HomeIcon,
  Lungs,
  Refresh,
  ShieldCheck,
  Syringe,
  UserSearch,
} from "@/components/nursing-icons";

const PHONE = "+91 91871 16003";
const PHONE_HREF = "tel:+919187116003";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#caregivers", label: "Caregivers" },
  { href: "#programs", label: "Programs" },
];

const BADGES = [
  { icon: ShieldCheck, label: "Background-verified" },
  { icon: GradCap, label: "Portea-trained" },
  { icon: Refresh, label: "Replacement guarantee" },
  { icon: Clipboard, label: "Health manager included" },
];

const PROBLEMS = [
  { icon: UserSearch, title: "No way to verify who you are hiring", body: "Agencies send whoever is available. No background check, no medical training records, no references you can actually call." },
  { icon: BookOff, title: "They are not trained for your parent's condition", body: "A generic attendant does not know how to handle a dementia patient's sundowning, manage a tracheostomy, or track post-surgical vitals." },
  { icon: CalendarX, title: "No backup when they do not show up", body: "Your caregiver calls in sick at 6am. The agency says they will try to send someone. Your parent is alone." },
  { icon: EyeOff, title: "Nobody is monitoring the quality of care", body: "No one checks if medications are given on time, if the patient is being turned, or if early warning signs are being missed." },
];

const SOLUTION = [
  "Background-verified before placement",
  "Trained on your parent's specific condition",
  "Health manager monitors and adjusts care",
  "Replacement guarantee if the fit is not right",
  "Your family updated every week",
];

const STEPS = [
  { title: "Tell your health manager about your parent", body: "Share their condition, daily routine, and what kind of support they need. Your health manager asks the right questions." },
  { title: "We match a trained, verified caregiver", body: "Based on your parent's condition, location, and schedule, your health manager selects the right caregiver from Portea's network." },
  { title: "Your health manager places and trains them", body: "The health manager introduces the caregiver at home, trains them on your parent's case, and sets the care routine." },
  { title: "Ongoing monitoring and support", body: "Your health manager checks in regularly, tracks quality, adjusts the plan, and replaces the caregiver if the fit is not right." },
];

const CAREGIVERS = [
  { icon: HandHeart, tint: "bg-[#e8f6f7] text-[#0b7c87]", title: "Nursing Attendant", body: "Daily support with bathing, feeding, mobility, medication reminders, and companionship. Trained on condition-specific protocols by your health manager.", tag: "12h or 24h" },
  { icon: Syringe, tint: "bg-[#fff1ec] text-[#c2410c]", title: "Nurse", body: "Clinical care at home: vitals monitoring, wound care, injections, catheter and drain management, IV infusions, and post-surgical protocols.", tag: "Scheduled visits or live-in" },
  { icon: Activity, tint: "bg-[#e1f3f1] text-[#0b7c87]", title: "Physiotherapist", body: "At-home sessions for post-surgical rehab, stroke recovery, chronic pain, fall prevention, and mobility. Coordinated with your health manager.", tag: "Session-based" },
  { icon: Clipboard, tint: "bg-[#e8f6f7] text-[#0b7c87]", title: "Care Manager", body: "A licensed clinician who becomes your parent's single point of contact. Builds the plan, coordinates services, trains caregivers, sends weekly updates.", tag: "Included with placement" },
];

const PROGRAMS = [
  { icon: Brain, img: "/dementia-1.webp", title: "Dementia and Memory Care", body: "Attendants trained in cognitive stimulation, sundowning management, safety protocols, and structured routines for moderate-stage patients." },
  { icon: HeartPulse, img: "/post-discharge-1.png", title: "Post-Surgical Recovery", body: "Nurses and attendants for discharge coordination, wound care, medication management, physio support, and return-to-function tracking." },
  { icon: HomeIcon, img: "/elder-care-2.png", title: "Daily Elder Care", body: "Trained attendants for daily support with mobility, bathing, feeding, companionship, and medication reminders for ageing parents." },
  { icon: Lungs, img: "/post-discharge-2.png", title: "ICU Step-Down and Ventilator Care", body: "ICU-trained nurses for ventilator management, tracheostomy care, feeding tube management, and continuous vitals monitoring at home." },
];

const STATS = [
  { val: "10,000+", lbl: "Clinicians in our network" },
  { val: "135+", lbl: "Cities across India" },
  { val: "2M+", lbl: "Patients served since 2013" },
  { val: "100%", lbl: "Background-verified caregivers" },
];

const TESTIMONIALS = [
  { name: "About their coordinator", role: "Family feedback", quote: "Very prompt in responses, and in coordinating with the patient and attender, making everything easy. I could concentrate on my recovery without external worries." },
  { name: "About their attender", role: "Family feedback", quote: "Very calm, prompt in her actions, and very attentive to all my needs. There was such a comfort level with her. Never felt she was an outsider. Took very good care of me." },
];

export const NURSING_FAQS = [
  { q: "How are your caregivers different from what I would find through an agency?", a: "Three things. First, every Portea caregiver is background-verified before placement. Second, your health manager trains them on your parent's specific condition, not just generic caregiving. Third, your health manager monitors care quality over time and replaces the caregiver if the fit is not right. Most agencies drop someone at your door and move on. Portea stays in the picture." },
  { q: "What if the caregiver is not a good fit?", a: "Your health manager replaces them. This is one of the core guarantees. If the caregiver is not working out for any reason, tell your health manager and they will source and train a replacement. You should not have to start the search over from scratch." },
  { q: "I live abroad. Can I arrange care for my parent through this?", a: "Yes. Many families we support have children in other cities or countries. Your health manager becomes your single point of contact, sends weekly written updates, and is reachable across time zones. You manage one relationship instead of coordinating from a distance." },
  { q: "Which cities are you in?", a: "Portea operates across 135+ cities in India. Share your parent's location when you reach out and we will confirm availability for your area." },
  { q: "Is there a lock-in or contract?", a: "No. You can adjust, pause, or stop care at any time. Your health manager walks you through everything before any commitment." },
  { q: "What does the health manager do?", a: "Your health manager is a licensed clinician with geriatric training. They assess your parent's needs, match the right caregiver from Portea's network, train that caregiver on your parent's specific condition and routines, and then monitor care quality on an ongoing basis. If something changes, a new diagnosis, a fall, a medication adjustment, they adjust the plan and retrain the caregiver, and they send your family updates every week." },
];

export function NursingLanding() {
  return (
    <main className="bg-white text-[#374151]">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-6 py-3.5">
          <a href="https://www.portea.com" aria-label="Portea" className="flex items-center">
            <Image src="/portea-logo.svg" alt="Portea" width={116} height={28} priority />
          </a>
          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[#6b7280] transition hover:text-[#0f9aa8]">{l.label}</a>
            ))}
            <a href={PHONE_HREF} className="text-[13px] font-medium text-[#6b7280] transition hover:text-[#0f9aa8]">{PHONE}</a>
          </div>
          <a href="#form" className="rounded-lg bg-[#0f9aa8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7c87]">Get a free assessment</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-white to-[#e8f6f7]">
        <div className="mx-auto grid max-w-[1080px] items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#6b7280]">
              India&apos;s largest home healthcare company · <strong className="text-[#0f9aa8]">10,000+ clinicians</strong>
            </span>
            <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#10242b] sm:text-[3.1rem]">
              A trained caregiver for your parent, <span className="text-[#0f9aa8]">managed by your health manager</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#54727a]">
              Background-verified nursing attendants and nurses, placed and trained on your parent&apos;s specific condition by a dedicated health manager who coordinates their care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#form" className="rounded-[10px] bg-[#0f9aa8] px-8 py-4 text-base font-bold text-white transition hover:bg-[#0b7c87]">Get a free assessment</a>
              <a href="#how" className="rounded-[10px] border-2 border-[#0f9aa8] px-8 py-4 text-base font-bold text-[#0b7c87] transition hover:bg-[#e8f6f7]">See how it works</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {BADGES.map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-sm text-[#54727a]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#0f9aa8]"><b.icon className="h-4 w-4" /></span>
                  {b.label}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white p-2.5 shadow-[0_30px_60px_-28px_rgba(16,42,49,0.28)]">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.35rem]">
                <Image src="/nursing-hero.png" alt="A Portea caregiver in uniform sitting with a smiling elderly woman at home" fill sizes="(max-width: 1024px) 92vw, 520px" className="object-cover" priority />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-[1080px] px-6 py-16 sm:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f9aa8]">The reality today</div>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-tight tracking-[-0.01em] text-[#10242b]">Managing your parent&apos;s care alone is exhausting</h2>
            <div className="mt-7 space-y-5">
              {PROBLEMS.map((p) => (
                <div key={p.title} className="flex gap-3.5">
                  <span className="flex h-10 w-10 min-w-10 items-center justify-center rounded-[10px] bg-[#fef2f2] text-[#dc2626]"><p.icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#10242b]">{p.title}</h3>
                    <p className="mt-0.5 text-sm leading-6 text-[#54727a]">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl bg-[#0f9aa8] p-9 text-white">
              <h3 className="text-[1.4rem] font-extrabold">You should not have to do this alone</h3>
              <p className="mt-3 text-[15px] leading-7 text-white/90">Every Portea caregiver is placed by a dedicated health manager: a licensed clinician who knows your parent&apos;s case, trains the caregiver on their specific needs, and monitors care quality week over week.</p>
              <ul className="mt-6 space-y-2.5">
                {SOLUTION.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm leading-6 text-white/95"><CheckMini className="mt-0.5 h-4 w-4 min-w-4" />{s}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 bg-[#f9fafb]">
        <div className="mx-auto max-w-[1080px] px-6 py-16 text-center sm:py-20">
          <Reveal>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f9aa8]">How it works</div>
            <h2 className="mt-3 text-[2rem] font-extrabold tracking-[-0.01em] text-[#10242b]">From your first call to care at home</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] leading-7 text-[#54727a]">Your health manager handles the matching, placement, training, and ongoing monitoring.</p>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0f9aa8] text-xl font-extrabold text-white">{i + 1}</div>
                  <h3 className="mt-4 text-base font-bold text-[#10242b]">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-[240px] text-sm leading-6 text-[#54727a]">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CAREGIVER TYPES */}
      <section id="caregivers" className="scroll-mt-20">
        <div className="mx-auto max-w-[1080px] px-6 py-16 text-center sm:py-20">
          <Reveal>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f9aa8]">Caregivers and clinicians</div>
            <h2 className="mt-3 text-[2rem] font-extrabold tracking-[-0.01em] text-[#10242b]">The right caregiver for your parent&apos;s needs</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] leading-7 text-[#54727a]">Not sure what your parent needs? Your health manager recommends the right type of caregiver after understanding their condition.</p>
          </Reveal>
          <div className="mt-11 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {CAREGIVERS.map((c) => (
              <Reveal key={c.title}>
                <div className="h-full rounded-2xl border border-[#e5e7eb] bg-white p-7 transition hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.tint}`}><c.icon className="h-6 w-6" /></span>
                  <h3 className="mt-4 text-[17px] font-bold text-[#10242b]">{c.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#54727a]">{c.body}</p>
                  <span className="mt-3 inline-block rounded-md bg-[#e8f6f7] px-2.5 py-1 text-xs font-semibold text-[#0b7c87]">{c.tag}</span>
                </div>
              </Reveal>
            ))}
            <Reveal>
              <a href="#form" className="flex h-full flex-col rounded-2xl border-2 border-[#0f9aa8] bg-[#e8f6f7] p-7 transition hover:bg-[#dbf0f1]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0f9aa8]"><HelpCircle className="h-6 w-6" /></span>
                <h3 className="mt-4 text-[17px] font-bold text-[#10242b]">Not sure what you need?</h3>
                <p className="mt-2 text-sm leading-6 text-[#54727a]">That is the most common starting point. Your health manager will assess your parent&apos;s condition and recommend the right caregiver and level of clinical support.</p>
                <span className="mt-3 inline-block rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#0b7c87]">Start with a free assessment</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="scroll-mt-20 bg-[#f9fafb]">
        <div className="mx-auto max-w-[1080px] px-6 py-16 text-center sm:py-20">
          <Reveal>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f9aa8]">Specialized programs</div>
            <h2 className="mt-3 text-[2rem] font-extrabold tracking-[-0.01em] text-[#10242b]">Caregivers trained for specific conditions</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] leading-7 text-[#54727a]">Your health manager matches a caregiver with the right training for your parent&apos;s situation.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((p) => (
              <Reveal key={p.title}>
                <div className="h-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition hover:border-[#0f9aa8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={p.img} alt={p.title} fill sizes="(max-width: 768px) 92vw, 250px" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f6f7] text-[#0b7c87]"><p.icon className="h-[18px] w-[18px]" /></span>
                    <h3 className="mt-3 text-[15px] font-bold text-[#10242b]">{p.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-[#54727a]">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-[1080px] px-6 py-16 text-center sm:py-20">
        <Reveal>
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f9aa8]">Why families trust Portea</div>
          <h2 className="mt-3 text-[2rem] font-extrabold tracking-[-0.01em] text-[#10242b]">Every caregiver is verified, trained, and monitored</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-x-14 gap-y-8">
            {STATS.map((s) => (
              <div key={s.lbl} className="text-center">
                <div className="text-[2rem] font-extrabold text-[#0f9aa8]">{s.val}</div>
                <div className="mt-1 text-[13px] text-[#54727a]">{s.lbl}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 text-left sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <Reveal key={t.name}>
              <div className="h-full rounded-2xl border border-[#e5e7eb] bg-white p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f6f7] text-[#0b7c87]"><HandHeart className="h-5 w-5" /></span>
                  <div>
                    <div className="text-sm font-bold text-[#10242b]">{t.name}</div>
                    <div className="text-xs font-semibold text-[#0f9aa8]">{t.role}</div>
                  </div>
                </div>
                <blockquote className="mt-4 border-l-[3px] border-[#e8f6f7] pl-4 text-sm italic leading-7 text-[#54727a]">{t.quote}</blockquote>
                <div className="mt-3 text-xs text-[#9ca3af]">Portea customer appreciation program</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="scroll-mt-20 bg-gradient-to-b from-white to-[#e8f6f7] px-6 py-16 sm:py-20">
        <NursingLeadForm />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[720px] px-6 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-center text-[2rem] font-extrabold tracking-[-0.01em] text-[#10242b]">Common questions</h2>
        </Reveal>
        <div className="mt-10">
          {NURSING_FAQS.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b border-[#e5e7eb]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-[#10242b] transition hover:text-[#0f9aa8] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-[#9ca3af] transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="pb-5 text-sm leading-7 text-[#54727a]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-[#0f9aa8] to-[#0b7c87] px-6 py-16 text-center sm:py-20">
        <Reveal>
          <h2 className="text-[2rem] font-extrabold tracking-[-0.01em] text-white">Get a free assessment for your parent</h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-white/80">Tell us about your parent&apos;s needs. A health manager will call you to recommend the right caregiver and level of support.</p>
          <div className="mt-8">
            <a href="#form" className="inline-block rounded-[10px] bg-white px-10 py-4 text-base font-bold text-[#0b7c87] transition hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]">Get an assessment</a>
          </div>
          <p className="mt-4 text-sm text-white/70">Or call us: <a href={PHONE_HREF} className="font-semibold text-white">{PHONE}</a></p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#10242b] px-6 py-7 text-center text-[13px] text-white/40">
        <a href="https://www.portea.com" className="text-white/60 hover:text-white">Portea Medical</a> · India&apos;s largest home healthcare company · © 2026
      </footer>
    </main>
  );
}
