export const nudgeDirections = ["UP", "RIGHT", "DOWN", "LEFT"] as const;
export type NudgeDirection = (typeof nudgeDirections)[number];

export type SafeNudgeRequest = {
  kind: "SAFE_NUDGE_REQUEST";
  direction: NudgeDirection;
  arcseconds: 5;
  status: "AWAITING_SERVER_VALIDATION";
  directlyCommandsHardware: false;
};

export function createSafeNudgeRequest(direction: NudgeDirection): SafeNudgeRequest {
  return {
    kind: "SAFE_NUDGE_REQUEST",
    direction,
    arcseconds: 5,
    status: "AWAITING_SERVER_VALIDATION",
    directlyCommandsHardware: false,
  };
}
