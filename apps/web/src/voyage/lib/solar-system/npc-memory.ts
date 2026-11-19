// What the colony remembers about the pilot between visits: standing with
// each faction, the warrant, the droid's contract, credits and the job in
// hand. Kept on the device; a browser that refuses storage starts fresh.

import type { Standing } from '@/voyage/lib/solar-system/npc-brain';

const KEY = 'stellar_npc_v1';

export interface NpcSave extends Standing {
  credits: number;
  /** Kern's contract: scav drones to disable, and how many are down. */
  job: { need: number; done: number } | null;
  jobsDone: number;
  /** Rumours already told, so the next one is new. */
  rumors: number;
  /** One-time thanks already given. */
  flags: string[];
}

export const freshSave = (): NpcSave => ({
  rep: { crew: 0.2, trader: 0, hunter: 0 }, wanted: 0, recruited: false,
  credits: 40, job: null, jobsDone: 0, rumors: 0, flags: [],
});

const clamp = (v: unknown, lo: number, hi: number, d: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d);

export function loadNpcSave(): NpcSave {
  const s = freshSave();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<NpcSave> | null;
    if (!raw || typeof raw !== 'object') return s;
    for (const f of ['crew', 'trader', 'hunter'] as const) s.rep[f] = clamp(raw.rep?.[f], -1, 1, s.rep[f]);
    s.wanted = clamp(raw.wanted, 0, 5, 0);
    s.recruited = raw.recruited === true;
    s.credits = Math.round(clamp(raw.credits, 0, 99999, s.credits));
    s.job = raw.job && typeof raw.job === 'object' ? { need: clamp(raw.job.need, 1, 9, 3), done: clamp(raw.job.done, 0, 9, 0) } : null;
    s.jobsDone = Math.round(clamp(raw.jobsDone, 0, 999, 0));
    s.rumors = Math.round(clamp(raw.rumors, 0, 999, 0));
    s.flags = Array.isArray(raw.flags) ? raw.flags.filter((f): f is string => typeof f === 'string').slice(0, 50) : [];
  } catch { /* no storage, or junk in it */ }
  return s;
}

export function storeNpcSave(s: NpcSave): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: this visit only */ }
}
