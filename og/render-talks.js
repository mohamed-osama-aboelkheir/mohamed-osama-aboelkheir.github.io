// After `npm run build`: for every share page under _site/t/, screenshot its
// spotlight box and save it as that page's 1200x630 link-preview image (the
// og:image path the page names, e.g. _site/img/og/<talk>--<event>.png).
//
// Uses Playwright. Set CHROME_PATH to use an installed Chrome instead of
// Playwright's own browser (the deploy workflow does).
const fs = require("fs");
const http = require("http");
const path = require("path");

let pw;
try { pw = require("playwright-core"); } catch { pw = require("playwright"); }

const SITE = path.join(__dirname, "..", "_site");
const TYPES = { ".html": "text/html", ".css": "text/css", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".js": "text/javascript" };

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? pages(p) : d.name === "index.html" ? [p] : [];
  });
}

// Who gave the talk: photo, name and one-line bio from site.yaml, shown under
// the box.
const yaml = require("js-yaml");
const site = yaml.load(fs.readFileSync(path.join(__dirname, "..", "src", "_data", "site.yaml"), "utf8"));
const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
const avatar = site.avatar
  ? "data:image/jpeg;base64," + fs.readFileSync(path.join(__dirname, "..", "src", "img", site.avatar)).toString("base64")
  : "";
const bio = [site.headline, site.brand].filter(Boolean).map(esc).join(' <span class="dot">·</span> ');

const frame = (src) => `<!doctype html><html><head><style>
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; box-sizing: border-box; padding: 28px 48px 26px;
    display: flex; flex-direction: column; gap: 20px; background: #0b0d12; color: #e8eaf0;
    font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
  .box { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
  .box img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .by { flex: none; display: flex; align-items: center; gap: 18px; padding: 0 6px; }
  .by img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
    border: 3px solid #232836; box-shadow: 0 0 0 5px rgba(91,140,255,.16); }
  .name { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
  .bio { margin: 4px 0 0; font-size: 21px; color: #a2a9bb; }
  .bio .dot { color: #6d748a; }
  .url { margin-left: auto; font-size: 18px; color: #6d748a; }
</style></head><body>
  <div class="box"><img src="${src}"></div>
  <div class="by">
    ${avatar ? `<img src="${avatar}" alt="">` : ""}
    <div><p class="name">${esc(site.name)}</p><p class="bio">${bio}</p></div>
    <span class="url">${esc((site.url || "").replace(/^https?:\/\//, ""))}</span>
  </div>
</body></html>`;

(async () => {
  const server = http.createServer((req, res) => {
    let p = path.join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
    if (!p.startsWith(SITE) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
  }).listen(0);
  const base = `http://localhost:${server.address().port}`;

  const exe = process.env.CHROME_PATH;
  const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  const ctx = await browser.newContext({
    viewport: { width: 860, height: 1200 }, deviceScaleFactor: 2, colorScheme: "dark",
  });
  const page = await ctx.newPage();

  const files = pages(path.join(SITE, "t"));
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const m = html.match(/property="og:image" content="https?:\/\/[^/"]+(\/img\/og\/[^"]+)"/);
    if (!m) continue;
    const url = base + "/" + path.relative(SITE, path.dirname(file)).split(path.sep).join("/") + "/";
    await page.goto(url, { waitUntil: "networkidle" });
    const box = await page.$("#spotlight .talk");
    if (!box) { console.warn("no spotlight on", url); continue; }
    // A few px of margin so the box's glow ring isn't clipped.
    const b = await box.boundingBox();
    const pad = 6;
    const shot = await page.screenshot({ animations: "disabled", fullPage: true,
      clip: { x: b.x - pad, y: b.y - pad, width: b.width + 2 * pad, height: b.height + 2 * pad } });

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(frame("data:image/png;base64," + shot.toString("base64")));
    const out = path.join(SITE, m[1]);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    // Back to 1x for the final 1200x630 file.
    const final = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await final.setContent(await page.content());
    await final.screenshot({ path: out });
    await final.close();
    await page.setViewportSize({ width: 860, height: 1200 });
    console.log("wrote", path.relative(SITE, out));
  }

  await browser.close();
  server.close();
})().catch((e) => { console.error(e); process.exit(1); });
