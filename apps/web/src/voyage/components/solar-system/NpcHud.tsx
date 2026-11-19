'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins, Crosshair, Shield, Star } from 'lucide-react';
import { useTranslations } from 'use-intl';
import { claimEscape } from '@/voyage/game/escape';
import type { NpcTelemetry } from '@/voyage/lib/solar-system/world-npcs';

interface NpcHudProps {
  /** The colony's telemetry while on the surface, else null. */
  get: () => NpcTelemetry | null;
  choose: (index: number) => void;
  close: () => void;
  /** A coarse pointer: the fire key is on the deck, and the options are tapped. */
  touch: boolean;
  onFire: (down: boolean) => void;
}

const POLL_MS = 100;

/** Mars: the suit's integrity and the overshield, credits, the warrant, Kern's
 *  contract, what people say, the talk panel, a crosshair and the hit flash. */
export function NpcHud({ get, choose, close, touch, onFire }: NpcHudProps) {
  const t = useTranslations('solarSystem.npc');
  const [tel, setTel] = useState<NpcTelemetry | null>(null);
  const [flash, setFlash] = useState(0);
  const [tick, setTick] = useState(0);
  const hits = useRef(0);
  const landed = useRef(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      const n = get();
      if (!n) { setTel(null); return; }
      if (n.hits !== hits.current) { hits.current = n.hits; setFlash((f) => f + 1); }
      if (n.landed !== landed.current) { landed.current = n.landed; setTick((k) => k + 1); }
      // A copy, so React sees the change; the fields are few.
      setTel({ ...n, bark: n.bark ? { ...n.bark } : null, dialog: n.dialog });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [get]);

  const dialog = tel?.dialog ?? null;
  // In a talk: the number keys answer, Esc walks away.
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      const m = /^Digit([1-9])$/.exec(e.code);
      if (!m) return;
      const opt = dialog.options[Number(m[1]) - 1];
      if (opt) { e.preventDefault(); e.stopPropagation(); choose(opt.index); }
    };
    window.addEventListener('keydown', onKey, true);
    const release = claimEscape(() => { close(); return true; });
    return () => { window.removeEventListener('keydown', onKey, true); release(); };
  }, [dialog, choose, close]);

  if (!tel) return null;
  const say = (key: string, vars: Record<string, string | number>) => (t.has(key) ? t(key, vars) : key);
  const integrity = Math.round(tel.integrity);

  return (
    <div className="npc-hud">
      <div className="npc-hud__status" aria-label={t('statusLabel')}>
        <div className="npc-hud__bar" data-low={integrity < 35 || undefined}>
          <span className="npc-hud__bar-label">{t('suit')}</span>
          <span className="npc-hud__bar-track"><i style={{ width: `${integrity}%` }} />{tel.shield > 0 && <b style={{ width: `${tel.shield}%` }} />}</span>
          <span className="npc-hud__bar-num">{integrity}{tel.shield > 0 && <><Shield size={11} aria-hidden />{Math.round(tel.shield)}</>}</span>
        </div>
        <div className="npc-hud__row">
          <span className="npc-hud__credits"><Coins size={13} aria-hidden /> {tel.credits}</span>
          <span className="npc-hud__wanted" aria-label={t('wantedLabel', { n: tel.wanted })} data-on={tel.wanted > 0 || undefined}>
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} aria-hidden fill={i < tel.wanted ? 'currentColor' : 'none'} />)}
          </span>
        </div>
        {tel.job && <p className="npc-hud__job">{t('jobTracker', { done: tel.job.done, need: tel.job.need })}</p>}
        {tel.companion && <p className="npc-hud__job">{t('companionOn')}</p>}
      </div>

      {!dialog && tel.bark && (
        <p key={`b${tel.bark.serial}`} className="npc-hud__bark" role="status">
          {tel.bark.name && <b>{tel.bark.name}</b>}{say(tel.bark.key, tel.bark.vars)}
        </p>
      )}

      {dialog && (
        <div className="npc-hud__talk" role="dialog" aria-label={dialog.name}>
          <p className="npc-hud__talk-who">{dialog.name}</p>
          <p className="npc-hud__talk-line">{say(dialog.line, dialog.vars)}</p>
          <ol className="npc-hud__talk-opts">
            {dialog.options.map((o, i) => (
              <li key={`${dialog.serial}-${o.index}`}>
                <button type="button" disabled={!o.enabled} onClick={() => choose(o.index)}>
                  {!touch && <kbd>{i + 1}</kbd>}
                  <span>{say(o.key, dialog.vars)}</span>
                  {o.cost > 0 && <small><Coins size={11} aria-hidden /> {o.cost}</small>}
                </button>
              </li>
            ))}
          </ol>
          {!touch && <p className="npc-hud__talk-hint">{t('talkHint')}</p>}
        </div>
      )}

      {!dialog && <Crosshair key={`x${tick}`} className="npc-hud__cross" data-hit={tick > 0 || undefined} size={22} aria-hidden />}
      {flash > 0 && <i key={`f${flash}`} className="npc-hud__flash" aria-hidden />}
      {tel.engaged > 0 && <p className="npc-hud__engaged" role="status">{t('engaged', { n: tel.engaged })}</p>}
      {touch && !dialog && (
        <button type="button" className="npc-hud__fire" aria-label={t('fire')}
          onPointerDown={(e) => { e.preventDefault(); onFire(true); }} onPointerUp={() => onFire(false)} onPointerCancel={() => onFire(false)} onPointerLeave={() => onFire(false)}>
          <Crosshair size={22} aria-hidden />
        </button>
      )}
    </div>
  );
}
