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
      'Growth timelines by breed size, what affects adult weight, and when to switch from puppy to adult food.',
    relatedTools: ['puppy-weight-calculator', 'puppy-food-calculator', 'dog-age-calculator'],
    lastUpdated: '2026-10-19',
  },
  {
    slug: 'how-much-to-feed-a-puppy',
    title: 'How Much to Feed a Puppy',
    description:
      'Practical puppy feeding guide covering calories, meal frequency, and common overfeeding mistakes.',
    relatedTools: ['puppy-food-calculator', 'dog-food-calculator', 'puppy-weight-calculator'],
    lastUpdated: '2026-10-19',
  },
  {
    slug: 'dog-years-myth',
    title: 'The Dog Years Myth: Why 7:1 Is Wrong',
    description:
      'Why the “one dog year equals seven human years” rule fails, and what modern research suggests instead.',
    relatedTools: ['dog-age-calculator', 'cat-age-calculator'],
    lastUpdated: '2026-10-19',
  },
  {
    slug: 'raw-feeding-basics',
    title: 'Raw Feeding Basics for Dogs',
    description:
      'What BARF and prey-model feeding mean, nutritional risks, and how to use portion calculators safely.',
    relatedTools: ['homemade-dog-food-calculator', 'dog-food-calculator'],
    lastUpdated: '2026-10-19',
  },
  {
    slug: 'cat-feeding-guide',
    title: 'Cat Feeding Guide: Calories, Wet vs Dry, and Weight',
    description:
      'How much to feed cats by life stage, why protein matters, and how to use a cat food calculator.',
    relatedTools: ['cat-food-calculator', 'cat-age-calculator'],
    lastUpdated: '2026-10-19',
  },
  {
    slug: 'chocolate-and-dogs-safety',
    title: 'Chocolate and Dogs: Why It Is Dangerous',
    description:
      'Theobromine toxicity explained by chocolate type, symptoms to watch for, and when to call a poison hotline.',
    relatedTools: ['dog-chocolate-toxicity-calculator'],
    lastUpdated: '2026-10-19',
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return guides.find((g) => g.slug === slug);
}
