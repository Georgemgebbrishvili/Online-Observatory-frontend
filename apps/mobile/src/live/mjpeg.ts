// The live view is multipart/x-mixed-replace (ADR-011): each part names its own
// Content-Length. A phone has no <img> that plays it, so the app reads the stream and
// hands each JPEG to <Image> as it arrives.

const decoder = new TextDecoder("ascii");
const headerEnd = [13, 10, 13, 10];

function indexOf(buffer: Uint8Array, pattern: readonly number[], from = 0) {
  outer: for (let i = from; i <= buffer.length - pattern.length; i++) {
    for (let j = 0; j < pattern.length; j++) if (buffer[i + j] !== pattern[j]) continue outer;
    return i;
  }
  return -1;
}

/** Feed it chunks as they arrive; it returns every complete frame each chunk finishes. */
export function multipartFrames() {
  let pending = new Uint8Array(0);

  return (chunk: Uint8Array): Uint8Array[] => {
    const joined = new Uint8Array(pending.length + chunk.length);
    joined.set(pending);
    joined.set(chunk, pending.length);
    pending = joined;

    const frames: Uint8Array[] = [];
    for (;;) {
      const end = indexOf(pending, headerEnd);
      if (end === -1) break;
      const headers = decoder.decode(pending.subarray(0, end));
      const length = /content-length:\s*(\d+)/i.exec(headers);
      // A part with no length cannot be framed; drop its headers and resynchronise.
      if (!length) {
        pending = pending.subarray(end + headerEnd.length);
        continue;
      }
      const start = end + headerEnd.length;
      const size = Number(length[1]);
      if (pending.length < start + size) break;
      frames.push(pending.slice(start, start + size));
      pending = pending.subarray(start + size);
    }
    return frames;
  };
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** A frame as a data URI for <Image>. Plain base64, so no engine's btoa limits apply. */
export function jpegDataUri(bytes: Uint8Array) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += alphabet[a >> 2] + alphabet[((a & 3) << 4) | (b >> 4)];
    out += i + 1 < bytes.length ? alphabet[((b & 15) << 2) | (c >> 6)] : "=";
    out += i + 2 < bytes.length ? alphabet[c & 63] : "=";
  }
  return `data:image/jpeg;base64,${out}`;
}
