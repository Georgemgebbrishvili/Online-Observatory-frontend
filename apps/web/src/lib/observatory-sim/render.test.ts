import { describe, expect, it } from 'vitest';
import { boilPx } from './render';

describe('boilPx', () => {
  const frame = { seeingArcsec: 3, exposureSec: 0.005, subs: 1, fovArcmin: 1.6, width: 800 };

  it('shoves a planetary frame by several display pixels at high power', () => {
    expect(boilPx(frame)).toBeGreaterThan(2);
  });

  it('calms as the live stack grows, by the square root of the frames', () => {
    expect(boilPx({ ...frame, subs: 100 })).toBeCloseTo(boilPx(frame) / 10, 6);
  });

  it('is averaged away on a long deep-sky sub', () => {
    expect(boilPx({ ...frame, exposureSec: 4, fovArcmin: 18.8 })).toBeLessThan(0.35);
  });
});
