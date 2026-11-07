// Builds the Night Sky page's data (ADR-085) into apps/web/public/sky/data/:
//
//   stars.bin            the Yale Bright Star Catalogue, 5th rev. (Hoffleit & Warren 1991,
//                        CDS/ADC V/50): Float32 records [x, y, z, V, B-V], x/y/z the J2000
//                        unit vector, brightest first
//   constellations.json  d3-celestial's lines and label points (BSD 3-Clause, Olaf Frohn)
//   milkyway.webp        d3-celestial's mw.json (five brightness steps of J. R. Vieira's
//                        outline catalogue) rasterised equirectangular: u = (RA+180°)/360°
//                        with RA in -180..180, v = (90° - Dec)/180°
//
// Run from the repository root: `node scripts/build-sky-data.mjs [sourceDir]`. Without a
// sourceDir it downloads the sources; with one it reads bsc5.dat.gz, constellations.json,
// constellations.lines.json and mw.json from there.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import sharp from "sharp";

const out = new URL("../apps/web/public/sky/data/", import.meta.url);
const sources = {
  "bsc5.dat.gz": "http://tdc-www.harvard.edu/catalogs/bsc5.dat.gz",
  "constellations.json":
    "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json",
  "constellations.lines.json":
    "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json",
  "mw.json": "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/mw.json",
};

async function source(name) {
  const dir = process.argv[2];
  if (dir) return readFile(new URL(name, `file://${dir.replace(/\/?$/, "/")}`));
  const response = await fetch(sources[name]);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const DEG = Math.PI / 180;
const unit = (raDeg, decDeg) => [
  Math.cos(decDeg * DEG) * Math.cos(raDeg * DEG),
  Math.cos(decDeg * DEG) * Math.sin(raDeg * DEG),
  Math.sin(decDeg * DEG),
];
const round = (value) => Math.round(value * 1e5) / 1e5;

await mkdir(out, { recursive: true });

// Stars. Byte columns from the catalogue's ReadMe (1-based, inclusive).
const field = (line, from, to) => line.slice(from - 1, to).trim();
const stars = [];
for (const line of gunzipSync(await source("bsc5.dat.gz")).toString("latin1").split("\n")) {
  const raH = field(line, 76, 77);
  const vmag = field(line, 103, 107);
  if (!raH || !vmag) continue; // the 14 removed entries carry no position
  const ra =
    (Number(raH) + Number(field(line, 78, 79)) / 60 + Number(field(line, 80, 83)) / 3600) * 15;
  const sign = field(line, 84, 84) === "-" ? -1 : 1;
  const dec =
    sign *
    (Number(field(line, 85, 86)) + Number(field(line, 87, 88)) / 60 + Number(field(line, 89, 90)) / 3600);
  const bv = field(line, 110, 114);
  stars.push({ ra, dec, v: Number(vmag), bv: bv === "" ? 0.6 : Number(bv) });
}
stars.sort((a, b) => a.v - b.v);
const records = new Float32Array(stars.length * 5);
stars.forEach((star, index) => {
  records.set([...unit(star.ra, star.dec), star.v, star.bv], index * 5);
});
await writeFile(new URL("stars.bin", out), Buffer.from(records.buffer));

// Constellations: each figure's polylines as flat J2000 unit vectors, and its label point.
const names = JSON.parse(await source("constellations.json"));
const lines = JSON.parse(await source("constellations.lines.json"));
const labels = new Map(names.features.map((f) => [f.id, f]));
const constellations = lines.features.map((feature) => {
  const meta = labels.get(feature.id);
  const [lon, lat] = meta.geometry.coordinates;
  return {
    id: feature.id,
    name: meta.properties.name,
    label: unit(lon, lat).map(round),
    lines: feature.geometry.coordinates.map((polyline) =>
      polyline.flatMap(([ra, dec]) => unit(ra, dec).map(round)),
    ),
  };
});
await writeFile(new URL("constellations.json", out), JSON.stringify(constellations));

// The Milky Way, five layers of outline, each brighter step on top, softened.
const W = 2048;
const H = 1024;
const milky = JSON.parse(await source("mw.json"));
const toXY = ([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
// A ring that crosses RA ±180° jumps a whole width: unwrap it so each step is under half a
// turn, and draw the layer three times, a width apart, so whatever spills off one edge
// comes back on the other.
// The faintest layer's two edges each run once around the sky: closing both through the
// north pole makes the even-odd fill the band between them.
const unwrap = (ring) => {
  let last = ring[0][0];
  const points = ring.map(([lon, lat]) => {
    while (lon - last > 180) lon -= 360;
    while (lon - last < -180) lon += 360;
    last = lon;
    return [lon, lat];
  });
  const first = points[0][0];
  return Math.abs(last - first) > 180 ? [...points, [last, 90], [first, 90]] : points;
};
const paths = milky.features
  .map((feature) => {
    // All three copies in one path, so the even-odd rule works across them too.
    const d = [-360, 0, 360]
      .flatMap((shift) =>
        feature.geometry.coordinates.flatMap((polygon) =>
          polygon.map(
            (ring) =>
              unwrap(ring)
                .map(([lon, lat], i) => `${i ? "L" : "M"}${toXY([lon + shift, lat]).map((n) => n.toFixed(1)).join(" ")}`)
                .join("") + "Z",
          ),
        ),
      )
      .join("");
    return `<path d="${d}" fill="#fff" fill-opacity="0.2" fill-rule="evenodd"/>`;
  })
  .join("");
const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${paths}</svg>`,
);
await writeFile(
  new URL("milkyway.webp", out),
  await sharp(svg).blur(6).grayscale().webp({ quality: 70 }).toBuffer(),
);

console.log(
  `stars.bin: ${stars.length} stars to V ${stars.at(-1).v}; constellations.json: ${constellations.length}; milkyway.webp: ${W}x${H}`,
);
