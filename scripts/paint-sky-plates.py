"""
Paints the console's deep-sky plates: what a live stack on a 203 mm SCT with an
ASI585MC settles to, drawn by code. No photograph is used. Each plate is north up,
east left, on true black, and fades to nothing before its edge so it never shows
a square in the frame. The console blurs, rotates, dims and adds noise to it.

    python3 scripts/paint-sky-plates.py

Writes apps/web/public/sky/plates/<id>.webp. The span of each plate, in arcminutes,
is the `frameSpan` x `major` the sky model gives it (lib/observatory-sim/sky-field.ts).

Kept modest on purpose (ADR-027 §6): soft arms, muted colour, no Hubble-class detail.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

OUT = Path(__file__).resolve().parent.parent / "apps/web/public/sky/plates"

WARM = np.array([1.0, 0.86, 0.68])
WHITE = np.array([1.0, 0.97, 0.92])
BLUE = np.array([0.78, 0.86, 1.0])
PINK = np.array([1.0, 0.55, 0.62])
RED = np.array([1.0, 0.36, 0.34])
TEAL = np.array([0.55, 0.95, 0.88])
DUST = np.array([0.55, 0.62, 0.75])  # dust takes more blue than red


class Plate:
    def __init__(self, span, px, seed):
        self.span, self.px = span, px
        self.s = span / px  # arcmin per pixel
        c = (np.arange(px) - (px - 1) / 2) * self.s
        self.u, self.v = np.meshgrid(c, -c)  # u to the right (west), v up (north)
        self.rgb = np.zeros((px, px, 3))
        self.rng = np.random.default_rng(seed)

    def axes(self, pa, x0=0.0, y0=0.0):
        """Distance along a position angle (east of north) and across it, arcmin."""
        t = np.radians(pa)
        du, dv = self.u - x0, self.v - y0
        return du * -np.sin(t) + dv * np.cos(t), du * np.cos(t) + dv * np.sin(t)

    def at(self, pa, r):
        """Plate coordinates of a point r arcmin away at a position angle."""
        t = np.radians(pa)
        return -np.sin(t) * r, np.cos(t) * r

    def add(self, light, colour):
        self.rgb += light[..., None] * np.asarray(colour)[None, None, :]

    def dim(self, att, colour=DUST):
        """Absorb: `att` 0-1, redder light gets through more."""
        self.rgb *= 1 - att[..., None] * np.asarray(colour)[None, None, :]

    def noise(self, scale_arcmin, octaves=4, seed_shift=0):
        """Fractal noise, roughly 0-1, features about `scale_arcmin` across."""
        rng = np.random.default_rng(self.rng.integers(1 << 30) + seed_shift)
        out = np.zeros((self.px, self.px))
        amp, total, scale = 1.0, 0.0, scale_arcmin
        for _ in range(octaves):
            field = ndimage.gaussian_filter(rng.standard_normal((self.px, self.px)), max(0.6, scale / self.s / 2.5))
            out += amp * field / (field.std() + 1e-9)
            total += amp
            amp *= 0.55
            scale /= 2.1
        out /= total
        return np.clip(0.5 + 0.28 * out, 0, 1)

    def stars(self, xs, ys, fluxes, colours, sigma_px=0.9):
        """Point sources: splatted then blurred, with a faint wide wing on the bright ones."""
        layer = np.zeros_like(self.rgb)
        ix = np.round(xs / self.s + (self.px - 1) / 2).astype(int)
        iy = np.round(-ys / self.s + (self.px - 1) / 2).astype(int)
        ok = (ix >= 0) & (ix < self.px) & (iy >= 0) & (iy < self.px)
        for ch in range(3):
            np.add.at(layer[..., ch], (iy[ok], ix[ok]), fluxes[ok] * colours[ok, ch])
        core = np.stack([ndimage.gaussian_filter(layer[..., c], sigma_px) for c in range(3)], -1)
        wing = np.stack([ndimage.gaussian_filter(layer[..., c], sigma_px * 4) for c in range(3)], -1)
        # Scaled so `fluxes` is each star's peak.
        self.rgb += core * (2 * np.pi * sigma_px**2) + 0.03 * wing * (2 * np.pi * (4 * sigma_px) ** 2)

    def save(self, name, stretch=12.0, gain=1.0, fade=0.82):
        r = np.hypot(self.u, self.v) / (self.span / 2)
        edge = np.clip((1 - r) / (1 - fade), 0, 1) ** 2
        lin = np.clip(self.rgb * gain, 0, None) * edge[..., None]
        lum = lin.mean(-1)
        stretched = np.arcsinh(stretch * lum) / np.arcsinh(stretch)
        out = lin * (stretched / np.maximum(lum, 1e-9))[..., None]
        # Desaturate a little: a one-shot-colour stack is never as vivid as a print.
        grey = out.mean(-1, keepdims=True)
        out = grey + 0.85 * (out - grey)
        img = (np.clip(out, 0, 1) ** (1 / 1.1) * 255 + 0.5).astype(np.uint8)
        OUT.mkdir(parents=True, exist_ok=True)
        Image.fromarray(img, "RGB").save(OUT / f"{name}.webp", quality=86, method=6)
        print(f"{name}: {self.px}px over {self.span}'")


def sersic(r, re, n):
    b = 2 * n - 1 / 3
    return np.exp(-b * ((r / re) ** (1 / n) - 1))


def spiral(p, x0, y0, pa, q, pitch, arms=2, phase=0.0, sharp=3.0):
    """Arm crest strength 0-1 and the deprojected radius, for a disc at (x0, y0)."""
    a, b = p.axes(pa, x0, y0)
    b = b / q
    r = np.hypot(a, b) + 1e-6
    phi = np.arctan2(b, a)
    psi = phi - np.log(r) / np.tan(np.radians(pitch)) + phase
    crest = (0.5 + 0.5 * np.cos(arms * psi)) ** sharp
    lane = (0.5 + 0.5 * np.cos(arms * (psi + 0.55))) ** (sharp * 2)
    return crest, lane, r


def m51():
    p = Plate(16.8, 1300, 51)
    x0, y0 = 0.0, -1.6
    crest, lane, r = spiral(p, x0, y0, 163, 0.85, 18, phase=0.4)
    disc = np.exp(-r / 1.35)
    grow = np.clip((r - 0.35) / 0.6, 0, 1) * np.exp(-((r / 5.2) ** 6))
    p.add(1.4 * sersic(r, 0.28, 2.5) * 0.25, WARM)
    lumpy = 0.55 + 0.9 * p.noise(0.6)
    p.add(disc * (0.14 + 0.55 * crest * grow * lumpy) * 0.6, BLUE * 0.6 + WHITE * 0.4)
    p.dim(0.5 * lane * grow * np.exp(-r / 3) * lumpy)
    # HII knots strung along the inner crests, few and faint.
    ys, xs = np.nonzero((crest > 0.8) & (grow > 0.4) & (r < 3.4) & (p.rng.random(r.shape) < 0.0004))
    knots = len(xs)
    p.stars(p.u[ys, xs], p.v[ys, xs], p.rng.uniform(0.05, 0.18, knots), np.tile(PINK, (knots, 1)), 1.6)
    # NGC 5195 to the north, joined by the tidal bridge.
    cx, cy = p.at(10, 4.4)
    cx, cy = cx + x0, cy + y0
    a, b = p.axes(80, cx, cy)
    rr = np.hypot(a, b / 0.78)
    p.add(0.9 * sersic(rr, 0.45, 2.2) * 0.3, WARM)
    p.dim(0.4 * np.exp(-(((b + 0.25) / 0.12) ** 2)) * np.exp(-((a / 0.9) ** 2)))
    bx, by = p.at(10, 2.6)
    bridge = np.exp(-(((p.u - x0 - bx) / 0.9) ** 2 + ((p.v - y0 - by) / 1.6) ** 2))
    p.add(0.05 * bridge, WHITE)
    p.save("m51", stretch=14)


def m81():
    p = Plate(32, 1600, 81)
    crest, lane, r = spiral(p, 0, 0, 157, 0.52, 12, phase=1.1, sharp=2.5)
    grow = np.clip((r - 2.2) / 1.5, 0, 1) * np.exp(-((r / 13) ** 6))
    p.add(1.2 * sersic(r, 1.5, 3.0) * 0.3, WARM)
    lumpy = 0.6 + 0.8 * p.noise(1.2)
    p.add(np.exp(-r / 3.6) * (0.24 + 0.35 * crest * grow * lumpy) * 0.5, BLUE * 0.5 + WHITE * 0.5)
    p.dim(0.3 * lane * grow * lumpy)
    p.save("m81", stretch=16)


def m82():
    p = Plate(14, 1300, 82)
    a, b = p.axes(65)
    clumps = p.noise(0.5)
    body = np.exp(-np.abs(a) / 1.6) * np.exp(-((b / 0.55) ** 2) / 2) * np.exp(-((a / 5.2) ** 8))
    p.add(body * (0.55 + 0.9 * clumps) * 0.55, WHITE * 0.7 + WARM * 0.3)
    # The dust that breaks it up across the middle.
    lanes = np.clip((p.noise(0.35) - 0.5) * 3.5, 0, 1) * np.exp(-((a / 2.4) ** 2)) * np.exp(-((b / 0.55) ** 2))
    p.dim(0.85 * lanes)
    p.dim(0.5 * np.exp(-(((a - 0.4 * b) / 0.18) ** 2)) * np.exp(-((b / 0.7) ** 2)) * np.exp(-((a / 2.5) ** 2)))
    # The starburst wind: a faint red plume along the minor axis, kept quiet.
    plume = np.exp(-((a / (0.5 + 0.35 * np.abs(b))) ** 2)) * np.exp(-np.abs(b) / 1.2) * np.clip(np.abs(b) / 0.4, 0, 1)
    p.add(0.06 * plume * p.noise(0.25), RED)
    p.save("m82", stretch=10)


def m104():
    p = Plate(12, 1200, 104)
    a, b = p.axes(90)
    bulge = sersic(np.hypot(a, b / 0.6), 1.0, 4)
    disc = np.exp(-np.abs(a) / 1.9) * np.exp(-((b / 0.24) ** 2)) * np.exp(-((a / 4.4) ** 8))
    p.add(0.35 * bulge, WARM)
    p.add(0.5 * disc, WHITE * 0.6 + WARM * 0.4)
    # The lane runs along the major axis just south of the nucleus.
    lane = np.exp(-(((b + 0.1) / 0.1) ** 2)) * np.exp(-((a / 4.2) ** 8))
    p.dim(0.95 * lane)
    p.save("m104", stretch=18)


def m27():
    p = Plate(12, 1200, 27)
    a, b = p.axes(120)  # the football's long axis
    halo = np.exp(-((np.hypot(a / 4.0, b / 2.85)) ** 6))
    p.add(0.12 * halo * (0.7 + 0.6 * p.noise(0.8)), TEAL * 0.35 + RED * 0.65)
    # The apple core: two bright lobes across the long axis, pinched at the waist.
    ang = np.arctan2(a, b)  # zero along the short axis
    lobe = np.exp(-((np.minimum(np.abs(ang), np.pi - np.abs(ang)) / 0.85) ** 2))
    r = np.hypot(a, b)
    waist = np.exp(-((np.hypot(a / 1.25, b / 1.9)) ** 4))
    core = np.maximum(lobe * np.exp(-((r / 2.75) ** 6)), 0.8 * waist)
    texture = 0.7 + 0.6 * p.noise(0.4)
    p.add(0.4 * core * texture, TEAL * 0.65 + WHITE * 0.35)
    rim = core * np.clip((r - 1.6) / 1.1, 0, 1)
    p.add(0.25 * rim * texture, RED)
    p.add(0.12 * np.exp(-((r / 1.3) ** 2)), TEAL * 0.6 + WHITE * 0.4)
    p.stars(np.array([0.0]), np.array([0.0]), np.array([0.25]), np.array([BLUE]), 1.1)
    p.save("m27", stretch=8)


def m1():
    p = Plate(9, 1000, 1)
    a, b = p.axes(130)
    shape = np.exp(-((np.hypot(a / 3.0, b / 2.0)) ** 4))
    ridges = 1 - np.abs(2 * p.noise(0.35, octaves=5) - 1)
    edge = np.clip(np.hypot(a / 3.0, b / 2.0) * 1.3, 0, 1)
    p.add(0.4 * shape * (0.7 + 0.5 * p.noise(0.8)), BLUE * 0.35 + WHITE * 0.65)
    p.add(0.14 * shape * ridges**4 * (0.3 + 0.9 * edge), RED)
    p.save("m1", stretch=9)


def globular(name, span, px, a_core, count, seed, brightest):
    p = Plate(span, px, seed)
    rng = p.rng
    u = rng.random(count)
    r = a_core * np.sqrt(u / (1 - u + 1e-9))
    keep = r < span * 0.42
    r = r[keep]
    t = rng.random(r.size) * 2 * np.pi
    mags = brightest + 5.5 * rng.random(r.size) ** 0.45
    flux = 10 ** (-0.4 * (mags - brightest)) * 0.9
    colours = np.tile(WHITE, (r.size, 1))
    giants = rng.random(r.size) < 0.06
    colours[giants] = WARM * np.array([1.0, 0.9, 0.75])
    hb = rng.random(r.size) < 0.05
    colours[hb] = BLUE
    p.stars(r * np.cos(t), r * np.sin(t), flux, colours, 0.85)
    rr = np.hypot(p.u, p.v)
    p.add(0.5 * (1 + (rr / a_core) ** 2) ** -2, WHITE * 0.8 + WARM * 0.2)
    p.save(name, stretch=10)


def double_cluster():
    p = Plate(36, 1600, 869)
    rng = p.rng
    n = 420
    u = rng.random(n)
    r = 3.0 * np.sqrt(u / (1 - u * 0.9))
    r = np.clip(r, 0, 16)
    t = rng.random(n) * 2 * np.pi
    mags = 6.5 + 6 * rng.random(n) ** 0.55
    flux = 10 ** (-0.4 * (mags - 6.5)) * 6
    colours = np.tile(BLUE * 0.6 + WHITE * 0.4, (n, 1))
    colours[rng.random(n) < 0.04] = np.array([1.0, 0.62, 0.38])
    p.stars(r * np.cos(t), r * np.sin(t), flux, colours, 1.2)
    p.save("ngc869", stretch=8)


def m31():
    p = Plate(64, 2000, 31)
    a, b = p.axes(35)
    p.add(0.9 * np.exp(-0.5 * (np.hypot(a, b) / 0.07) ** 2), WHITE)
    p.add(0.12 * sersic(np.hypot(a, b / 0.72), 2.2, 3), WARM)
    disc_r = np.hypot(a, b / 0.31)
    p.add(0.07 * np.exp(-disc_r / 22) * np.exp(-((np.hypot(p.u, p.v) / 26) ** 4)), WHITE * 0.6 + WARM * 0.4)
    # Dust arcs on the near (north-west) side of the disc.
    near = np.clip(-b / 1.5, 0, 1)
    for ring, depth in ((17.5, 0.45), (26, 0.4), (35, 0.3)):
        p.dim(depth * near * np.exp(-(((disc_r - ring) / 3.2) ** 2)) * (0.4 + 1.0 * p.noise(2.5)))
    # M32, small and bright, south of the nucleus.
    mx, my = p.at(170, 22)
    p.add(0.55 * sersic(np.hypot(p.u - mx, (p.v - my) / 0.85), 0.45, 3), WARM)
    p.save("m31", stretch=7, fade=0.6)


def m42():
    p = Plate(60, 2000, 42)
    u, v = p.u, p.v
    clouds = p.noise(2.0, octaves=5)
    fine = p.noise(0.5, octaves=4)
    ridges = (1 - np.abs(2 * p.noise(0.9, octaves=4) - 1)) ** 3
    r = np.hypot(u, v)
    texture = (0.65 + 0.6 * clouds) * (0.8 + 0.35 * fine) * (0.86 + 0.28 * ridges)
    # The Huygens region: a bright core drawn out east-west around the Trapezium.
    huygens = np.exp(-((u / 3.4) ** 2 + ((v + 0.6) / 2.4) ** 2))
    # The Orion Bar, a ridge south-west of the Trapezium.
    ba, bb = p.axes(55, 1.9, -1.6)
    bar = np.exp(-((ba / 2.2) ** 2 + (bb / 0.35) ** 2))
    # The wings: a broad, bright one sweeping south-west, a thin arc curving south-east.
    d = np.hypot(u, v - 5)
    theta = np.degrees(np.arctan2(u, -(v - 5)))  # 0 straight south of the arc's centre, west positive
    west = np.exp(-(((d - 10.5) / 3.4) ** 2)) * np.exp(-(((theta - 30) / 24) ** 2))
    east = np.exp(-(((d - 12.5) / 1.6) ** 2)) * np.exp(-(((theta + 52) / 20) ** 2))
    body = np.exp(-(((u - 1.5) / 10) ** 2 + ((v + 4) / 11) ** 2))
    glow = 1.1 * huygens + 0.5 * bar + 0.75 * west + 0.45 * east + 0.22 * body
    p.add(0.36 * glow * texture, RED * 0.7 + PINK * 0.3)
    p.add(0.5 * huygens * (0.8 + 0.3 * fine) + 0.15 * bar, TEAL * 0.45 + WHITE * 0.55)
    # The dark bay of the Fish's Mouth, cutting in from the north-east toward the core.
    ba, bb = p.axes(50, -2.0, 2.6)
    bay = np.exp(-((ba / 3.4) ** 2 + (bb / 1.1) ** 2))
    p.dim(0.85 * bay * np.clip(r / 1.6, 0, 1), np.array([1.0, 1.0, 1.0]))
    # M43, a small comma to the north with its own star.
    m43 = np.exp(-(((u + 0.3) / 1.4) ** 2 + ((v - 7.4) / 1.2) ** 2))
    p.add(0.3 * m43 * (0.7 + 0.5 * fine), RED * 0.6 + PINK * 0.4)
    trap = np.array([[0.0, 0.0], [0.13, 0.22], [-0.12, 0.12], [0.05, -0.15], [-0.05, 7.6]])
    p.stars(trap[:, 0], trap[:, 1], np.array([1.2, 0.8, 0.7, 0.6, 0.6]), np.tile(BLUE * 0.5 + WHITE * 0.5, (5, 1)), 1.0)
    # Stars embedded in the cloud.
    n = 60
    sx, sy = p.rng.normal(0.5, 6, n), p.rng.normal(-2, 7, n)
    p.stars(sx, sy, p.rng.uniform(0.08, 0.6, n) ** 1.5, np.tile(BLUE * 0.4 + WHITE * 0.6, (n, 1)), 1.0)
    p.save("m42", stretch=10, fade=0.85)


if __name__ == "__main__":
    m51()
    m81()
    m82()
    m104()
    m27()
    m1()
    globular("m13", 24, 1600, 0.9, 9000, 13, 11.9)
    globular("m15", 16, 1300, 0.42, 7000, 15, 12.6)
    double_cluster()
    m31()
    m42()
