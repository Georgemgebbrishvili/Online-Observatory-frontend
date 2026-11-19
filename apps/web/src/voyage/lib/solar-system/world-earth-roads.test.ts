import { describe, expect, it } from "vitest";

import { makeRoadGraph, routeDistance } from "./world-earth-roads";

// A small grid of streets: three east–west, three north–south, 100 m apart, and a footway that must not be driven.
const street = (pts: [number, number][], cls = 3) => ({ cls, width: 8, tunnel: false, pts });
const grid = [
  street([[0, 0], [100, 0], [200, 0]]),
  street([[0, 100], [100, 100], [200, 100]]),
  street([[0, 200], [100, 200], [200, 200]]),
  street([[0, 0], [0, 100], [0, 200]]),
  street([[100, 0], [100, 100], [100, 200]]),
  street([[200, 0], [200, 100], [200, 200]]),
  street([[0, 0], [200, 200]], 7),
];

describe("Tbilisi road graph", () => {
  it("joins streets where they share a vertex, both ways, and leaves footways out", () => {
    const g = makeRoadGraph(grid);
    expect(g.nodes.length).toBe(9);
    // 12 street segments, each both ways.
    expect(g.edges.length).toBe(24);
  });

  it("finds the nearest node, and nothing beyond the reach asked for", () => {
    const g = makeRoadGraph(grid);
    const n = g.nearest(96, 104);
    expect([g.nodes[n].x, g.nodes[n].z]).toEqual([100, 100]);
    expect(g.nearest(1000, 1000, 100)).toBe(-1);
  });

  it("lists the nodes in a ring round a point", () => {
    const g = makeRoadGraph(grid);
    const ring = g.within(0, 0, 50, 150, []).map((n) => [g.nodes[n].x, g.nodes[n].z].join(",")).sort();
    expect(ring).toEqual(["0,100", "100,0", "100,100"]);
  });

  it("routes along the streets by the shortest way", () => {
    const g = makeRoadGraph(grid);
    const r = g.route(2, -3, 198, 203)!;
    expect(r).not.toBeNull();
    expect(r.length).toBeCloseTo(400, 5);
    expect([r.pts[0], r.pts[1]]).toEqual([0, 0]);
    expect([r.pts[r.pts.length - 2], r.pts[r.pts.length - 1]]).toEqual([200, 200]);
  });

  it("goes round a missing block", () => {
    // Without the middle north–south street, from (100,0) to (100,200) goes round by a side.
    const g = makeRoadGraph(grid.filter((_, i) => i !== 4));
    const r = g.route(100, 0, 100, 200)!;
    expect(r.length).toBeCloseTo(400, 5);
  });

  it("says when there is no way across", () => {
    const g = makeRoadGraph([street([[0, 0], [100, 0]]), street([[500, 500], [600, 500]])]);
    expect(g.route(0, 0, 600, 500)).toBeNull();
  });

  it("measures how far a point is off a route, and how far along it", () => {
    const pts = new Float32Array([0, 0, 100, 0, 100, 100]);
    const a = routeDistance(pts, 50, 10);
    expect(a.off).toBeCloseTo(10, 5);
    expect(a.along).toBeCloseTo(50, 5);
    const b = routeDistance(pts, 110, 60);
    expect(b.off).toBeCloseTo(10, 5);
    expect(b.along).toBeCloseTo(160, 5);
  });
});
