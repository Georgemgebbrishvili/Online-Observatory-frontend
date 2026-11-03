/**
 * The twenty showpieces: the objects a 203 mm SCT shows best, across the seasons, so
 * that on any night a good handful are up. Each carries the camera recipe an EAA
 * observer would use on an 8SE with an ASI585MC: the optical train that frames it, a
 * sub short enough to freeze the seeing on a planet or long enough to lift a galaxy,
 * and a live stack deep enough that the picture settles clean.
 */

import { Body, Equator, Horizon, Illumination, Observer } from 'astronomy-engine';
import type { RoiPreset } from './camera';
import type { OpticalTrainId } from './optics';
import { brightLimbPa } from './sky-field';
import { targetPosition, type TargetPosition, type TelescopeTarget } from './telescope-targets';
import type { ObservatoryNode } from './types';

export type Recipe = {
  train: OpticalTrainId;
  roi: RoiPreset['id'];
  exposureS: number;
  gain: number;
  /** Subs in the live stack once on target. */
  stack: number;
};

export type Showpiece = {
  /** A TELESCOPE_TARGETS id. */
  id: string;
  name: { en: string; ka: string };
  recipe: Recipe;
};

const PLANET = (exposureS: number): Recipe => ({ train: 'F20_BARLOW', roi: '640', exposureS, gain: 250, stack: 200 });
const DOUBLE: Recipe = { train: 'F20_BARLOW', roi: '1080', exposureS: 0.05, gain: 250, stack: 64 };

export const SHOWPIECES: Showpiece[] = [
  { id: 'moon', name: { en: 'The Moon', ka: 'მთვარე' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 0.002, gain: 100, stack: 100 } },
  { id: 'venus', name: { en: 'Venus', ka: 'ვენერა' }, recipe: PLANET(0.001) },
  { id: 'mars', name: { en: 'Mars', ka: 'მარსი' }, recipe: PLANET(0.005) },
  { id: 'jupiter', name: { en: 'Jupiter', ka: 'იუპიტერი' }, recipe: PLANET(0.005) },
  { id: 'saturn', name: { en: 'Saturn', ka: 'სატურნი' }, recipe: PLANET(0.02) },
  { id: 'star-albireo', name: { en: 'Albireo', ka: 'ალბირეო' }, recipe: DOUBLE },
  { id: 'star-almach', name: { en: 'Almach', ka: 'ალმახი' }, recipe: DOUBLE },
  { id: 'star-mizar', name: { en: 'Mizar', ka: 'მიცარი' }, recipe: DOUBLE },
  { id: 'm42', name: { en: 'Orion Nebula', ka: 'ორიონის ნისლეული' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 2, gain: 200, stack: 8 } },
  { id: 'm31', name: { en: 'Andromeda Galaxy', ka: 'ანდრომედას გალაქტიკა' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 4, gain: 300, stack: 8 } },
  { id: 'm57', name: { en: 'Ring Nebula', ka: 'რგოლის ნისლეული' }, recipe: { train: 'F10_NATIVE', roi: 'full', exposureS: 4, gain: 300, stack: 8 } },
  { id: 'm27', name: { en: 'Dumbbell Nebula', ka: 'ჰანტელის ნისლეული' }, recipe: { train: 'F10_NATIVE', roi: 'full', exposureS: 4, gain: 300, stack: 8 } },
  { id: 'm1', name: { en: 'Crab Nebula', ka: 'კიბორჩხალას ნისლეული' }, recipe: { train: 'F10_NATIVE', roi: 'full', exposureS: 4, gain: 400, stack: 8 } },
  { id: 'm13', name: { en: 'Hercules Cluster', ka: 'ჰერკულესის გროვა' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 2, gain: 300, stack: 8 } },
  { id: 'm15', name: { en: 'Pegasus Cluster', ka: 'პეგასის გროვა' }, recipe: { train: 'F10_NATIVE', roi: 'full', exposureS: 2, gain: 300, stack: 8 } },
  { id: 'ngc869', name: { en: 'Double Cluster', ka: 'ორმაგი გროვა' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 1, gain: 250, stack: 8 } },
  { id: 'm51', name: { en: 'Whirlpool Galaxy', ka: 'მორევის გალაქტიკა' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 4, gain: 400, stack: 8 } },
  { id: 'm81', name: { en: "Bode's Galaxy", ka: 'ბოდეს გალაქტიკა' }, recipe: { train: 'F6_3_REDUCER', roi: 'full', exposureS: 4, gain: 400, stack: 8 } },
  { id: 'm82', name: { en: 'Cigar Galaxy', ka: 'სიგარის გალაქტიკა' }, recipe: { train: 'F10_NATIVE', roi: 'full', exposureS: 4, gain: 400, stack: 8 } },
  { id: 'm104', name: { en: 'Sombrero Galaxy', ka: 'სომბრეროს გალაქტიკა' }, recipe: { train: 'F10_NATIVE', roi: 'full', exposureS: 4, gain: 400, stack: 8 } },
];

export const SHOWPIECE_BY_ID = new Map(SHOWPIECES.map((s) => [s.id, s]));

/**
 * Where the GoTo aims for a target. The Moon is framed on its lit part, as an observer
 * frames a crescent: from the centre toward the bright limb, further the thinner the
 * crescent. Everything else is aimed at its centre.
 */
export function aimPosition(t: TelescopeTarget, node: ObservatoryNode, date: Date): TargetPosition {
  const p = targetPosition(t, node, date);
  if (t.id !== 'moon' || !p.sizeArcmin) return p;
  const observer = new Observer(node.lat, node.lon, 0);
  const moon = Equator(Body.Moon, date, observer, true, true);
  const sun = Equator(Body.Sun, date, observer, true, true);
  const lit = Illumination(Body.Moon, date).phase_fraction;
  const pa = (brightLimbPa(moon, sun) * Math.PI) / 180;
  const off = (p.sizeArcmin / 120) * (1 - lit) * 0.85;
  const dec = moon.dec + off * Math.cos(pa);
  const ra = moon.ra + (off * Math.sin(pa)) / Math.cos((moon.dec * Math.PI) / 180) / 15;
  const h = Horizon(date, observer, ra, dec, 'normal');
  return { ...p, altitude: h.altitude, azimuth: h.azimuth };
}
