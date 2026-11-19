// Tbilisi's drivable streets as a graph: every street vertex a node, the
// streets that share a vertex joined at it, both ways (OSM's one-way tags are
// not in the bake). The traffic drives it, the police chase along it, and the
// GPS finds the way across it with A*.

import { ROAD, type Pt } from '@/voyage/lib/solar-system/world-earth-data';

export interface RoadNode { x: number; z: number; out: number[] }
export interface RoadEdge { a: number; b: number; len: number; cls: number; lane: number }

export interface RoadGraph {
  nodes: RoadNode[];
  edges: RoadEdge[];
  /** The nearest node to a point within `max` metres, or −1. */
  nearest: (x: number, z: number, max?: number) => number;
  /** Every connected node between `min` and `max` metres of a point. */
  within: (x: number, z: number, min: number, max: number, out: number[]) => number[];
  /** The way along the streets from one point to another, as points to drive through, or null. */
  route: (fromX: number, fromZ: number, toX: number, toZ: number) => Route | null;
}

export interface Route {
  /** x, z pairs from the node nearest the start to the node nearest the end. */
  pts: Float32Array;
  /** Metres along the streets. */
  length: number;
}

interface RoadLike { cls: number; width: number; tunnel: boolean; pts: Pt[] }

const CELL = 60;
/** Nodes this far from the origin and beyond are not driven. */
export const ROAD_REACH = 2600;

export function makeRoadGraph(roads: readonly RoadLike[]): RoadGraph {
  const nodes: RoadNode[] = [];
  const edges: RoadEdge[] = [];
  const index = new Map<string, number>();
  const nodeAt = ([x, z]: Pt) => {
    const k = `${Math.round(x * 2)},${Math.round(z * 2)}`;
    let i = index.get(k);
    if (i === undefined) { i = nodes.length; nodes.push({ x, z, out: [] }); index.set(k, i); }
    return i;
  };
  for (const r of roads) {
    if (r.tunnel || r.cls > ROAD.service || r.pts.length < 2) continue;
    if (!r.pts.some(([x, z]) => Math.hypot(x, z) < ROAD_REACH)) continue;
    const lane = Math.min(3.2, Math.max(1.3, r.width / 4));
    for (let k = 0; k + 1 < r.pts.length; k++) {
      const a = nodeAt(r.pts[k]); const b = nodeAt(r.pts[k + 1]);
      if (a === b) continue;
      const len = Math.hypot(nodes[b].x - nodes[a].x, nodes[b].z - nodes[a].z);
      for (const [from, to] of [[a, b], [b, a]]) {
        nodes[from].out.push(edges.length);
        edges.push({ a: from, b: to, len, cls: r.cls, lane });
      }
    }
  }

  // A grid of node indices for the nearest-node search.
  const grid = new Map<number, number[]>();
  const cellKey = (cx: number, cz: number) => (cx + 4096) * 8192 + (cz + 4096);
  nodes.forEach((n, i) => {
    if (!n.out.length) return;
    const k = cellKey(Math.floor(n.x / CELL), Math.floor(n.z / CELL));
    let list = grid.get(k);
    if (!list) grid.set(k, (list = []));
    list.push(i);
  });
  const nearest = (x: number, z: number, max = 400) => {
    const cx = Math.floor(x / CELL); const cz = Math.floor(z / CELL);
    let best = -1; let bd = max * max;
    const rings = Math.ceil(max / CELL);
    for (let r = 0; r <= rings; r++) {
      // Once something is found, one more ring settles it: a nearer node cannot be further out.
      if (best >= 0 && (r - 1) * CELL > Math.sqrt(bd)) break;
      for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
        const list = grid.get(cellKey(cx + i, cz + j));
        if (!list) continue;
        for (const n of list) {
          const d = (nodes[n].x - x) ** 2 + (nodes[n].z - z) ** 2;
          if (d < bd) { bd = d; best = n; }
        }
      }
    }
    return best;
  };

  const within = (x: number, z: number, min: number, max: number, out: number[]) => {
    out.length = 0;
    const r = Math.ceil(max / CELL);
    const cx = Math.floor(x / CELL); const cz = Math.floor(z / CELL);
    for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
      const list = grid.get(cellKey(cx + i, cz + j));
      if (!list) continue;
      for (const n of list) {
        const d = Math.hypot(nodes[n].x - x, nodes[n].z - z);
        if (d >= min && d <= max) out.push(n);
      }
    }
    return out;
  };

  // A* with a binary heap; the scratch arrays are kept between searches.
  const g = new Float64Array(nodes.length);
  const from = new Int32Array(nodes.length);
  const seen = new Uint32Array(nodes.length);
  const closed = new Uint32Array(nodes.length);
  let stamp = 0;
  const heapN: number[] = []; const heapF: number[] = [];
  const push = (n: number, f: number) => {
    let i = heapN.length;
    heapN.push(n); heapF.push(f);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heapF[p] <= f) break;
      heapN[i] = heapN[p]; heapF[i] = heapF[p];
      i = p;
    }
    heapN[i] = n; heapF[i] = f;
  };
  const pop = () => {
    const top = heapN[0];
    const n = heapN.pop()!; const f = heapF.pop()!;
    if (heapN.length) {
      let i = 0;
      const len = heapN.length;
      for (;;) {
        const l = i * 2 + 1; const r = l + 1;
        let m = i; let mf = f;
        if (l < len && heapF[l] < mf) { m = l; mf = heapF[l]; }
        if (r < len && heapF[r] < mf) { m = r; mf = heapF[r]; }
        if (m === i) break;
        heapN[i] = heapN[m]; heapF[i] = heapF[m];
        i = m;
      }
      heapN[i] = n; heapF[i] = f;
    }
    return top;
  };

  const route = (fx: number, fz: number, tx: number, tz: number): Route | null => {
    const s = nearest(fx, fz); const t = nearest(tx, tz);
    if (s < 0 || t < 0) return null;
    stamp += 1;
    heapN.length = 0; heapF.length = 0;
    const T = nodes[t];
    g[s] = 0; from[s] = -1; seen[s] = stamp;
    push(s, Math.hypot(nodes[s].x - T.x, nodes[s].z - T.z));
    let found = s === t;
    let expanded = 0;
    while (heapN.length && !found) {
      const n = pop();
      if (closed[n] === stamp) continue;
      closed[n] = stamp;
      if (n === t) { found = true; break; }
      if (++expanded > 60000) break;
      for (const e of nodes[n].out) {
        const E = edges[e];
        // Small streets cost a little more, so the way keeps to the avenues.
        const cost = E.len * (E.cls <= ROAD.secondary ? 1 : E.cls <= ROAD.residential ? 1.15 : 1.4);
        const ng = g[n] + cost;
        if (seen[E.b] === stamp && ng >= g[E.b]) continue;
        seen[E.b] = stamp; g[E.b] = ng; from[E.b] = n;
        push(E.b, ng + Math.hypot(nodes[E.b].x - T.x, nodes[E.b].z - T.z));
      }
    }
    if (!found) return null;
    const chain: number[] = [];
    for (let n = t; n >= 0; n = from[n]) { chain.push(n); if (n === s) break; }
    chain.reverse();
    const pts = new Float32Array(chain.length * 2);
    let length = 0;
    chain.forEach((n, i) => {
      pts[i * 2] = nodes[n].x; pts[i * 2 + 1] = nodes[n].z;
      if (i) length += Math.hypot(nodes[n].x - nodes[chain[i - 1]].x, nodes[n].z - nodes[chain[i - 1]].z);
    });
    return { pts, length };
  };

  return { nodes, edges, nearest, within, route };
}

/** How far a point is from a route's line, and how far along it the nearest place is (metres). */
export function routeDistance(pts: Float32Array, x: number, z: number): { off: number; along: number } {
  let off = Infinity; let along = 0; let run = 0;
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const ax = pts[i]; const az = pts[i + 1]; const bx = pts[i + 2]; const bz = pts[i + 3];
    const dx = bx - ax; const dz = bz - az;
    const L = Math.hypot(dx, dz) || 1e-6;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (L * L)));
    const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
    if (d < off) { off = d; along = run + t * L; }
    run += L;
  }
  return { off, along };
}
