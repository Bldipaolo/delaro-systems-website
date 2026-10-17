const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 16 * 1024;
const MAX_TRACKED_CLIENTS = 2000;
const submissions = new Map();

const json = (body, status = 200, headers = {}) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    ...headers,
  },
});

const clean = (value, maxLength) => typeof value === 'string'
  ? value.trim().replace(/\0/g, '').slice(0, maxLength)
  : '';

const cleanLine = (value, maxLength) => clean(value, maxLength).replace(/[\r\n\t]+/g, ' ');

const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
})[character]);

const allowedOrigin = (request) => {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  const configured = (process.env.CONTACT_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const deployment = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const allowed = new Set([...configured, requestOrigin, deployment, 'http://localhost:4173', 'http://127.0.0.1:4173']);
  return allowed.has(origin);
};

const rateLimited = (request) => {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')
    || '';
  const client = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();

  if (submissions.size > MAX_TRACKED_CLIENTS) {
    for (const [key, timestamps] of submissions) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) submissions.delete(key);
    }
  }

  const recent = (submissions.get(client) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  submissions.set(client, recent);
  return false;
};

export async function POST(request) {
  if (!allowedOrigin(request)) {
    return json({ ok: false, message: 'This request could not be verified.' }, 403);
  }

  if (rateLimited(request)) {
    return json({ ok: false, message: 'Too many attempts. Please wait before trying again.' }, 429, {
      'Retry-After': String(WINDOW_MS / 1000),
    });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return json({ ok: false, message: 'The request format was not accepted.' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, message: 'The request was too large.' }, 413);
  }

  let body;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ ok: false, message: 'The request was too large.' }, 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, message: 'The request could not be read.' }, 400);
  }

  const name = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 254).toLowerCase();
  const company = cleanLine(body.company, 160);
  const challenge = clean(body.challenge, 3000);
  const website = cleanLine(body.website, 200);
  const startedAt = Number(body.startedAt);
  const elapsed = Date.now() - startedAt;

  if (website || !Number.isFinite(startedAt) || elapsed < 2500 || elapsed > 2 * 60 * 60 * 1000) {
    return json({ ok: true, message: 'Thank you. Your inquiry has been received.' });
  }

  const fields = {};
  if (name.length < 2) fields.name = 'Enter your name.';
  else if (typeof body.name === 'string' && body.name.length > 100) fields.name = 'Keep your name under 100 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Enter a valid work email.';
  else if (typeof body.email === 'string' && body.email.length > 254) fields.email = 'Keep your email under 254 characters.';
  if (company.length < 2) fields.company = 'Enter your company name.';
  else if (typeof body.company === 'string' && body.company.length > 160) fields.company = 'Keep your company name under 160 characters.';
  if (challenge.length < 30) fields.challenge = 'Describe the operational challenge in at least 30 characters.';
  else if (typeof body.challenge === 'string' && body.challenge.length > 3000) fields.challenge = 'Keep the description under 3,000 characters.';

  if (Object.keys(fields).length) {
    return json({ ok: false, message: 'Review the highlighted fields.', fields }, 422);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error('Contact delivery is not configured: RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL are required.');
    return json({
      ok: false,
      code: 'CONTACT_NOT_CONFIGURED',
      message: 'The inquiry service is not configured yet. Please try again later.',
    }, 503);
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(company),
    challenge: escapeHtml(challenge).replace(/\n/g, '<br>'),
  };

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Operational inquiry — ${company}`,
        html: `<h1>New Delaro Systems inquiry</h1><p><strong>Name:</strong> ${safe.name}</p><p><strong>Work email:</strong> ${safe.email}</p><p><strong>Company:</strong> ${safe.company}</p><p><strong>Operational challenge:</strong><br>${safe.challenge}</p>`,
        text: `New Delaro Systems inquiry\n\nName: ${name}\nWork email: ${email}\nCompany: ${company}\n\nOperational challenge:\n${challenge}`,
      }),
    });
  } catch {
    console.error('Contact delivery failed because the provider could not be reached.');
    return json({ ok: false, message: 'Your inquiry could not be delivered. Please try again.' }, 502);
  }

  if (!response.ok) {
    const providerRequestId = response.headers.get('x-request-id') || 'unavailable';
    console.error('Contact delivery failed.', response.status, `provider request ${providerRequestId}`);
    return json({ ok: false, message: 'Your inquiry could not be delivered. Please try again.' }, 502);
  }

  return json({ ok: true, message: 'Thank you. Your inquiry has been delivered.' }, 201);
}

export function GET() {
  return json({ ok: false, message: 'Method not allowed.' }, 405, { Allow: 'POST' });
}
