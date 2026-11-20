// STicks: serves installed extensions' files at <scope>ext/<id>/<path> from
// Cache Storage, with page.js put first in every extension page.
const CACHE = 'sticks-files'
const scope = new URL(self.registration.scope).pathname
const prefix = `${scope}ext/`

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== location.origin || !url.pathname.startsWith(prefix)) return
  event.respondWith(serve(url))
})

const bootstrap = () => `<script src="${scope}page.js"></script>`

function inject(html) {
  for (const pattern of [/<head\b[^>]*>/i, /<html\b[^>]*>/i, /<!doctype[^>]*>/i]) {
    const found = pattern.exec(html)
    if (found) {
      const at = found.index + found[0].length
      return html.slice(0, at) + bootstrap() + html.slice(at)
    }
  }
  return bootstrap() + html
}

function background(id, params) {
  const type = params.get('m') === '1' ? ' type="module"' : ''
  const scripts = params
    .getAll('s')
    .map((src) => `<script src="${prefix}${id}/${src.split('/').map(encodeURIComponent).join('/')}"${type}></script>`)
    .join('')
  return new Response(`<!doctype html><html><head><meta charset="utf-8">${bootstrap()}</head><body>${scripts}</body></html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

async function serve(url) {
  const found = /^([a-p]{32})\/(.*)$/.exec(url.pathname.slice(prefix.length))
  if (!found) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  const [, id, path] = found
  if (path === '_sticks_background.html') return background(id, url.searchParams)
  const cache = await caches.open(CACHE)
  let response = await cache.match(url.origin + url.pathname)
  if (!response && (path === '' || path.endsWith('/'))) response = await cache.match(`${url.origin}${url.pathname}index.html`)
  if (!response) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  const type = response.headers.get('content-type') || ''
  if (!type.startsWith('text/html')) return response
  return new Response(inject(await response.text()), { headers: { 'content-type': type, 'cache-control': 'no-cache' } })
}
