/**
 * Cat-to-human age conversion using common veterinary life-stage education charts
 * (AAFP/AAHA Feline Life Stage Guidelines style banding).
 */

export type CatAgeResult = {
  humanYears: number;
  lifeStage: string;
};

export function catLifeStage(ageYears: number): string {
  if (ageYears < 0.5) return 'Kitten';
  if (ageYears < 1) return 'Junior';
  if (ageYears < 7) return 'Prime / adult';
  if (ageYears < 11) return 'Mature';
  if (ageYears < 15) return 'Senior';
  return 'Geriatric';
}

export function catToHumanYears(ageYears: number): CatAgeResult {
  if (ageYears < 0) throw new Error('Age must be non-negative');

  let human: number;
  if (ageYears <= 1) {
    human = ageYears * 15;
  } else if (ageYears <= 2) {
    human = 15 + (ageYears - 1) * 9;
  } else {
    human = 24 + (ageYears - 2) * 4;
  }

  return {
    humanYears: human,
    lifeStage: catLifeStage(ageYears),
  };
}
