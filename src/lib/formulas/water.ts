/**
 * Daily water intake estimate for dogs.
 * Common clinical teaching range ≈ 50–60 ml/kg/day for healthy adults,
 * higher with heat, activity, lactation, or dry-food diets.
 */

export type WaterActivity = 'normal' | 'active' | 'hot_climate' | 'lactating';

const ML_PER_KG: Record<WaterActivity, [number, number]> = {
  normal: [50, 60],
  active: [60, 80],
  hot_climate: [70, 100],
  lactating: [80, 120],
};

export type WaterResult = {
  lowMl: number;
  highMl: number;
  lowCups: number;
  highCups: number;
};

export function estimateWaterIntake(weightKg: number, activity: WaterActivity = 'normal'): WaterResult {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  const [lo, hi] = ML_PER_KG[activity];
  const lowMl = weightKg * lo;
  const highMl = weightKg * hi;
  const cupMl = 240;
  return {
    lowMl,
    highMl,
    lowCups: lowMl / cupMl,
    highCups: highMl / cupMl,
  };
}
