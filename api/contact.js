const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
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

  const configured = (process.env.CONTACT_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const deployment = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const allowed = new Set([...configured, deployment, 'http://localhost:4173', 'http://127.0.0.1:4173']);
  return allowed.has(origin);
};

const rateLimited = (request) => {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const client = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
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

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'The request could not be read.' }, 400);
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const company = clean(body.company, 160);
  const challenge = clean(body.challenge, 3000);
  const website = clean(body.website, 200);
  const startedAt = Number(body.startedAt);
  const elapsed = Date.now() - startedAt;

  if (website || !Number.isFinite(startedAt) || elapsed < 2500 || elapsed > 2 * 60 * 60 * 1000) {
    return json({ ok: true, message: 'Thank you. Your inquiry has been received.' });
  }

  const fields = {};
  if (name.length < 2) fields.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Enter a valid work email.';
  if (company.length < 2) fields.company = 'Enter your company name.';
  if (challenge.length < 30) fields.challenge = 'Describe the operational challenge in at least 30 characters.';

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

  const response = await fetch('https://api.resend.com/emails', {
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

  if (!response.ok) {
    const providerError = await response.text();
    console.error('Contact delivery failed.', response.status, providerError.slice(0, 500));
    return json({ ok: false, message: 'Your inquiry could not be delivered. Please try again.' }, 502);
  }

  return json({ ok: true, message: 'Thank you. Your inquiry has been delivered.' }, 201);
}

export function GET() {
  return json({ ok: false, message: 'Method not allowed.' }, 405, { Allow: 'POST' });
}

