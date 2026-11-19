'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connectRealtime, realtimeConfig, type Channel, type PresenceState, type RealtimeClient } from '@/voyage/lib/multiplayer/realtime';
import { makeRoomCode, normalizeRoomCode, pushSample, pushShot, readPose, readShot, type RoomLink, type Scene } from '@/voyage/lib/multiplayer/room-link';

/** A private room: friends by code or link. */
export const ROOM_MAX = 8;
/** One copy of the open world. Past this, newcomers open the next copy. */
export const WORLD_MAX = 40;
const SEND_EVERY_MS = 200;
const KEEPALIVE_MS = 2000;
/** At most this often a bolt goes out; more than a few waiting and the oldest are dropped. */
const SHOT_GAP_MS = 100;
const SHOTS_WAITING = 3;
/** Entering the open world waits this long for the lobby's head count, then goes to copy 1. */
const SEEK_WAIT_MS = 4000;
/** A join not through by now says so (it keeps trying underneath). */
const UNREACHABLE_MS = 12_000;

export interface RosterEntry {
  id: string;
  name: string;
  scene: Scene;
  world: string;
  joinedAt: number;
  self: boolean;
}

export type RoomStatus = 'unconfigured' | 'idle' | 'seeking' | 'connecting' | 'joined' | 'reconnecting';
export type RoomError = 'full' | 'unreachable' | null;

/** Where this explorer plays: a copy of the open world, or a private room. */
type Target = { kind: 'world'; n: number } | { kind: 'room'; code: string };

interface RoomMeta {
  name: string;
  scene: Scene;
  world: string;
  joinedAt: number;
  epoch: number;
}

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v.slice(0, 40) : fallback);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const scene = (v: unknown): Scene => (v === 'flight' || v === 'surface' ? v : 'orbit');

/** The first meta each explorer tracked — one per key, whatever tabs they have open. */
function firstMetas(state: PresenceState) {
  return Object.entries(state).flatMap(([key, metas]) => (metas[0] ? [{ key, meta: metas[0] }] : []));
}

/** How many explorers each copy of the open world holds, from the lobby's presence. */
export function worldCounts(state: PresenceState): Map<number, number> {
  const counts = new Map<number, number>();
  for (const { meta } of firstMetas(state)) {
    const n = num(meta.world);
    if (Number.isInteger(n) && n >= 1 && n <= 999) counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  return counts;
}

/** The copy a newcomer goes to: the first with a free place, so the copies fill
 *  in order and the later ones empty out as the first ones free up. */
export function pickWorld(counts: ReadonlyMap<number, number>, exclude: ReadonlySet<number> = new Set()): number {
  for (let n = 1; ; n++) if (!exclude.has(n) && (counts.get(n) ?? 0) < WORLD_MAX) return n;
}

/** Whether anyone else is where this explorer is, so a pose is worth sending:
 *  in flight anyone else in flight, on a surface anyone on the same world. */
export function anyoneHere(roster: readonly RosterEntry[], s: Scene, world: string): boolean {
  if (s === 'orbit') return false;
  return roster.some((m) => !m.self && m.scene === s && (s === 'flight' || m.world === world));
}

/** The key the engine knows the room by (the Backrooms' maze is seeded from it). */
const linkKey = (t: Target) => (t.kind === 'world' ? `W${t.n}` : t.code);
const channelName = (t: Target) => (t.kind === 'world' ? `explore-world-${t.n}` : `explore-room-${t.code}`);

/** A state setter that keeps the old value (and skips the render) when the new one reads the same. */
function setIfChanged<T>(set: (fn: (prev: T) => T) => void, next: T) {
  const json = JSON.stringify(next);
  set((prev) => (JSON.stringify(prev) === json ? prev : next));
}

/**
 * Where this explorer flies with others. Nobody has to sign in: `name` is the
 * account's name or the guest's callsign. `enterWorld` joins the open world
 * everyone shares (the first copy of it with a free place), `create` opens a
 * private room shared by code or link, `join` takes a code.
 */
export function useExploreRoom(link: RoomLink, opts: { name: string; epochMs: number; watchLobby: boolean; onEpoch: (ms: number) => void }) {
  const config = realtimeConfig();
  const [target, setTarget] = useState<Target | null>(null);
  const [joined, setJoined] = useState(false);
  /** This place was joined once: a drop now reads as reconnecting, not joining. */
  const [wasJoined, setWasJoined] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [lobbyReady, setLobbyReady] = useState(false);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  /** Everyone in the open world right now, all copies together (while the lobby is watched). */
  const [online, setOnline] = useState<number | null>(null);
  const [error, setError] = useState<RoomError>(null);
  /** Bumped by Retry: a fresh socket. */
  const [attempt, setAttempt] = useState(0);
  const clientRef = useRef<RealtimeClient | null>(null);
  const roomRef = useRef<Channel | null>(null);
  const lobbyRef = useRef<Channel | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const metaRef = useRef<RoomMeta | null>(null);
  const rosterRef = useRef<RosterEntry[]>([]);
  /** Copies found full this time round. */
  const excludeRef = useRef(new Set<number>());
  /** The copy this explorer is counted in, in the lobby (re-sent if the lobby channel is made again). */
  const advertRef = useRef<Record<string, unknown> | null>(null);
  const lobbyStateRef = useRef<PresenceState | null>(null);

  const inWorld = target?.kind === 'world';
  const wantSocket = !!config && (target !== null || opts.watchLobby || seeking);
  const wantLobby = wantSocket && (inWorld || opts.watchLobby || seeking);
  useEffect(() => {
    if (!wantSocket || !config) return;
    const client = connectRealtime(config.url, config.key);
    clientRef.current = client;
    return () => {
      client.close();
      clientRef.current = null;
      roomRef.current = null;
      lobbyRef.current = null;
    };
  }, [wantSocket, config?.url, config?.key, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // The lobby counts the open world: each explorer in it is counted under
  // the copy they are in. It is joined while in the open world (presence
  // cannot be tracked without joining), but the count only turns into state
  // while the lobby is on screen.
  useEffect(() => {
    const client = clientRef.current;
    if (!wantLobby || !client) return;
    const lobby = client.channel('explore-lobby', link.self.id);
    lobbyRef.current = lobby;
    let grace = 0;
    const total = (state: PresenceState) => [...worldCounts(state).values()].reduce((a, b) => a + b, 0);
    lobby.onPresence((state) => {
      lobbyStateRef.current = state;
      setLobbyReady(true);
      if (optsRef.current.watchLobby) setOnline(total(state));
    });
    // A server that sends no presence for an empty lobby: joined is enough to go on.
    lobby.onStatus((s) => {
      window.clearTimeout(grace);
      if (s === 'joined') grace = window.setTimeout(() => { setLobbyReady(true); setOnline((n) => n ?? 0); }, 700);
    });
    if (advertRef.current) lobby.track({ ...advertRef.current });
    return () => {
      window.clearTimeout(grace);
      lobby.leave();
      lobbyRef.current = null;
      lobbyStateRef.current = null;
      setLobbyReady(false);
    };
  }, [wantLobby, wantSocket, link, attempt]);
  useEffect(() => {
    const state = lobbyStateRef.current;
    if (opts.watchLobby && state) setOnline([...worldCounts(state).values()].reduce((a, b) => a + b, 0));
  }, [opts.watchLobby]);

  // Into the open world: once the lobby has counted (or has not, in time),
  // the first copy with a free place.
  useEffect(() => {
    if (!seeking) return;
    const decide = () => {
      const state = lobbyStateRef.current;
      setSeeking(false);
      setTarget({ kind: 'world', n: pickWorld(state ? worldCounts(state) : new Map(), excludeRef.current) });
    };
    if (lobbyReady) { decide(); return; }
    const id = window.setTimeout(decide, SEEK_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [seeking, lobbyReady]);

  useEffect(() => {
    const client = clientRef.current;
    if (!target || !client) return;
    setJoined(false);
    setWasJoined(false);
    link.peers.clear();
    link.shotsIn.length = 0;
    link.shotsOut.length = 0;
    link.code = linkKey(target);
    const max = target.kind === 'world' ? WORLD_MAX : ROOM_MAX;
    const meta: RoomMeta = { name: optsRef.current.name, scene: link.self.s, world: link.self.w ?? '', joinedAt: Date.now(), epoch: optsRef.current.epochMs };
    metaRef.current = meta;
    const room = client.channel(channelName(target), link.self.id);
    roomRef.current = room;
    let firstSync = true;
    let alive = true;
    /** Names by presence key, for a pose that arrives before its sender's presence is applied. */
    const names = new Map<string, string>();
    const slow = window.setTimeout(() => { if (alive) setError((e) => e ?? 'unreachable'); }, UNREACHABLE_MS);
    room.onStatus((s) => {
      if (!alive) return;
      setJoined(s === 'joined');
      if (s === 'joined') {
        setWasJoined(true);
        setError((e) => (e === 'unreachable' ? null : e));
        window.clearTimeout(slow);
        room.track({ ...meta });
      }
    });
    room.onPresence((state) => {
      if (!alive) return;
      const members = firstMetas(state).map(({ key, meta: m }) => ({
        id: key, name: str(m.name, '?'), scene: scene(m.scene), world: str(m.world), joinedAt: num(m.joinedAt), epoch: num(m.epoch), self: key === link.self.id,
      })).sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
      const mine = members.findIndex((m) => m.self);
      if (mine >= max) {
        alive = false;
        if (target.kind === 'world') {
          // Someone took the last place first: on to the next copy.
          excludeRef.current.add(target.n);
          setTarget(null);
          setSeeking(true);
        } else {
          setError('full');
          setTarget(null);
        }
        return;
      }
      if (firstSync && mine >= 0) {
        firstSync = false;
        const first = members[0];
        // Everyone in a room sees the planets where its first explorer had them.
        if (!first.self && first.epoch) optsRef.current.onEpoch(first.epoch);
      }
      names.clear();
      for (const m of members) names.set(m.id, m.name);
      for (const id of [...link.peers.keys()]) if (!names.has(id)) link.peers.delete(id);
      for (const m of members) {
        const p = link.peers.get(m.id);
        if (p) p.name = m.name;
      }
      rosterRef.current = members.map(({ epoch: _epoch, ...m }) => m);
      setIfChanged(setRoster, rosterRef.current);
    });
    room.onBroadcast('pose', (payload) => {
      const msg = readPose(payload);
      if (!alive || !msg || msg.id === link.self.id) return;
      let peer = link.peers.get(msg.id);
      if (!peer) {
        peer = { id: msg.id, name: names.get(msg.id) ?? '', samples: [], lastSeq: -1 };
        link.peers.set(msg.id, peer);
      }
      pushSample(peer, msg, performance.now());
    });
    room.onBroadcast('shot', (payload) => {
      const msg = readShot(payload);
      if (!alive || !msg || msg.id === link.self.id) return;
      pushShot(link, link.peers.get(msg.id), msg, performance.now());
    });
    if (target.kind === 'world') {
      advertRef.current = { world: target.n };
      lobbyRef.current?.track({ ...advertRef.current });
    }

    let lastSent = 0;
    let lastShot = 0;
    let lastJson = '';
    let wasHere = false;
    const timer = window.setInterval(() => {
      const now = performance.now();
      const self = link.self;
      // Where this explorer is goes into presence: the roster shows it, and the others decide from it whether to send.
      if (self.s !== meta.scene || (self.w ?? '') !== meta.world) {
        meta.scene = self.s;
        meta.world = self.w ?? '';
        room.track({ ...meta });
      }
      // Nobody else in the same place: nothing to send, and nobody to draw it.
      const here = anyoneHere(rosterRef.current, self.s, self.w ?? '');
      if (!here) {
        link.shotsOut.length = 0;
        wasHere = false;
        return;
      }
      const { n: _n, t: _t, ...pose } = self;
      const json = JSON.stringify(pose);
      if (!wasHere || (json !== lastJson && now - lastSent >= SEND_EVERY_MS) || now - lastSent >= KEEPALIVE_MS) {
        self.n += 1;
        self.t = Math.round(now);
        room.send('pose', { ...self });
        lastSent = now;
        lastJson = json;
      }
      wasHere = true;
      const out = link.shotsOut;
      if (out.length > SHOTS_WAITING) out.splice(0, out.length - SHOTS_WAITING);
      if (out.length && now - lastShot >= SHOT_GAP_MS) {
        const shot = out.shift()!;
        room.send('shot', { ...shot, id: self.id, t: Math.round(now) });
        lastShot = now;
      }
    }, 50);

    return () => {
      alive = false;
      window.clearTimeout(slow);
      window.clearInterval(timer);
      room.leave();
      roomRef.current = null;
      if (advertRef.current) lobbyRef.current?.track({ world: 0 });
      advertRef.current = null;
      link.peers.clear();
      link.shotsIn.length = 0;
      link.shotsOut.length = 0;
      link.view.pilots = [];
      link.code = null;
      rosterRef.current = [];
      setRoster([]);
      setJoined(false);
    };
  }, [target, link, wantSocket, attempt]);

  // The name can arrive after the room was joined (the profile loads late), or be changed.
  useEffect(() => {
    const meta = metaRef.current;
    if (!meta || !target || meta.name === opts.name) return;
    meta.name = opts.name;
    roomRef.current?.track({ ...meta });
  }, [opts.name, target]);

  const code = target?.kind === 'room' ? target.code : null;
  const world = target?.kind === 'world' ? target.n : null;

  // A private room goes in the address bar, so the page can be shared as the invite.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (code) url.searchParams.set('room', code);
    else url.searchParams.delete('room');
    window.history.replaceState(window.history.state, '', url);
  }, [code]);

  const enterWorld = useCallback(() => {
    excludeRef.current.clear();
    setError(null);
    setTarget(null);
    setSeeking(true);
  }, []);
  const enterRoom = useCallback((c: string) => {
    setError(null);
    setSeeking(false);
    setTarget({ kind: 'room', code: c });
  }, []);
  const create = useCallback(() => enterRoom(makeRoomCode()), [enterRoom]);
  const join = useCallback((raw: string) => {
    const c = normalizeRoomCode(raw);
    if (c) enterRoom(c);
    return !!c;
  }, [enterRoom]);
  const leave = useCallback(() => { setSeeking(false); setTarget(null); }, []);
  const clearError = useCallback(() => setError(null), []);
  /** A fresh socket, now, rather than waiting out the backoff. */
  const retry = useCallback(() => { setError(null); setAttempt((n) => n + 1); }, []);

  let status: RoomStatus;
  if (!config) status = 'unconfigured';
  else if (seeking) status = 'seeking';
  else if (!target) status = 'idle';
  else if (joined) status = 'joined';
  else status = wasJoined ? 'reconnecting' : 'connecting';

  // One object while nothing in it changed: it is handed down to the game's panels.
  return useMemo(
    () => ({ status, code, world, roster, online, error, enterWorld, create, join, leave, clearError, retry }),
    [status, code, world, roster, online, error, enterWorld, create, join, leave, clearError, retry],
  );
}
