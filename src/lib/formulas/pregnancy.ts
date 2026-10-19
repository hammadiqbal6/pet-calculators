/**
 * Dog pregnancy / whelping due date.
 * Typical gestation from ovulation ≈ 63 days; from breeding often 58–68 days
 * depending on when mating occurred relative to ovulation.
 * Source framing: veterinary theriogenology references (e.g. ~63 days post-LH surge/ovulation).
 */

export type PregnancyInput = {
  /** ISO date string YYYY-MM-DD */
  startDate: string;
  mode: 'breeding' | 'ovulation';
};

export type PregnancyResult = {
  dueDate: string;
  windowStart: string;
  windowEnd: string;
  daysFromStart: number;
  gestationDaysUsed: number;
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function estimateWhelpingDate(input: PregnancyInput): PregnancyResult {
  const gestation = input.mode === 'ovulation' ? 63 : 63;
  const pad = input.mode === 'breeding' ? 5 : 2;
  const due = addDays(input.startDate, gestation);
  return {
    dueDate: due,
    windowStart: addDays(input.startDate, gestation - pad),
    windowEnd: addDays(input.startDate, gestation + pad),
    daysFromStart: gestation,
    gestationDaysUsed: gestation,
  };
}

export function daysUntil(isoDue: string, todayIso?: string): number {
  const today = todayIso ?? new Date().toISOString().slice(0, 10);
  const a = new Date(today + 'T12:00:00Z').getTime();
  const b = new Date(isoDue + 'T12:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}
