export type ToolMeta = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: 'dog' | 'cat' | 'both';
  keywords: string[];
  related: string[];
};

/** Registry of all calculators — used for nav, hubs, related links, and audits */
export const tools: ToolMeta[] = [
  {
    slug: 'puppy-weight-calculator',
    title: 'Puppy Weight Calculator',
    shortTitle: 'Puppy Weight',
    description:
      'Predict adult weight from age in weeks, current weight and breed or size. Growth chart in lb and kg; free, private.',
    category: 'dog',
    keywords: ['puppy weight calculator', 'adult dog weight predictor', 'puppy growth chart'],
    related: ['dog-food-calculator', 'puppy-food-calculator', 'dog-bmi-calculator'],
  },
  {
    slug: 'dog-food-calculator',
    title: 'Dog Food Calculator',
    shortTitle: 'Dog Food',
    description:
      'Daily calories and cups from weight, life stage and label kcal per cup. RER/MER factors; lb or kg; free.',
    category: 'dog',
    keywords: ['dog food calculator', 'dog calorie calculator', 'how much to feed a dog'],
    related: ['puppy-food-calculator', 'homemade-dog-food-calculator', 'dog-water-intake-calculator'],
  },
  {
    slug: 'puppy-food-calculator',
    title: 'Puppy Food Calculator',
    shortTitle: 'Puppy Food',
    description:
      'Calculate puppy feeding amounts by current weight and expected adult size using RER and growth multipliers.',
    category: 'dog',
    keywords: ['puppy food calculator', 'puppy calorie calculator', 'puppy feeding calculator by weight'],
    related: ['dog-food-calculator', 'puppy-weight-calculator', 'homemade-dog-food-calculator'],
  },
  {
    slug: 'homemade-dog-food-calculator',
    title: 'Homemade & Raw Dog Food Calculator',
    shortTitle: 'Homemade / Raw',
    description:
      'Estimate daily homemade or raw ration portions from body weight. Educational only — balance recipes with a vet nutritionist.',
    category: 'dog',
    keywords: ['homemade dog food calculator', 'raw dog food calculator', 'BARF calculator'],
    related: ['dog-food-calculator', 'puppy-food-calculator', 'cat-food-calculator'],
  },
  {
    slug: 'dog-age-calculator',
    title: 'Dog Age Calculator',
    shortTitle: 'Dog Age',
    description:
      'Dog years to human years by size with AAHA-style life stages and an optional log curve — not the 7:1 myth.',
    category: 'dog',
    keywords: ['dog age calculator', 'dog years to human years', 'dog age by breed'],
    related: ['cat-age-calculator', 'puppy-weight-calculator', 'dog-bmi-calculator'],
  },
  {
    slug: 'cat-age-calculator',
    title: 'Cat Age Calculator',
    shortTitle: 'Cat Age',
    description:
      'Estimate your cat’s age in human years with life-stage stages used by veterinary associations.',
    category: 'cat',
    keywords: ['cat age calculator', 'cat years to human years', 'how old is my cat'],
    related: ['dog-age-calculator', 'cat-food-calculator'],
  },
  {
    slug: 'cat-food-calculator',
    title: 'Cat Food Calculator',
    shortTitle: 'Cat Food',
    description:
      'Estimate daily kcal and feeding amounts for cats by weight, life stage, and body condition goals.',
    category: 'cat',
    keywords: ['cat food calculator', 'cat calorie calculator', 'how much to feed a cat'],
    related: ['dog-food-calculator', 'cat-age-calculator'],
  },
  {
    slug: 'dog-bmi-calculator',
    title: 'Dog BMI & Body Condition Helper',
    shortTitle: 'Dog BMI / BCS',
    description:
      'Screen body condition with a BMI-style index and the 1–9 BCS scale. Educational helper, not a diagnosis.',
    category: 'dog',
    keywords: ['dog BMI calculator', 'dog body condition score', 'is my dog overweight'],
    related: ['dog-food-calculator', 'dog-water-intake-calculator', 'puppy-weight-calculator'],
  },
  {
    slug: 'dog-pregnancy-calculator',
    title: 'Dog Pregnancy & Due Date Calculator',
    shortTitle: 'Dog Pregnancy',
    description:
      'Estimate whelping due date from breeding or ovulation date. Typical gestation is about 63 days.',
    category: 'dog',
    keywords: ['dog pregnancy calculator', 'dog due date calculator', 'whelping date'],
    related: ['puppy-weight-calculator', 'puppy-food-calculator', 'dog-age-calculator'],
  },
  {
    slug: 'dog-chocolate-toxicity-calculator',
    title: 'Dog Chocolate Toxicity Calculator',
    shortTitle: 'Chocolate Toxicity',
    description:
      'Estimate theobromine dose from chocolate type, amount and weight. Call a vet or poison hotline if your dog ate chocolate.',
    category: 'dog',
    keywords: ['dog chocolate toxicity calculator', 'chocolate poisoning dog', 'how much chocolate is toxic'],
    related: ['dog-water-intake-calculator', 'dog-bmi-calculator'],
  },
  {
    slug: 'dog-water-intake-calculator',
    title: 'Dog Water Intake Calculator',
    shortTitle: 'Water Intake',
    description:
      'Estimate typical daily water needs from body weight and activity. Sudden changes warrant a vet visit.',
    category: 'dog',
    keywords: ['dog water intake calculator', 'how much water should a dog drink'],
    related: ['dog-food-calculator', 'dog-bmi-calculator'],
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string): ToolMeta[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return tool.related
    .map((s) => getTool(s))
    .filter((t): t is ToolMeta => Boolean(t));
}
