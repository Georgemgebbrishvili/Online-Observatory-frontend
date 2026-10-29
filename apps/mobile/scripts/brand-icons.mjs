// Draws the app icon, Android's adaptive and themed layers, the splash mark and the web
// favicon from the comet mark (apps/web/public/brand/logo-mark.svg). Run from apps/mobile:
// `node scripts/brand-icons.mjs`. sharp comes from the repo root's install.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));

const comet =
  "M13.0922 3.36946V1.73961C13.0922 1.27436 12.5543 1.01542 12.1906 1.30569L2.8604 8.75177C-0.321404 11.5593 -0.474794 16.4692 2.52582 19.4698C5.5263 22.4704 10.4363 22.3171 13.2437 19.1351L20.6898 9.80489C20.9801 9.44124 20.7211 8.90346 20.256 8.90346H18.6262C18.211 8.90346 17.9428 8.4646 18.132 8.09517L21.7925 0.950365C22.0383 0.470724 21.5251 -0.0425023 21.0451 0.203175L13.9005 3.86349C13.531 4.05286 13.0922 3.78447 13.0922 3.36946ZM7.99167 18.4452C5.53886 18.4452 3.55044 16.4567 3.55044 14.004C3.55044 11.5512 5.53872 9.56274 7.99167 9.5626C10.4445 9.5626 12.4329 11.5512 12.4329 14.004C12.4329 16.4568 10.4445 18.4452 7.99167 18.4452Z";

/** The mark, `scale` of the canvas wide, centred; `mono` draws it in one colour. */
function mark(size, scale, { background, mono } = {}) {
  const box = 21.485;
  const side = box / scale;
  const pad = (side - box) / 2;
  const view = `${0.1439 - pad} ${0.3757 - pad} ${side} ${side}`;
  const core = mono ? "#ffffff" : "url(#core)";
  const ink = mono ? "#ffffff" : "#F6F1E7";
  const ground = background
    ? `<rect x="${0.1439 - pad}" y="${0.3757 - pad}" width="${side}" height="${side}" fill="#0d0d0d"/>
       <circle cx="11" cy="11" r="${side * 0.42}" fill="url(#glow)"/>`
    : "";
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${view}">
  <defs>
    <linearGradient id="core" gradientUnits="userSpaceOnUse" x1="14.008" y1="3.555" x2="14.008" y2="12.437">
      <stop offset="0" stop-color="#FF8146"/><stop offset="1" stop-color="#C8102E"/>
    </linearGradient>
    <radialGradient id="glow" cx="11" cy="11" r="${side * 0.42}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#c8392a" stop-opacity="0.32"/><stop offset="1" stop-color="#c8392a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${ground}
  <circle cx="14.0083" cy="7.9960" r="4.4812" fill="${core}"/>
  <path transform="rotate(180 11 11)" d="${comet}" fill="${ink}" fill-rule="evenodd"/>
</svg>`);
}

const png = (svg) => sharp(svg).png({ compressionLevel: 9 }).toBuffer();

// Android masks the adaptive layer to a circle at most 66% of it wide: the mark sits
// inside that. The full icon (iOS, the web, old launchers) is a square on the canvas.
await writeFile(out("icon.png"), await png(mark(1024, 0.62, { background: true })));
await writeFile(out("adaptive-icon.png"), await png(mark(1024, 0.46)));
await writeFile(out("adaptive-monochrome.png"), await png(mark(1024, 0.46, { mono: true })));
await writeFile(out("splash-icon.png"), await png(mark(1024, 0.9)));
await writeFile(out("favicon.png"), await png(mark(96, 0.8, { background: true })));
