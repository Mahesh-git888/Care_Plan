// Best-effort "new lead" alert to the internal team.
//
// PRIVACY BY DESIGN: this deliberately contains NO patient details — no name,
// phone, condition, or elder name. Only the program + city + a link to the
// secured dashboard. The sensitive data stays in the authenticated DB; this is
// just a "go look" trigger, so nothing sensitive ever reaches a third-party
// mail provider or an inbox.
//
// No-op unless RESEND_API_KEY + LEAD_ALERT_FROM + LEAD_ALERT_TO are set, so it
// is safe to deploy before the email account is configured. Server-side only.

const PROGRAM_LABELS: Record<string, string> = {
  "elder-care": "Elder care",
  dementia: "Dementia care",
  "post-discharge": "Post-discharge",
};

export async function notifyNewLead(input: {
  vertical?: string;
  city?: string;
}): Promise<void> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
  const brevoKey = process.env.BREVO_API_KEY?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.LEAD_ALERT_FROM?.trim() || gmailUser || "";
  const toRaw = process.env.LEAD_ALERT_TO?.trim();
  const hasProvider = Boolean((gmailUser && gmailPass) || brevoKey || resendKey);
  if (!hasProvider || !from || !toRaw) return;

  const to = toRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) return;

  const program = input.vertical
    ? PROGRAM_LABELS[input.vertical] ?? input.vertical
    : "General";
  const city =
    input.city && input.city.trim() && input.city !== "Awaiting details"
      ? input.city.trim()
      : "City to confirm";
  const dashUrl =
    (process.env.LEAD_ALERT_DASHBOARD_URL?.trim() || "https://care.portea.com") +
    "/admin/leads";

  const subject = `New Portea lead — ${program}, ${city}`;
  const text = [
    "A new lead just came in.",
    "",
    `Program: ${program}`,
    `City: ${city}`,
    "",
    "Open the dashboard to see the details:",
    dashUrl,
    "",
    "For privacy, no patient details are included in this alert — they live only in the secured dashboard.",
  ].join("\n");

  try {
    if (gmailUser && gmailPass) {
      // Gmail's own SMTP (Nodemailer). Because Google sends and signs the
      // message, this works from a personal Gmail with no DNS/DKIM setup.
      // App password only; strip any spaces Google shows it with.
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, "") },
      });
      await transporter.sendMail({
        from: `Portea Leads <${gmailUser}>`,
        to: to.join(", "),
        subject,
        text,
      });
    } else if (brevoKey) {
      // Brevo (no DNS needed; a single verified sender is enough).
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: from, name: "Portea Leads" },
          to: to.map((email) => ({ email })),
          subject,
          textContent: text,
        }),
        signal: AbortSignal.timeout(8000),
      });
    } else {
      // Resend (requires a verified domain to send to the team).
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, text }),
        signal: AbortSignal.timeout(8000),
      });
    }
  } catch (err) {
    // Alerts are best-effort and must never affect a lead being saved.
    // eslint-disable-next-line no-console
    console.warn("[notify] lead alert failed (non-fatal)", err);
  }
}
