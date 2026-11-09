// Renders og/card.html to src/img/og-card.png (1200x630) with Playwright.
const path = require("path");
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto("file://" + path.join(__dirname, "card.html"));
  await page.screenshot({ path: path.join(__dirname, "..", "src", "img", "og-card.png") });
  await browser.close();
})();
