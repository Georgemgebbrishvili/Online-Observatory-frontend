import { describe, expect, it } from 'vitest';
import { captureEntries, readPngText, withPngText } from './capture-meta';

/** The smallest valid PNG: one transparent pixel. */
const PIXEL = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
  (c) => c.charCodeAt(0),
);

describe('a captured frame’s record', () => {
  it('rides in the PNG and reads back exactly', () => {
    const record = { target: 'Albireo', exposureSec: 1, gain: 300, frames: 16, startedAtMs: Date.UTC(2026, 9, 17, 20, 0, 0), endedAtMs: Date.UTC(2026, 9, 17, 20, 0, 17), provenance: 'სიმულირებული · ცის მოდელი' };
    const png = withPngText(PIXEL, captureEntries(record));
    expect(png.length).toBeGreaterThan(PIXEL.length);
    expect(Array.from(png.subarray(0, 8))).toEqual(Array.from(PIXEL.subarray(0, 8)));
    const text = readPngText(png);
    expect(text.Exposure).toBe('16 x 1 s');
    expect(text.Integration).toBe('16 s');
    expect(text.Gain).toBe('300');
    expect(text.Frames).toBe('16');
    expect(text['Creation Time']).toBe('2026-10-17T20:00:17.000Z');
    expect(text.Comment).toBe(record.provenance);
  });

  it('leaves anything that is not a PNG alone', () => {
    const junk = new Uint8Array([1, 2, 3]);
    expect(withPngText(junk, [['Gain', '1']])).toBe(junk);
  });
});
