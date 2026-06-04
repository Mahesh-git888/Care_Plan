# Portea Care Plan — Project Handoff Brief

## 1. What this is
A Next.js 15 (App Router) + TypeScript + Tailwind CSS website for **Portea Medical's managed home care service**. Lives at `care.portea.com`. Deployed on **Vercel**. Backed by **Postgres** (Vercel Postgres / Neon). Uses **Gemini API (Google AI Studio key)** for AI features.

Three sub-products:
1. **Public website** — home page + three vertical landing pages (elder-care, dementia, post-discharge) + thank-you page. Lead capture via chatbot and inline lead form, both feeding Postgres.
2. **CM dashboard** at `/admin/leads` — care managers and admins log in, see/own leads, generate AI pre-call briefs, upload call recordings for transcription, save notes/observations.
3. **Admin user-management** at `/admin/users` — admin-only UI to create/deactivate users and reset passwords. Plus per-user self-service password change.

## 2. Tech stack
- **Framework:** Next.js 15 (App Router, server + client components)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS (no UI library; raw HTML + Tailwind classes)
- **Database:** Postgres via `pg` driver (Vercel Postgres)
- **Storage:** Vercel Blob (`@vercel/blob`) for temporary audio file uploads
- **AI:** `@google/genai` SDK → Gemini 2.5 Flash (text + audio multimodal)
- **Auth:** Custom — PBKDF2-SHA256 (210k iterations) password hashing, HMAC-SHA256 signed session cookies (24h TTL)
- **Tracking:** GTM (`GTM-MQGX3H46`) + Google Ads gtag (`AW-977307455`) + GA4 via GTM
- **Deployment:** Vercel (auto-deploy on push to main)

## 3. Folder structure
```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # root layout, mounts GTMProvider, GoogleAdsProvider, TrackingProvider, ScrollTracker
│   ├── page.tsx                      # home → renders <HomePage />
│   ├── elder-care/page.tsx           # vertical pages → renders <LandingPage vertical={...} />
│   ├── dementia/page.tsx
│   ├── post-discharge/page.tsx
│   ├── thank-you/page.tsx            # post-submit thank-you, fires generate_lead + Google Ads conversion
│   ├── admin/
│   │   ├── login/page.tsx            # login form
│   │   ├── leads/page.tsx            # main CM dashboard
│   │   ├── users/page.tsx            # admin user management
│   │   └── analytics/page.tsx        # marketing analytics view
│   └── api/
│       ├── v1/
│       │   ├── intake/route.ts       # POST: lead form / chatbot submit
│       │   ├── track/route.ts        # POST: call/whatsapp click tracking
│       │   └── admin/leads.csv/route.ts  # CSV export
│       ├── admin/
│       │   ├── auth/route.ts         # POST=login, GET=session, DELETE=logout
│       │   ├── leads/
│       │   │   ├── route.ts          # GET: list leads (CM-scoped)
│       │   │   ├── update/route.ts   # POST: update lead (status, CM, notes, recording_url, observations)
│       │   │   ├── brief/route.ts    # POST: generate AI pre-call brief
│       │   │   ├── transcribe/route.ts   # POST: transcribe recording (URL or blob)
│       │   │   └── upload-token/route.ts # POST: Vercel Blob upload token
│       │   └── users/
│       │       ├── route.ts          # GET=list, POST=create
│       │       └── [id]/route.ts     # PATCH=update (active/role/reset_password)
│       └── account/password/route.ts # POST: change own password
│
├── components/
│   ├── home-page.tsx                 # the entire / page
│   ├── landing-page.tsx              # vertical page template (shared across 3)
│   ├── doctors-section.tsx           # "Meet the doctors" (Kavitha + Allia)
│   ├── handwritten-note.tsx          # family-note testimonial card
│   ├── stats-strip.tsx               # 2M+/10000+/135+/100+ stat strip
│   ├── lead-form.tsx                 # 3-field lead form (name, phone, city)
│   ├── intake-chatbot.tsx            # full chatbot modal (7 steps, review screen)
│   ├── chatbot-trigger.tsx           # stateless "open chatbot" button
│   ├── contact-actions.tsx           # FloatingContactButtons (sticky call/WhatsApp/chat) + ContactActions
│   ├── mobile-menu.tsx               # hamburger drawer
│   ├── brand-logo.tsx
│   ├── cm-dashboard.tsx              # the entire CM dashboard UI (large file)
│   ├── users-admin.tsx               # user-management UI
│   ├── password-change-modal.tsx     # change-password modal (voluntary or forced)
│   ├── gtm-provider.tsx              # injects GTM script
│   ├── google-ads-provider.tsx       # injects Google Ads gtag.js script
│   ├── tracking-provider.tsx         # click_call/whatsapp_click listener + UTM capture on mount
│   ├── scroll-tracker.tsx            # fires scroll_90 event
│   ├── thank-you-conversion.tsx      # /thank-you fires generate_lead + Google Ads conversion
│   └── ui-icons.tsx                  # all SVG icons (Phone, Chat, Check, Layers, Syringe, Dumbbell, etc.)
│
├── lib/
│   ├── db.ts                         # Postgres pool + ensureSchema() (lazy CREATE TABLE)
│   ├── lead-store.ts                 # appendLead, readLeads, getLeadById, updateLead, updateLeadBrief, updateLeadTranscript
│   ├── lead-types.ts                 # LeadRecord, AiBrief, LeadAttribution, LifecycleStatus
│   ├── users.ts                      # DB-backed user store + auto-seed from PORTEA_USERS_JSON
│   ├── password-overrides.ts         # legacy password override table (unused now, kept for compat)
│   ├── admin-auth.ts                 # PBKDF2 hash/verify, HMAC sessions, rate limiting, audit logging, attemptLogin
│   ├── ai-brief.ts                   # generateBrief() — Gemini call with stub fallback, embedded clinical context
│   ├── transcribe.ts                 # transcribeAudio() — Gemini audio transcription with Indian language script rules
│   ├── chatbot.ts                    # intakeSteps array, isValidIndianMobile, sanitizePhoneInput, quick-form handoff
│   ├── contact.ts                    # PORTEA_PHONE_DISPLAY = "+91 91871 16003", getPhoneContact, getWhatsAppContact
│   ├── gtm.ts                        # pushDataLayerEvent helper, GTM_ID
│   └── utm.ts                        # captureAttributionFromUrl, readAttribution (GCLID + UTM)
│
└── data/
    └── verticals.ts                  # ALL vertical content (elder-care, dementia, post-discharge), homeStats, testimonials, FAQs
```

## 4. Environment variables (every one used)
| Name | Purpose | Default if missing |
|---|---|---|
| `POSTGRES_URL` / `DATABASE_URL` | Postgres connection | None — DB calls fail |
| `PORTEA_USERS_JSON` | One-time seed for users table on first run. JSON array of `{id, email, name, role, password_hash}` | If unset and DB has no users, admin login disabled |
| `PORTEA_ADMIN_PASSWORD` | Legacy single-password fallback for admin | If unset, only DB user accounts work |
| `PORTEA_AUTH_SECRET` | HMAC key for signing session cookies. **MUST be set in production.** | Falls back to a hardcoded dev string (insecure) |
| `GEMINI_API_KEY` | Google AI Studio key (currently a personal AIza... key, should rotate + transfer ownership) | Stub brief returned, transcription disabled |
| `GEMINI_MODEL` | Override Gemini model name | `gemini-2.5-flash` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob auth (auto-set when you connect a store) | Upload disabled |
| `NEXT_PUBLIC_GTM_ID` | GTM container ID | `GTM-MQGX3H46` |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads gtag ID | `AW-977307455` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Conversion label from Hiveminds for the `generate_lead` Google Ads conversion. **Empty until Hiveminds sends it.** | No conversion fires |
| `NEXT_PUBLIC_SITE_URL` | Used for OpenGraph metadata canonical URL | `https://www.portea.com` |

## 5. Postgres schema (auto-created by `ensureSchema()`)
**`leads`** — every lead from the chatbot/form
```
id TEXT PK, kind TEXT (default 'intake'), created_at TIMESTAMPTZ, vertical TEXT,
full_name, phone, city, elder_name, condition, needs, relationship, situation,
ab_variant, consent_given BOOL, status TEXT (LifecycleStatus enum),
care_manager TEXT, follow_up_date TEXT, click_target, user_agent, ip_hash,
attribution JSONB, notes TEXT, updated_at, updated_by,
ai_brief JSONB, ai_brief_at TIMESTAMPTZ,
call_recording_url TEXT, call_observations TEXT,
call_transcript TEXT, call_transcript_at TIMESTAMPTZ
```
**`users`** — admin/CM accounts (seeded from PORTEA_USERS_JSON on first DB read)
```
id TEXT PK, email TEXT UNIQUE, name TEXT, role TEXT CHECK IN ('admin','cm'),
password_hash TEXT, must_change_password BOOL, active BOOL,
created_at, created_by, updated_at
```
**`password_overrides`** — legacy, kept for compat, no longer written to
```
email PK, password_hash, updated_at, updated_by
```
**`login_audit`** — every login attempt (success/failure/rate_limited/logout)
```
id BIGSERIAL PK, type TEXT, ts TIMESTAMPTZ, email, user_id, ip, user_agent, reason
```

## 6. LeadRecord shape (TypeScript)
```ts
{
  id, kind: 'intake'|'call_click'|'whatsapp_click', created_at,
  vertical?, full_name?, phone?, city?,
  elder_name?, condition?, needs?, relationship?, situation?,
  ab_variant?, consent_given?, status?: LifecycleStatus, care_manager?, follow_up_date?,
  attribution?: { utm_source/medium/campaign/term/content, gclid, fbclid, referrer, landing_path },
  click_target?, user_agent?, ip_hash?,
  ai_brief?: { summary: [{label,value}], questions: string[], generated_by? },
  ai_brief_at?,
  notes?, call_recording_url?, call_observations?, call_transcript?, call_transcript_at?
}
```
`LifecycleStatus`: `new | cm_contacted | plan_shared | follow_up | converted | active | lost`

## 7. Key features (status: ✅ built and live; ⏳ pending)
| Feature | Status | Files |
|---|---|---|
| Lead form (3 fields) → chatbot handoff → Postgres | ✅ | `lead-form.tsx`, `intake-chatbot.tsx`, `api/v1/intake/route.ts` |
| Chatbot intake (7 steps + review screen) | ✅ | `intake-chatbot.tsx`, `lib/chatbot.ts` |
| Phone validation (10-digit Indian mobile) | ✅ | `lib/chatbot.ts` `isValidIndianMobile`, `sanitizePhoneInput` |
| GTM + dataLayer events (page_view, form_start, generate_lead, click_call, whatsapp_click, scroll_90) | ✅ | `lib/gtm.ts`, `gtm-provider.tsx`, `tracking-provider.tsx`, `scroll-tracker.tsx`, `thank-you-conversion.tsx` |
| Google Ads gtag.js | ✅ | `google-ads-provider.tsx` |
| Google Ads conversion fire on /thank-you | ⏳ ready, awaiting `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` from Hiveminds | `thank-you-conversion.tsx` |
| GCLID/UTM capture + persistence | ✅ | `lib/utm.ts` |
| CM dashboard with per-CM scoping | ✅ | `cm-dashboard.tsx`, `api/admin/leads/route.ts` |
| Per-user admin auth (PBKDF2 + HMAC sessions) | ✅ | `lib/admin-auth.ts` |
| User management UI + self-service password change | ✅ | `users-admin.tsx`, `password-change-modal.tsx`, `api/admin/users/*`, `api/account/password/*` |
| AI pre-call brief (Gemini) | ✅ | `lib/ai-brief.ts`, `api/admin/leads/brief/route.ts` |
| Call recording transcription (URL or upload) | ✅ | `lib/transcribe.ts`, `api/admin/leads/transcribe/route.ts`, `api/admin/leads/upload-token/route.ts` |
| Mobile chatbot fixes (autoFocus, current-question reminder, 100dvh, safe-area padding, autoComplete suppression) | ✅ | `intake-chatbot.tsx` |
| AI care plan generation (Feature 3 per SOP) | ⏳ not started | future |

## 8. The home page (`home-page.tsx`) section order
1. Sticky nav header (logo, links, "Get a care assessment" chatbot trigger)
2. Announcement bar (gradient orange)
3. Hero — badge ("India's largest home healthcare company · 2M+ patients served", **no bullet dot**) + headline "Your parent's care, *coordinated*" (teal accent) + sub + 3 CTAs (Talk to care manager / Call / WhatsApp) + pricing line + 3 trust pills (*Fortnightly doctor consults / Dedicated care manager / Doctor-designed care plan*) | Right: image + lead form (vertically centered)
4. Portea Medical stats (2M+ / 10,000+ / 135+ / 100+ hospital partnerships)
5. "Nobody is in charge of your parent's care" — 4 problems (line-art SVG icons in orange chips) + teal callout "What if one person handled all of this?" (tick list, **no price, no "they don't just check in" line**)
6. How it works — 4 numbered steps (step 2 is "A care manager calls you back", **not** "visits the home")
7. "Every service your parent needs, in one place" — 8 service cards (line-art SVG icons in teal chips): Caregiver, Nursing, Doctor visits, Physiotherapy, Labs and diagnostics, Equipment, Nutrition, Counselor
8. Specialized care programs — 3 cards (Dementia, Post-surgical recovery, Daily elder care) **with images**, linking to verticals
9. Simple pricing — Care management ₹1,999/month with **bullet-point list** (teal markers): dedicated care manager / 2 doctor consults per month / doctor-designed care plan / coordination / care team trained
10. Doctors section (Dr. Kavitha + Dr. Allia bios — see § 11)
11. Real family note (`handwritten-note.tsx`) — "A note from a family we cared for"
12. FAQ — 6 questions with `<details>` accordion
13. Footer

Plus mounted globally: `<IntakeChatbot />` (one per page) and `<FloatingContactButtons />` (sticky bottom-right Call/WhatsApp/Chat)

## 9. Vertical pages (`landing-page.tsx`)
Shared template, takes a `vertical` prop. Renders headline + image + lead form + program cards + handwritten note + DoctorsSection + footer. The "Who this isn't for" card has a **prominent "Visit portea.com" teal button**.

## 10. Brand / Style rules (USER PREFERENCES — IMPORTANT)
- **Brand Teal scheme**: primary teal `#0f9aa8` (hover `#0b7c87`), WhatsApp official green `#25d366`, accent orange `#ff5b2e` kept as rare highlight (the word "trust", step number badges, checkmarks)
- **NO em-dashes anywhere** (the user hates them — they're an AI tell). Use commas, colons, or parentheses. En-dashes for ranges (4-5, 1-3s) are OK.
- **NO negative parallelism** ("X, not Y" / "this isn't X, it's Y") — another AI tell.
- **No marketing tropes** per tropes.fyi (no "yes." FAQ openers, no magic adverbs)
- **No insider jargon to customers**: "CM" is spelled out as "care manager"; "SOP", "triage", "intake", "discovery call", "pre-placement scoring sheet" all avoided in customer copy. Use "care manager", "first call", "home assessment", "specialist readiness check".
- **No specific time commitments**: "within 12 hours" has been replaced everywhere with "shortly" / "be in touch shortly" — do NOT add back hard time promises
- **No "real note from a real family"** phrasing — the section title is "A note from a family we cared for"
- **No "your care manager visits the home"** in How it works step 2 — it's "A care manager calls you back"
- **No "24/7 ambulance hotline" or emergency service claim** — Portea does not run emergency response
- **Phone**: `+91 91871 16003` (display) / `919187116003` (digits). All in `lib/contact.ts`.

## 11. Doctor bios (final state in `doctors-section.tsx`)
**Dr. Kavitha S Manjunath** — *Clinical Head, Primary · Preventive · Elderly Care*
> 22+ years across infectious disease, chronic disease, palliative and elderly care, with 11 at Portea leading palliative and elderly care alongside preventive and primary services. MBBS (Al Ameen Medical College), DNB Family Medicine (The Bangalore Hospital), and a Certificate Course in Geriatric Medicine & Gerontology (Khaja Bandanwaz University with Geriatric Society of India). Also certified in palliative care and sleep-study interpretation; member of the Indian Medical Association, the Family Physician Association, and the Geriatric Society of India. Co-authors the elder-care and post-discharge protocols every Portea care manager works to.

**Dr. Allia Rahaman** — *AVP, Medical · Quality · Training* (NOT "Clinical Head, South")
> 14 years in chronic disease, emergency medicine and critical care. Trained at GB Pant Hospital and NRHM (A & N Islands) where she ran ICU duties for most of her tenure, then worked as Consultant Physician with V-Health by Aetna (CVS Health). Certified in Diabetes Management (BMJ Fortis) and in ACLS, BLS and PALS by the American Heart Association. Now leads medical operations, quality and care-manager training at Portea, and owns the dementia-care protocol design used across the network.

## 12. AI pre-call brief — `lib/ai-brief.ts`
**Output shape (strict JSON):**
```
{ summary: [{label, value} ×7 rows], questions: string[5-6], generated_by? }
```
**Summary table — 7 fixed rows:** Elder · Condition · Main need · Caller · Location · Program fit · Urgency
**Urgency tiers:** `Low` (green pill) / `Medium` (amber pill) / `High` (red pill). Backward-compat with legacy Green/Amber/Red wording. Rendered as colored pill in `cm-dashboard.tsx` (see `UrgencyValue`).
**System prompt** contains: Portea's 3 programs description; junior CM framing (medically trained, ~1 year, doctor-supervised); urgency tier definitions; a large clinical context reference keyed by condition; a rule that questions are a balanced mix of ~2-3 general intake probes AND ~2-3 condition-specific clinical depth (NEVER only one kind).
**Model:** `gemini-2.5-flash` via `@google/genai` SDK. `thinkingBudget: 0`, `temperature: 0.4`, `maxOutputTokens: 2048`, `responseMimeType: "application/json"`.
**Stub fallback:** When `GEMINI_API_KEY` is missing, returns a sample brief built from the lead's own fields.

## 13. Transcription — `lib/transcribe.ts`
Uses Gemini Flash audio multimodal. URL path: fetches the audio, sends inline (≤19 MB cap). Upload path: client uploads to Vercel Blob (`upload-token` route), server reads blob, transcribes, **deletes blob** (audio never persisted).
**Script rule in prompt:** English speech → Roman/Latin script. Hindi → Devanagari. Tamil/Telugu/Kannada → native script. Do NOT transliterate English into Devanagari. Speaker labels: `CM:` and `Family:`.
**Early MIME check (recommended next):** the transcribe route doesn't yet detect when a URL returns HTML (e.g., Limewire share pages); it forwards to Gemini and gets a generic error. Easy improvement.

## 14. Auth model
- Login: `POST /api/admin/auth` with `{email, password}` → checks DB users table (auto-seeded from `PORTEA_USERS_JSON`), then legacy `PORTEA_ADMIN_PASSWORD` fallback. PBKDF2 verify, returns `must_change_password` flag in response.
- Session: HMAC-SHA256 signed cookie `portea_admin_session`, 24h TTL, HttpOnly + Secure + SameSite=Lax.
- Rate limit: 5 attempts per (IP + email) per 15 min (in-memory, per Vercel instance).
- Forced password change: when `must_change_password=true`, the dashboard shows a modal that can't be dismissed until they change it. After change, session is re-issued without the flag.
- Per-CM scoping: in `api/admin/leads/route.ts`, CMs see only their leads + unassigned. Admins see all. CMs can only reassign to themselves.

## 15. Open / pending
1. **Push current changes** (everything local-clean, typecheck passes)
2. **Send reply email to Mitali** confirming Google Ads gtag is deployed
3. **When Mitali sends conversion label** → set `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` in Vercel → redeploy → conversion fires automatically
4. **Transfer GTM container `GTM-MQGX3H46`** from personal Google account to a Portea-owned account (low priority)
5. **Transfer Gemini API key** from personal AI Studio account to a Portea account (same)
6. **Rotate** the Gemini API key that was once pasted in chat (treat as compromised)
7. **Feature 3 — AI care plan generation** from intake + transcript + observations + clinical protocol. v1 system prompt sketched but not built into code yet.
8. **Test Hiveminds preview-mode walkthrough** once they configure tags in GTM

## 16. Quick commands
```bash
cd "C:\Users\itsfo\OneDrive\Desktop\portea\Care_Plan"
npm run dev                 # local dev at localhost:3000
npx tsc --noEmit            # typecheck (used after every change)
npm run build               # production build (user has rejected this in past — use sparingly)
git status / git log --oneline -5
git push                    # deploys via Vercel
```

## 17. Person glossary
- **Mahesh** — the developer (intern at Portea)
- **Akshita Ganesh** — Head of Managed Care, team lead, owns the SOP, gives content/UX feedback
- **Atishay** — direct team lead at Portea
- **Rama** — COO/CTO, prefers minimal/pragmatic moves
- **Dr. Kavitha S Manjunath** — Clinical Head, writes care plans
- **Dr. Allia Rahaman** — AVP Medical/Quality/Training, designs dementia protocols
- **Mitali Bhola** — Group Head at Hiveminds (paid-ads agency), handles GTM/Google Ads setup
