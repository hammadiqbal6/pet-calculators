/** Unit conversion helpers — all internal math uses metric (kg, g, ml, kcal). */

export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

export function kgToLb(kg: number): number {
  return kg / 0.45359237;
}

export function ozToG(oz: number): number {
  return oz * 28.349523125;
}

export function gToOz(g: number): number {
  return g / 28.349523125;
}

export function mlToFlOz(ml: number): number {
  return ml / 29.5735295625;
}

export function flOzToMl(flOz: number): number {
  return flOz * 29.5735295625;
}

export function cupsFromG(grams: number, gramsPerCup: number): number {
  if (gramsPerCup <= 0) return 0;
  return grams / gramsPerCup;
}

export function round(n: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export type WeightUnit = 'kg' | 'lb';

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : lbToKg(value);
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg);
}
