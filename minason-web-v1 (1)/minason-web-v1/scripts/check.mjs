// Usage: node scripts/check.mjs            static checks (no install needed)
//        node scripts/check.mjs --build    also runs `vite build` and checks dist/
//        node scripts/check.mjs --live https://your.site/base/   checks deployed assets, MIME types
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

let fails = 0;
const ok = (c, msg) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`); if (!c) fails++; };
const args = process.argv.slice(2);

for (const f of ['index.html', 'src/main.js', 'src/style.css', 'vite.config.js', 'package.json', 'public/minason-web-v1.svg']) ok(existsSync(f), `file exists: ${f}`);

const html = readFileSync('index.html', 'utf8'), js = readFileSync('src/main.js', 'utf8');
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const used = [...new Set([...js.matchAll(/\$\('#([\w-]+)'\)/g)].map((m) => m[1]))];
for (const id of used) ok(ids.has(id) || ['wispstat'].includes(id), `main.js element #${id} exists in index.html`);
ok(/minason web v1\.2/.test(html), 'branding reads "minason web v1.2"');
ok(!/wss?:\/\/(?!your-relay\.example)[a-z0-9.-]+\.[a-z]{2,}\/wisp/i.test(js), 'no hard-coded public Wisp relay');

const svg = readFileSync('public/minason-web-v1.svg', 'utf8');
ok(svg.includes('xmlns="http://www.w3.org/1999/xhtml"') && svg.includes('<foreignObject'), 'SVG declares XHTML namespace inside foreignObject');
try { execFileSync(process.execPath, ['--check', 'src/main.js']); ok(true, 'src/main.js parses'); } catch { ok(false, 'src/main.js parses'); }

if (args.includes('--build')) {
  try { execFileSync('npx', ['vite', 'build'], { stdio: 'inherit' }); ok(true, 'vite build succeeded'); } catch { ok(false, 'vite build succeeded'); }
  ok(existsSync('dist/index.html'), 'dist/index.html');
  ok(existsSync('dist/minason-web-v1.svg'), 'dist/minason-web-v1.svg');
  for (const d of ['dist/stomp', 'dist/sticks']) {
    ok(existsSync(d) && readdirSync(d).length > 0, `${d} copied`);
  }
  if (existsSync('dist/stomp')) {
    const names = readdirSync('dist/stomp');
    ok(names.some((n) => /serviceworker|sw/i.test(n)), `STomp service worker present (found: ${names.filter((n) => /\.m?js$/.test(n)).slice(0, 8).join(', ')})`);
    ok(names.includes('transportWorker.js') || names.some((n) => /transport/i.test(n)), 'STomp transport worker present');
  }
}

const li = args.indexOf('--live');
if (li >= 0) {
  const base = args[li + 1].replace(/\/?$/, '/');
  const probe = async (path, wantType) => {
    try { const r = await fetch(base + path); const t = r.headers.get('content-type') || ''; ok(r.ok && (!wantType || t.includes(wantType)), `${path}: ${r.status} ${t}`); }
    catch (e) { ok(false, `${path}: ${e.message}`); }
  };
  await probe('', 'text/html'); await probe('minason-web-v1.svg', 'image/svg+xml');
  await probe('stomp/Controller.js', 'javascript'); await probe('stomp/transportWorker.js', 'javascript');
  if (!base.startsWith('https://') && !/localhost|127\.0\.0\.1/.test(base)) ok(false, 'site is served over HTTPS (needed for service workers)');
}
console.log(fails ? `\n${fails} check(s) failed` : '\nAll checks passed');
process.exit(fails ? 1 : 0);
