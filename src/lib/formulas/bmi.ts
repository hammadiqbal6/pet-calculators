/**
 * Dog body-condition helper.
 * True BMI is validated in humans; for dogs we use a weight-for-height style index
 * sometimes reported in research, plus BCS (1–9) guidance from WSAVA.
 *
 * Index ≈ weightKg / (heightAtWithersM ^ 2) — interpretive only.
 */

export type BcsBand = {
  score: number;
  label: string;
  guidance: string;
};

export const BCS_SCALE: BcsBand[] = [
  { score: 1, label: 'Emaciated', guidance: 'Ribs, spine, and pelvic bones highly visible. Seek veterinary care.' },
  { score: 2, label: 'Very thin', guidance: 'Minimal fat cover; ribs easily seen. Veterinary assessment recommended.' },
  { score: 3, label: 'Thin', guidance: 'Ribs easily felt with minimal fat. Consider calorie increase with vet guidance.' },
  { score: 4, label: 'Underweight lean', guidance: 'Ribs palpable with slight fat cover; waist visible.' },
  { score: 5, label: 'Ideal', guidance: 'Ribs palpable without excess fat; waist visible from above; abdominal tuck.' },
  { score: 6, label: 'Slightly overweight', guidance: 'Ribs palpable with slight excess fat; waist just discernible.' },
  { score: 7, label: 'Overweight', guidance: 'Difficult to feel ribs; fat deposits; waist absent or minimal.' },
  { score: 8, label: 'Obese', guidance: 'Ribs not palpable; heavy fat cover; no waist. Veterinary weight plan advised.' },
  { score: 9, label: 'Severely obese', guidance: 'Massive fat deposits; clinical risks elevated. Seek veterinary care.' },
];

export function dogBodyMassIndex(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) throw new Error('Weight and height must be positive');
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/**
 * Educational mapping from dog BMI-style index to suggested BCS.
 * Canine index values are much higher than human BMI (often ~70–95 for fit adults);
 * human cutoffs would misclassify normal dogs as obese.
 */
export function suggestBcsFromIndex(bmi: number): number {
  if (bmi < 55) return 3;
  if (bmi < 68) return 4;
  if (bmi < 82) return 5;
  if (bmi < 92) return 6;
  if (bmi < 102) return 7;
  if (bmi < 115) return 8;
  return 9;
}

export function getBcs(score: number): BcsBand {
  const s = Math.min(9, Math.max(1, Math.round(score)));
  return BCS_SCALE[s - 1]!;
}
