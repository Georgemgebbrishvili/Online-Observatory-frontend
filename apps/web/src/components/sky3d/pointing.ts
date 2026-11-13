/**
 * "Point at the sky" (ADR-085): the phone's orientation as the sky camera's, steady and
 * aimed at true north. Loaded with three.js, in the browser only.
 *
 * - **One sensor frame.** iOS gives `alpha` against an arbitrary start and a separate
 *   magnetic `webkitCompassHeading`, which turns half a circle as the top edge passes
 *   upright -- the very pose of a phone held up to the sky. Mixing that heading with the
 *   tilt flipped the sky. Here the heading only teaches an offset for `alpha`, learned
 *   while the phone is tilted between flat and upright, where every reading agrees; the
 *   camera then turns with `alpha` alone, which never jumps. Android's absolute event is
 *   north-referenced already.
 * - **True north.** Compasses point to magnetic north; the declination is added.
 * - **Steady.** Readings set a goal; each frame the camera turns toward it, smoothing
 *   heavily while the phone is still and hardly at all while it turns (see step).
 */
import { Euler, Quaternion, Vector3 } from "three";

const DEG = Math.PI / 180;


type Reading = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

/** The angle a phone's screen is turned from portrait, degrees. */
function screenAngle() {
  const angle = screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0;
  return Number(angle) || 0;
}

/** The smallest signed difference a − b of two angles, degrees. */
function apart(a: number, b: number) {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

export class Pointing {
  /** Where the readings say the camera points, and where it is drawn this frame. */
  private goal = new Quaternion();
  private drawn = new Quaternion();
  private slow = new Quaternion();
  private lastSlow = new Quaternion();
  /** How fast the phone is turning, degrees a second, smoothed. */
  private speed = 0;
  private started = false;
  private read = false;
  /** iOS: degrees added to `alpha` to put it on north. */
  private offset: number | null = null;
  private euler = new Euler();
  private back = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  private turn = new Quaternion();
  private z = new Vector3(0, 0, 1);

  constructor(
    private declination: number,
    /** The event is north-referenced (deviceorientationabsolute). */
    private absolute: boolean,
  ) {}

  setDeclination(degrees: number) {
    this.declination = degrees;
  }

  /** Takes a sensor reading. */
  take(event: Reading) {
    if (event.alpha === null || event.beta === null || event.gamma === null) return;
    let alpha = event.alpha;
    if (!this.absolute && event.webkitCompassHeading !== undefined && event.webkitCompassHeading >= 0) {
      // The heading as an alpha (alpha turns the other way), magnetic.
      const fromCompass = 360 - event.webkitCompassHeading;
      // Sound only while the top edge is well off the vertical and the phone not on its side.
      const sound = Math.abs(event.beta) > 12 && Math.abs(event.beta) < 78 && Math.abs(event.gamma) < 50;
      const sample = apart(fromCompass, alpha) + (event.beta > 90 || event.beta < -90 ? 180 : 0);
      if (this.offset === null) this.offset = sample;
      else if (sound) this.offset += apart(sample, this.offset) * 0.04;
      alpha += this.offset;
    }
    // Magnetic to true: a heading grows eastward, alpha the other way.
    alpha -= this.declination;
    this.euler.set(event.beta * DEG, alpha * DEG, -event.gamma * DEG, "YXZ");
    this.goal.setFromEuler(this.euler).multiply(this.back);
    this.goal.multiply(this.turn.setFromAxisAngle(this.z, -screenAngle() * DEG));
    this.read = true;
  }

  /**
   * The camera this frame, `dt` milliseconds after the last. The smoothing follows how fast
   * the phone is turning, as a "one euro" filter does: held still, the readings are
   * averaged over about a fifth of a second, which takes out the hand's tremor and the
   * sensor's noise; turning, it eases off to a few hundredths, so the sky keeps up and
   * lands exactly where the phone stops. Null until the first reading.
   */
  step(dt: number) {
    if (!this.read) return null;
    if (!this.started) {
      this.drawn.copy(this.goal);
      this.slow.copy(this.goal);
      this.lastSlow.copy(this.goal);
      this.started = true;
      return this.drawn;
    }
    // How fast the phone turns, from a lightly averaged copy of the readings, so tremor
    // (which goes nowhere) does not count as turning.
    this.slow.slerp(this.goal, 1 - Math.exp(-dt / 90));
    const turning = this.lastSlow.angleTo(this.slow) / DEG / Math.max(dt, 1) * 1000;
    this.lastSlow.copy(this.slow);
    this.speed += (turning - this.speed) * (1 - Math.exp(-dt / 80));
    // Under 6° a second is a hand holding still; from 50° it is a turn.
    const t = Math.min(1, Math.max(0, (this.speed - 6) / 44));
    const tau = 230 - 205 * t * t * (3 - 2 * t);
    this.drawn.slerp(this.goal, 1 - Math.exp(-dt / tau));
    return this.drawn;
  }
}