import { describe, expect, it } from 'vitest';
import { calculateRER, calculateDogMER, calculateCatMER, cupsFromKcal, gramsFromKcal } from './energy';
import { predictAdultWeight, growthFraction } from './puppyWeight';
import { dogToHumanYears } from './dogAge';
import { catToHumanYears } from './catAge';
import { homemadeRation } from './homemade';
import { dogBodyMassIndex, suggestBcsFromIndex, getBcs } from './bmi';
import { estimateWhelpingDate, daysUntil } from './pregnancy';
import { assessChocolateToxicity } from './chocolate';
import { estimateWaterIntake } from './water';
import { lbToKg, kgToLb, toKg } from '../units';

describe('units', () => {
  it('converts lb and kg', () => {
    expect(lbToKg(10)).toBeCloseTo(4.5359, 3);
    expect(kgToLb(4.5359237)).toBeCloseTo(10, 3);
    expect(toKg(10, 'lb')).toBeCloseTo(4.5359, 3);
  });
});

describe('energy RER/MER', () => {
  it('computes RER for 10 kg dog ≈ 393 kcal', () => {
    expect(calculateRER(10)).toBeCloseTo(393.6, 0);
  });

  it('applies neutered adult MER factor 1.6', () => {
    const rer = calculateRER(10);
    expect(calculateDogMER(10, 'adult_neutered')).toBeCloseTo(rer * 1.6, 5);
  });

  it('applies cat kitten factor', () => {
    const rer = calculateRER(4);
    expect(calculateCatMER(4, 'kitten')).toBeCloseTo(rer * 2.5, 5);
  });

  it('converts kcal to cups and grams', () => {
    expect(cupsFromKcal(400, 350)).toBeCloseTo(1.142, 2);
    expect(gramsFromKcal(400, 350)).toBeCloseTo(114.286, 2);
  });

  it('rejects non-positive weight', () => {
    expect(() => calculateRER(0)).toThrow();
  });
});

describe('puppy weight', () => {
  it('predicts adult weight from early puppy rule', () => {
    const r = predictAdultWeight({ currentWeightKg: 5, ageWeeks: 10, size: 'large' });
    expect(r.method).toBe('week52');
    expect(r.predictedAdultKg).toBeGreaterThan(5);
    expect(r.chart.length).toBeGreaterThan(3);
  });

  it('growth fraction approaches 1 near maturity', () => {
    expect(growthFraction(80, 16)).toBeGreaterThan(0.95);
    expect(growthFraction(4, 16)).toBeLessThan(0.5);
  });
});

describe('dog age', () => {
  it('maps 1 year to ~15 human years', () => {
    expect(dogToHumanYears(1, 'medium').humanYears).toBeCloseTo(15, 0);
  });

  it('maps 2 years to ~24 human years', () => {
    expect(dogToHumanYears(2, 'medium').humanYears).toBeCloseTo(24, 0);
  });

  it('ages large dogs faster after year 2', () => {
    const small = dogToHumanYears(8, 'small').humanYears;
    const giant = dogToHumanYears(8, 'giant').humanYears;
    expect(giant).toBeGreaterThan(small);
  });
});

describe('cat age', () => {
  it('maps 1 year to 15 human years', () => {
    expect(catToHumanYears(1).humanYears).toBe(15);
  });
  it('maps 5 years to 36 human years', () => {
    expect(catToHumanYears(5).humanYears).toBe(36);
  });
});

describe('homemade', () => {
  it('returns 2–3% for maintenance', () => {
    const r = homemadeRation(20, 'maintain');
    expect(r.lowGPerDay).toBeCloseTo(400, 0);
    expect(r.highGPerDay).toBeCloseTo(600, 0);
  });
});

describe('bmi / bcs', () => {
  it('computes BMI-like index', () => {
    expect(dogBodyMassIndex(30, 60)).toBeCloseTo(83.33, 1);
  });
  it('suggests BCS and labels', () => {
    expect(suggestBcsFromIndex(28)).toBe(5);
    expect(getBcs(5).label).toBe('Ideal');
  });
});

describe('pregnancy', () => {
  it('estimates ~63 day due date from ovulation', () => {
    const r = estimateWhelpingDate({ startDate: '2026-01-01', mode: 'ovulation' });
    expect(r.dueDate).toBe('2026-03-05');
    expect(r.gestationDaysUsed).toBe(63);
  });
  it('daysUntil works', () => {
    expect(daysUntil('2026-01-10', '2026-01-01')).toBe(9);
  });
});

describe('chocolate', () => {
  it('flags baking chocolate as high risk for small dogs', () => {
    const r = assessChocolateToxicity(5, 50, 'baking');
    expect(r.band).toBe('high');
    expect(r.doseMgPerKg).toBeGreaterThan(60);
  });
  it('milk chocolate small amount may be low/mild for large dog', () => {
    const r = assessChocolateToxicity(30, 10, 'milk');
    expect(['low', 'mild']).toContain(r.band);
  });
});

describe('water', () => {
  it('estimates ~50–60 ml/kg', () => {
    const r = estimateWaterIntake(10, 'normal');
    expect(r.lowMl).toBe(500);
    expect(r.highMl).toBe(600);
  });
});
