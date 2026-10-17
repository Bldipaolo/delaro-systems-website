import assert from 'node:assert/strict';
import { GET, POST } from '../api/contact.js';

const submit = (body, ip, origin = 'http://localhost:4173') => POST(new Request('http://localhost:4173/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: origin,
    'X-Forwarded-For': ip,
  },
  body: JSON.stringify(body),
}));

const rawSubmit = ({ body, ip, contentType = 'application/json', origin = 'http://localhost:4173' }) => POST(new Request('http://localhost:4173/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': contentType,
    Origin: origin,
    'X-Forwarded-For': ip,
  },
  body,
}));

const valid = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  company: 'Example Company',
  challenge: 'A repeated operational handoff creates delay and duplicate work across two teams.',
  website: '',
  startedAt: Date.now() - 5000,
};

assert.equal((await GET()).status, 405, 'GET should be rejected');
assert.equal((await submit(valid, 'test-origin', 'https://untrusted.example')).status, 403, 'untrusted origins should be rejected');
assert.equal((await rawSubmit({ body: 'name=Alex', ip: 'test-type', contentType: 'application/x-www-form-urlencoded' })).status, 415, 'non-JSON requests should be rejected');
assert.equal((await rawSubmit({ body: '{broken', ip: 'test-json' })).status, 400, 'malformed JSON should be rejected');
assert.equal((await submit({ ...valid, email: 'invalid' }, 'test-validation')).status, 422, 'invalid fields should be rejected');
assert.equal((await submit({ ...valid, company: 'x'.repeat(161) }, 'test-field-size')).status, 422, 'oversized fields should be rejected');
assert.equal((await submit({ ...valid, challenge: 'x'.repeat(17000) }, 'test-size')).status, 413, 'oversized requests should be rejected');
assert.equal((await submit({ ...valid, website: 'spam.example' }, 'test-honeypot')).status, 200, 'honeypot submissions should be silently accepted');
assert.equal((await submit(valid, 'test-config')).status, 503, 'missing delivery credentials should be explicit');

const originalFetch = globalThis.fetch;
process.env.RESEND_API_KEY = 'test-key';
process.env.CONTACT_TO_EMAIL = 'inquiries@example.com';
process.env.CONTACT_FROM_EMAIL = 'Delaro Systems <website@example.com>';
let deliveryRequest;
globalThis.fetch = async (url, options) => {
  deliveryRequest = { url, options };
  return Response.json({ id: 'test-message' }, { status: 200 });
};

const delivered = await submit(valid, 'test-delivery');
assert.equal(delivered.status, 201, 'configured inquiries should be delivered');
assert.equal(deliveryRequest.url, 'https://api.resend.com/emails', 'delivery should use the Resend email endpoint');
assert.match(deliveryRequest.options.headers.Authorization, /^Bearer /, 'delivery should authenticate server-side');
assert.equal(JSON.parse(deliveryRequest.options.body).reply_to, valid.email, 'replies should go to the inquirer');

await submit({ ...valid, challenge: 'A handoff includes <script>alert(1)</script> and creates repeated operational delay.' }, 'test-escaping');
assert.doesNotMatch(JSON.parse(deliveryRequest.options.body).html, /<script>/, 'HTML delivery should escape submitted markup');

globalThis.fetch = async () => new Response('provider detail must remain private', {
  status: 500,
  headers: { 'X-Request-Id': 'test-provider-request' },
});
const providerFailure = await submit(valid, 'test-provider-failure');
assert.equal(providerFailure.status, 502, 'provider failures should return a safe gateway error');
assert.doesNotMatch(await providerFailure.text(), /provider detail/, 'provider responses should not leak to the client');

globalThis.fetch = async () => { throw new Error('network detail must remain private'); };
const transportFailure = await submit(valid, 'test-transport-failure');
assert.equal(transportFailure.status, 502, 'provider transport failures should return a safe gateway error');
assert.doesNotMatch(await transportFailure.text(), /network detail/, 'transport errors should not leak to the client');

globalThis.fetch = async () => Response.json({ id: 'test-message' }, { status: 200 });
for (let attempt = 0; attempt < 5; attempt += 1) {
  assert.equal((await submit(valid, 'test-rate-limit')).status, 201, `rate-limit attempt ${attempt + 1} should pass`);
}
const limited = await submit(valid, 'test-rate-limit');
assert.equal(limited.status, 429, 'the sixth request in the window should be rate limited');
assert.equal(limited.headers.get('Retry-After'), '900', 'rate limiting should identify the retry window');
globalThis.fetch = originalFetch;

console.log('Contact endpoint validation, origin, content type, size, spam, escaping, delivery, safe failure, and local rate-limit states passed.');
