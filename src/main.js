import EpoxyTransport from '@mercuryworkshop/epoxy-transport';
import { StompController } from '@sysce/stomp';
import { Sticks } from 'sticks';
import './style.css';

const DIR = import.meta.env.BASE_URL + 'stomp/';
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  e.append(...kids);
  return e;
};
const ICONS = {
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  plus: 'M12 5v14M5 12h14', x: 'M18 6L6 18M6 6l12 12', back: 'M15 18l-6-6 6-6', fwd: 'M9 18l6-6-6-6',
  reload: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5', home: 'M3 11l9-8 9 8M5 10v10h14V10',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  bookmark: 'M6 3h12v18l-6-4-6 4z', clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-9-9',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
};
const setIcon = (node, name) => { node.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ICONS[name]}"/></svg>`; };
document.querySelectorAll('[data-i]').forEach((n) => setIcon(n, n.dataset.i));

/* ---------- persistence ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem('mw:' + k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem('mw:' + k, JSON.stringify(v)); } catch (e) { toast(`Could not save ${k}: ${e.message}`); } };
const ENGINES = { DuckDuckGo: 'https://duckduckgo.com/?q=%s', Google: 'https://www.google.com/search?q=%s', Brave: 'https://search.brave.com/search?q=%s', Bing: 'https://www.bing.com/search?q=%s' };
const DEF = { theme: 'dark', accent: '#8f7cff', wall: '', opacity: 72, radius: 14, anim: true, density: 'comfortable', engine: ENGINES.DuckDuckGo, wisp: import.meta.env.VITE_DEFAULT_WISP || '', greeting: 'Where to?', shortcuts: true, adblock: false, wasm: true };
let S = { ...DEF, ...load('settings', {}) };
if (!S.wisp && DEF.wisp) S.wisp = DEF.wisp;
const PERMS = 'fullscreen; autoplay; encrypted-media; picture-in-picture; gamepad; clipboard-read; clipboard-write; keyboard-map; screen-wake-lock; microphone; camera; display-capture; web-share';
const LINKS = [{ title: 'YouTube', url: 'https://www.youtube.com/' }, { title: 'GeForce NOW', url: 'https://play.geforcenow.com/' }, { title: 'Google', url: 'https://www.google.com/' }];
let bookmarks = load('bookmarks', []);
let history = load('history', []);

function applySettings() {
  const r = document.documentElement;
  r.dataset.theme = S.theme === 'auto' ? (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark') : S.theme;
  r.dataset.density = S.density; r.dataset.anim = S.anim ? 'on' : 'off';
  r.style.setProperty('--accent', S.accent); r.style.setProperty('--radius', S.radius + 'px');
  r.style.setProperty('--glass', S.opacity / 100);
  r.style.setProperty('--wall', S.wall ? `url("${S.wall.replace(/"/g, '%22')}")` : 'none');
  $('#greet').textContent = S.greeting;
  renderShortcuts();
}
let saveT; const setS = (patch) => { S = { ...S, ...patch }; clearTimeout(saveT); saveT = setTimeout(() => save('settings', S), 150); applySettings(); };

/* ---------- helpers ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 5000); }
const hostOf = (u) => { try { return new URL(u).host; } catch { return u; } };
const faviconOf = (u) => `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(hostOf(u))}`;
function resolve(v) {
  v = v.trim(); if (!v) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return v;
  if (!/\s/.test(v) && (/^localhost(:\d+)?([/?#]|$)/.test(v) || /^[^\s/]+\.[a-z]{2,}(:\d+)?([/?#]|$)/i.test(v))) return 'https://' + v;
  return S.engine.replace('%s', encodeURIComponent(v));
}
const validWisp = (w) => /^wss?:\/\/[^\s]+$/i.test(w) && (w.startsWith('wss://') || /^ws:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(w));
{ const qp = new URLSearchParams(location.search).get('wisp'); if (qp && validWisp(qp)) { S.wisp = qp; save('settings', S); window.history.replaceState(null, '', location.pathname); } }

/* ---------- tabs ---------- */
let controller = null, sticks = null, transport = null;
const tabs = []; let active = null, nextId = 1;
const byId = (id) => tabs.find((t) => t.id === id);

function newTab(url, { activate = true } = {}) {
  const t = { id: nextId++, url: '', title: 'New tab', icon: null, loading: false, home: true, frame: null, extFrame: null, back: false, fwd: false };
  tabs.push(t); t.node = el('div', { class: 'tab', role: 'tab' });
  t.node.addEventListener('click', () => activateTab(t.id));
  t.node.addEventListener('auxclick', (e) => { if (e.button === 1) closeTab(t.id); });
  t.node.addEventListener('contextmenu', (e) => { e.preventDefault(); menu(e.clientX, e.clientY, [
    ['Reload', () => reload(t)], ['Duplicate', () => newTab(t.url || undefined)], ['Close', () => closeTab(t.id)],
    ['Close other tabs', () => tabs.filter((x) => x !== t).forEach((x) => closeTab(x.id))]]); });
  $('#tabs').append(t.node); drawTab(t);
  try { sticks?.tabCreated(t.id); } catch {}
  if (activate) activateTab(t.id);
  if (url) navigate(t, url);
  saveSession(); return t;
}
function drawTab(t) {
  t.node.className = 'tab' + (t === active ? ' on' : '') + (t.loading ? ' busy' : '');
  const ic = t.icon ? el('img', { src: t.icon, alt: '' }) : el('i', { class: 'dot' });
  if (t.icon) ic.onerror = () => ic.replaceWith(el('i', { class: 'dot' }));
  t.node.replaceChildren(ic, el('span', { text: t.title }), el('button', { title: 'Close tab', 'aria-label': 'Close tab', onclick: (e) => { e.stopPropagation(); closeTab(t.id); }, text: '×' }));
}
function activateTab(id) { active = byId(id); tabs.forEach(drawTab); if (active?.pending && controller) { const u = active.pending; active.pending = null; navigate(active, u); } updateViews(); updateChrome(); try { sticks?.tabActivated(id); } catch {} renderExt(); }
function closeTab(id) {
  const i = tabs.findIndex((t) => t.id === id); if (i < 0) return; const t = tabs[i];
  t.frame?.element.remove(); t.extFrame?.remove(); t.node.remove(); tabs.splice(i, 1);
  try { sticks?.tabRemoved(id); } catch {}
  if (!tabs.length) newTab(); else if (active === t) activateTab(tabs[Math.min(i, tabs.length - 1)].id);
  saveSession();
}
const saveSession = () => save('session', tabs.map((t) => t.url).filter(Boolean));
function updateViews() {
  for (const t of tabs) { const show = t === active && !t.home; if (t.frame) t.frame.element.hidden = !show; if (t.extFrame) t.extFrame.hidden = !show; }
  $('#home-page').hidden = !(active && active.home);
}
function updateChrome() {
  const t = active; $('#addr').value = t?.home ? '' : (t?.url || '');
  $('#back').disabled = !t || t.home || !(t.back); $('#fwd').disabled = !t || t.home || !(t.fwd);
  $('#reload').disabled = !t || t.home;
  setIcon($('#reload'), t?.loading ? 'x' : 'reload'); $('#reload').title = t?.loading ? 'Stop' : 'Reload (Ctrl+R)';
  $('#load').classList.toggle('on', !!t?.loading);
  $('#star').classList.toggle('on', !!t && bookmarks.some((b) => b.url === t.url));
  document.title = t && !t.home && t.title ? `${t.title} – minason web v1.2` : 'minason web v1.2';
}
function setLoading(t, v) { t.loading = v; drawTab(t); if (t === active) updateChrome(); }

async function navigate(t, input) {
  const url = resolve(input); if (!url) return;
  if (!controller) { toast('The proxy is not running yet. Check the Wisp endpoint in Settings.'); return; }
  if (sticks?.isExtensionUrl(url)) return openExt(t, url);
  if (!t.frame) { t.frame = controller.createFrame(); t.frame.element.className = 'view'; t.frame.element.setAttribute('allow', PERMS); t.frame.element.setAttribute('allowfullscreen', ''); $('#viewport').append(t.frame.element); }
  t.url = url; t.home = false; t.title = hostOf(url); t.icon = null; updateViews(); setLoading(t, true);
  try { await t.frame.go(url); }
  catch (e) { toast(`Could not load ${hostOf(url)}: ${e?.message || e}`); }
  finally { setLoading(t, false); saveSession(); }
}
function openExt(t, url) {
  if (!t.extFrame) { t.extFrame = el('iframe', { class: 'view' }); $('#viewport').append(t.extFrame); }
  sticks.mountPage(t.extFrame, url, t.id);
  if (!t.extFrame.getAttribute('src')) t.extFrame.src = url;
  t.url = sticks.displayUrl?.(url) || url; t.home = false; t.title = 'Extension'; updateViews(); drawTab(t); updateChrome();
}
function reload(t) {
  if (!t || t.home) return;
  if (t.loading) { try { t.frame.element.contentWindow.stop(); } catch {} return setLoading(t, false); }
  if (!t.frame) return; setLoading(t, true);
  Promise.resolve(t.frame.reload()).catch((e) => toast(`Reload failed: ${e?.message || e}`)).finally(() => setLoading(t, false));
}
async function step(t, dir) { if (!t?.frame) return; try { await (dir < 0 ? t.frame.back() : t.frame.forward()); } catch (e) { toast(`Navigation failed: ${e?.message || e}`); } }
function goHome(t) { if (!t) return; t.home = true; t.title = 'New tab'; t.icon = null; drawTab(t); updateViews(); updateChrome(); $('#hsearch').focus(); }

function onNavigate(info, frame) {
  const t = tabs.find((x) => x.frame === frame); if (!t) return;
  t.url = info.url || t.url; t.title = info.title || hostOf(t.url); t.icon = info.icon || null; t.back = !!info.canGoBack; t.fwd = !!info.canGoForward;
  if (info.url && !t.home) addHistory(t.url, t.title);
  drawTab(t); if (t === active) updateChrome(); saveSession();
  try { sticks?.navigated(t.id, info); } catch {}
}
function addHistory(url, title) {
  if (history[0]?.url === url) { history[0].title = title; } else history.unshift({ url, title, at: Date.now() });
  history = history.slice(0, 500); save('history', history);
}

/* ---------- Wisp status / reconnect ---------- */
let probeT, backoff = 2000, conn = { state: 'none', msg: '' };
function setConn(state, msg = '') { const c = $('#conn'); c.className = state; c.title = `Wisp: ${state}${msg ? ' – ' + msg : ''}`; conn = { state, msg }; $('#wispstat') && ($('#wispstat').textContent = c.title); }
function probe() {
  clearTimeout(probeT);
  if (!validWisp(S.wisp)) return setConn('none');
  setConn('connecting'); let done = false, ws;
  const fail = (m) => { if (done) return; done = true; setConn('error', m); backoff = Math.min(backoff * 2, 60000); probeT = setTimeout(probe, backoff); };
  try { ws = new WebSocket(S.wisp); } catch (e) { return fail(e.message); }
  const to = setTimeout(() => { try { ws.close(); } catch {} fail('timed out'); }, 8000);
  ws.onopen = () => { if (done) return; done = true; clearTimeout(to); ws.close(); backoff = 2000; setConn('ok'); probeT = setTimeout(probe, 30000); };
  ws.onerror = () => { clearTimeout(to); fail('unreachable'); };
}
async function applyWisp(w) {
  w = w.trim();
  if (!validWisp(w)) { toast('Use a wss:// address (ws:// only for localhost).'); return false; }
  setS({ wisp: w }); backoff = 2000; probe();
  if (controller) { try { await controller.setTransport(new EpoxyTransport({ wisp: w })); toast('Wisp endpoint updated. Reload open tabs. Extensions keep the old transport until the page reloads.'); } catch (e) { toast(`Could not switch transport: ${e?.message || e}`); } }
  else boot();
  return true;
}

/* ---------- STicks host + toolbar ---------- */
const tabInfo = (t) => ({ id: t.id, index: tabs.indexOf(t), windowId: 1, active: t === active, highlighted: t === active, pinned: false, incognito: false, url: t.url || '', title: t.title || '', favIconUrl: t.icon || '', status: t.loading ? 'loading' : 'complete' });
const host = {
  getTabId(win) { for (let w = win; w; ) { const t = tabs.find((x) => x.frame?.element.contentWindow === w || x.extFrame?.contentWindow === w); if (t) return t.id; try { w = w.parent === w ? null : w.parent; } catch { return undefined; } } },
  getTab: (id) => { const t = byId(id); return t && tabInfo(t); },
  getTabs: () => tabs.map(tabInfo), getActiveTabId: () => active?.id,
  createTab: (url, o = {}) => tabInfo(newTab(url, { activate: o.active !== false })),
  navigateTab: (id, url) => navigate(byId(id), url), closeTab: (id) => closeTab(id), reloadTab: (id) => reload(byId(id)),
  activateTab: (id) => activateTab(id), goBack: (id) => step(byId(id), -1), goForward: (id) => step(byId(id), 1),
  openPopup: (extId, tabId) => openPopup(extId, tabId), closePopup: () => closePopup(),
};
let popup = null;
function closePopup() { if (popup) { try { sticks.unmountPopup(popup); } catch {} popup.remove(); popup = null; } }
function openPopup(extId, tabId) {
  closePopup(); const info = sticks.list(tabId).find((e) => e.id === extId); if (!info?.popup) return;
  popup = el('iframe', { class: 'popup', title: info.name || 'Extension popup' }); $('#popupHost').append(popup);
  popup.src = info.popup; sticks.mountPopup(popup, extId, tabId);
  popup.addEventListener('load', () => { try { const d = popup.contentDocument.documentElement; popup.style.width = Math.min(800, Math.max(25, d.scrollWidth)) + 'px'; popup.style.height = Math.min(600, Math.max(25, d.scrollHeight)) + 'px'; } catch {} });
}
function renderExt() {
  const box = $('#ext'); box.replaceChildren(); if (!sticks) return;
  let list = []; try { list = sticks.list(active?.id); } catch {}
  for (const e of list) {
    const b = el('button', { class: 'ib ext', title: e.title || e.name || 'Extension', onclick: (ev) => { ev.stopPropagation(); sticks.clickAction(e.id, active?.id); } }, el('img', { src: e.icon || '', alt: '' }));
    const bt = e.badge && typeof e.badge === 'object' ? e.badge.text : e.badge; if (bt) b.append(el('i', { class: 'badge', text: bt })); box.append(b);
  }
}

/* ---------- panels, menu ---------- */
function menu(x, y, items) {
  const m = $('#menu'); m.replaceChildren(...items.map(([l, fn]) => el('button', { text: l, onclick: () => { m.hidden = true; fn(); } })));
  m.hidden = false; m.style.left = Math.min(x, innerWidth - 200) + 'px'; m.style.top = Math.min(y, innerHeight - 40 * items.length - 12) + 'px';
}
let panelName = null;
function openPanel(name) { if (panelName === name) return closePanel(); panelName = name; $('#panel').classList.add('open'); $('#panel').setAttribute('aria-hidden', 'false'); renderPanel(); }
function closePanel() { panelName = null; $('#panel').classList.remove('open'); $('#panel').setAttribute('aria-hidden', 'true'); }
function renderPanel() {
  const b = $('#pbody'); b.replaceChildren(); $('#ptitle').textContent = { bookmarks: 'Bookmarks', history: 'History', settings: 'Settings' }[panelName] || '';
  if (panelName === 'bookmarks') list(b, bookmarks, 'No bookmarks yet. Press Ctrl+D on a page to add one.', (x) => { bookmarks = bookmarks.filter((y) => y !== x); save('bookmarks', bookmarks); renderPanel(); renderShortcuts(); updateChrome(); });
  if (panelName === 'history') {
    b.append(el('button', { class: 'btn ghost', text: 'Clear history', onclick: () => { history = []; save('history', history); renderPanel(); } }));
    list(b, history, 'Pages you visit will show up here.', (x) => { history = history.filter((y) => y !== x); save('history', history); renderPanel(); });
  }
  if (panelName === 'settings') renderSettings(b);
}
function list(box, arr, emptyMsg, remove) {
  if (!arr.length) return box.append(el('div', { class: 'empty', text: emptyMsg }));
  for (const x of arr.slice(0, 200)) box.append(el('div', { class: 'item', onclick: () => { (active.home ? navigate(active, x.url) : navigate(active, x.url)); closePanel(); },
    oncontextmenu: (e) => { e.preventDefault(); menu(e.clientX, e.clientY, [['Open in new tab', () => newTab(x.url)], ['Remove', () => remove(x)]]); } },
    el('img', { src: faviconOf(x.url), alt: '' }), el('div', {}, el('b', { text: x.title || x.url }), el('small', { text: x.url })),
    el('button', { class: 'ib sm', title: 'Remove', onclick: (e) => { e.stopPropagation(); remove(x); }, text: '×' })));
}
const row = (label, ctl, hint) => el('div', { class: 'row' }, el('label', { text: label }), ctl, hint ? el('small', { text: hint }) : '');
function renderSettings(b) {
  const sel = (key, opts) => { const s = el('select', { onchange: () => setS({ [key]: s.value }) }); for (const [l, v] of opts) s.append(el('option', { value: v, text: l, ...(S[key] === v ? { selected: '' } : {}) })); return s; };
  const rng = (key, min, max) => el('input', { type: 'range', min, max, value: S[key], oninput: (e) => setS({ [key]: +e.target.value }) });
  const chk = (key) => el('input', { type: 'checkbox', ...(S[key] ? { checked: '' } : {}), onchange: (e) => setS({ [key]: e.target.checked }) });
  const wisp = el('input', { type: 'text', value: S.wisp, placeholder: 'wss://your-relay.example/wisp/', spellcheck: 'false' });
  b.append(
    row('Wisp endpoint', el('div', { class: 'inline' }, wisp, el('button', { class: 'btn', text: 'Connect', onclick: () => applyWisp(wisp.value) })), 'Required. Bring your own relay; none is bundled.'),
    el('div', { class: 'row' }, el('small', { id: 'wispstat', text: `Wisp: ${conn.state}${conn.msg ? ' – ' + conn.msg : ''}` }), el('button', { class: 'btn ghost', text: 'Retry now', onclick: () => { backoff = 2000; probe(); } })),
    row('Content blocker', chk('adblock'), 'Off is faster and avoids YouTube/site breakage. Needs a page reload.'),
    row('Fast rewriter (WASM)', chk('wasm'), 'Falls back to JavaScript if it can\u2019t load. Needs a page reload.'),
    el('div', { class: 'row' }, el('button', { class: 'btn ghost', text: 'Reload to apply', onclick: () => location.reload() })),
    row('Theme', sel('theme', [['Dark', 'dark'], ['Light', 'light'], ['Match system', 'auto']])),
    row('Accent color', el('input', { type: 'color', value: S.accent, oninput: (e) => setS({ accent: e.target.value }) })),
    row('Panel transparency', rng('opacity', 30, 100)), row('Corner radius', rng('radius', 0, 28)),
    row('Animations', chk('anim')), row('Layout', sel('density', [['Comfortable', 'comfortable'], ['Compact', 'compact']])),
    row('Search engine', sel('engine', Object.entries(ENGINES))),
    row('Custom search URL', el('input', { type: 'text', placeholder: 'https://example.com/?q=%s', onchange: (e) => { if (e.target.value.includes('%s')) setS({ engine: e.target.value }); else toast('The URL must contain %s where the query goes.'); } })),
    row('Wallpaper URL', el('input', { type: 'text', value: S.wall.startsWith('data:') ? '' : S.wall, placeholder: 'https://…/image.jpg', onchange: (e) => setS({ wall: e.target.value.trim() }) })),
    row('Wallpaper file', el('input', { type: 'file', accept: 'image/*', onchange: (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 1.5e6) return toast('Choose an image under 1.5 MB, or use a URL.'); const r = new FileReader(); r.onload = () => setS({ wall: r.result }); r.readAsDataURL(f); } }), 'Stored in this browser.'),
    el('div', { class: 'row' }, el('button', { class: 'btn ghost', text: 'Remove wallpaper', onclick: () => setS({ wall: '' }) })),
    row('Home greeting', el('input', { type: 'text', value: S.greeting, oninput: (e) => setS({ greeting: e.target.value }) })),
    row('Show bookmarks on home', chk('shortcuts')),
  );
  const fi = el('input', { type: 'text', placeholder: 'Chrome Web Store ID' }), ff = el('input', { type: 'file', accept: '.crx,.zip' });
  const run = async (fn) => { if (!sticks) return toast('Extensions are unavailable until the proxy has started.'); try { await fn(); toast('Extension installed.'); renderExt(); } catch (e) { toast(`Install failed: ${e?.message || e}`); } };
  b.append(row('Install extension', el('div', { class: 'inline' }, fi, el('button', { class: 'btn', text: 'Install', onclick: () => fi.value.trim() && run(() => sticks.installFromWebStore(fi.value.trim())) })), 'Web Store ID, or pick a .crx/.zip below.'),
    row('Install from file', ff), el('div', { class: 'row' }, el('button', { class: 'btn', text: 'Install file', onclick: () => ff.files[0] && run(async () => sticks.install(await ff.files[0].arrayBuffer(), ff.files[0].name)) })),
    el('div', { class: 'row' }, el('button', { class: 'btn ghost', text: 'Reset all settings', onclick: () => { S = { ...DEF, wisp: S.wisp }; save('settings', S); applySettings(); renderPanel(); } })));
}
function renderShortcuts() {
  const box = $('#shortcuts'); box.replaceChildren(); if (!S.shortcuts) return;
  for (const x of [...LINKS, ...bookmarks].slice(0, 10)) box.append(el('div', { class: 'sc', tabindex: '0', onclick: () => active && navigate(active, x.url) }, el('img', { src: faviconOf(x.url), alt: '' }), el('span', { text: x.title || hostOf(x.url) })));
}
function toggleFs() { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) { toast(`Fullscreen failed: ${e?.message || e}`); } }
addEventListener('fullscreenchange', () => document.body.classList.toggle('fs', !!document.fullscreenElement));
const clock = () => { $('#clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }; clock(); setInterval(clock, 30000);
function toggleBookmark() {
  const t = active; if (!t || t.home || !t.url) return;
  const i = bookmarks.findIndex((b) => b.url === t.url);
  if (i >= 0) bookmarks.splice(i, 1); else bookmarks.unshift({ url: t.url, title: t.title });
  save('bookmarks', bookmarks); renderShortcuts(); updateChrome(); if (panelName === 'bookmarks') renderPanel();
}

/* ---------- boot (STomp + Epoxy + STicks) ---------- */
let booting = false;
const status = (msg, err) => { const s = $('#status'); s.textContent = msg; s.classList.toggle('err', !!err); };
async function boot() {
  if (controller || booting) return;
  if (!validWisp(S.wisp)) { status('Add a Wisp endpoint in Settings to start browsing.'); openPanel('settings'); return; }
  booting = true; status('Starting the proxy…');
  try {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable. Use HTTPS (or localhost) and a window that allows site data.');
    transport = new EpoxyTransport({ wisp: S.wisp });
    try { sticks = new Sticks({ host, transport }); } catch (e) { sticks = null; toast(`Extensions disabled: ${e?.message || e}`); }
    const registration = await StompController.register(DIR);
    controller = new StompController({
      serviceworker: registration, transport, directory: DIR, codec: 'xor', adblock: S.adblock, rewriter: S.wasm ? 'wasm' : 'js',
      ...(sticks ? { hooks: Sticks.hooks(), onRequest: (i) => sticks.onRequest(i) } : {}),
      onNavigate, onOpen: (url) => newTab(url),
    });
    await controller.wait();
    if (sticks) { try { sticks.attach(controller); await sticks.ready(); sticks.onChange(renderExt); } catch (e) { toast(`Extensions failed to start: ${e?.message || e}`); } }
    status(''); renderExt();
    const first = tabs[0]; const saved = load('session', []);
    if (saved.length) { navigate(first, saved[0]); saved.slice(1, 8).forEach((u) => { const t = newTab(null, { activate: false }); t.url = u; t.pending = u; t.home = false; t.title = hostOf(u); drawTab(t); }); }
  } catch (e) {
    controller = null; status(`The proxy could not start: ${e?.message || e}`, true); console.error(e);
  } finally { booting = false; }
}

/* ---------- wiring ---------- */
const go = (v) => { if (active) navigate(active, v); };
$('#newtab').onclick = () => { newTab(); $('#hsearch').focus(); };
$('#back').onclick = () => step(active, -1); $('#fwd').onclick = () => step(active, 1);
$('#reload').onclick = () => reload(active); $('#home').onclick = () => goHome(active);
$('#fs').onclick = toggleFs; $('#star').onclick = toggleBookmark; $('#bm').onclick = () => openPanel('bookmarks'); $('#hist').onclick = () => openPanel('history'); $('#set').onclick = () => openPanel('settings');
$('#pclose').onclick = closePanel;
$('#addr').addEventListener('keydown', (e) => { if (e.key === 'Enter') { go(e.target.value); e.target.blur(); } });
$('#addr').addEventListener('focus', (e) => e.target.select());
$('#hform').addEventListener('submit', (e) => { e.preventDefault(); go($('#hsearch').value); $('#hsearch').value = ''; });
$('#conn').onclick = () => openPanel('settings');
addEventListener('click', (e) => { $('#menu').hidden = true; if (popup && !e.target.closest('.ext,.popup')) closePopup(); });
addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  const act = (fn) => { e.preventDefault(); fn(); };
  if ((mod || e.altKey) && k === 't') act(() => $('#newtab').click());
  else if ((mod || e.altKey) && k === 'w') act(() => active && closeTab(active.id));
  else if (mod && k === 'l') act(() => $('#addr').focus());
  else if (mod && k === 'r') act(() => reload(active));
  else if (mod && k === 'd') act(toggleBookmark);
  else if (e.altKey && k === 'f') act(toggleFs);
  else if (e.altKey && k === 'arrowleft') act(() => step(active, -1));
  else if (e.altKey && k === 'arrowright') act(() => step(active, 1));
  else if (e.key === 'Escape') { closePanel(); closePopup(); $('#menu').hidden = true; }
});
matchMedia('(prefers-color-scheme:light)').addEventListener('change', () => S.theme === 'auto' && applySettings());
applySettings(); newTab(); probe(); boot();
