export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  relatedTools: string[];
  /** Optional reciprocal guide↔guide links for clusters and hubs. */
  relatedGuides?: string[];
  lastUpdated: string;
};

export const guides: GuideMeta[] = [
  {
    slug: 'when-do-puppies-stop-growing',
    title: 'When Do Puppies Stop Growing?',
    description:
      'When puppies stop growing by size class, what affects adult weight, and when to switch from puppy to adult food — with a growth timeline (not a calculator).',
    relatedTools: ['puppy-weight-calculator', 'puppy-food-calculator', 'dog-age-calculator'],
    relatedGuides: ['how-much-to-feed-a-puppy'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'how-much-to-feed-a-puppy',
    title: 'How Much to Feed a Puppy',
    description:
      'How much and how often to feed a puppy by age and adult size: daily calories, meals per day and signs of overfeeding, plus a free puppy food calculator.',
    relatedTools: ['puppy-food-calculator', 'dog-food-calculator', 'puppy-weight-calculator'],
    relatedGuides: ['when-do-puppies-stop-growing', 'dog-body-condition-score-chart', 'how-much-water-should-a-dog-drink'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'dog-years-myth',
    title: 'The Dog Years Myth: Why 7:1 Is Wrong',
    description:
      'Why the 7:1 dog-years myth fails, what AAHA life stages mean, and how the Wang et al. 2020 log curve (104 Labradors) compares — not a calculator page.',
    relatedTools: ['dog-age-calculator', 'cat-age-calculator'],
    relatedGuides: ['cat-life-stages'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'raw-feeding-basics',
    title: 'Raw Feeding Basics for Dogs',
    description:
      'What BARF and prey-model raw feeding mean, pathogen and balance risks, and how portion maths relates to a homemade food calculator (safety first).',
    relatedTools: ['homemade-dog-food-calculator', 'dog-food-calculator'],
    relatedGuides: ['homemade-dog-food-calories'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'cat-feeding-guide',
    title: 'Cat Feeding Guide: Calories, Wet vs Dry, and Weight',
    description:
      'Cat feeding by life stage: wet vs dry, meal schedules, weight cues, and when to use a cat food calculator for kcal estimates.',
    relatedTools: ['cat-food-calculator', 'cat-age-calculator'],
    relatedGuides: ['cat-life-stages', 'kitten-feeding-schedule'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'chocolate-and-dogs-safety',
    title: 'Chocolate and Dogs: Why It Is Dangerous',
    description:
      'Why chocolate is dangerous for dogs, theobromine by type, symptoms, and when to call ASPCA or Pet Poison Helpline — with a link to the toxicity calculator.',
    relatedTools: ['dog-chocolate-toxicity-calculator', 'dog-bmi-calculator'],
    relatedGuides: ['dog-body-condition-score-chart'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'cat-life-stages',
    title: 'Cat Life Stages: Kitten to Geriatric',
    description:
      'AAFP/AAHA-style cat life stages with a cat-years-to-human-years chart, care focus by age, and when to adjust diet or vet visits.',
    relatedTools: ['cat-age-calculator', 'cat-food-calculator'],
    relatedGuides: ['cat-feeding-guide', 'kitten-feeding-schedule', 'dog-years-myth'],
    lastUpdated: '2026-10-23',
  },
  {
    slug: 'how-much-water-should-a-dog-drink',
    title: 'How Much Water Should a Dog Drink?',
    description:
      'How much water a dog should drink per day by weight (~50–60 ml/kg), dehydration signs, and when to call your veterinarian.',
    relatedTools: ['dog-water-intake-calculator', 'dog-food-calculator', 'dog-bmi-calculator'],
    relatedGuides: ['dog-body-condition-score-chart', 'how-much-to-feed-a-puppy'],
    lastUpdated: '2026-10-23',
  },
  {
    slug: 'how-long-are-dogs-pregnant',
    title: 'How Long Are Dogs Pregnant?',
    description:
      'Dog pregnancy length (~63 days from ovulation), week-by-week stages, and why ultrasound confirmation with your vet matters.',
    relatedTools: ['dog-pregnancy-calculator', 'dog-food-calculator'],
    relatedGuides: ['dog-body-condition-score-chart'],
    lastUpdated: '2026-10-23',
  },
  {
    slug: 'dog-body-condition-score-chart',
    title: 'Dog Body Condition Score Chart',
    description:
      'Dog body condition score chart (BCS 1–9) in plain words: ribs, waist, and abdomen cues to screen if your dog is overweight.',
    relatedTools: ['dog-bmi-calculator', 'dog-food-calculator'],
    relatedGuides: ['how-much-to-feed-a-puppy', 'homemade-dog-food-calories', 'how-much-water-should-a-dog-drink'],
    lastUpdated: '2026-10-23',
  },
  {
    slug: 'homemade-dog-food-calories',
    title: 'Homemade Dog Food Calories Guide',
    description:
      'How to estimate homemade dog food calories with RER/MER context, portion maths, and why a veterinary nutritionist must balance recipes.',
    relatedTools: ['homemade-dog-food-calculator', 'dog-food-calculator'],
    relatedGuides: ['raw-feeding-basics', 'dog-body-condition-score-chart'],
    lastUpdated: '2026-10-23',
  },
  {
    slug: 'kitten-feeding-schedule',
    title: 'Kitten Feeding Schedule by Age',
    description:
      'Kitten feeding schedule by age: meals per day, weaning notes, calorie multipliers, and when orphan or underweight kittens need a vet.',
    relatedTools: ['cat-food-calculator', 'cat-age-calculator'],
    relatedGuides: ['cat-feeding-guide', 'cat-life-stages'],
    lastUpdated: '2026-10-23',
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return guides.find((g) => g.slug === slug);
}

/** Guides that list this tool in relatedTools (for tool-page "Learn more"). */
export function getGuidesForTool(toolSlug: string): GuideMeta[] {
  return guides.filter((g) => g.relatedTools.includes(toolSlug));
}

/** Topical sibling guides from relatedGuides (falls back to empty). */
export function getRelatedGuides(slug: string): GuideMeta[] {
  const guide = getGuide(slug);
  if (!guide?.relatedGuides?.length) return [];
  return guide.relatedGuides
    .map((s) => getGuide(s))
    .filter((g): g is GuideMeta => Boolean(g) && g.slug !== slug);
}
