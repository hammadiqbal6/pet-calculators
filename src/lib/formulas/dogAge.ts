import type { SizeClass } from '../../data/breeds';

/**
 * Dog-to-human age conversion.
 * The old "multiply by 7" rule is inaccurate. Modern approaches:
 * 1) AAHA / clinical life-stage banding by size
 * 2) Research-inspired logarithmic models (e.g. epigenetic clock style curves)
 *
 * We implement a size-aware piecewise model commonly used in client education,
 * aligned with AAHA Canine Life Stage Guidelines life stages, plus an optional
 * research-style log curve for comparison.
 *
 * Sources cited on the tool page: AAHA Canine Life Stage Guidelines;
 * Wang et al. cell methylation / epigenetic aging discussions in popular science
 * (educational comparison only).
 */

export type DogAgeResult = {
  humanYears: number;
  lifeStage: string;
  method: 'size-piecewise' | 'log-curve';
  notes: string;
};

const SIZE_SENIOR_YEARS: Record<SizeClass, number> = {
  toy: 10,
  small: 10,
  medium: 8,
  large: 7,
  giant: 6,
};

export function dogLifeStage(ageYears: number, size: SizeClass): string {
  if (ageYears < 0.5) return 'Puppy (neonate / pediatric)';
  if (ageYears < 1) return 'Puppy (juvenile)';
  if (ageYears < 2) return 'Young adult';
  const seniorAt = SIZE_SENIOR_YEARS[size];
  if (ageYears < seniorAt) return 'Mature adult';
  if (ageYears < seniorAt + 3) return 'Senior';
  return 'Geriatric';
}

/** Size-aware piecewise human-year estimate */
export function dogToHumanYearsPiecewise(ageYears: number, size: SizeClass): DogAgeResult {
  if (ageYears < 0) throw new Error('Age must be non-negative');

  let human: number;
  if (ageYears <= 1) {
    human = ageYears * 15;
  } else if (ageYears <= 2) {
    human = 15 + (ageYears - 1) * 9;
  } else {
    const perYear =
      size === 'toy' || size === 'small' ? 4 : size === 'medium' ? 5 : size === 'large' ? 6 : 7;
    human = 24 + (ageYears - 2) * perYear;
  }

  return {
    humanYears: human,
    lifeStage: dogLifeStage(ageYears, size),
    method: 'size-piecewise',
    notes: 'First year ≈ 15 human years, second ≈ 9, then size-dependent increments.',
  };
}

/**
 * Research-style log curve (popular science adaptation of epigenetic clock ideas):
 * human ≈ 16 × ln(dogAge) + 31 for dogs ≥ ~1 year; not a clinical standard.
 */
export function dogToHumanYearsLog(ageYears: number): DogAgeResult {
  if (ageYears < 0) throw new Error('Age must be non-negative');
  if (ageYears < 0.1) {
    return {
      humanYears: ageYears * 30,
      lifeStage: 'Puppy (neonate / pediatric)',
      method: 'log-curve',
      notes: 'Log curve is unstable for very young puppies; treat as illustrative only.',
    };
  }
  const human = 16 * Math.log(ageYears) + 31;
  return {
    humanYears: Math.max(human, 0),
    lifeStage: 'See size-based life stage for clinical banding',
    method: 'log-curve',
    notes: 'Illustrative logarithmic model often linked to epigenetic aging research — not a diagnosis tool.',
  };
}

export function dogToHumanYears(
  ageYears: number,
  size: SizeClass,
  method: 'size-piecewise' | 'log-curve' = 'size-piecewise',
): DogAgeResult {
  if (method === 'log-curve') {
    const r = dogToHumanYearsLog(ageYears);
    return { ...r, lifeStage: dogLifeStage(ageYears, size) };
  }
  return dogToHumanYearsPiecewise(ageYears, size);
}
