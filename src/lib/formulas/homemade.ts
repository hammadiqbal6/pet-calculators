/**
 * Homemade / raw ration sizing — educational portion estimates only.
 *
 * The percent-of-body-weight bands below are an industry / raw-feeder convention
 * used for as-fed portion sizing. They are NOT a veterinary standard and are not
 * stated as such in WSAVA, NRC, FDA, or AVMA guidance. Those sources address
 * nutrient completeness and (for raw) pathogen risk — not a 2–3% BW rule.
 *
 * - Adult maintenance (convention): ~2–3% of body weight per day (as-fed)
 * - Puppies / highly active (convention): ~2.5–5% depending on age
 * - Weight loss: often toward ~1.5–2% under veterinary supervision
 *
 * Balanced recipes require calcium, vitamins, essential fatty acids. Analyses such
 * as Stockman et al. 2013 (JAVMA) found many published homemade recipes deficient.
 */

export type HomemadeGoal = 'maintain' | 'puppy' | 'active' | 'weight_loss';

const PCT: Record<HomemadeGoal, [number, number]> = {
  maintain: [0.02, 0.03],
  puppy: [0.025, 0.05],
  active: [0.03, 0.04],
  weight_loss: [0.015, 0.02],
};

export type HomemadeResult = {
  lowKgPerDay: number;
  highKgPerDay: number;
  lowGPerDay: number;
  highGPerDay: number;
  percentLow: number;
  percentHigh: number;
};

export function homemadeRation(weightKg: number, goal: HomemadeGoal): HomemadeResult {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  const [lo, hi] = PCT[goal];
  return {
    lowKgPerDay: weightKg * lo,
    highKgPerDay: weightKg * hi,
    lowGPerDay: weightKg * lo * 1000,
    highGPerDay: weightKg * hi * 1000,
    percentLow: lo * 100,
    percentHigh: hi * 100,
  };
}
