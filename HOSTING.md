# Hosting guide (minason web v1.2)

Three pieces: (1) the site, (2) your own Wisp relay, (3) an optional jsDelivr link.

## 1. The site (must be a real host)
Deploy `dist/` to Cloudflare Pages (see README). The proxy needs service workers, and those can't run from jsDelivr (see section 3). You end up with an address like `https://minason.pages.dev/`.

## 2. Your own Wisp relay
The relay is the server that actually fetches sites for people. Use **wisp-server-python** (MercuryWorkshop; the Scramjet-App README recommends it for production). It supports UDP, which GeForce NOW-style WebRTC traffic and HTTP/3 need. UDP is allowed unless you pass `--block-udp`.

### Option A: your own PC + Cloudflare Tunnel (easiest; residential IP)
1. Install Python 3.11+ and run:
   ```
   pip install wisp-python
   python -m wisp.server --host 127.0.0.1 --port 6001
   ```
2. Install `cloudflared` (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and run:
   ```
   cloudflared tunnel --url http://localhost:6001
   ```
   It prints an `https://something.trycloudflare.com` address. Your Wisp URL is `wss://something.trycloudflare.com/`. (Quick tunnels change every run; for a permanent one, create a named tunnel on your own domain.)
3. Your PC must stay on while people use it.

### Option B: a VPS (always on)
1. Rent a small Linux VPS, then:
   ```
   sudo apt update && sudo apt install -y python3-venv caddy
   python3 -m venv ~/wisp && ~/wisp/bin/pip install wisp-python
   ~/wisp/bin/python -m wisp.server --host 127.0.0.1 --port 6001
   ```
   Run it as a systemd service so it survives reboots.
2. Point a domain's DNS A record at the VPS, then put this in `/etc/caddy/Caddyfile` and run `sudo systemctl reload caddy` (Caddy gets the HTTPS certificate automatically):
   ```
   wisp.yourdomain.com {
       reverse_proxy 127.0.0.1:6001
   }
   ```
3. Useful flags: `--limits`, `--bandwidth`, `--connections` to cap abuse. Run `python -m wisp.server -h` for the full list.

### Testing it
Open the site, Settings → Wisp endpoint → paste the URL → Connect. The dot next to the address bar turns green. If it stays red, try adding `/wisp/` to the end; I couldn't confirm which path the server expects.

### Important caveats
- **YouTube/CAPTCHAs and datacenter IPs:** the Scramjet-App README warns YouTube and CAPTCHAs are unreliable from datacenter IPs. A VPS may get YouTube bot-checks; Option A (home connection) usually avoids that.
- **Video uses your bandwidth.** Many users streaming through one relay will saturate it.
- Port 6001 and the exact module path are what I used from the README; check `-h` if a flag is rejected.

## 3. jsDelivr: do you just use the SVG?
No. Two reasons:
- The proxy needs service workers, which need your own HTTPS origin and a scope under it. jsDelivr is a shared CDN and can't host that.
- jsDelivr typically serves HTML as plain text, so `index.html` wouldn't render from it.

What does work: use jsDelivr only to hand out a short link that **redirects to your real site**.
1. Put `jsdelivr/minason-web-v1.2.svg` in a **public GitHub repo** (the whole project is fine).
2. Edit both `https://YOUR-SITE.pages.dev/` URLs in that file to your real site, commit, and create a tag/release, e.g. `v1.2.0`.
3. Your share link is:
   ```
   https://cdn.jsdelivr.net/gh/YOUR_USER/YOUR_REPO@v1.2.0/jsdelivr/minason-web-v1.2.svg
   ```
4. Opening it redirects to your site (the "Open the browser" text is a clickable fallback). If it doesn't redirect, jsDelivr may be blocking scripts in SVGs, so use the plain site URL instead. I haven't tested this.
5. After changing the file, use a new tag, or purge: `https://purge.jsdelivr.net/gh/YOUR_USER/YOUR_REPO@v1.2.0/jsdelivr/minason-web-v1.2.svg`.

### Pre-setting your relay for everyone
Visitors otherwise have to paste a Wisp URL themselves. Either build with it set (Cloudflare Pages → Environment variable `VITE_DEFAULT_WISP=wss://your-relay/`), or share links like `https://YOUR-SITE.pages.dev/?wisp=wss://your-relay/`. Everyone who uses it then runs through your relay and your bandwidth.
