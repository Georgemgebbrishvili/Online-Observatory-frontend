'use client';

import type { HorizontalCoordinates, ImagingProfile, Mission, MissionState } from '@darkview/contracts';
import { zCommandRejectionReason, zSubmitMissionCommandResponse } from '@darkview/contracts/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { commandRequest, NUDGE_STEP_ARCMINUTES, offeredControls, outcomeOf, type Control, type Outcome } from '@/features/missions/controls';
import { liveStatus, type LiveStatus } from '@/features/missions/live';
import { useLiveSession } from '@/features/missions/use-live-session';
import type { Locale } from '@/i18n/config';
import { ApiRequestError, apiRequest, navigateWithFreshSession } from '@/lib/platform/browser';
import type { Axis } from '@/lib/observatory-sim/mount-drive';
import type { AltAz } from '@/lib/observatory-sim/safety';

/**
 * The real instrument, through the platform (ADR-054 §6).
 *
 * The console's controls become the contract's `ClientCommandType`: a held arrow is a
 * run of bounded NUDGE steps at the envelope's rate, Centre is RECENTER, Capture is
 * CAPTURE, Stop is ABORT. The feed is the platform's stream, the pointing is the
 * telemetry's. What the contract withholds from a customer — a GoTo of the customer's
 * choosing, a train change, park — the driver reports as unavailable, and the console
 * says so. Nothing here addresses hardware: every press is `submitMissionCommand`.
 */

/**
 * The nudge envelope's rate as the platform seeds it (`nudgeRateDegreesPerSecond`:
 * 0.25°/s), degrees per second. A held arrow asks for one bounded step, and the next
 * as soon as the agent has answered the last, never faster than the envelope's rate.
 */
const NUDGE_RATE_DEG_S = 0.25;
const stepEveryMs = Math.round((NUDGE_STEP_ARCMINUTES / 60 / NUDGE_RATE_DEG_S) * 1000);

export type PlatformFeed = { url: string; simulated: boolean; expiresAt: string } | null;

export type PlatformDriverState = {
  missionState: MissionState;
  status: LiveStatus;
  feed: PlatformFeed;
  pointing: AltAz | null;
  tracking: boolean | null;
  linkOnline: boolean;
  session: boolean;
  /** Which controls the platform offers this moment. */
  offered: ReturnType<typeof offeredControls>;
  pending: Control | null;
  outcome: { control: Control; outcome: Outcome } | null;
  timeLeftMs: number | null;
};

export type PlatformDriver = {
  state: PlatformDriverState;
  start: () => void;
  press: (axis: Axis, direction: 1 | -1) => void;
  release: (axis: Axis) => void;
  recentre: () => void;
  capture: () => void;
  stop: () => void;
  onStreamError: () => void;
};

/** The platform's refusal, as the live room reads it (room-controls.tsx). */
function refusalOf(error: ApiRequestError) {
  const named = zCommandRejectionReason.safeParse(error.error?.details?.rejectionReason);
  if (named.success) return named.data;
  if (error.error?.code === 'SESSION_NOT_OWNER') return 'WRONG_SESSION' as const;
  if (error.error?.code === 'MISSION_NOT_ACTIVE') return 'NO_ACTIVE_MISSION' as const;
  return null;
}

const horizontal = (p: HorizontalCoordinates | null | undefined): AltAz | null =>
  p ? { altitude: p.altitudeDegrees, azimuth: p.azimuthDegrees } : null;

export function usePlatformDriver({
  mission,
  imagingProfile,
  locale,
  signInPath,
  now,
}: {
  mission: Mission;
  imagingProfile: ImagingProfile | null;
  locale: Locale;
  signInPath: string;
  now: number;
}): PlatformDriver {
  const { live, start, onStreamError } = useLiveSession({
    missionId: mission.id,
    state: mission.state,
    failureReason: mission.failureReason ?? null,
    locale,
  });
  const [command, setCommand] = useState<{ control: Control; commandId: string | null; expiresAt: string | null; outcome: Outcome | null } | null>(null);
  const verdict = command?.commandId ? live.verdicts[command.commandId] : undefined;
  const outcome = command?.outcome ?? (verdict ? outcomeOf(verdict) : null);
  const pending = command && !outcome ? command : null;
  const connected = live.socket === 'open';
  const offered = offeredControls(live.missionState, connected, imagingProfile);

  // Past the envelope's own deadline there will be no verdict worth waiting for.
  const waitUntil = pending?.expiresAt ?? null;
  useEffect(() => {
    if (!waitUntil) return;
    const timer = window.setTimeout(
      () => setCommand((c) => (c && c.expiresAt === waitUntil ? { ...c, outcome: { kind: 'no-answer' } } : c)),
      Math.max(Date.parse(waitUntil) - Date.now(), 0) + 1000,
    );
    return () => window.clearTimeout(timer);
  }, [waitUntil]);

  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const submit = useCallback(
    async (control: Control) => {
      if (pendingRef.current) return;
      setCommand({ control, commandId: null, expiresAt: null, outcome: null });
      try {
        const accepted = await apiRequest(`/missions/${encodeURIComponent(mission.id)}/command`, {
          method: 'POST',
          body: commandRequest(control, imagingProfile),
          schema: zSubmitMissionCommandResponse,
        });
        setCommand({
          control,
          commandId: accepted.commandId,
          expiresAt: accepted.expiresAt,
          outcome: accepted.status === 'ACCEPTED' ? null : outcomeOf({ status: accepted.status, rejectionReason: accepted.rejectionReason ?? null }),
        });
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          navigateWithFreshSession(signInPath);
          return;
        }
        const reason = error instanceof ApiRequestError && (error.status === 403 || error.status === 409) ? refusalOf(error) : null;
        setCommand({ control, commandId: null, expiresAt: null, outcome: reason ? { kind: 'refused', reason } : { kind: 'error' } });
      }
    },
    [mission.id, imagingProfile, signInPath],
  );

  // A held arrow: one bounded step now, then one every step interval until release.
  const holdRef = useRef<{ axis: Axis; control: Control; timer: number } | null>(null);
  const press = useCallback(
    (axis: Axis, direction: 1 | -1) => {
      const control: Control = axis === 'alt' ? (direction > 0 ? 'up' : 'down') : direction > 0 ? 'right' : 'left';
      if (holdRef.current) window.clearInterval(holdRef.current.timer);
      void submit(control);
      const timer = window.setInterval(() => {
        if (!pendingRef.current) void submit(control);
      }, stepEveryMs);
      holdRef.current = { axis, control, timer };
    },
    [submit],
  );
  const release = useCallback((axis: Axis) => {
    if (holdRef.current?.axis === axis) {
      window.clearInterval(holdRef.current.timer);
      holdRef.current = null;
    }
  }, []);
  useEffect(() => () => {
    if (holdRef.current) window.clearInterval(holdRef.current.timer);
  }, []);

  const expiresAt = live.session?.expiresAt ?? null;
  return {
    state: {
      missionState: live.missionState,
      status: liveStatus(live),
      feed: live.stream ? { url: live.stream.url, simulated: live.stream.mode !== 'REAL', expiresAt: live.stream.expiresAt } : null,
      pointing: horizontal(live.pointing),
      tracking: null,
      linkOnline: live.link === 'ONLINE',
      session: live.session !== null && !live.expired,
      offered,
      pending: pending?.control ?? null,
      outcome: command && outcome ? { control: command.control, outcome } : null,
      timeLeftMs: expiresAt ? Math.max(0, Date.parse(expiresAt) - now) : null,
    },
    start: () => void start(),
    press,
    release,
    recentre: () => void submit('recenter'),
    capture: () => void submit('capture'),
    stop: () => void submit('stop'),
    onStreamError,
  };
}
