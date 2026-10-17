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
assert.equal((await submit({ ...valid, email: 'invalid' }, 'test-validation')).status, 422, 'invalid fields should be rejected');
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
globalThis.fetch = originalFetch;

console.log('Contact endpoint validation, origin, spam, configuration, and delivery states passed.');
