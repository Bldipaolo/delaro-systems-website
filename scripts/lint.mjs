import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const routes = ['index.html', 'approach/index.html', 'capabilities/index.html', 'work/index.html', 'company/index.html', 'contact/index.html'];
const failures = [];
const titles = new Map();
const descriptions = new Map();

const recordUnique = (collection, value, route, label) => {
  if (!value) return;
  if (collection.has(value)) failures.push(`${route}: duplicate ${label} also used by ${collection.get(value)}`);
  else collection.set(value, route);
};

const verifyLocalReference = async (value, pageUrl, route) => {
  if (!value || /^(?:https?:|mailto:|tel:|data:|#)/.test(value) || value.startsWith('/api/')) return;
  const target = value.startsWith('/') ? new URL(value.slice(1), root) : new URL(value, pageUrl);
  target.hash = '';
  target.search = '';
  try {
    await access(fileURLToPath(target));
  } catch {
    failures.push(`${route}: missing local reference ${value}`);
  }
};

for (const route of routes) {
  const url = new URL(route, root);
  const html = await readFile(url, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const duplicateIds = [...ids].filter((id) => html.match(new RegExp(`\\sid="${id}"`, 'g'))?.length > 1);
  if (duplicateIds.length) failures.push(`${route}: duplicate IDs ${duplicateIds.join(', ')}`);
  if (!/<html lang="en">/.test(html)) failures.push(`${route}: missing language`);
  if (!/<meta name="description"/.test(html)) failures.push(`${route}: missing description`);
  if (!/<meta name="viewport"/.test(html)) failures.push(`${route}: missing viewport metadata`);
  if (!/<meta property="og:title"/.test(html)) failures.push(`${route}: missing Open Graph title`);
  if (!/<meta property="og:description"/.test(html)) failures.push(`${route}: missing Open Graph description`);
  if (!/<meta property="og:type" content="website"/.test(html)) failures.push(`${route}: missing Open Graph type`);
  if (!/<link rel="icon"/.test(html)) failures.push(`${route}: missing favicon`);
  if (!/<main[^>]+id="main"/.test(html)) failures.push(`${route}: missing main landmark`);
  if (!/class="skip-link"/.test(html)) failures.push(`${route}: missing skip link`);
  if (/href="\/(privacy|terms)\/?"/.test(html)) failures.push(`${route}: unapproved legal link`);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]?.trim();
  if (!title) failures.push(`${route}: missing title`);
  recordUnique(titles, title, route, 'title');
  recordUnique(descriptions, description, route, 'description');

  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(match[1])) failures.push(`${route}: broken fragment #${match[1]}`);
  }

  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]*"/.test(image[0])) failures.push(`${route}: image missing alt attribute`);
    if (!/\bwidth="\d+"/.test(image[0]) || !/\bheight="\d+"/.test(image[0])) failures.push(`${route}: image missing intrinsic dimensions`);
  }

  const references = [
    ...[...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/\bsrcset="([^"]+)"/g)].flatMap((match) => match[1].split(',').map((candidate) => candidate.trim().split(/\s+/)[0])),
  ];
  await Promise.all(references.map((reference) => verifyLocalReference(reference, url, route)));
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Linted ${routes.length} public routes.`);
