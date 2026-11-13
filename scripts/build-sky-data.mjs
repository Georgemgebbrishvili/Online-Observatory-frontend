// Builds the Night Sky page's data (ADR-085) into apps/web/public/sky/data/:
//
//   stars.bin            the Yale Bright Star Catalogue, 5th rev. (Hoffleit & Warren 1991,
//                        CDS/ADC V/50): Float32 records [x, y, z, V, B-V, pmRA, pmDec],
//                        x/y/z the J2000 unit vector at epoch 2000, the proper motions in
//                        arcseconds a year (pmRA is on the sky, already times cos Dec),
//                        brightest first. The page moves each star to today's date.
//   constellations.json  d3-celestial's lines and label points (BSD 3-Clause, Olaf Frohn)
//   milkyway.webp        NASA's Deep Star Maps 2020 Milky Way (NASA/Goddard Space Flight
//                        Center Scientific Visualization Studio; Gaia DR2: ESA/Gaia/DPAC;
//                        public domain), tone-mapped and turned to this page's
//                        equirectangular: u = (RA+180°)/360° with RA in -180..180,
//                        v = (90° - Dec)/180°
//   messier.json         the 110 Messier objects from d3-celestial (BSD 3-Clause): number,
//                        NGC designation, common name, kind, magnitude, size in arcminutes,
//                        J2000 RA (hours) and Dec (degrees)
//
// Run from the repository root: `node scripts/build-sky-data.mjs [sourceDir] [--only=name]`.
// Without a sourceDir it downloads the sources; with one it reads bsc5.dat.gz,
// constellations.json, constellations.lines.json, messier.json and milkyway_2020_4k.exr from
// there. `--only=stars|constellations|messier|milkyway` builds that one file. The Milky Way
// is an OpenEXR picture, decoded by `ffmpeg`, which must be installed.
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import sharp from "sharp";

const out = new URL("../apps/web/public/sky/data/", import.meta.url);
const sources = {
  "bsc5.dat.gz": "http://tdc-www.harvard.edu/catalogs/bsc5.dat.gz",
  "constellations.json":
    "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json",
  "constellations.lines.json":
    "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json",
  "messier.json": "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/messier.json",
  "milkyway_2020_4k.exr":
    "https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/milkyway_2020_4k.exr",
};

const args = process.argv.slice(2);
const only = args.find((arg) => arg.startsWith("--only="))?.slice(7);
const wanted = (name) => !only || only === name;

async function source(name) {
  const dir = args.find((arg) => !arg.startsWith("--"));
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

const built = [];

// Stars. Byte columns from the catalogue's ReadMe (1-based, inclusive).
if (wanted("stars")) {
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
    stars.push({
      ra,
      dec,
      v: Number(vmag),
      bv: bv === "" ? 0.6 : Number(bv),
      pmRa: Number(field(line, 149, 154)) || 0,
      pmDec: Number(field(line, 155, 160)) || 0,
    });
  }
  stars.sort((a, b) => a.v - b.v);
  const records = new Float32Array(stars.length * 7);
  stars.forEach((star, index) => {
    records.set([...unit(star.ra, star.dec), star.v, star.bv, star.pmRa, star.pmDec], index * 7);
  });
  await writeFile(new URL("stars.bin", out), Buffer.from(records.buffer));
  built.push(`stars.bin: ${stars.length} stars to V ${stars.at(-1).v}`);
}

// Constellations: each figure's polylines as flat J2000 unit vectors, and its label point.
if (wanted("constellations")) {
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
  built.push(`constellations.json: ${constellations.length}`);
}

// Messier's catalogue: what a small telescope shows beyond the stars. Sizes are arcminutes,
// the long axis first; an object the source gives no size is taken as 5′ across.
if (wanted("messier")) {
  const kinds = { s: "galaxy", e: "galaxy", i: "galaxy", gc: "globular", oc: "open", pos: "open", pn: "nebula", rn: "nebula", snr: "nebula", sfr: "nebula" };
  const catalogue = JSON.parse(await source("messier.json"));
  const messier = catalogue.features
    .map(({ id, properties, geometry }) => {
      const [major, minor] = String(properties.dim || "5").split("x").map(Number);
      const [lon, lat] = geometry.coordinates;
      return {
        id,
        ngc: properties.desig || null,
        name: properties.alt || null,
        kind: kinds[properties.type],
        mag: properties.mag,
        size: [major, minor || major],
        ra: Math.round((((lon + 360) % 360) / 15) * 1e4) / 1e4,
        dec: lat,
      };
    })
    .sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
  await writeFile(new URL("messier.json", out), JSON.stringify(messier));
  built.push(`messier.json: ${messier.length}`);
}

// The Milky Way: NASA's map is linear light, centred on RA 0h with RA growing to the left.
// Decoded to 16-bit by ffmpeg, mirrored so RA grows to the right, then tone-mapped: the
// sky's own floor taken off so the background is black, the faint outer band lifted, the
// bright centre held under white.
if (wanted("milkyway")) {
  const W = 2048;
  const H = 1024;
  const work = await mkdtemp(join(tmpdir(), "sky-"));
  const exr = join(work, "milkyway.exr");
  const png = join(work, "milkyway.png");
  await writeFile(exr, await source("milkyway_2020_4k.exr"));
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", exr, "-frames:v", "1", "-pix_fmt", "rgb48be", png]);
  const { data, info } = await sharp(png)
    .resize(W, H, { kernel: "lanczos3" })
    .flop()
    .toColourspace("rgb16")
    .raw({ depth: "ushort" })
    .toBuffer({ resolveWithObject: true });
  await rm(work, { recursive: true });
  const linear = new Uint16Array(data.buffer, data.byteOffset, data.length / 2);
  const toned = Buffer.alloc(linear.length);
  for (let i = 0; i < linear.length; i++) {
    const light = Math.max(0, linear[i] / 65535 - 0.02);
    toned[i] = Math.round(255 * (1 - Math.exp(-light * 2.2)) ** (1 / 2.2));
  }
  await writeFile(
    new URL("milkyway.webp", out),
    await sharp(toned, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .webp({ quality: 62 })
      .toBuffer(),
  );
  built.push(`milkyway.webp: ${W}x${H}`);
}

console.log(built.join("; "));
