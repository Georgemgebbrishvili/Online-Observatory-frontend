import { palette } from "@/styles/tokens";

/**
 * The homepage's simulated camera feed: one object as a live stack would show it. At
 * depth 0 it is a single raw sub (dim, grainy, soft, the air sliding rows of it about);
 * as the depth goes to 1 the frames add up and it settles clean, the way the console's
 * feed does (ADR-082). A drawing from a reference picture, always badged Simulated.
 */
export function createFeed(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const ctx = canvas.getContext("2d")!;
  const buffer = document.createElement("canvas");
  const bctx = buffer.getContext("2d")!;
  const soft = document.createElement("canvas");
  const sctx = soft.getContext("2d")!;

  // Grain: a few tiles of sensor noise, laid at a new offset each frame.
  const tiles = [0, 1, 2].map((seed) => {
    const tile = document.createElement("canvas");
    tile.width = tile.height = 128;
    const t = tile.getContext("2d")!;
    const data = t.createImageData(128, 128);
    let s = 9001 + seed * 77;
    for (let i = 0; i < data.data.length; i += 4) {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      const v = (s >>> 24) & 255;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    t.putImageData(data, 0, 0);
    return tile;
  });

  // A fixed field of faint stars around the object.
  const stars: [number, number, number][] = [];
  let seed = 4242;
  for (let i = 0; i < 46; i++) {
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    const x = ((seed >>> 8) & 1023) / 1023;
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    const y = ((seed >>> 8) & 1023) / 1023;
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    stars.push([x, y, 0.3 + (((seed >>> 8) & 255) / 255) * 0.7]);
  }

  let W = 0;
  let H = 0;

  const resize = () => {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = Math.max(2, Math.round(canvas.clientWidth * dpr));
    H = Math.max(2, Math.round(canvas.clientHeight * dpr));
    canvas.width = buffer.width = W;
    canvas.height = buffer.height = H;
  };

  /**
   * @param depth 0 a single raw sub, 1 the settled stack
   * @param seconds the clock the air and the grain move by
   * @param at where the object sits in the frame (fractions) and how much of the short side it spans
   */
  const draw = (depth: number, seconds: number, at: { x: number; y: number; span: number }) => {
    if (!image.complete || !image.naturalWidth) return;
    const raw = 1 - depth;
    const frame = Math.floor(seconds * 24);

    // The scene, sharp: black sky, field stars, the object.
    bctx.globalCompositeOperation = "source-over";
    bctx.globalAlpha = 1;
    bctx.fillStyle = palette.black;
    bctx.fillRect(0, 0, W, H);
    bctx.fillStyle = palette.starCool;
    for (const [x, y, b] of stars) {
      bctx.globalAlpha = b * (0.25 + 0.75 * depth);
      const r = Math.max(1, (0.6 + b) * (W / 1400));
      bctx.beginPath();
      bctx.arc(x * W, y * H, r, 0, Math.PI * 2);
      bctx.fill();
    }
    const side = Math.min(W, H) * at.span;
    const ratio = image.naturalWidth / image.naturalHeight;
    const iw = ratio >= 1 ? side : side * ratio;
    const ih = ratio >= 1 ? side / ratio : side;
    // The tracking wanders a little on a raw sub and holds once the stack registers.
    const jx = Math.sin(seconds * 2.3) * raw * W * 0.006;
    const jy = Math.cos(seconds * 1.7) * raw * H * 0.006;
    bctx.globalAlpha = 0.55 + 0.45 * depth;
    bctx.globalCompositeOperation = "lighter";
    bctx.drawImage(image, at.x * W - iw / 2 + jx, at.y * H - ih / 2 + jy, iw, ih);
    bctx.globalCompositeOperation = "source-over";
    bctx.globalAlpha = 1;

    // The seeing's blur: the raw sub is the scene at a fraction of its size, scaled back up.
    // Even the settled stack keeps the softness of 203 mm of aperture under real air.
    const scale = (0.1 + 0.3 * Math.pow(depth, 1.6)) * Math.min(1, 1400 / W);
    const sw = Math.max(2, Math.round(W * scale));
    const sh = Math.max(2, Math.round(H * scale));
    if (soft.width !== sw || soft.height !== sh) {
      soft.width = sw;
      soft.height = sh;
    }
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(buffer, 0, 0, sw, sh);

    // The air: bands of the frame slide against each other, less as the stack grows.
    ctx.globalAlpha = 1;
    ctx.imageSmoothingQuality = "high";
    const boil = raw * raw * W * 0.012;
    if (boil < 0.5) {
      ctx.drawImage(soft, 0, 0, W, H);
    } else {
      const bands = 36;
      const bh = H / bands;
      ctx.fillStyle = palette.black;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < bands; i++) {
        const dx = (Math.sin(i * 0.9 + seconds * 9) + Math.sin(i * 0.37 - seconds * 5.3)) * boil;
        ctx.drawImage(soft, 0, (i * sh) / bands, sw, sh / bands, dx, i * bh, W, bh + 1);
      }
    }

    // Sensor grain over everything, fading with the square root of the stack.
    const grain = 0.34 * Math.sqrt(raw);
    if (grain > 0.01) {
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = grain;
      const tile = tiles[frame % tiles.length];
      const ox = (frame * 37) % 128;
      const oy = (frame * 61) % 128;
      const size = 128 * Math.max(1, W / 900);
      for (let y = -oy; y < H; y += size) for (let x = -ox; x < W; x += size) ctx.drawImage(tile, x, y, size, size);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  };

  resize();
  return { draw, resize };
}
