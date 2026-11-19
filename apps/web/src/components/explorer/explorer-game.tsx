"use client";

import dynamic from "next/dynamic";
import { IntlProvider } from "use-intl";

import { brand } from "@/brand";

import { CosmicLoader } from "@/voyage/components/solar-system/CosmicLoader";
import messages from "@/voyage/messages/voyage.en.json";

/** The whole game is one chunk that only this route asks for. */
const GameShell = dynamic(() => import("@/voyage/components/play/GameShell"), {
  ssr: false,
  loading: () => (
    <div className="game-shell">
      <CosmicLoader label={brand.en.game} progress={0.02} />
    </div>
  ),
});

/** The game's clocks read in the player's own zone; it only ever renders in the browser. */
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** No accounts here: guests fly in the open world or private rooms (ADR-090), no leaderboard, progress on the device. */
export function ExplorerGame() {
  return (
    <IntlProvider locale="en" messages={messages} timeZone={timeZone}>
      <GameShell />
    </IntlProvider>
  );
}
