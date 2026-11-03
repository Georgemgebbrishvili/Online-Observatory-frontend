import { describe, expect, it } from 'vitest';
import { EXPOSURES_S, ROI_BY_ID, STACK_SIZES } from './camera';
import { NODES } from './nodes';
import { TRAIN_BY_ID } from './optics';
import { angularSeparation } from './safety';
import { SHOWPIECES, aimPosition } from './showpieces';
import { TELESCOPE_TARGET_BY_ID, targetPosition } from './telescope-targets';

describe('showpieces', () => {
  it('are twenty distinct targets the console can point at', () => {
    expect(SHOWPIECES).toHaveLength(20);
    expect(new Set(SHOWPIECES.map((s) => s.id)).size).toBe(20);
    for (const s of SHOWPIECES) expect(TELESCOPE_TARGET_BY_ID.has(s.id), s.id).toBe(true);
  });

  it('use only settings the camera and the optical train offer', () => {
    for (const { id, recipe } of SHOWPIECES) {
      expect(EXPOSURES_S, id).toContain(recipe.exposureS);
      expect(STACK_SIZES, id).toContain(recipe.stack);
      expect(TRAIN_BY_ID.has(recipe.train), id).toBe(true);
      expect(ROI_BY_ID.has(recipe.roi), id).toBe(true);
    }
  });
});

describe('aimPosition', () => {
  const node = NODES[0];
  // A waning crescent over Tbilisi before dawn.
  const date = new Date('2026-11-04T01:30:00Z');

  it('frames a crescent Moon on its lit part, inside the disc', () => {
    const moon = TELESCOPE_TARGET_BY_ID.get('moon')!;
    const centre = targetPosition(moon, node, date);
    const aim = aimPosition(moon, node, date);
    const off = angularSeparation(centre, aim) * 60;
    expect(off).toBeGreaterThan(3);
    expect(off).toBeLessThan(centre.sizeArcmin! / 2);
  });

  it('aims at the centre of everything else', () => {
    const jupiter = TELESCOPE_TARGET_BY_ID.get('jupiter')!;
    expect(aimPosition(jupiter, node, date)).toEqual(targetPosition(jupiter, node, date));
  });
});
