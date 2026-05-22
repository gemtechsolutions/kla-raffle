// Operator edits this file each month to publish results.
//
// Workflow:
//   1. Before draw: leave `latestResult` as `null`. The site shows a countdown
//      to the end of the current month and 5 gold stars.
//   2. After drawing: set `latestResult` to the month's winning numbers and
//      the date they were drawn. The site reveals the numbers and starts a
//      new countdown to the end of the next month automatically.

export interface RaffleResult {
  // Winning numbers — 5 entries.
  numbers: number[]
  // ISO date string for when the draw happened, e.g. "2026-05-31".
  drawnOn: string
}

export const latestResult: RaffleResult | null = null

export const ENTRY_PRICE_USD = 2

// Local timezone the draw is anchored to (Phnom Penh).
const DRAW_HOUR_LOCAL = 20 // 8 PM

// Last moment of the given month at DRAW_HOUR_LOCAL local time.
function endOfMonth(year: number, monthIndex: number): Date {
  // monthIndex + 1 with day=0 rolls back to the last day of monthIndex.
  return new Date(year, monthIndex + 1, 0, DRAW_HOUR_LOCAL, 0, 0, 0)
}

// Next scheduled draw — last day of the current month at 20:00 local time.
// If that moment has already passed, returns the last day of next month.
export function getNextDrawDate(now: Date = new Date()): Date {
  const candidate = endOfMonth(now.getFullYear(), now.getMonth())
  if (candidate.getTime() > now.getTime()) return candidate
  return endOfMonth(now.getFullYear(), now.getMonth() + 1)
}
