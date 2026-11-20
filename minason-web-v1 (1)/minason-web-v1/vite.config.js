import { defineConfig } from 'vite';
import { createReadStream, existsSync, statSync, cpSync } from 'node:fs';
import { join, extname, normalize, resolve } from 'node:path';
import { stompPath } from '@sysce/stomp/path';
import { sticksPath } from 'sticks/path';

const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm',
  '.json': 'application/json', '.html': 'text/html', '.css': 'text/css', '.map': 'application/json' };

// Serves STomp's dist/ at /stomp/ and STicks' static/ at /sticks/ (same origin as the app),
// and copies both into the build output. Everything else is stock Vite.
function mounts(base) {
  const map = { stomp: stompPath, sticks: sticksPath };
  return {
    name: 'minason-mounts',
    configureServer(server) {
      for (const [name, dir] of Object.entries(map)) {
        server.middlewares.use(`${base}${name}/`.replace(/\/$/, ''), (req, res, next) => {
          const rel = normalize(decodeURIComponent((req.url || '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
          let file = join(dir, rel);
          if (!file.startsWith(resolve(dir))) return next();
          if (!existsSync(file) || statSync(file).isDirectory()) return next();
          res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-cache');
          createReadStream(file).pipe(res);
        });
      }
    },
    closeBundle() {
      for (const [name, dir] of Object.entries(map)) cpSync(dir, join('dist', name), { recursive: true });
    },
  };
}

export default defineConfig(() => {
  const base = process.env.BASE || '/';
  return { base, plugins: [mounts(base)], build: { target: 'es2022', sourcemap: false } };
});
