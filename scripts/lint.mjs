import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const routes = ['index.html', 'approach/index.html', 'capabilities/index.html', 'work/index.html', 'company/index.html', 'contact/index.html'];
const failures = [];

for (const route of routes) {
  const url = new URL(route, root);
  const html = await readFile(url, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const duplicateIds = [...ids].filter((id) => html.match(new RegExp(`\\sid="${id}"`, 'g'))?.length > 1);
  if (duplicateIds.length) failures.push(`${route}: duplicate IDs ${duplicateIds.join(', ')}`);
  if (!/<html lang="en">/.test(html)) failures.push(`${route}: missing language`);
  if (!/<meta name="description"/.test(html)) failures.push(`${route}: missing description`);
  if (!/<main[^>]+id="main"/.test(html)) failures.push(`${route}: missing main landmark`);
  if (!/class="skip-link"/.test(html)) failures.push(`${route}: missing skip link`);
  if (/href="\/(privacy|terms)\/?"/.test(html)) failures.push(`${route}: unapproved legal link`);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(match[1])) failures.push(`${route}: broken fragment #${match[1]}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Linted ${routes.length} public routes.`);
