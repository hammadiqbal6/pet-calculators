/**
 * Resting Energy Requirement (RER) and Maintenance Energy Requirement (MER).
 * Sources: NRC Nutrient Requirements of Dogs and Cats (2006); WSAVA Global Nutrition Guidelines;
 * common clinical multipliers taught in veterinary nutrition (e.g. AAFCO feeding trial context).
 *
 * RER (kcal/day) ≈ 70 × (body weight in kg)^0.75
 * MER = RER × life-stage / activity factor
 */

export type DogLifeStage =
  | 'puppy_0_4'
  | 'puppy_4_adult'
  | 'adult_intact'
  | 'adult_neutered'
  | 'weight_loss'
  | 'weight_gain'
  | 'active'
  | 'working'
  | 'senior';

export type CatLifeStage =
  | 'kitten'
  | 'adult_intact'
  | 'adult_neutered'
  | 'weight_loss'
  | 'weight_gain'
  | 'senior';

/** RER in kcal/day from body weight in kg */
export function calculateRER(weightKg: number): number {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  return 70 * weightKg ** 0.75;
}

export const DOG_MER_FACTORS: Record<DogLifeStage, number> = {
  puppy_0_4: 3.0,
  puppy_4_adult: 2.0,
  adult_intact: 1.8,
  adult_neutered: 1.6,
  weight_loss: 1.0,
  weight_gain: 1.7,
  active: 2.0,
  working: 2.5,
  senior: 1.4,
};

export const CAT_MER_FACTORS: Record<CatLifeStage, number> = {
  kitten: 2.5,
  adult_intact: 1.4,
  adult_neutered: 1.2,
  weight_loss: 0.8,
  weight_gain: 1.4,
  senior: 1.1,
};

export function calculateDogMER(weightKg: number, stage: DogLifeStage): number {
  return calculateRER(weightKg) * DOG_MER_FACTORS[stage];
}

export function calculateCatMER(weightKg: number, stage: CatLifeStage): number {
  return calculateRER(weightKg) * CAT_MER_FACTORS[stage];
}

/** Convert daily kcal to cups given kcal per cup of the food */
export function cupsFromKcal(dailyKcal: number, kcalPerCup: number): number {
  if (kcalPerCup <= 0) throw new Error('kcal per cup must be positive');
  return dailyKcal / kcalPerCup;
}

/** Grams of food from kcal and kcal/kg (or kcal/100g → scale) */
export function gramsFromKcal(dailyKcal: number, kcalPer100g: number): number {
  if (kcalPer100g <= 0) throw new Error('kcal density must be positive');
  return (dailyKcal / kcalPer100g) * 100;
}
