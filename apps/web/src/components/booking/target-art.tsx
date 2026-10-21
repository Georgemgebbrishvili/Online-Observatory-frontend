import type { Target } from "@darkview/contracts";
import { useId } from "react";

import { targetVisual } from "@/features/targets/present";

export type TargetAccent =
  "saturn" | "jupiter" | "mars" | "venus" | "moon" | "star" | "cluster" | "nebula";

/** Each target's own colour, for its card's wash and glow (ADR-057). */
export function targetAccent(target: Target): TargetAccent {
  const body = target.solarSystemBody?.toLowerCase();
  if (body === "saturn" || body === "jupiter" || body === "mars" || body === "venus")
    return body;
  const visual = targetVisual(target);
  if (visual === "moon") return "moon";
  if (visual === "star") return "star";
  if (visual === "cluster") return "cluster";
  if (visual === "ring" || visual === "nebula") return "nebula";
  return "venus";
}

// A globular cluster's stars, thrown once: denser to the core, as M13's are.
const clusterStars = (() => {
  let seed = 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 140 }, () => {
    const r = Math.pow(rnd(), 1.6) * 32;
    const a = rnd() * Math.PI * 2;
    return {
      x: Math.round((50 + Math.cos(a) * r) * 10) / 10,
      y: Math.round((50 + Math.sin(a) * r) * 10) / 10,
      s: Math.round((0.7 + rnd() * (r < 10 ? 1.5 : 1)) * 100) / 100,
    };
  });
})();

/**
 * A target's picture on its card: our drawn plate for a planet, a drawn Moon, double star
 * or cluster for the rest. Every one is an illustration, and the board says so.
 */
export function TargetArt({ target }: { target: Target }) {
  const id = useId();
  const accent = targetAccent(target);

  if (
    accent === "saturn" ||
    accent === "jupiter" ||
    accent === "mars" ||
    accent === "venus"
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`target-art target-art-${accent}`}
        src={`/sky/${accent}.webp`}
        alt=""
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (accent === "moon") {
    return (
      <svg
        className="target-art target-art-moon"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-moon`} cx="38%" cy="34%" r="70%">
            <stop offset="0" className="art-moon-hi" />
            <stop offset="0.55" className="art-moon-mid" />
            <stop offset="1" className="art-moon-lo" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="34" fill={`url(#${id}-moon)`} />
        <g className="art-moon-maria">
          <ellipse cx="40" cy="38" rx="9" ry="7" />
          <ellipse cx="55" cy="33" rx="7" ry="5" />
          <ellipse cx="60" cy="50" rx="10" ry="8" />
          <ellipse cx="45" cy="58" rx="8" ry="6" />
          <ellipse cx="34" cy="50" rx="5" ry="6" />
        </g>
        <g className="art-moon-craters">
          <circle cx="58" cy="72" r="2.6" />
          <circle cx="30" cy="62" r="1.8" />
          <circle cx="68" cy="38" r="1.5" />
        </g>
      </svg>
    );
  }

  if (accent === "star") {
    return (
      <svg
        className="target-art target-art-star"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-gold`}>
            <stop offset="0" className="art-star-core" />
            <stop offset="0.25" className="art-star-gold" />
            <stop offset="1" className="art-star-fade" />
          </radialGradient>
          <radialGradient id={`${id}-blue`}>
            <stop offset="0" className="art-star-core" />
            <stop offset="0.3" className="art-star-blue" />
            <stop offset="1" className="art-star-fade" />
          </radialGradient>
        </defs>
        <g className="art-star-spikes">
          <path d="M40 30 V78 M16 54 H64" />
        </g>
        <circle cx="40" cy="54" r="22" fill={`url(#${id}-gold)`} />
        <circle cx="64" cy="38" r="14" fill={`url(#${id}-blue)`} />
      </svg>
    );
  }

  if (accent === "cluster") {
    return (
      <svg
        className="target-art target-art-cluster"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-core`}>
            <stop offset="0" className="art-cluster-core" />
            <stop offset="1" className="art-star-fade" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill={`url(#${id}-core)`} />
        <g className="art-cluster-stars">
          {clusterStars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.s} />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg
      className="target-art target-art-nebula"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-ring`}>
          <stop offset="0.35" className="art-star-fade" />
          <stop offset="0.6" className="art-nebula" />
          <stop offset="1" className="art-star-fade" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="50" rx="30" ry="24" fill={`url(#${id}-ring)`} />
    </svg>
  );
}
