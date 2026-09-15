# QR code

Points at <https://mohamed-osama-aboelkheir.github.io/>.

- `portfolio-qr.svg` — vector; use this on slides so it stays sharp when projected
- `portfolio-qr.png` — 2000px raster, for anywhere that won't take SVG

Error correction level H, so the code still scans with up to ~30% of it obscured —
enough to drop a small logo in the centre if you want one.

Regenerate (only needed if the URL changes):

```bash
npx qrcode -o qr/portfolio-qr.svg -t svg -e H -m 2 "https://mohamed-osama-aboelkheir.github.io/"
npx qrcode -o qr/portfolio-qr.png -t png -e H -m 2 -w 2000 "https://mohamed-osama-aboelkheir.github.io/"
```

Attaching a custom domain later does **not** invalidate this code: GitHub redirects
`mohamed-osama-aboelkheir.github.io` to the custom domain.
