import { Euler, Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { declinationAt, SITE } from "@/features/sky3d/astro";

import { Pointing } from "./pointing";

const DEG = Math.PI / 180;

/** Where the camera looks, as altitude and azimuth (world: x east, y up, z south). */
function aim(q: Quaternion) {
  const ahead = new Vector3(0, 0, -1).applyQuaternion(q);
  const up = new Vector3(0, 1, 0).applyQuaternion(q);
  return {
    alt: Math.asin(ahead.y) / DEG,
    az: ((Math.atan2(ahead.x, -ahead.z) / DEG) % 360 + 360) % 360,
    // The screen's up against the sky's: positive when the sky's up is the screen's up.
    upright: up.y,
  };
}

/** The W3C angles of a phone at (alpha, beta), turned `spin`° about its own screen normal. */
function angles(alpha: number, beta: number, spin = 0) {
  const q = new Quaternion()
    .setFromEuler(new Euler(beta * DEG, 0, alpha * DEG, "ZXY"))
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), spin * DEG));
  const e = new Euler().setFromQuaternion(q, "ZXY");
  return { alpha: ((e.z / DEG) % 360 + 360) % 360, beta: e.x / DEG, gamma: e.y / DEG };
}

const reading = (values: { alpha: number; beta: number; gamma: number; webkitCompassHeading?: number }) =>
  values as unknown as DeviceOrientationEvent;

/** Feeds one pose for a second of frames and returns where the camera settled. */
function settle(pointing: Pointing, values: Parameters<typeof reading>[0]) {
  let q: Quaternion | null = null;
  for (let i = 0; i < 90; i++) {
    pointing.take(reading(values));
    q = pointing.step(16);
  }
  return aim(q!);
}

describe("pointing the phone at the sky", () => {
  it("knows Georgia's declination, and none elsewhere", () => {
    expect(declinationAt(SITE)).toBe(7);
    expect(declinationAt({ latitude: 51.5, longitude: -0.1, height: 0 })).toBe(0);
  });

  it("looks where an Android phone's back points, on true north", () => {
    const pointing = new Pointing(7, true);
    const level = settle(pointing, { alpha: 0, beta: 90, gamma: 0 });
    expect(level.alt).toBeCloseTo(0, 1);
    expect(level.az).toBeCloseTo(7, 1);
    const up = settle(pointing, { alpha: 270, beta: 135, gamma: 0 });
    expect(up.alt).toBeCloseTo(45, 1);
    expect(up.az).toBeCloseTo(97, 1);
    expect(up.upright).toBeGreaterThan(0);
  });

  it("keeps an iPhone's sky the right way round as it is lifted past upright", () => {
    // iOS: alpha from an arbitrary start (here 123°), and a magnetic heading for the top edge
    // that turns half a circle once the phone leans back past upright.
    const pointing = new Pointing(7, false);
    const low = settle(pointing, { alpha: 123, beta: 50, gamma: 0, webkitCompassHeading: 0 });
    expect(low.alt).toBeCloseTo(-40, 1);
    expect(low.az).toBeCloseTo(7, 1);
    const lifted = settle(pointing, { alpha: 123, beta: 135, gamma: 0, webkitCompassHeading: 180 });
    expect(lifted.alt).toBeCloseTo(45, 1);
    expect(lifted.az).toBeCloseTo(7, 1);
    expect(lifted.upright).toBeGreaterThan(0);
    const east = settle(pointing, { alpha: 33, beta: 135, gamma: 0, webkitCompassHeading: 270 });
    expect(east.az).toBeCloseTo(97, 1);
  });

  it("stays upright in landscape", () => {
    const original = Object.getOwnPropertyDescriptor(window.screen, "orientation");
    Object.defineProperty(window.screen, "orientation", { configurable: true, get: () => ({ angle: 90 }) });
    try {
      const pointing = new Pointing(7, true);
      const view = settle(pointing, angles(0, 135, 90));
      expect(view.alt).toBeCloseTo(45, 1);
      expect(view.az).toBeCloseTo(7, 1);
      expect(view.upright).toBeGreaterThan(0.5);
    } finally {
      if (original) Object.defineProperty(window.screen, "orientation", original);
      else delete (window.screen as unknown as { orientation?: unknown }).orientation;
    }
  });

  it("holds steady through the hand's tremor, and follows a real move", () => {
    const pointing = new Pointing(0, true);
    settle(pointing, { alpha: 270, beta: 135, gamma: 0 });
    // Half a degree of shake, sixty readings a second, for two seconds.
    let seed = 7;
    const shake = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed / 2147483647 - 0.5) * 1;
    };
    const seen: { alt: number; az: number }[] = [];
    for (let i = 0; i < 120; i++) {
      pointing.take(reading({ alpha: 270 + shake(), beta: 135 + shake(), gamma: shake() }));
      seen.push(aim(pointing.step(16)!));
    }
    const spread = (key: "alt" | "az") => Math.max(...seen.map((v) => v[key])) - Math.min(...seen.map((v) => v[key]));
    expect(spread("alt")).toBeLessThan(0.3);
    expect(spread("az")).toBeLessThan(0.4);
    // A 90° turn is followed within a quarter of a second.
    let frames = 0;
    let view = seen.at(-1)!;
    while (frames < 60 && Math.abs(view.az - 180) > 1) {
      pointing.take(reading({ alpha: 180, beta: 135, gamma: 0 }));
      view = aim(pointing.step(16)!);
      frames += 1;
    }
    expect(frames * 16).toBeLessThan(250);
  });
});
