// Who lives round Mars Base, and what they say. Every character is
// original: a utility droid, the base's quartermaster, a smuggler, two
// guild bounty hunters, two colonists, and the scav drones that strip the
// colony's kit out in the dunes. Lines and option labels are message keys
// under solarSystem.npc; the world fills in {name}, {credits} and the rest.

import type { Persona } from '@/voyage/lib/solar-system/npc-brain';
import type { NpcSave } from '@/voyage/lib/solar-system/npc-memory';

export type BodyKind = 'ballDroid' | 'tallDroid' | 'smuggler' | 'hunter' | 'colonist' | 'scav' | 'alien';

export type Effect = 'recruit' | 'dismiss' | 'scan' | 'repair' | 'startJob' | 'turnIn' | 'payWanted' | 'tip' | 'shield' | 'insult' | 'provoke' | 'work' | 'rumor'
  | 'buyBlaster' | 'buyPlating' | 'drink' | 'food' | 'assay';

export interface DialogCtx {
  save: NpcSave;
  /** Gems picked up on this world and not yet sold to the assayer. */
  unassayed?: number;
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

/** The two who keep each outpost: a caretaker droid at its post, who patches suits and knows the place,
 *  and a technician on their rounds. `spots` are the outpost's own points of interest. */
const OUTPOST_PEOPLE: Record<string, { droid: string; body: BodyKind; tech: string; color: number }> = {
  mercury: { droid: 'HELIO-3', body: 'tallDroid', tech: 'Ines', color: 0xb9c2cc },
  venus: { droid: 'SULFA', body: 'ballDroid', tech: 'Marek', color: 0xd9a441 },
  jupiter: { droid: 'BAND-9', body: 'tallDroid', tech: 'Yuki', color: 0xc77b4a },
  saturn: { droid: 'RINGO', body: 'ballDroid', tech: 'Anan', color: 0xe3d3a3 },
  uranus: { droid: 'TILT', body: 'tallDroid', tech: 'Bo', color: 0x7fd6d0 },
  neptune: { droid: 'DEEP-1', body: 'ballDroid', tech: 'Lior', color: 0x4a6fd8 },
};

export function outpostCast(world: string, spots: { x: number; z: number }[]): CastMember[] {
  const who = OUTPOST_PEOPLE[world];
  if (!who || spots.length === 0) return [];
  const at = (i: number) => spots[i % spots.length];
  const home = at(0);
  return [
    {
      id: 'caretaker', name: who.droid, body: who.body, color: who.color, maxHealth: 140,
      persona: { faction: 'crew', role: 'vendor', nerve: 0.9, temper: 0, sight: 30 },
      home: { x: home.x + 3, z: home.z + 3 },
      start: () => 'hello',
      nodes: {
        hello: {
          line: `outpost.${world}.droid`,
          options: [
            { key: 'kern.repair', effect: 'repair', cost: REPAIR_COST, when: (c) => c.integrity < 100 },
            { key: 'outpost.ask', to: 'lore' },
            bye,
          ],
        },
        lore: { line: `outpost.${world}.lore`, options: [bye] },
      },
    },
    {
      id: 'tech', name: who.tech, body: 'colonist', color: 0xe07a2e, maxHealth: 60,
      persona: { faction: 'crew', role: 'colonist', nerve: 0.4, temper: 0, sight: 30 },
      home: { x: at(1).x, z: at(1).z }, route: spots.slice(0, 4).map((s) => ({ x: s.x + 2, z: s.z + 2 })),
      start: () => 'hello',
      nodes: {
        hello: { line: `outpost.${world}.tech`, options: [{ key: 'outpost.life', to: 'life' }, bye] },
        life: { line: `outpost.${world}.life`, options: [bye] },
      },
    },
  ];
}

export const BLASTER_COST = 150;
export const PLATING_COST = 200;
export const DRINK_COST = 12;
export const FOOD_COST = 6;
export const ASSAY_PER_GEM = 20;
const has = (c: DialogCtx, f: string) => c.save.flags.includes(f);

/** Dusthaven's people: the mechanic, the bartender, the grocer, the assayer, and townsfolk on the street. */
export function marsTownCast(spots: Record<string, { x: number; z: number }>, street: { x: number; z0: number; z1: number }): CastMember[] {
  const at = (k: string, fallback: { x: number; z: number }) => spots[k] ?? fallback;
  const walk = (dx: number) => [
    { x: street.x + dx, z: street.z0 + 4 }, { x: street.x + dx, z: (street.z0 + street.z1) / 2 },
    { x: street.x - dx, z: street.z1 - 6 }, { x: street.x - dx, z: (street.z0 + street.z1) / 2 + 8 },
  ];
  const vendor = { faction: 'crew' as const, role: 'vendor' as const, nerve: 0.5, temper: 0, sight: 30 };
  return [
    {
      id: 'grit', name: 'GRIT-4', body: 'tallDroid', color: 0x9a6a3a, maxHealth: 160, persona: { ...vendor, nerve: 0.9 },
      home: at('parts', { x: street.x - 7, z: 6 }),
      start: () => 'hello',
      nodes: {
        hello: {
          line: 'town.grit.hello',
          options: [
            { key: 'town.grit.blaster', effect: 'buyBlaster', cost: BLASTER_COST, when: (c) => !has(c, 'blaster2') },
            { key: 'town.grit.plating', effect: 'buyPlating', cost: PLATING_COST, when: (c) => !has(c, 'plating') },
            { key: 'kern.repair', effect: 'repair', cost: REPAIR_COST, when: (c) => c.integrity < 100 },
            { key: 'bye' },
          ],
        },
      },
    },
    {
      id: 'nadia', name: 'Nadia', body: 'colonist', color: 0xb03a6a, maxHealth: 60, persona: vendor,
      home: at('cantina', { x: street.x - 10, z: 37 }),
      start: () => 'hello',
      nodes: {
        hello: { line: 'town.nadia.hello', options: [{ key: 'town.nadia.drink', effect: 'drink', cost: DRINK_COST }, { key: 'town.nadia.news', effect: 'rumor', to: 'news' }, { key: 'bye' }] },
        news: { line: 'vex.rumorLine', options: [{ key: 'bye' }] },
      },
    },
    {
      id: 'pell', name: 'Pell', body: 'colonist', color: 0x3ea36a, maxHealth: 60, persona: vendor,
      home: at('hydro', { x: street.x + 7, z: 10 }),
      start: () => 'hello',
      nodes: { hello: { line: 'town.pell.hello', options: [{ key: 'town.pell.food', effect: 'food', cost: FOOD_COST }, { key: 'bye' }] } },
    },
    {
      id: 'okonkwo', name: 'Okonkwo', body: 'colonist', color: 0xc9a227, maxHealth: 60, persona: vendor,
      home: at('assay', { x: street.x + 7, z: 58 }),
      start: (c) => ((c.unassayed ?? 0) > 0 ? 'buy' : 'hello'),
      nodes: {
        hello: { line: 'town.okonkwo.hello', options: [{ key: 'bye' }] },
        buy: { line: 'town.okonkwo.buy', options: [{ key: 'town.okonkwo.sell', effect: 'assay' }, { key: 'bye' }] },
      },
    },
    ...[0x2a8fd0, 0xd06a2a, 0x8a8f96].map((color, i): CastMember => ({
      id: `townie${i}`, name: ['Sol', 'Mira', 'Dez'][i], body: 'colonist', color, maxHealth: 60,
      persona: { faction: 'crew', role: 'colonist', nerve: 0.35, temper: 0, sight: 30 },
      home: { x: street.x + (i - 1) * 2, z: street.z0 + 10 + i * 20 }, route: walk(i - 1 === 0 ? 1.5 : (i - 1) * 2.5),
      start: () => 'hello',
      nodes: { hello: { line: `town.townie${i}`, options: [{ key: 'bye' }] } },
    })),
  ];
}

/** The Lantern Market's traders on Proxima b: each keeps a stall, and each trades something different. */
export function alienMarketCast(spots: { x: number; z: number }[]): CastMember[] {
  const people: { id: string; name: string; color: number; node: DialogNode }[] = [
    { id: 'ilu', name: 'Ilu-Ren', color: 0x3ee6d8, node: { line: 'market.ilu.hello', options: [{ key: 'market.ilu.moss', effect: 'drink', cost: DRINK_COST }, bye] } },
    { id: 'tavo', name: 'Tavo', color: 0xff5ad6, node: { line: 'market.tavo.hello', options: [{ key: 'market.tavo.chart', effect: 'tip', cost: TIP_COST }, bye] } },
    { id: 'shee', name: 'Shee', color: 0xffb340, node: { line: 'market.shee.hello', options: [{ key: 'market.shee.song', effect: 'rumor', to: 'song' }, bye] } },
    { id: 'orrun', name: 'Orrun', color: 0xa2ff5a, node: { line: 'market.orrun.hello', options: [{ key: 'market.orrun.fruit', effect: 'food', cost: FOOD_COST }, bye] } },
    { id: 'kesh', name: 'Kesh', color: 0x9a6cff, node: { line: 'market.kesh.hello', options: [{ key: 'kern.repair', effect: 'repair', cost: REPAIR_COST, when: (c) => c.integrity < 100 }, bye] } },
    { id: 'vahn', name: 'Vahn', color: 0x5ac8ff, node: { line: 'market.vahn.hello', options: [{ key: 'vex.shield', effect: 'shield', cost: SHIELD_COST }, bye] } },
  ];
  return spots.slice(0, people.length).map((at, i): CastMember => {
    const who = people[i];
    return {
      id: who.id, name: who.name, body: 'alien', color: who.color, maxHealth: 70,
      persona: { faction: 'trader', role: 'vendor', nerve: 0.3, temper: 0, sight: 30 },
      home: at,
      start: () => 'hello',
      nodes: { hello: who.node, song: { line: 'market.shee.songLine', options: [bye] } },
    };
  });
}
