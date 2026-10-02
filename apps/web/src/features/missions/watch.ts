import type { MissionState } from "@darkview/contracts";

import { reopensSession, type LiveState, type LiveStatus } from "./live";

/**
 * A mission past its live view: nothing more to watch. As the room's, except that a
 * weather hold and a scheduled mission are still sessions an observer may sit in.
 */
export function sessionOver(state: MissionState) {
  return state !== "SCHEDULED" && state !== "WEATHER_HOLD" && !reopensSession(state);
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
