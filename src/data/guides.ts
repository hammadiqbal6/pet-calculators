export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  relatedTools: string[];
  lastUpdated: string;
};

export const guides: GuideMeta[] = [
  {
    slug: 'when-do-puppies-stop-growing',
    title: 'When Do Puppies Stop Growing?',
    description:
      'When puppies stop growing by size class, what affects adult weight, and when to switch from puppy to adult food — with a growth timeline (not a calculator).',
    relatedTools: ['puppy-weight-calculator', 'puppy-food-calculator', 'dog-age-calculator'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'how-much-to-feed-a-puppy',
    title: 'How Much to Feed a Puppy',
    description:
      'How much and how often to feed a puppy by age and adult size: daily calories, meals per day and signs of overfeeding, plus a free puppy food calculator.',
    relatedTools: ['puppy-food-calculator', 'dog-food-calculator', 'puppy-weight-calculator'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'dog-years-myth',
    title: 'The Dog Years Myth: Why 7:1 Is Wrong',
    description:
      'Why the 7:1 dog-years myth fails, what AAHA life stages mean, and how the Wang et al. 2020 log curve (104 Labradors) compares — not a calculator page.',
    relatedTools: ['dog-age-calculator', 'cat-age-calculator'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'raw-feeding-basics',
    title: 'Raw Feeding Basics for Dogs',
    description:
      'What BARF and prey-model raw feeding mean, pathogen and balance risks, and how portion maths relates to a homemade food calculator (safety first).',
    relatedTools: ['homemade-dog-food-calculator', 'dog-food-calculator'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'cat-feeding-guide',
    title: 'Cat Feeding Guide: Calories, Wet vs Dry, and Weight',
    description:
      'Cat feeding by life stage: wet vs dry, meal schedules, weight cues, and when to use a cat food calculator for kcal estimates.',
    relatedTools: ['cat-food-calculator', 'cat-age-calculator'],
    lastUpdated: '2026-10-20',
  },
  {
    slug: 'chocolate-and-dogs-safety',
    title: 'Chocolate and Dogs: Why It Is Dangerous',
    description:
      'Why chocolate is dangerous for dogs, theobromine by type, symptoms, and when to call ASPCA or Pet Poison Helpline — with a link to the toxicity calculator.',
    relatedTools: ['dog-chocolate-toxicity-calculator'],
    lastUpdated: '2026-10-20',
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return guides.find((g) => g.slug === slug);
}
