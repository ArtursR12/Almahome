import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';

export const prerender = false;

// Rate limit: 5 requests per IP per hour (in-memory).
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5;
const ipHits = new Map<string, number[]>();

const ContactSchema = z.object({
  name:    z.string().trim().min(2).max(100),
  phone:   z.string().trim().min(6).max(20),
  email:   z.string().trim().email().max(254),
  message: z.string().trim().max(2000).optional().default(''),
  apartmentNumber: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === '') return undefined;
      const n = typeof v === 'number' ? v : parseInt(v, 10);
      return Number.isFinite(n) ? n : undefined;
    }),
  honeypot: z.string().optional(),
});

function clientIp(request: Request, clientAddress?: string): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    clientAddress ||
    'unknown'
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

function ownerEmailHtml(d: {
  name: string;
  phone: string;
  email: string;
  message: string;
  apartmentNumber?: number;
  siteOrigin: string;
}): string {
  const apt = d.apartmentNumber
    ? `<tr><td style="padding:6px 12px 6px 0;color:#6B5D52;">Dzīvoklis</td><td style="padding:6px 0;color:#2A1F1A;font-weight:600;">
         <a href="${d.siteOrigin}/dzivokli/${d.apartmentNumber}" style="color:#5A1F2A;text-decoration:none;">Nr. ${d.apartmentNumber}</a>
       </td></tr>`
    : '';
  const msg = d.message
    ? `<div style="margin-top:24px;padding:18px;background:#F5EFE6;border-radius:8px;">
         <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6B5D52;margin-bottom:8px;">Ziņojums</div>
         <div style="white-space:pre-wrap;color:#2A1F1A;line-height:1.6;">${escapeHtml(d.message)}</div>
       </div>`
    : '';
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#FAF6EE;margin:0;padding:32px;color:#2A1F1A;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <h1 style="font-family:Georgia,serif;color:#5A1F2A;font-weight:500;margin:0 0 6px;">Jauns pieteikums</h1>
      <p style="margin:0 0 24px;color:#6B5D52;font-size:14px;">no almahome.lv</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 12px 6px 0;color:#6B5D52;width:120px;">Vārds</td><td style="padding:6px 0;color:#2A1F1A;font-weight:600;">${escapeHtml(d.name)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6B5D52;">Tālrunis</td><td style="padding:6px 0;color:#2A1F1A;"><a href="tel:${escapeHtml(d.phone)}" style="color:#5A1F2A;text-decoration:none;">${escapeHtml(d.phone)}</a></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6B5D52;">E-pasts</td><td style="padding:6px 0;color:#2A1F1A;"><a href="mailto:${escapeHtml(d.email)}" style="color:#5A1F2A;text-decoration:none;">${escapeHtml(d.email)}</a></td></tr>
        ${apt}
      </table>
      ${msg}
    </div></body></html>`;
}

function clientCopyHtml(d: { name: string; apartmentNumber?: number }): string {
  const aptLine = d.apartmentNumber
    ? `<p style="margin:0 0 16px;color:#2A1F1A;">Esam saņēmuši Jūsu pieteikumu par dzīvokli <strong>Nr. ${d.apartmentNumber}</strong>.</p>`
    : `<p style="margin:0 0 16px;color:#2A1F1A;">Esam saņēmuši Jūsu pieteikumu.</p>`;
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#FAF6EE;margin:0;padding:32px;color:#2A1F1A;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <h1 style="font-family:Georgia,serif;color:#5A1F2A;font-weight:500;margin:0 0 6px;">Paldies, ${escapeHtml(d.name)}!</h1>
      <p style="margin:0 0 20px;color:#6B5D52;font-size:14px;letter-spacing:0.05em;">ALMA HOME</p>
      ${aptLine}
      <p style="margin:0 0 16px;color:#2A1F1A;line-height:1.6;">
        Sazināsimies ar Jums tuvāko 24 stundu laikā darba dienās, lai vienotos par tālāko soli.
      </p>
      <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #E8DDC9;color:#6B5D52;font-size:13px;line-height:1.6;">
        Ja Jums ir steidzami jautājumi, zvaniet pa <a href="tel:+37126148011" style="color:#5A1F2A;">+371 26 148 011</a>
        vai rakstiet uz <a href="mailto:info@almahome.lv" style="color:#5A1F2A;">info@almahome.lv</a>.
      </p>
      <p style="margin:24px 0 0;color:#6B5D52;font-size:12px;">Mores iela 15, Rīga, LV-1034 · almahome.lv</p>
    </div></body></html>`;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let raw: Record<string, unknown>;
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      raw = (await request.json()) as Record<string, unknown>;
    } else {
      const fd = await request.formData();
      raw = Object.fromEntries(fd.entries());
    }
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Honeypot — bots fill this; humans don't see it. Return 200 silently.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') {
    return Response.json({ ok: true }, { status: 200 });
  }

  const ip = clientIp(request, clientAddress);
  if (rateLimited(ip)) {
    return Response.json(
      { error: 'Pārāk daudz pieprasījumu, mēģiniet pēc stundas' },
      { status: 429 },
    );
  }

  const parsed = ContactSchema.safeParse({
    name:            raw.name,
    phone:           raw.phone,
    email:           raw.email,
    message:         raw.message,
    apartmentNumber: raw.apartmentNumber,
    honeypot:        raw.website,
  });
  if (!parsed.success) {
    return Response.json({ error: 'Lūdzu pārbaudiet ievadītos datus' }, { status: 400 });
  }
  const data = parsed.data;

  const apiKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const infoEmail = import.meta.env.INFO_EMAIL;
  if (!apiKey || !fromEmail || !infoEmail) {
    console.error('[contact] Missing Resend env vars (RESEND_API_KEY/RESEND_FROM_EMAIL/INFO_EMAIL)');
    return Response.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const url = new URL(request.url);
  const siteOrigin = `${url.protocol}//${url.host}`;
  const subject = data.apartmentNumber
    ? `Pieteikums dzīvoklim Nr.${data.apartmentNumber}`
    : 'Jauns pieteikums no almahome.lv';

  try {
    const ownerSend = await resend.emails.send({
      from: fromEmail,
      to: infoEmail,
      replyTo: data.email,
      subject,
      html: ownerEmailHtml({ ...data, message: data.message ?? '', siteOrigin }),
    });
    if (ownerSend.error) throw new Error(ownerSend.error.message);

    // Customer copy — send AFTER owner so a bounce on the customer address still
    // delivers the lead to the owner.
    await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: 'Paldies par pieteikumu — ALMA HOME',
      html: clientCopyHtml({ name: data.name, apartmentNumber: data.apartmentNumber }),
    }).catch((e) => {
      console.error('[contact] Customer copy failed (lead still saved):', e);
    });

    console.log(`[contact] Sent: ${data.email} → apt=${data.apartmentNumber ?? '—'} ip=${ip}`);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[contact] Send failed:', e);
    return Response.json(
      { error: 'Neizdevās nosūtīt pieteikumu. Lūdzu mēģiniet vēlreiz vai zvaniet +371 26 148 011.' },
      { status: 500 },
    );
  }
};
