/** Types for e2e/fake-night.mjs, which the fake platform runs as plain JavaScript. */
export function fakeNight(date: string): { first: number; count: number };
export function fakeNightOf(at: number): string;
export function fakeSlotAt(date: string, index: number): string;
export function fakeLocalTime(iso: string): string;
