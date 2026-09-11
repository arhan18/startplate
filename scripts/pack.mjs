// ponytail: system `zip` via stdlib child_process — no deps for a pack script.
// Builds the frozen buyer snapshot: source + themes + docs + .env.example +
// license + readme. Excludes node_modules, dist, git, astro cache, secrets.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
const out = `startplate-frozen-v${version}.zip`;

execFileSync(
  'zip',
  ['-r', '-q', out, '.', '-x', 'node_modules/*', 'dist/*', '.git/*', '.astro/*', '*.zip', '.env', '.dev.vars'],
  { stdio: 'inherit' },
);
console.log(`packed ${out}`);
