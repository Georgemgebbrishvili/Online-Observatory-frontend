/**
 * A captured frame carries its own record. The PNG the console saves holds the
 * exposure, gain, frame count and time in `iTXt` chunks, so the file still says how
 * it was made wherever it ends up — and says it was simulated, when it was.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** One uncompressed international text chunk: keyword, flags, empty language and translation, UTF-8 text. */
function itxt(keyword: string, text: string): Uint8Array {
  const encoder = new TextEncoder();
  const key = encoder.encode(keyword.replace(/[^\x20-\x7e]/g, '').slice(0, 79));
  const value = encoder.encode(text);
  const body = new Uint8Array(4 + key.length + 5 + value.length);
  body.set(encoder.encode('iTXt'), 0);
  body.set(key, 4);
  // NUL after the keyword, compression flag and method 0, empty language tag and translated keyword.
  body.set([0, 0, 0, 0, 0], 4 + key.length);
  body.set(value, 4 + key.length + 5);
  const chunk = new Uint8Array(8 + body.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, body.length - 4);
  chunk.set(body, 4);
  view.setUint32(4 + body.length, crc32(body));
  return chunk;
}

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
/** The signature and the IHDR chunk, which every text chunk must follow. */
const HEADER_BYTES = 8 + 4 + 4 + 13 + 4;

/** The PNG with these text entries inserted after its header. A non-PNG comes back unchanged. */
export function withPngText(png: Uint8Array<ArrayBuffer>, entries: Array<[string, string]>): Uint8Array<ArrayBuffer> {
  if (png.length < HEADER_BYTES || SIGNATURE.some((b, i) => png[i] !== b)) return png;
  const chunks = entries.map(([k, v]) => itxt(k, v));
  const out = new Uint8Array(png.length + chunks.reduce((n, c) => n + c.length, 0));
  out.set(png.subarray(0, HEADER_BYTES), 0);
  let at = HEADER_BYTES;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  out.set(png.subarray(HEADER_BYTES), at);
  return out;
}

/** Every text entry in a PNG, keyword to text: what a reader of the saved file finds. */
export function readPngText(png: Uint8Array): Record<string, string> {
  const out: Record<string, string> = {};
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const decoder = new TextDecoder();
  let at = 8;
  while (at + 12 <= png.length) {
    const length = view.getUint32(at);
    const type = decoder.decode(png.subarray(at + 4, at + 8));
    if (type === 'iTXt') {
      const data = png.subarray(at + 8, at + 8 + length);
      const nul = data.indexOf(0);
      // Keyword, NUL, two flag bytes, language tag NUL, translated keyword NUL, text.
      let p = nul + 3;
      p = data.indexOf(0, p) + 1;
      p = data.indexOf(0, p) + 1;
      out[decoder.decode(data.subarray(0, nul))] = decoder.decode(data.subarray(p));
    }
    if (type === 'IEND') break;
    at += 12 + length;
  }
  return out;
}

export type CaptureRecord = {
  target: string;
  exposureSec: number;
  gain: number;
  frames: number;
  startedAtMs: number;
  endedAtMs: number;
  /** What the frame is: the sky model's drawing, or the instrument's output. */
  provenance: string;
};

/** The entries a captured frame's PNG carries, in plain units. */
export function captureEntries(r: CaptureRecord): Array<[string, string]> {
  const seconds = (s: number) => `${Number(s.toPrecision(4))} s`;
  return [
    ['Title', r.target],
    ['Exposure', `${r.frames} x ${seconds(r.exposureSec)}`],
    ['Integration', seconds(r.frames * r.exposureSec)],
    ['Gain', String(r.gain)],
    ['Frames', String(r.frames)],
    ['Creation Time', new Date(r.endedAtMs).toISOString()],
    ['Stack Start', new Date(r.startedAtMs).toISOString()],
    ['Comment', r.provenance],
  ];
}
