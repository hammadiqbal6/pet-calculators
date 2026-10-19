/**
 * Chocolate toxicity screening for dogs (methylxanthines: theobromine + caffeine).
 * Educational risk bands only — always contact a vet or poison control if ingestion occurred.
 *
 * Approximate theobromine mg/oz (common veterinary toxicology tables):
 * - White: ~0.25 mg/oz (negligible)
 * - Milk: ~44–64 mg/oz
 * - Dark: ~130–450 mg/oz (varies widely by cacao %)
 * - Baking / unsweetened: ~390–450 mg/oz
 *
 * Risk guidance often cited (theobromine):
 * - <20 mg/kg: typically mild / monitor
 * - 20–40 mg/kg: mild–moderate signs possible
 * - 40–60 mg/kg: moderate–severe risk
 * - >60 mg/kg: high risk; emergency care
 */

export type ChocolateType = 'white' | 'milk' | 'dark' | 'baking';

/** Approximate mg theobromine per gram of chocolate */
export const THEOBROMINE_MG_PER_G: Record<ChocolateType, number> = {
  white: 0.01,
  milk: 2.0,
  dark: 5.5,
  baking: 14.0,
};

export type ToxicityBand = 'low' | 'mild' | 'moderate' | 'high';

export type ChocolateResult = {
  theobromineMg: number;
  doseMgPerKg: number;
  band: ToxicityBand;
  message: string;
};

export function assessChocolateToxicity(
  dogWeightKg: number,
  chocolateGrams: number,
  type: ChocolateType,
): ChocolateResult {
  if (dogWeightKg <= 0 || chocolateGrams < 0) throw new Error('Invalid inputs');
  const theobromineMg = chocolateGrams * THEOBROMINE_MG_PER_G[type];
  const dose = theobromineMg / dogWeightKg;

  let band: ToxicityBand;
  let message: string;
  if (dose < 20) {
    band = 'low';
    message = 'Estimated dose is in a lower range, but individual sensitivity varies. Contact a vet if any symptoms appear.';
  } else if (dose < 40) {
    band = 'mild';
    message = 'Mild to moderate signs are possible (vomiting, restlessness). Contact a veterinarian or pet poison hotline for advice.';
  } else if (dose < 60) {
    band = 'moderate';
    message = 'Moderate to severe toxicity risk. Seek veterinary care promptly.';
  } else {
    band = 'high';
    message = 'High estimated methylxanthine dose. This is an emergency — contact emergency veterinary care or a poison hotline immediately.';
  }

  return { theobromineMg, doseMgPerKg: dose, band, message };
}
