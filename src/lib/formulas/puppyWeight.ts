import { SIZE_ADULT_KG, SIZE_GROWTH_MONTHS, type SizeClass, getBreed } from '../../data/breeds';

/**
 * Adult weight prediction for puppies — site heuristic (educational).
 *
 * Early estimate (≤16 weeks): adultWeight ≈ (currentWeight / ageWeeks) × 52,
 * then blended (65%) with the breed/size adult midpoint (35%). This ×52 + blend
 * method is a common breeder/owner rule of thumb used on this site; it is NOT
 * published as a clinical standard by NRC, WSAVA, or AAHA. Growth context:
 * Hawthorne et al. 2004 (J Nutr) on breed growth curves.
 *
 * For older puppies we interpolate toward expected adult weight using a
 * logistic-ish growth fraction by age vs size-class maturity months.
 */

export type PuppyWeightInput = {
  currentWeightKg: number;
  ageWeeks: number;
  size?: SizeClass;
  breedId?: string;
};

export type PuppyWeightResult = {
  predictedAdultKg: number;
  predictedLowKg: number;
  predictedHighKg: number;
  method: 'week52' | 'growth-curve';
  growthCompleteFraction: number;
  expectedAdultRangeKg: [number, number];
  chart: { week: number; estimatedKg: number }[];
};

function expectedRange(size?: SizeClass, breedId?: string): [number, number] {
  if (breedId) {
    const b = getBreed(breedId);
    if (b) return b.adultKg;
  }
  if (size) return SIZE_ADULT_KG[size];
  return SIZE_ADULT_KG.medium;
}

function growthMonths(size?: SizeClass, breedId?: string): number {
  if (breedId) {
    const b = getBreed(breedId);
    if (b) return b.growthMonths;
  }
  if (size) return SIZE_GROWTH_MONTHS[size];
  return SIZE_GROWTH_MONTHS.medium;
}

/** Fraction of adult weight typically reached by age (weeks), rough sigmoid */
export function growthFraction(ageWeeks: number, maturityMonths: number): number {
  const maturityWeeks = maturityMonths * 4.345;
  if (ageWeeks <= 0) return 0;
  if (ageWeeks >= maturityWeeks) return 1;
  // Smooth curve: early rapid growth then taper
  const t = ageWeeks / maturityWeeks;
  return 1 - Math.exp(-3.2 * t);
}

export function predictAdultWeight(input: PuppyWeightInput): PuppyWeightResult {
  const { currentWeightKg, ageWeeks } = input;
  if (currentWeightKg <= 0) throw new Error('Weight must be positive');
  if (ageWeeks <= 0) throw new Error('Age must be positive');

  const range = expectedRange(input.size, input.breedId);
  const maturity = growthMonths(input.size, input.breedId);
  const frac = growthFraction(ageWeeks, maturity);

  let predicted: number;
  let method: PuppyWeightResult['method'];

  if (ageWeeks <= 16) {
    // Classic early-puppy estimate
    predicted = (currentWeightKg / ageWeeks) * 52;
    method = 'week52';
  } else {
    // Back-calculate from growth fraction
    const safeFrac = Math.max(frac, 0.35);
    predicted = currentWeightKg / safeFrac;
    method = 'growth-curve';
  }

  // Blend toward breed/size expected midpoint for stability
  const mid = (range[0] + range[1]) / 2;
  const blended = predicted * 0.65 + mid * 0.35;

  const spread = Math.max((range[1] - range[0]) / 2, blended * 0.12);
  const low = Math.max(blended - spread, currentWeightKg);
  const high = blended + spread;

  const chart: PuppyWeightResult['chart'] = [];
  for (let w = 4; w <= Math.ceil(maturity * 4.345); w += 2) {
    const f = growthFraction(w, maturity);
    chart.push({ week: w, estimatedKg: blended * f });
  }

  return {
    predictedAdultKg: blended,
    predictedLowKg: low,
    predictedHighKg: high,
    method,
    growthCompleteFraction: frac,
    expectedAdultRangeKg: range,
    chart,
  };
}
