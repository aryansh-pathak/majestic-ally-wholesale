import "server-only";
import { Resend } from "resend";

/**
 * Email sending via Resend. If RESEND_API_KEY is not set (e.g. local preview),
 * emails are logged to the server console instead of sent, so nothing breaks.
 */
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail({ to, from, subject, html, replyTo }: SendArgs) {
  if (!resend) {
    console.log(
      `[email:dev] (no RESEND_API_KEY) would send "${subject}" to ${to}`
    );
    return { ok: true, dev: true as const };
  }
  try {
    const res = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });
    if (res.error) {
      console.error("[email] Resend error:", res.error);
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: String(err) };
  }
}

/** Simple, brand-styled HTML wrapper for transactional emails. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#faf7f1;font-family:Arial,Helvetica,sans-serif;color:#20211f;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e6e0d5;border-bottom:none;border-radius:8px 8px 0 0;padding:20px 20px 14px;text-align:center;">
        <img src="https://majesticallyproducts.com/cdn/shop/files/Logo_PNG.png?v=1721900841&width=400" alt="Majestic Ally" style="height:42px;width:auto;" />
        <div style="margin-top:6px;font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#b07a3c;">Wholesale</div>
      </div>
      <div style="background:#ffffff;border:1px solid #e6e0d5;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
        <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <p style="color:#8a857c;font-size:12px;margin-top:16px;">Amay International LLC · Naperville, IL · majesticallyproducts.com</p>
    </div>
  </body></html>`;
}
