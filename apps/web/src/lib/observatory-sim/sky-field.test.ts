import { describe, expect, it } from 'vitest';
import { STATIONS } from './sim-stations';
import { bvToTint, skyObjectsNear, tangentOffsetDeg } from './sky-field';
import { localSiderealHours } from './site-time';
import { raDecToAzAlt } from './catalog';

describe('coloured stars and doubles', () => {
  it('Albireo is a gold primary with a blue companion 34.6″ away', () => {
    const station = STATIONS[0];
    const date = new Date(Date.UTC(2026, 9, 17, 17, 0));
    const at = raDecToAzAlt(19.512, 27.96, station.lat, station.lon, date);
    const objects = skyObjectsNear(station, date, at, 0.5, localSiderealHours(station.lon, date));
    const a = objects.find((o) => o.id === 'albireo')!;
    const b = objects.find((o) => o.id === 'albireo-b')!;
    expect(a.tint!).toBeGreaterThan(0.65);
    expect(b.tint!).toBeLessThan(0.2);
    const d = tangentOffsetDeg(a, b);
    expect(Math.hypot(d.x, d.y) * 3600).toBeCloseTo(34.6, 0);
    expect(bvToTint(-0.3)).toBe(0);
    expect(bvToTint(2)).toBe(1);
  });
});
