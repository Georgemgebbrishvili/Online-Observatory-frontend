import type { MissionState, MissionWatchView, ObserverPack } from "@darkview/contracts";

import { reopensSession, type LiveState, type LiveStatus } from "./live";

/**
 * A mission past its live view: nothing more to watch. As the room's, except that a
 * weather hold and a scheduled mission are still sessions an observer may sit in.
 */
export function sessionOver(state: MissionState) {
  return state !== "SCHEDULED" && state !== "WEATHER_HOLD" && !reopensSession(state);
}

/**
 * ADR-045: what a close gave back for the caller's seat. Issued and owed are never both
 * set; owed is said as owed, never as refunded. Null when there is nothing to say.
 */
export function packRefund(
  pack: ObserverPack | null | undefined,
): {
  kind: "refunded" | "owed";
  minor: number;
  currency: ObserverPack["currency"];
} | null {
  if (!pack) return null;
  if (pack.refundedMinor) {
    return { kind: "refunded", minor: pack.refundedMinor, currency: pack.currency };
  }
  if (pack.refundOwedMinor) {
    return { kind: "owed", minor: pack.refundOwedMinor, currency: pack.currency };
  }
  return null;
}

/**
 * Where the watch page opens. A buyer who paid keeps their place (ADR-045): told the
 * owner closed it while it still runs, offered their seat again while it is open, and
 * never offered a seat for sale that they already own.
 */
export type OpeningPhase = "watching" | "over" | "closed" | "left" | "full" | "sale";

export function openingPhase(view: MissionWatchView, capacity: number): OpeningPhase {
  if (view.myObserverSeat) return "watching";
  if (sessionOver(view.mission.state)) return "over";
  if (view.myObserverPack?.status === "PAID") {
    return view.mission.observable === true ? "left" : "closed";
  }
  return view.observerCount >= capacity ? "full" : "sale";
}

export type WatchStatus = Extract<
  LiveStatus,
  "connecting" | "live" | "reconnecting" | "offline" | "hold" | "ended"
>;

/**
 * The one status an observer's feed shows (Phase 4 slice 5). The room's `liveStatus`
 * follows a session the owner starts; an observer holds a seat instead, so there is no
 * start, no session and no expiry to follow, only the channel. Earlier rules win.
 */
export function watchStatus(live: LiveState): WatchStatus {
  const state = live.missionState;
  if (state === "WEATHER_HOLD") return "hold";
  if (sessionOver(state)) return "ended";
  if (live.link === "OFFLINE") return "offline";
  if (live.socket === "lost") return "reconnecting";
  if (live.stream) return "live";
  return "connecting";
}

/**
 * The checkout sends the buyer back to the watch page with nothing in the address to
 * say so, so the page notes, before it leaves, which mission it went to pay for. Read
 * once on the way back; a browser that keeps no storage simply sees the seat for sale.
 */
const checkoutKey = "stellar:watch-checkout";

export function markCheckout(missionId: string) {
  try {
    window.sessionStorage.setItem(checkoutKey, missionId);
  } catch {
    // Storage refused: the page shows the seat for sale on return, and buying again
    // returns the same pack.
  }
}

export function returnedFromCheckout(missionId: string) {
  try {
    return window.sessionStorage.getItem(checkoutKey) === missionId;
  } catch {
    return false;
  }
}

export function clearCheckout() {
  try {
    window.sessionStorage.removeItem(checkoutKey);
  } catch {
    // Nothing to clear.
  }
}
