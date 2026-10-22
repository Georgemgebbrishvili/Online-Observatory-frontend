import { describe, expect, it } from "vitest";

import { jpegDataUri, multipartFrames } from "./mjpeg";

const encoder = new TextEncoder();

function part(bytes: number[]) {
  const head = encoder.encode(
    `--darkview-b\r\nContent-Type: image/jpeg\r\nContent-Length: ${bytes.length}\r\n\r\n`,
  );
  const out = new Uint8Array(head.length + bytes.length + 2);
  out.set(head);
  out.set(bytes, head.length);
  out.set([13, 10], head.length + bytes.length);
  return out;
}

describe("multipartFrames", () => {
  it("yields each frame, by its Content-Length, even when it holds CRLFs", () => {
    const read = multipartFrames();
    const stream = new Uint8Array([...part([255, 216, 13, 10, 13, 10, 255, 217]), ...part([1, 2, 3])]);
    expect(read(stream).map((frame) => [...frame])).toEqual([
      [255, 216, 13, 10, 13, 10, 255, 217],
      [1, 2, 3],
    ]);
  });

  it("waits for a frame split across chunks", () => {
    const read = multipartFrames();
    const whole = part([9, 8, 7, 6, 5]);
    expect(read(whole.subarray(0, 20))).toEqual([]);
    expect(read(whole.subarray(20, whole.length - 4))).toEqual([]);
    expect(read(whole.subarray(whole.length - 4)).map((frame) => [...frame])).toEqual([[9, 8, 7, 6, 5]]);
  });
});

describe("jpegDataUri", () => {
  it("is standard base64, padding included", () => {
    expect(jpegDataUri(encoder.encode("Man"))).toBe("data:image/jpeg;base64,TWFu");
    expect(jpegDataUri(encoder.encode("Ma"))).toBe("data:image/jpeg;base64,TWE=");
    expect(jpegDataUri(encoder.encode("M"))).toBe("data:image/jpeg;base64,TQ==");
  });
});
