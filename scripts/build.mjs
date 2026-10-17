import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const entries = ['index.html', 'styles.css', 'script.js', 'assets', 'approach', 'capabilities', 'company', 'contact'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of entries) {
  await cp(join(root, entry), join(dist, entry), { recursive: true });
}

await mkdir(join(dist, 'work'), { recursive: true });
await cp(join(root, 'work', 'index.html'), join(dist, 'work', 'index.html'));

console.log(`Built ${entries.length + 1} source entries into dist/.`);
