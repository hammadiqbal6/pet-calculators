/** Top ~50 dog breeds with size class and typical adult weight ranges (kg). Educational averages — individuals vary. */

export type SizeClass = 'toy' | 'small' | 'medium' | 'large' | 'giant';

export type Breed = {
  id: string;
  name: string;
  size: SizeClass;
  /** Typical adult weight range kg [min, max] for mixed sexes / average */
  adultKg: [number, number];
  /** Approximate age in months when most growth is complete */
  growthMonths: number;
};

export const SIZE_ADULT_KG: Record<SizeClass, [number, number]> = {
  toy: [1.5, 5.5],
  small: [5.5, 12],
  medium: [12, 27],
  large: [27, 45],
  giant: [45, 90],
};

export const SIZE_GROWTH_MONTHS: Record<SizeClass, number> = {
  toy: 10,
  small: 12,
  medium: 14,
  large: 16,
  giant: 18,
};

export const breeds: Breed[] = [
  { id: 'labrador-retriever', name: 'Labrador Retriever', size: 'large', adultKg: [25, 36], growthMonths: 16 },
  { id: 'french-bulldog', name: 'French Bulldog', size: 'small', adultKg: [8, 14], growthMonths: 12 },
  { id: 'german-shepherd', name: 'German Shepherd', size: 'large', adultKg: [22, 40], growthMonths: 18 },
  { id: 'golden-retriever', name: 'Golden Retriever', size: 'large', adultKg: [25, 34], growthMonths: 16 },
  { id: 'bulldog', name: 'Bulldog (English)', size: 'medium', adultKg: [18, 25], growthMonths: 14 },
  { id: 'poodle-standard', name: 'Poodle (Standard)', size: 'large', adultKg: [20, 32], growthMonths: 16 },
  { id: 'poodle-miniature', name: 'Poodle (Miniature)', size: 'small', adultKg: [5, 9], growthMonths: 12 },
  { id: 'poodle-toy', name: 'Poodle (Toy)', size: 'toy', adultKg: [2, 4], growthMonths: 10 },
  { id: 'beagle', name: 'Beagle', size: 'small', adultKg: [9, 11], growthMonths: 12 },
  { id: 'rottweiler', name: 'Rottweiler', size: 'large', adultKg: [35, 60], growthMonths: 18 },
  { id: 'german-shorthaired-pointer', name: 'German Shorthaired Pointer', size: 'large', adultKg: [20, 32], growthMonths: 16 },
  { id: 'dachshund', name: 'Dachshund', size: 'small', adultKg: [7, 15], growthMonths: 12 },
  { id: 'pembroke-welsh-corgi', name: 'Pembroke Welsh Corgi', size: 'small', adultKg: [10, 14], growthMonths: 12 },
  { id: 'australian-shepherd', name: 'Australian Shepherd', size: 'medium', adultKg: [16, 32], growthMonths: 15 },
  { id: 'yorkshire-terrier', name: 'Yorkshire Terrier', size: 'toy', adultKg: [1.5, 3.2], growthMonths: 10 },
  { id: 'boxer', name: 'Boxer', size: 'large', adultKg: [25, 32], growthMonths: 16 },
  { id: 'cavalier-king-charles', name: 'Cavalier King Charles Spaniel', size: 'small', adultKg: [5.5, 8], growthMonths: 12 },
  { id: 'doberman-pinscher', name: 'Doberman Pinscher', size: 'large', adultKg: [27, 45], growthMonths: 18 },
  { id: 'miniature-schnauzer', name: 'Miniature Schnauzer', size: 'small', adultKg: [5, 9], growthMonths: 12 },
  { id: 'cane-corso', name: 'Cane Corso', size: 'giant', adultKg: [40, 50], growthMonths: 20 },
  { id: 'shih-tzu', name: 'Shih Tzu', size: 'toy', adultKg: [4, 7.5], growthMonths: 10 },
  { id: 'boston-terrier', name: 'Boston Terrier', size: 'small', adultKg: [5.5, 11], growthMonths: 12 },
  { id: 'pomeranian', name: 'Pomeranian', size: 'toy', adultKg: [1.5, 3.5], growthMonths: 10 },
  { id: 'havanese', name: 'Havanese', size: 'toy', adultKg: [3, 6], growthMonths: 10 },
  { id: 'shetland-sheepdog', name: 'Shetland Sheepdog', size: 'small', adultKg: [7, 12], growthMonths: 12 },
  { id: 'brittany', name: 'Brittany', size: 'medium', adultKg: [14, 18], growthMonths: 14 },
  { id: 'english-springer-spaniel', name: 'English Springer Spaniel', size: 'medium', adultKg: [18, 25], growthMonths: 14 },
  { id: 'pug', name: 'Pug', size: 'small', adultKg: [6, 8], growthMonths: 12 },
  { id: 'cocker-spaniel', name: 'Cocker Spaniel', size: 'medium', adultKg: [9, 14], growthMonths: 13 },
  { id: 'miniature-american-shepherd', name: 'Miniature American Shepherd', size: 'small', adultKg: [7, 18], growthMonths: 13 },
  { id: 'border-collie', name: 'Border Collie', size: 'medium', adultKg: [12, 20], growthMonths: 14 },
  { id: 'chihuahua', name: 'Chihuahua', size: 'toy', adultKg: [1.5, 3], growthMonths: 9 },
  { id: 'maltese', name: 'Maltese', size: 'toy', adultKg: [2, 4], growthMonths: 10 },
  { id: 'weimaraner', name: 'Weimaraner', size: 'large', adultKg: [25, 40], growthMonths: 17 },
  { id: 'vizsla', name: 'Vizsla', size: 'large', adultKg: [20, 30], growthMonths: 16 },
  { id: 'basset-hound', name: 'Basset Hound', size: 'medium', adultKg: [20, 29], growthMonths: 14 },
  { id: 'mastiff', name: 'Mastiff', size: 'giant', adultKg: [54, 90], growthMonths: 24 },
  { id: 'great-dane', name: 'Great Dane', size: 'giant', adultKg: [45, 90], growthMonths: 24 },
  { id: 'saint-bernard', name: 'Saint Bernard', size: 'giant', adultKg: [54, 82], growthMonths: 24 },
  { id: 'bernese-mountain-dog', name: 'Bernese Mountain Dog', size: 'giant', adultKg: [36, 50], growthMonths: 20 },
  { id: 'siberian-husky', name: 'Siberian Husky', size: 'medium', adultKg: [16, 27], growthMonths: 14 },
  { id: 'alaskan-malamute', name: 'Alaskan Malamute', size: 'large', adultKg: [34, 45], growthMonths: 18 },
  { id: 'shiba-inu', name: 'Shiba Inu', size: 'small', adultKg: [7, 11], growthMonths: 12 },
  { id: 'akita', name: 'Akita', size: 'large', adultKg: [32, 59], growthMonths: 18 },
  { id: 'collie', name: 'Collie (Rough/Smooth)', size: 'large', adultKg: [22, 34], growthMonths: 16 },
  { id: 'whippet', name: 'Whippet', size: 'medium', adultKg: [9, 18], growthMonths: 13 },
  { id: 'greyhound', name: 'Greyhound', size: 'large', adultKg: [27, 40], growthMonths: 16 },
  { id: 'jack-russell-terrier', name: 'Jack Russell / Parson Russell', size: 'small', adultKg: [5, 8], growthMonths: 12 },
  { id: 'staffordshire-bull-terrier', name: 'Staffordshire Bull Terrier', size: 'medium', adultKg: [11, 17], growthMonths: 14 },
  { id: 'american-pit-bull-terrier', name: 'American Pit Bull Terrier', size: 'medium', adultKg: [14, 27], growthMonths: 15 },
  { id: 'mixed-unknown', name: 'Mixed / Unknown breed', size: 'medium', adultKg: [12, 27], growthMonths: 14 },
];

export function getBreed(id: string): Breed | undefined {
  return breeds.find((b) => b.id === id);
}

export function breedsBySize(size: SizeClass): Breed[] {
  return breeds.filter((b) => b.size === size);
}
