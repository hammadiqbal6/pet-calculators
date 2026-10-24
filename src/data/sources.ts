import type { SourceItem } from '../components/SourcesList.astro';
import { siteConfig } from '../config/site.ts';

const accessed = siteConfig.buildDate;

export const SRC = {
  nrc: {
    title: 'Nutrient Requirements of Dogs and Cats (2006)',
    url: 'https://nap.nationalacademies.org/catalog/10668/nutrient-requirements-of-dogs-and-cats',
    publisher: 'National Research Council / National Academies Press',
    accessed,
  },
  wsavaNutrition: {
    title: 'Global Nutrition Guidelines and Nutritional Assessment Tools',
    url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
    publisher: 'World Small Animal Veterinary Association (WSAVA)',
    accessed,
  },
  wsavaBcs: {
    title: 'WSAVA Body Condition Score chart for dogs',
    url: 'https://wsava.org/wp-content/uploads/2020/01/Body-Condition-Score-Dog.pdf',
    publisher: 'WSAVA Global Nutrition Committee',
    accessed,
  },
  aafco: {
    title: 'Understanding Pet Food: AAFCO nutrient profiles and labeling',
    url: 'https://www.aafco.org/consumers/understanding-pet-food/',
    publisher: 'Association of American Feed Control Officials (AAFCO)',
    accessed,
  },
  aahaCanineLife: {
    title: 'AAHA Canine Life Stage Guidelines',
    url: 'https://www.aaha.org/resources/2019-aaha-canine-life-stage-guidelines/',
    publisher: 'American Animal Hospital Association (AAHA)',
    accessed,
  },
  aahaNutrition: {
    title: 'AAHA Nutrition and Weight Management Guidelines for Dogs and Cats',
    url: 'https://www.aaha.org/resources/2021-aaha-nutrition-and-weight-management-guidelines/',
    publisher: 'American Animal Hospital Association (AAHA)',
    accessed,
  },
  aahaFeline: {
    title: 'AAHA/AAFP Feline Life Stage Guidelines',
    url: 'https://www.aaha.org/resources/2021-aaha-aafp-feline-life-stage-guidelines/',
    publisher: 'AAHA and American Association of Feline Practitioners (AAFP)',
    accessed,
  },
  aafp: {
    title: 'American Association of Feline Practitioners — cat owner and clinical resources',
    url: 'https://catvets.com/',
    publisher: 'American Association of Feline Practitioners (AAFP)',
    accessed,
  },
  aspcaPoison: {
    title: 'Animal Poison Control Center',
    url: 'https://www.aspca.org/pet-care/animal-poison-control',
    publisher: 'ASPCA',
    accessed,
  },
  aspcaPeopleFoods: {
    title: 'People Foods to Avoid Feeding Your Pets',
    url: 'https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets',
    publisher: 'ASPCA',
    accessed,
  },
  aspcaDogCare: {
    title: 'General Dog Care',
    url: 'https://www.aspca.org/pet-care/dog-care/general-dog-care',
    publisher: 'ASPCA',
    accessed,
  },
  aspcaCatCare: {
    title: 'General Cat Care',
    url: 'https://www.aspca.org/pet-care/cat-care/general-cat-care',
    publisher: 'ASPCA',
    accessed,
  },
  petPoisonChocolate: {
    title: 'Chocolate poisoning in dogs and cats',
    url: 'https://www.petpoisonhelpline.com/poison/chocolate/',
    publisher: 'Pet Poison Helpline',
    accessed,
  },
  msdChocolate: {
    title: 'Chocolate Toxicosis in Animals',
    url: 'https://www.msdvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
    publisher: 'MSD Veterinary Manual',
    accessed,
  },
  msdDogReproduction: {
    title: 'Management of Reproduction in Dogs',
    url: 'https://www.msdvetmanual.com/dog-owners/reproductive-disorders-of-dogs/management-of-reproduction-in-dogs',
    publisher: 'MSD Veterinary Manual (owner edition)',
    accessed,
  },
  msdCatNutrition: {
    title: 'Proper Nutrition for Cats',
    url: 'https://www.msdvetmanual.com/cat-owners/selecting-and-providing-a-home-for-a-cat/proper-nutrition-for-cats',
    publisher: 'MSD Veterinary Manual (owner edition)',
    accessed,
  },
  msdDogHome: {
    title: 'Selecting and Providing a Home for a Dog',
    url: 'https://www.msdvetmanual.com/dog-owners/selecting-and-providing-a-home-for-a-dog',
    publisher: 'MSD Veterinary Manual (owner edition)',
    accessed,
  },
  merckMer: {
    title: 'Daily Maintenance Energy Requirements for Dogs and Cats',
    url: 'https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats',
    publisher: 'Merck Veterinary Manual',
    accessed,
  },
  tuftsNutrition: {
    title: 'Clinical Nutrition service — Foster Hospital for Small Animals',
    url: 'https://vet.tufts.edu/foster-hospital-small-animals/specialty-services/nutrition',
    publisher: 'Tufts Cummings School of Veterinary Medicine',
    accessed,
  },
  wangDogAgingPmc: {
    title: 'Quantitative translation of dog-to-human aging (PMC full text; 104 Labradors)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7484147/',
    publisher: 'Wang et al., Cell Systems (2020) via PMC',
    accessed,
  },
  wangDogAging: {
    title: 'Quantitative translation of dog-to-human aging by conserved remodeling of the DNA methylome',
    url: 'https://doi.org/10.1016/j.cels.2020.06.006',
    publisher: 'Wang et al., Cell Systems (2020)',
    accessed,
  },
  hawthornePuppyGrowth: {
    title: 'Body-weight changes during growth in puppies of different breeds (Hawthorne et al., 2004)',
    url: 'https://doi.org/10.1093/jn/134.8.2027S',
    publisher: 'Journal of Nutrition 134(8)',
    accessed,
  },
  stockmanHomemade: {
    title: 'Evaluation of recipes of home-prepared maintenance diets for dogs (Stockman et al., 2013)',
    url: 'https://doi.org/10.2460/javma.242.11.1500',
    publisher: 'JAVMA 242(11):1500–1505',
    accessed,
  },
  avmaSeniorPets: {
    title: 'Senior pet care',
    url: 'https://www.avma.org/resources-tools/pet-owners/petcare/senior-pet-care',
    publisher: 'American Veterinary Medical Association (AVMA)',
    accessed,
  },
  avmaRawPolicy: {
    title: 'Raw or undercooked animal-source protein in cat and dog diets',
    url: 'https://www.avma.org/resources-tools/avma-policies/raw-or-undercooked-animal-source-protein-cat-and-dog-diets',
    publisher: 'American Veterinary Medical Association (AVMA)',
    accessed,
  },
  fdaRawPetFood: {
    title: 'Get the Facts about Raw Pet Food Diets',
    url: 'https://www.fda.gov/animal-veterinary/animal-health-literacy/get-facts-about-raw-pet-food-diets',
    publisher: 'U.S. Food and Drug Administration (FDA)',
    accessed,
  },
  msdPolydipsia: {
    title: 'Polyuria and Polydipsia in Animals',
    url: 'https://www.msdvetmanual.com/urinary-system/polyuria-and-polydipsia-in-animals',
    publisher: 'MSD Veterinary Manual',
    accessed,
  },
  aahaAafpFelinePmc: {
    title: '2021 AAHA/AAFP Feline Life Stage Guidelines (full text)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8344318/',
    publisher: 'AAHA/AAFP via PMC',
    accessed,
  },
} satisfies Record<string, SourceItem>;

export type { SourceItem };
