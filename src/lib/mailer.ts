import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(message: MailMessage): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_HOST is not configured; cannot send email.");
    }
    console.info(`\n[mailer] SMTP not configured. Email to ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`);
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "BTECHBUDDY <no-reply@btechbuddy.in>",
    ...message,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function passwordResetEmail(name: string, link: string): Omit<MailMessage, "to"> {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);
  return {
    subject: "Reset your BTECHBUDDY password",
    text: `Hi ${name},\n\nSomeone (hopefully you) asked to reset your BTECHBUDDY password.\nOpen this link within 30 minutes to choose a new one:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email; your password stays the same.\n\n— Buddy from BTECHBUDDY`,
    html: `<!doctype html><html><body style="margin:0;background:#0b1020;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#e9e7e1">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#121c38;border:2px solid #6d5df6;border-radius:16px;box-shadow:6px 6px 0 #6d5df6">
<tr><td style="padding:32px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;color:#22d3ee;font-weight:700">BTECHBUDDY</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#ffffff">Reset your password</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6">Hi ${safeName}, someone (hopefully you) asked to reset your password. This link works for 30 minutes.</p>
<a href="${safeLink}" style="display:inline-block;background:#6d5df6;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;border:2px solid #0b1020">Choose a new password</a>
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#94a3b8">If you didn't ask for this, ignore this email and your password stays the same.</p>
</td></tr></table></td></tr></table></body></html>`,
  };
}
