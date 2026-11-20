# minason web v1.2

Proxy browser built on STomp (`@sysce/stomp`), Epoxy transport and STicks extensions, with a Vite front end.

## Status: written, not run
This project was written in a sandbox with no network access. `npm install`, `vite build`, and every browser behavior are **unverified**. Only these were run: the static checks in `scripts/check.mjs` (file/ID consistency, SVG namespace, `node --check` of `src/main.js`). Use the manual checklist below to verify.

## Run locally
```
npm install
npm run dev          # http://localhost:5173
```
You need a Wisp relay. Run your own (e.g. wisp-server-node) and paste its `wss://…/wisp/` URL in **Settings → Wisp endpoint** (`ws://localhost:…` is accepted for local testing). No relay is bundled or hard-coded.

If install fails on STicks (`github:abstractsvg/STicks`), check whether the repo needs a build step; it exports `sticks` and `sticks/path`. Pin `@sysce/stomp` and the Epoxy build to exact versions once you have a working combination. STomp's README recommends its own patched epoxy build (`deploy/epoxy/`) over the npm release; this project uses the npm package, so concurrent-request issues described there may appear.

See `HOSTING.md` for Wisp relay setup and the jsDelivr link.

## Layout
- `index.html`, `src/main.js`, `src/style.css`: the browser UI and boot sequence (`register` → `new StompController` → `wait` → `sticks.attach` → `sticks.ready`).
- `vite.config.js`: serves and copies STomp `dist/` to `/stomp/` and STicks `static/` to `/sticks/` on your own origin.
- `public/minason-web-v1.svg`: SVG shell (XHTML `foreignObject` embedding `index.html`). Open it as a top-level document at the same origin.
- `scripts/check.mjs`: test script. `public/_headers`: Cloudflare cache headers.

## Deploy: Cloudflare Pages (recommended)
1. Push to GitHub. Cloudflare → Pages → Connect to Git.
2. Build command `npm install && npm run build`, output directory `dist`, no `BASE` variable needed.
3. Use HTTPS (default). Prefer your own domain: STomp same-origin mode is not a security boundary, so don't share an origin with other apps.
4. Verify: `node scripts/check.mjs --live https://YOUR.pages.dev/`

## Deploy: GitHub Pages
1. Settings → Pages → Source: GitHub Actions. Push to `main`; `.github/workflows/pages.yml` builds with `BASE=/<repo>/`.
2. Caveat: `<user>.github.io` is one origin shared by all your repos' pages. Use a custom domain if you can.
3. Verify with `--live https://<user>.github.io/<repo>/`.

## jsDelivr
Only the font stylesheet (`@fontsource-variable/manrope`) comes from jsDelivr. STomp, STicks and the service workers must stay on your origin because of service-worker scope.

## Manual test checklist
1. `npm run dev`; console has no red errors on load; status says to add a Wisp endpoint.
2. Settings → enter relay URL → dot turns green; stop the relay → dot turns red and retries with backoff.
3. DevTools → Application → Service Workers: worker under `/stomp/` (and `/sticks/` after extensions load) is activated.
4. Type `example.com` → loads; type a phrase → search engine opens. Title and favicon appear on the tab.
5. Back/forward enable correctly after two navigations; reload works; clicking reload during load stops it.
6. New tab (Alt+T), close (Alt+W), middle-click close, right-click tab menu, closing last tab opens a fresh one.
7. Ctrl+L focuses address; Ctrl+D toggles bookmark; Bookmarks and History panels open/remove/open-in-new-tab.
8. Reload the page: settings, bookmarks, history and open tabs persist.
9. Theme, accent, transparency, radius, density, animations and wallpaper update live without layout breaks; narrow the window below 720px.
10. Open `public/minason-web-v1.svg` directly (via dev server or deployed URL): it fills the viewport and the app works inside it.
11. Settings → install a Web Store ID (e.g. `ddkjiahejlhfcafbddmgiahcphecmpfh`): icon appears in the toolbar, popup opens and sizes itself.
12. Open a site that uses WebSockets and one that is HTTP-heavy; note failures (STomp documents WebSocket limits with epoxy).

## v1.2 changes
- Faster defaults: content blocker off, WASM rewriter on (both toggles in Settings; reload to apply), lazy-loaded restored tabs, no blur over the page area, debounced saves.
- Frames get fullscreen/autoplay/gamepad/clipboard/mic/camera permissions; Fullscreen button (Alt+F) hides the browser chrome.
- Home tiles for YouTube, GeForce NOW and Google; clock; refreshed look.
- `?wisp=` URL parameter and `VITE_DEFAULT_WISP` build variable.
- YouTube and GeForce NOW **compatibility is unverified**: nothing here blocks them, but playback depends on your relay, and GeForce NOW needs WebRTC through a UDP-capable relay. Test both and report back.

## Not implemented / known gaps
- Extension manager: install (ID or file) works through STicks; listing with enable/disable/remove and an options-page button are **not built**, because I couldn't confirm those STicks method names. Only the toolbar and popups exist.
- STicks field names (`list()` items: `id`, `name`, `icon`, `title`, `badge`, `popup`) and `mountPage` behavior follow the README prose and are unverified.
- No origin isolation (`RemoteController`): STicks requires the same-origin controller.
- Switching the Wisp endpoint at runtime updates STomp's transport only; STicks keeps the old one until reload.
- No Stop for in-flight proxy requests beyond `window.stop()` on the frame; no tab drag-reorder; browser-reserved shortcuts (Ctrl+T/W) may be swallowed, so Alt+T/Alt+W are provided.
- No performance claims: STomp's own README benchmarks show it slower than native and than Scramjet on load time; nothing here was measured.
- Licensing: STomp is GPL-3.0, so a deployed build carries GPL obligations. STicks' license was not visible in its README; confirm with its author before redistributing.
