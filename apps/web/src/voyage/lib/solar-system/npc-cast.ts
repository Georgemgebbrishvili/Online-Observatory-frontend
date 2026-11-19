// Who lives round Mars Base, and what they say. Every character is
// original: a utility droid, the base's quartermaster, a smuggler, two
// guild bounty hunters, two colonists, and the scav drones that strip the
// colony's kit out in the dunes. Lines and option labels are message keys
// under solarSystem.npc; the world fills in {name}, {credits} and the rest.

import type { Persona } from '@/voyage/lib/solar-system/npc-brain';
import type { NpcSave } from '@/voyage/lib/solar-system/npc-memory';

export type BodyKind = 'ballDroid' | 'tallDroid' | 'smuggler' | 'hunter' | 'colonist' | 'scav';

export type Effect = 'recruit' | 'dismiss' | 'scan' | 'repair' | 'startJob' | 'turnIn' | 'payWanted' | 'tip' | 'shield' | 'insult' | 'provoke' | 'work' | 'rumor';

export interface DialogCtx {
  save: NpcSave;
  /** Suit integrity, 0…100. */
  integrity: number;
  hostiles: number;
}

export interface DialogOption {
  key: string;
  /** Next node; none ends the talk (after the effect). */
  to?: string;
  effect?: Effect;
  /** Credits it costs: the option shows the price and is greyed out when short. */
  cost?: number | ((c: DialogCtx) => number);
  when?: (c: DialogCtx) => boolean;
}

export interface DialogNode { line: string; options: DialogOption[] }

export interface CastMember {
  id: string;
  /** Shown over their head and in the talk panel (not translated: a name). */
  name: string;
  body: BodyKind;
  persona: Persona;
  maxHealth: number;
  home: { x: number; z: number };
  /** Walked in a loop by patrols; wandered between by colonists. */
  route?: { x: number; z: number }[];
  /** The tint of their kit. */
  color: number;
  /** Talkable: the first node for this visit. */
  start?: (c: DialogCtx) => string;
  nodes?: Record<string, DialogNode>;
}

export const WANTED_FEE = 75;
export const REPAIR_COST = 20;
export const TIP_COST = 30;
export const SHIELD_COST = 60;
export const JOB_PAY = 120;
const fee = (c: DialogCtx) => WANTED_FEE * Math.ceil(c.save.wanted);
const bye: DialogOption = { key: 'bye' };

const ring = (cx: number, cz: number, r: number, n: number, a0 = 0) =>
  Array.from({ length: n }, (_, i) => ({ x: cx + Math.cos(a0 + (i / n) * Math.PI * 2) * r, z: cz + Math.sin(a0 + (i / n) * Math.PI * 2) * r }));

export const MARS_CAST: CastMember[] = [
  {
    id: 'pip', name: 'PIP-7', body: 'ballDroid', color: 0xf2f2ec, maxHealth: 80,
    persona: { faction: 'crew', role: 'companion', nerve: 0.8, temper: 0.6, sight: 40 },
    home: { x: 6, z: -40 },
    start: (c) => (c.save.recruited ? 'status' : 'hello'),
    nodes: {
      hello: { line: 'pip.hello', options: [{ key: 'pip.join', effect: 'recruit' }, { key: 'pip.what', to: 'about' }, bye] },
      about: { line: 'pip.about', options: [{ key: 'pip.join', effect: 'recruit' }, bye] },
      status: { line: 'pip.status', options: [{ key: 'pip.scan', effect: 'scan' }, { key: 'pip.stay', effect: 'dismiss' }, bye] },
    },
  },
  {
    id: 'kern', name: 'KERN', body: 'tallDroid', color: 0xc9a227, maxHealth: 160,
    persona: { faction: 'crew', role: 'vendor', nerve: 0.9, temper: 0, sight: 30 },
    home: { x: -9, z: -44 },
    start: (c) => (c.save.wanted > 0 ? 'wanted' : c.save.job && c.save.job.done >= c.save.job.need ? 'payday' : 'hello'),
    nodes: {
      hello: {
        line: 'kern.hello',
        options: [
          { key: 'kern.repair', effect: 'repair', cost: REPAIR_COST, when: (c) => c.integrity < 100 },
          { key: 'kern.job', to: 'offer', when: (c) => !c.save.job },
          { key: 'kern.progress', to: 'progress', when: (c) => !!c.save.job },
          bye,
        ],
      },
      offer: { line: 'kern.offer', options: [{ key: 'kern.accept', effect: 'startJob' }, { key: 'kern.decline' }] },
      progress: { line: 'kern.progressLine', options: [bye] },
      payday: { line: 'kern.payday', options: [{ key: 'kern.collect', effect: 'turnIn' }] },
      wanted: {
        line: 'kern.wanted',
        options: [
          { key: 'kern.clear', effect: 'payWanted', cost: fee },
          { key: 'kern.repair', effect: 'repair', cost: REPAIR_COST, when: (c) => c.integrity < 100 },
          bye,
        ],
      },
    },
  },
  {
    id: 'vex', name: 'Vex Marrow', body: 'smuggler', color: 0x7a3b2e, maxHealth: 70,
    persona: { faction: 'trader', role: 'vendor', nerve: 0.35, temper: 0.2, sight: 35 },
    home: { x: 34, z: -18 },
    start: (c) => (c.save.rep.trader <= -0.3 ? 'cold' : 'hello'),
    nodes: {
      hello: {
        line: 'vex.hello',
        options: [
          { key: 'vex.tip', effect: 'tip', cost: TIP_COST },
          { key: 'vex.shield', effect: 'shield', cost: SHIELD_COST },
          { key: 'vex.rumor', effect: 'rumor', to: 'rumor' },
          { key: 'vex.threat', effect: 'insult' },
          bye,
        ],
      },
      rumor: { line: 'vex.rumorLine', options: [{ key: 'vex.more', to: 'hello' }, bye] },
      cold: { line: 'vex.cold', options: [bye] },
    },
  },
  {
    id: 'rook', name: 'Rook', body: 'hunter', color: 0x3d5a6c, maxHealth: 140,
    persona: { faction: 'hunter', role: 'patrol', nerve: 0.85, temper: 0.7, sight: 70 },
    home: { x: -40, z: -20 }, route: ring(0, -30, 48, 6, 0.3),
    start: () => 'hello',
    nodes: {
      hello: { line: 'rook.hello', options: [{ key: 'hunter.work', effect: 'work', to: 'work' }, { key: 'hunter.insult', effect: 'provoke' }, bye] },
      work: { line: 'rook.work', options: [bye] },
    },
  },
  {
    id: 'sable', name: 'Sable', body: 'hunter', color: 0x6c3d5e, maxHealth: 120,
    persona: { faction: 'hunter', role: 'patrol', nerve: 0.6, temper: 0.85, sight: 75 },
    home: { x: 40, z: -40 }, route: ring(0, -30, 48, 6, 0.3 + Math.PI),
    start: () => 'hello',
    nodes: {
      hello: { line: 'sable.hello', options: [{ key: 'hunter.work', effect: 'work', to: 'work' }, { key: 'hunter.insult', effect: 'provoke' }, bye] },
      work: { line: 'sable.work', options: [bye] },
    },
  },
  {
    id: 'oda', name: 'Oda', body: 'colonist', color: 0xd06a2a, maxHealth: 60,
    persona: { faction: 'crew', role: 'colonist', nerve: 0.3, temper: 0, sight: 35 },
    home: { x: -16, z: -38 }, route: [{ x: -16, z: -38 }, { x: 16, z: -38 }, { x: 22, z: -20 }, { x: -22, z: -22 }],
    start: () => 'hello',
    nodes: { hello: { line: 'oda.hello', options: [bye] } },
  },
  {
    id: 'tamsin', name: 'Tamsin', body: 'colonist', color: 0x2a8fd0, maxHealth: 60,
    persona: { faction: 'crew', role: 'colonist', nerve: 0.4, temper: 0, sight: 35 },
    home: { x: 14, z: -46 }, route: [{ x: 14, z: -46 }, { x: -30, z: -50 }, { x: -44, z: -60 }, { x: 0, z: -30 }],
    start: () => 'hello',
    nodes: { hello: { line: 'tamsin.hello', options: [bye] } },
  },
  ...Array.from({ length: 6 }, (_, i): CastMember => {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const r = 95 + (i % 3) * 18;
    return {
      id: `scav${i}`, name: `Scav ${String.fromCharCode(65 + i)}`, body: 'scav', color: 0x8a8f96, maxHealth: 45,
      persona: { faction: 'scav', role: 'raider', nerve: 0.5, temper: 0.9, sight: 38 },
      home: { x: Math.cos(a) * r, z: -30 + Math.sin(a) * r },
    };
  }),
];

/** An option as the panel shows it: its label, price, and whether it can be picked. */
export function optionsFor(node: DialogNode, ctx: DialogCtx): { key: string; cost: number; enabled: boolean; index: number }[] {
  return node.options
    .map((o, index) => ({ o, index }))
    .filter(({ o }) => !o.when || o.when(ctx))
    .map(({ o, index }) => {
      const cost = typeof o.cost === 'function' ? o.cost(ctx) : o.cost ?? 0;
      return { key: o.key, cost, enabled: ctx.save.credits >= cost, index };
    });
}
