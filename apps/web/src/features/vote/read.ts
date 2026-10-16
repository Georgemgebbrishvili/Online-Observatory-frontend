import "server-only";

import type { WeekVote } from "@darkview/contracts";
import { zListWeekVotesResponse } from "@darkview/contracts/zod";

import { platformRequest } from "@/lib/platform/client";

/**
 * GET /votes for the week at one observatory (platform ADR-050). The request carries
 * the visitor's session when there is one, so `mine` is theirs. Null when the ballot
 * cannot be read: the page then shows the sky without a tally.
 */
export async function readWeekVote(observatoryId: string): Promise<WeekVote | null> {
  try {
    return zListWeekVotesResponse.parse(
      await platformRequest<unknown>(`/votes?observatoryId=${encodeURIComponent(observatoryId)}`),
    );
  } catch {
    return null;
  }
}
