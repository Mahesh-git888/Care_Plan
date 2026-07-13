# Portea Care Plan — Complete Project Handoff

_Last updated: July 2026. This is the single source of truth. It merges the original project brief with all work done since._

---

## 1. What this is

A **Next.js (App Router) + TypeScript + Tailwind CSS** website for **Portea Medical's managed home care service**, live at **care.portea.com**, deployed on **Vercel**, backed by **Neon Postgres**, using **Gemini** for AI features.

Three sub-products:
1. **Public website** — home page + three vertical landing pages (elder-care, dementia, post-discharge) + a dedicated pricing page + thank-you page. Lead capture via chatbot and inline lead form, both feeding Postgres.
2. **CM dashboard** at `/admin/leads` — care managers and admins log in, see/own leads, generate AI pre-call briefs, transcribe call recordings, save notes/observations, and generate AI care plans.
3. **Admin user-management** at `/admin/users` — admin-only UI to create/deactivate users and reset passwords, plus per-user self-service password change. Marketing analytics at `/admin/analytics`.

---

## 2. Tech stack

- **Framework:** Next.js (App Router; version bumped to 16.x during the SEO work). React server + client components.
- **Language:** TypeScript (strict).
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`), raw HTML + classes, no UI library. **System fonts only** (Segoe UI / Bahnschrift / Aptos stack, no web fonts).
- **Database:** Postgres via the `pg` driver (Neon).
- **Storage:** Vercel Blob (`@vercel/blob`) for temporary audio uploads.
- **AI:** `@google/genai` SDK → Gemini 2.5 Flash (brief, transcription) and Gemini 2.5 Pro (care plan). Vertex-ready.
- **Docs:** `docx` package for generating branded `.docx` care plans.
- **Email:** `nodemailer` (Gmail SMTP) for lead alerts.
- **Auth:** custom — PBKDF2-SHA256 (210k iterations) password hashing, HMAC-SHA256 signed session cookies (24h TTL).
- **Tracking:** direct Google Ads gtag (`AW-977307455`). GA4/GTM history below.
- **Deployment:** Vercel.

---

## 3. Infrastructure and deployment (READ THIS)

- **Vercel project:** `care-plan` under team **akshita-ganeshs-projects** (`team_NEUfyMq8DQbr8GQhtAywfzy7`, project `prj_1oQtV1Z387YUENh6gFPt5MlrJKCL`).
- **Database:** **Neon Postgres**, host `ep-noisy-haze-apm8gn89` (region **us-east-1**), under Akshita's Vercel team on the **Neon Free tier** (short point-in-time-restore retention). The DB was migrated here from a personal account this session; the users table (6 accounts) and audit log were copied over, leads were cleared.
- **Deploy with `vercel --prod --yes`.** The GitHub→Vercel auto-deploy has been unreliable this whole project, so **do not assume `git push` deploys**. The CLI is authenticated as `vontimittarama-3069`, who is a member of Akshita's team.
- **Setting env vars:** the `vercel env add` CLI **silently saves blank values** (a real bug hit repeatedly). Set env vars via the **Vercel REST API**: `POST https://api.vercel.com/v10/projects/{projectId}/env?upsert=true&teamId={teamId}` with `Authorization: Bearer <token>` (token in `~/AppData/Roaming/xdg.data/com.vercel.cli/auth.json`). **Env changes require a redeploy to take effect.**
- **Common failure this session:** login/API 500s were almost always "production env still points at the old resource, or was never redeployed." Verify with `vercel env pull` and redeploy.

---

## 4. Environment variables

| Name | Purpose |
|---|---|
| `POSTGRES_URL` / `DATABASE_URL` / `POSTGRES_PRISMA_URL` | Neon connection (new DB `ep-noisy-haze-apm8gn89`). The app reads `POSTGRES_URL` first. |
| `PORTEA_USERS_JSON` | One-time seed for the users table on first run. |
| `PORTEA_AUTH_SECRET` | HMAC key for session cookies. Must stay set in prod. |
| `GEMINI_API_KEY` | Google AI Studio key (brief, transcription, care plan). |
| `GEMINI_MODEL` / `CARE_PLAN_MODEL` | Model overrides. Care plan defaults to `gemini-2.5-pro`. |
| `GOOGLE_GENAI_USE_VERTEXAI` / `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION` | Switch AI to Vertex AI (no code change). |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (audio upload/transcription). |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads ID, default `AW-977307455`. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | **Empty until Hiveminds sends the label.** When set, /thank-you fires the conversion. |
| `NEXT_PUBLIC_GTM_ID` | GTM container. Currently effectively unused (GTM removed — see §12). |
| `NEXT_PUBLIC_SITE_URL` | Base URL for canonical/OG/sitemap. **Not set in prod**; code default is now `https://care.portea.com`. |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Lead-alert email sender (`maheshdattabadvel@gmail.com` + a Gmail app password). |
| `LEAD_ALERT_TO` | Comma-separated alert recipients (`mahesh.datta@porteamedical.com,akshitag@porteamedical.com`). |
| `LEAD_ALERT_DASHBOARD_URL` | Optional; defaults to `https://care.portea.com`. |
| `BREVO_API_KEY` / `RESEND_API_KEY` | Optional alt email providers (Gmail is the active one). |
| `PORTEA_LEADS_WEBHOOK_URL` / `PORTEA_CRM_API_URL` | Optional lead-forwarding webhooks (dormant). |

---

## 5. Folder structure (current)

```
src/
├── app/
│   ├── layout.tsx              # root layout; SITE_URL default care.portea.com; GSC verification tag;
│   │                           #   mounts GoogleAdsProvider, TrackingProvider, PageViewTracker, ScrollTracker;
│   │                           #   MedicalBusiness JSON-LD (phone +91 91871 16003)
│   ├── page.tsx                # home → <HomePage/>; JSON-LD: WebSite, ItemList(programs), FAQPage, Physician
│   ├── globals.css             # system-font stacks + brand tokens
│   ├── sitemap.ts              # care.portea.com; home + 3 verticals + /pricing
│   ├── robots.ts               # care.portea.com sitemap; Host line removed
│   ├── icon.svg                # SVG favicon (Next file convention)
│   ├── apple-icon.png          # apple-touch-icon
│   ├── pricing/page.tsx        # NEW dedicated pricing page (cost FAQ schema)
│   ├── elder-care/page.tsx     # verticals → <LandingPage vertical={...}/>
│   ├── dementia/page.tsx
│   ├── post-discharge/page.tsx
│   ├── thank-you/page.tsx      # fires generate_lead + (pending) Google Ads conversion
│   ├── admin/{login,leads,users,analytics}/page.tsx
│   └── api/
│       ├── v1/intake/route.ts        # POST lead (partial early-capture + patch on completion); fires notifyNewLead via after()
│       ├── v1/track/route.ts         # POST call/whatsapp clicks AND page_view beacons
│       ├── v1/admin/leads.csv/route.ts
│       ├── admin/auth/route.ts       # login / session / logout
│       ├── admin/leads/route.ts      # list (CM-scoped)
│       ├── admin/leads/update/route.ts
│       ├── admin/leads/brief/route.ts
│       ├── admin/leads/transcribe/route.ts
│       ├── admin/leads/upload-token/route.ts
│       ├── admin/leads/care-plan/route.ts       # NEW: generate care plan
│       ├── admin/leads/care-plan.docx/route.ts  # NEW: download branded .docx
│       ├── admin/users/route.ts + [id]/route.ts
│       └── account/password/route.ts
├── components/
│   ├── home-page.tsx, landing-page.tsx, doctors-section.tsx, handwritten-note.tsx,
│   ├── stats-strip.tsx, lead-form.tsx, intake-chatbot.tsx, chatbot-trigger.tsx,
│   ├── contact-actions.tsx, mobile-menu.tsx, brand-logo.tsx,
│   ├── cm-dashboard.tsx         # CM dashboard incl. brief, transcription, and NEW care-plan UI
│   ├── users-admin.tsx, password-change-modal.tsx,
│   ├── google-ads-provider.tsx # direct gtag.js; src now strategy="lazyOnload"
│   ├── tracking-provider.tsx, scroll-tracker.tsx,
│   ├── page-view-tracker.tsx    # NEW: fires page_view beacon on landing pages (skips /admin, /thank-you)
│   ├── thank-you-conversion.tsx, ui-icons.tsx
│   └── (gtm-provider.tsx exists but is NOT mounted)
├── lib/
│   ├── db.ts                   # pg pool + ensureSchema() (leads, users, page_views, login_audit, ...)
│   ├── lead-store.ts           # appendLead, updateLeadIntake, updateLead, updateLeadBrief, updateLeadCarePlan, readLeads, getLeadById
│   ├── lead-types.ts           # LeadRecord, AiBrief, CarePlan, LeadAttribution, LifecycleStatus
│   ├── users.ts, password-overrides.ts, admin-auth.ts
│   ├── ai-brief.ts             # generateBrief() Gemini + stub
│   ├── transcribe.ts           # transcribeAudio() Gemini audio
│   ├── care-plan.ts            # NEW: generateCarePlan() (Gemini 2.5-pro, Vertex-ready) → structured JSON
│   ├── care-plan-docx.ts       # NEW: renderCarePlanDocx() → branded .docx buffer
│   ├── notify.ts               # NEW: notifyNewLead() (Gmail/Brevo/Resend; no PHI in body)
│   ├── page-views.ts           # NEW: recordPageView(), getPageViewStats(), getPageViewBreakdown() (IST)
│   ├── chatbot.ts, contact.ts, gtm.ts, utm.ts, api.ts
│   └── seo.ts                  # SITE_URL, buildVerticalMetadata (title absolute), serviceLd/faqLd/breadcrumbLd
└── data/verticals.ts           # all vertical content, homeStats, testimonials, FAQs
public/
├── favicon.ico                 # NEW (served statically; Next rejects RGB .ico in src/app)
├── portea-logo.svg, *.webp/*.png images
```

---

## 6. Postgres schema (auto-created by `ensureSchema()`)

**`leads`** — every lead. Columns: `id` PK, `kind` (`intake`|`call_click`|`whatsapp_click`), `created_at`, `vertical`, `full_name`, `phone`, `city`, `elder_name`, `condition`, `needs`, `relationship`, `situation`, `ab_variant`, `consent_given`, `status` (LifecycleStatus), `care_manager`, `follow_up_date`, `click_target`, `user_agent`, `ip_hash`, `attribution` JSONB, `notes`, `updated_at`, `updated_by`, `ai_brief` JSONB, `ai_brief_at`, `call_recording_url`, `call_observations`, `call_transcript`, `call_transcript_at`, **`care_plan` JSONB**, **`care_plan_at`**, **`care_plan_notes`**.

**`page_views`** (NEW) — aggregate traffic counter. Columns: `bucket` TIMESTAMPTZ (hour-truncated), `path`, `vertical`, `utm_campaign`, `views` BIGINT. PK (bucket, path, vertical, utm_campaign). (Was originally day-bucketed; migrated to hourly for the time filter.)

**`users`** — admin/CM accounts (seeded from `PORTEA_USERS_JSON` when empty). `id`, `email` UNIQUE, `name`, `role` CHECK IN (admin,cm), `password_hash`, `must_change_password`, `active`, timestamps.

**`login_audit`** — every login attempt. **`password_overrides`** — legacy, unused.

`LifecycleStatus`: `new | cm_contacted | plan_shared | follow_up | converted | active | lost`.

---

## 7. Key data types

- **`LeadRecord`** — see §6 columns as optional fields; `attribution` = `{utm_source/medium/campaign/term/content, gclid, fbclid, referrer, landing_path}`; `ai_brief` = `{summary:[{label,value}], questions:string[], generated_by}`.
- **`CarePlan`** (NEW) — `{ vertical, title, subtitle, patient_info[], clinical_summary[], care_goals[], service_plan[], equipment[], symptom_protocol[], escalation_protocol[], communication[], gaps[], generated_by }` (rows are `{label,value}`; service/equipment/symptom/escalation are typed objects). Mirrors the `portea-care-plan` skill's sections.

---

## 8. Features (status)

| Feature | Status |
|---|---|
| Lead form (3 fields) + chatbot (7 steps) → Postgres | ✅ live |
| **Early partial-lead capture** (save on name+phone, patch on completion) | ✅ live |
| Phone validation (10-digit Indian mobile) | ✅ |
| GTM/dataLayer events, GCLID/UTM capture | ✅ (GTM container removed; events still pushed) |
| Google Ads gtag (`AW-977307455`) | ✅ live, deferred to `lazyOnload` |
| Google Ads conversion on /thank-you | ⏳ waiting on `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` |
| CM dashboard, per-CM scoping | ✅ |
| Per-user auth (PBKDF2 + HMAC sessions) | ✅ |
| AI pre-call brief (Gemini) | ✅ |
| Call transcription | ✅ |
| **AI care plan generation + .docx** (Feature 3) | ✅ built & deployed; **.docx not yet runtime-tested** |
| **Lead-alert email** (no PHI, Gmail SMTP) | ✅ live |
| **Page-view analytics** (total, per-campaign, lead rate) | ✅ live |
| **Time filter + by-day/by-hour (IST) breakdowns** | ✅ live |
| **SEO fix** (self-canonical, sitemap, robots, OG, schema, /pricing, favicon) | ✅ live |
| **Lead routing by source** (paid→sales, organic→Akshita) | ⏳ not built |

---

## 9. Public pages

**Home (`home-page.tsx`) section order:** sticky nav → announcement bar → hero ("Your parent's care, coordinated", 2M+ patients / 135+ cities) → stats strip → "Nobody is in charge" problems → how it works (step 2 = "a care manager calls you back") → 8 service cards → specialized programs (3 cards, images) → simple pricing (₹1,999/month) → doctors section → family note → FAQ → footer. Plus `<IntakeChatbot/>` and `<FloatingContactButtons/>`.

**Verticals (`landing-page.tsx`):** shared template; headline + image + lead form + program cards + note + DoctorsSection + footer; "Who this isn't for" card has a **prominent "Visit portea.com" button** (intentional exit for niche-service seekers — this is a legit outbound link, not an SEO problem).

**/pricing (NEW):** dedicated indexable page — ₹1,999/month care management, what's included, what's billed separately, cost FAQ (with FAQPage schema), CTAs.

---

## 10. Auth & CM dashboard

Login `POST /api/admin/auth` → DB users (seeded from `PORTEA_USERS_JSON`), PBKDF2 verify, returns `must_change_password`. Session = HMAC-signed cookie `portea_admin_session`, 24h, HttpOnly+Secure+SameSite=Lax. Rate limit 5/(IP+email)/15min. Per-CM scoping: CMs see their own + unassigned leads; admins see all. The 6 seeded accounts: Mahesh, Atishay, Akshita (each admin + cm variants).

---

## 11. AI features

- **Pre-call brief** (`lib/ai-brief.ts`) — Gemini 2.5 Flash → `{summary(7 rows), questions(5-6)}`. Question prompt was updated to **drop generic intake questions** (language/faith etc.) and only produce condition-specific, non-obvious probes.
- **Transcription** (`lib/transcribe.ts`) — Gemini audio; Indian-language script rules; audio never persisted.
- **Care plan** (`lib/care-plan.ts` + `lib/care-plan-docx.ts`) — NEW. Doctor's notes + intake + transcript + observations → Gemini 2.5 Pro → structured `CarePlan` JSON → rendered to a Portea-branded `.docx`. Ported from the `portea-care-plan` skill (parse → detect vertical → fill sections, strict "never fabricate, flag gaps"). Vertex-ready. **Runtime-test the .docx before clinical use.**

---

## 12. Tracking / Ads (important history)

- **GTM-MQGX3H46 was removed.** It was Mahesh's **personal** GTM container (unpublished), which had leaked into production. Only the **direct Google Ads gtag `AW-977307455`** runs now (the ID Hiveminds provided). `gtag.js` is now `strategy="lazyOnload"` for mobile performance, with the init snippet kept early so conversions still queue/fire.
- **NFXT8K** is Hiveminds' own GTM container on the separate **lp.portea.com** landing pages — not this site.
- **Conversion** on /thank-you (`thank-you-conversion.tsx`) is pre-wired; it activates when `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` is set. **When Hiveminds sends the label, verify the conversion still fires now that gtag is lazyOnload.**

---

## 13. Analytics (`/admin/analytics`)

Built from the `leads` table + the `page_views` table. Shows: landing-page-view total, intake/call/whatsapp counts, total events, per-campaign rollup (views, intakes, lead rate), a **time-range filter** (last hour / 24h / 7d / 30d / all), and **"views over time" by day and by hour (IST)**. Page views are captured by `page-view-tracker.tsx` → `/api/v1/track` (kind `page_view`) → `recordPageView()`. Caveat: 83 real views were lost during the day→hour schema migration; an 83-view historical row dated ~Jun 7 was backfilled so the all-time total holds while recent windows stay clean.

---

## 14. Lead notifications (`lib/notify.ts`)

On every new lead, the intake route calls `notifyNewLead()` via Next's **`after()`** (so the serverless function stays alive to actually send — a plain fire-and-forget was getting frozen on response). **Privacy by design: the email contains NO patient data** — only program + city + a link to the secured dashboard. Active provider = **Gmail SMTP** (nodemailer, app password); Brevo/Resend supported as alternatives. Recipients in `LEAD_ALERT_TO`.

---

## 15. SEO (the big overhaul)

**Root cause (fixed):** `SITE_URL` defaulted to `https://www.portea.com` in `layout.tsx`, `sitemap.ts`, `robots.ts`, `lib/seo.ts`, so every canonical / sitemap URL / robots sitemap line / OG / JSON-LD declared the subdomain's identity as the main site → Google deindexed it. All four now default to `https://care.portea.com`. Verified live: self-canonical, own sitemap, correct robots, OG resolves.

**Phase 2 (on-page, done):** consistent numbers (**135+ cities, 2M+ patients** everywhere including meta), fixed double-brand titles (`title: {absolute}`), fixed "yourir" typo, schema phone `+91 91871 16003`, FAQPage schema on home, descriptive link text, **favicon** (favicon.ico in `public/`, apple-icon.png, icon.svg), **Physician schema** (Kavitha + Allia), **/pricing** page.

**Phase 3 (indexing — USER ACTION PENDING):** the Google Search Console verification meta tag is live (`z6GI8J7yo0kQhEAFqZoIT4Q_lyF6z9-7hSwkcZ6f-ow`). Still to do in GSC: click **Verify**, submit `sitemap.xml`, **Request Indexing** on `/`, `/elder-care`, `/dementia`, `/post-discharge`. Repeat in Bing Webmaster.

**Performance:** hero images got `sizes`; gtag deferred. Mobile lab scores swing 80→98 (simulated slow-4G + throttled CPU), desktop is 100, CLS 0. No web fonts. **No real-user (field) data yet** — Google ranks on field data, so lab numbers are not a blocker. Considered done.

**Still open (need data/decision):** `sameAs` real social URLs; schema street address; trust pages (`/about` + `/contact` buildable; `/privacy` + `/terms` should link to the main site's real, legally-reviewed policies).

---

## 16. Brand / style rules (STRICT — user preferences)

- Brand teal `#0f9aa8` (hover `#0b7c87`), WhatsApp green `#25d366`, accent orange `#ff5b2e`.
- **No em-dashes** anywhere (AI tell). Commas/colons/parentheses instead; en-dashes for ranges OK.
- **No negative parallelism** ("X, not Y").
- No marketing tropes; **no insider jargon** to customers (spell out "care manager", avoid SOP/triage/intake); **no hard time promises** ("shortly", not "within 12 hours"); no emergency/ambulance claims.
- Phone: `+91 91871 16003` / digits `919187116003` (in `lib/contact.ts`).

---

## 17. Doctor bios (final, in `doctors-section.tsx`)

- **Dr. Kavitha S Manjunath** — Clinical Head, Primary · Preventive · Elderly Care. 22+ years; MBBS, DNB Family Medicine, Geriatric Medicine & Gerontology cert; co-authors elder-care/post-discharge protocols.
- **Dr. Allia Rahaman** — AVP, Medical · Quality · Training. 14 years chronic/emergency/critical care; ACLS/BLS/PALS; owns the dementia-care protocol.

---

## 18. Open / pending tasks

1. **SEO Phase 3 (indexing) — user:** Verify in GSC, submit sitemap, Request Indexing on the 4 URLs (+ Bing).
2. **SEO remaining:** `sameAs` social URLs, schema street address, trust pages (`/about`, `/contact`, `/privacy`, `/terms`).
3. **Lead routing by source** (Akshita's ask): paid → sales team, organic → Akshita. Feasible off stored `gclid`/`utm`; extend `notify.ts` to pick recipients by source. Recommended: **one source-aware page** (swap displayed phone/WhatsApp by traffic source), not two pages. Need the **sales-team email**.
4. **Google Ads Conversion Label** from Hiveminds → set env → verify /thank-you conversion fires (gtag is lazyOnload).
5. **Rotate secrets** pasted in chat: Gmail app password, Neon DB password, Vercel CLI token.
6. **Care plan:** runtime-test `.docx` generation before Dr. Kavitha relies on it.
7. **Transfer** GTM/Gemini ownership off personal accounts (low priority).

---

## 19. Known gotchas

- **`git push` may not deploy** — use `vercel --prod --yes`.
- **`vercel env add` saves blank values** — use the REST API.
- **Env changes need a redeploy.**
- **Next's icon decoder rejects a non-RGBA `.ico` in `src/app/`** — keep `favicon.ico` in `public/`.
- **Neon Free tier has short PITR retention** — deleted rows are hard to recover after ~24h.
- **`after()` is required** for post-response work (email) on Vercel serverless.

---

## 20. People glossary

- **Mahesh** — the developer (intern).
- **Akshita Ganesh** — Head of Managed Care, owns the SOP, gives content/UX feedback. Owns the Vercel Pro team the project now lives under.
- **Atishay** — direct team lead.
- **Rama** — COO/CTO, prefers minimal/pragmatic moves; raised the LCP concern.
- **Dr. Kavitha S Manjunath / Dr. Allia Rahaman** — clinical leads (bios above).
- **Mitali Bhola** — Group Head at Hiveminds (paid-ads agency); handles Google Ads / conversion label.

---

## 21. Quick commands

```bash
cd "C:\Users\itsfo\OneDrive\Desktop\portea\Care_Plan"
npm run dev                       # local dev
npx tsc --noEmit                  # typecheck (run after every change)
npx next build                    # full build (use to reproduce build errors)
git add -A && git commit -m "..." && git push origin main
npx vercel --prod --yes           # DEPLOY (the reliable way)
npx vercel env pull .env.chk --environment=production --yes   # inspect prod env
```
