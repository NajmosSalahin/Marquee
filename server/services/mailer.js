import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const DEV_LOG = fileURLToPath(new URL('../mailer.log', import.meta.url));

function devLog(message) {
  appendFileSync(DEV_LOG, `${new Date().toISOString()} ${message}\n`);
}

function shell({ title, body, buttonLabel, buttonUrl }) {
  const link = buttonUrl
    ? `<a href="${buttonUrl}" style="display:inline-block;background:#E3A857;color:#14100a;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;">${buttonLabel}</a>`
    : '';
  return `
  <div style="background:#0C0C0F;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:440px;margin:0 auto;background:#17171B;border:1px solid #27272C;border-radius:14px;padding:32px;">
      <p style="font-size:26px;font-weight:700;color:#EDEDEF;margin:0 0 20px;letter-spacing:-0.5px;">Marquee<span style="color:#E3A857;">.</span></p>
      <h1 style="color:#EDEDEF;font-size:18px;margin:0 0 10px;">${title}</h1>
      <p style="color:#8B8B93;font-size:14px;line-height:1.6;margin:0 0 24px;">${body}</p>
      ${link}
      <p style="color:#5a5a62;font-size:12px;line-height:1.5;margin:24px 0 0;">If you didn't ask for this, you can safely ignore this email. The link expires soon.</p>
    </div>
  </div>`;
}

export async function sendEmail({ to, subject, title, body, buttonLabel, buttonUrl }) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn(`[mailer] BREVO_API_KEY or BREVO_FROM_EMAIL missing — email not sent to ${to}`);
    return { skipped: true };
  }
  const html = shell({ title, body, buttonLabel, buttonUrl });
  if (process.env.NODE_ENV !== 'production') {
    devLog(`link for ${to}: ${buttonUrl || '(none)'}`);
  }
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Marquee', email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[mailer] Brevo responded ${res.status}: ${detail}`);
      return { skipped: true };
    }
    return { sent: true };
  } catch (err) {
    console.error('[mailer] send failed:', err.message);
    return { skipped: true };
  }
}

export function sendVerificationEmail(email, url) {
  return sendEmail({
    to: email,
    subject: 'Confirm your Marquee email',
    title: "One tap, you're in.",
    body: 'Confirm your email to finish setting up your Marquee account.',
    buttonLabel: 'Confirm email',
    buttonUrl: url,
  });
}

export function sendResetEmail(email, url) {
  return sendEmail({
    to: email,
    subject: 'Reset your Marquee password',
    title: 'Reset your password',
    body: 'Use the link below to choose a new password. It expires in one hour.',
    buttonLabel: 'Reset password',
    buttonUrl: url,
  });
}
