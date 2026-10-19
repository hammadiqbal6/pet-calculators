# Keyword map (one primary keyword per page, zero cannibalization)

This file is the **single source of truth** for which page owns which search intent. It is machine-checked: `npm run audit:seo` fails if a built page is missing from the tables below, or if two rows share the same primary keyword.

Governing documents: [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md) (section 1 keyword workflow, section 6 "fan-out trap"), [MARKET-RESEARCH.md](./MARKET-RESEARCH.md) (idea #3, pet calculators), [ideas/README.md](./ideas/README.md). Summary and calendar: [SEO-GUIDE.md](./SEO-GUIDE.md).

## Rules

1. **One primary keyword per page, one page per primary keyword.** The primary keyword goes in `<title>`, the `<h1>`, the first paragraph, the URL slug and the meta description. It must be unique in the "Primary keyword" column across **all** tables in this file, including the planned-articles table.
2. **Secondary cluster = phrasings of the same intent.** They appear naturally in H2s, the FAQ, and body copy of the owning page only. A secondary keyword may never be a primary keyword of another row, and may not appear as a secondary on two rows.
3. **Different task, different page.** Phrasings such as "dog calorie calculator" and "dog feeding calculator by weight" belong on the dog food calculator as options, not on separate pages (SEO-PLAYBOOK section 6, the fan-out trap). Breed-specific pages are allowed only if they carry unique data (see "Not allowed" below).
4. **Question phrasing decides tool vs. guide.** "How much to feed a dog / cat" is answered by the calculator, so the tool owns it. "How much to feed a puppy" is owned by the existing guide because the guide's slug and title already target it; the puppy calculator owns "puppy food calculator".
5. **Hubs and the homepage target navigational / category terms only**, never a tool's primary keyword. They link down to the owning page instead of competing with it.
6. **Volumes are not recorded here.** No measured volumes exist (docs/MARKET-RESEARCH.md section 6; Nuqti figures are low-confidence estimates). Before writing a planned page, verify demand manually (autocomplete, Keyword Planner, Ahrefs free tools) and record the figure and source in the PR description, per the `keyword-research` skill.
7. **Change process:** any change to a primary keyword, slug, title or H1 starts here. Update this file, then the page, `src/data/tools.ts` / `src/data/guides.ts` (`keywords` array and `description`), internal anchors (see the `internal-linking` skill), then run `npm run audit:seo`.

Intent legend: **T** = transactional/tool (user wants a result now), **I** = informational (wants an explanation), **N** = navigational/brand, **E** = emergency (safety, link to disclaimers and poison hotlines).

## 1. Live pages

### 1a. Homepage and hubs

| Route | Page type | Primary keyword | Secondary cluster | Intent | Notes |
|---|---|---|---|---|---|
| `/` | Home | `pet calculators` | free pet calculators, dog and cat calculators, online pet calculator, pet calculator tools | T/N | Brand + category head term. Links to every hub and the 3 flagship tools. Never targets a single tool keyword. |
| `/tools/` | Hub | `dog and cat calculators list` | all pet calculators, pet calculator directory, free dog calculators and cat calculators | N | Index of every tool. Short unique intro (>= 150 words) so it is not a thin link page. |
| `/dogs/` | Hub | `dog calculators` | free dog calculators, dog tools online, calculators for dog owners | T/N | Groups the dog tools by life stage: puppy, adult, senior, health. |
| `/cats/` | Hub | `cat calculators` | free cat calculators, cat tools online, calculators for cat owners | T/N | Currently two tools (cat age, cat food). Expand with the cat articles before adding more tools. |
| `/guides/` | Hub | `dog and cat care guides` | pet care guides, dog feeding guides, cat feeding guides, vet-sourced pet guides | N | Index of every guide, grouped by topic. |

### 1b. Calculators (`src/pages/tools/<slug>/index.astro`)

| Route | Page type | Primary keyword | Secondary cluster | Intent | Notes |
|---|---|---|---|---|---|
| `/tools/puppy-weight-calculator/` | Tool | `puppy weight calculator` | puppy weight predictor, adult dog weight calculator, how big will my puppy get, puppy growth chart, puppy weight chart by age, puppy weight by breed | T | Breed picker + growth-fraction method. Flagship page; owns every "predict adult weight" phrasing. |
| `/tools/dog-food-calculator/` | Tool | `dog food calculator` | how much to feed a dog, dog calorie calculator, dog feeding calculator by weight, how many cups of food should my dog eat, dog food amount calculator, dog RER MER calculator | T | RER/MER + kcal-per-cup conversion. Owns adult/senior feeding. Puppies go to the puppy tool. |
| `/tools/puppy-food-calculator/` | Tool | `puppy food calculator` | puppy feeding calculator, puppy calorie calculator, puppy food amount by weight, puppy food by age and breed size | T | Growth multipliers (2.0 / 3.0 x RER). "How much to feed a puppy" belongs to the guide, not here. |
| `/tools/homemade-dog-food-calculator/` | Tool | `homemade dog food calculator` | raw dog food calculator, BARF calculator, raw feeding calculator, how much raw food to feed a dog, raw dog food portion calculator | T | Portion maths only. Educational: recipes must be balanced by a board-certified veterinary nutritionist. |
| `/tools/dog-age-calculator/` | Tool | `dog age calculator` | dog years to human years, dog age by breed, how old is my dog in human years, dog age chart | T | Size-aware conversion. Debunking the 7:1 rule lives in the guide. |
| `/tools/cat-age-calculator/` | Tool | `cat age calculator` | cat years to human years, how old is my cat, cat age chart, cat age in human years | T | Life-stage table (AAFP/AAHA). Teeth/eyes age estimation belongs to a planned article. |
| `/tools/cat-food-calculator/` | Tool | `cat food calculator` | how much to feed a cat, cat calorie calculator, cat feeding calculator, cat food amount by weight | T | Kitten / adult / senior / weight-loss factors. Wet-vs-dry editorial content belongs to the cat guides. |
| `/tools/dog-bmi-calculator/` | Tool | `dog bmi calculator` | is my dog overweight, ideal dog weight calculator, healthy dog weight, dog body condition score calculator | T | Screening index plus BCS pointer. Must never read as a diagnosis. The full 9-point BCS chart is a planned article. |
| `/tools/dog-pregnancy-calculator/` | Tool | `dog pregnancy calculator` | dog due date calculator, whelping date calculator, dog gestation calculator, dog pregnancy due date | T | About 63 days from ovulation; wider window from breeding date. Week-by-week and sign articles are separate pages. |
| `/tools/dog-chocolate-toxicity-calculator/` | Tool | `dog chocolate toxicity calculator` | how much chocolate is toxic to a dog, chocolate poisoning dog calculator, dog ate chocolate calculator, theobromine calculator dog | T/E | Emergency-adjacent. Prominent "call your vet / poison hotline" copy above the result. Explanations live in the guide. |
| `/tools/dog-water-intake-calculator/` | Tool | `dog water intake calculator` | how much water should a dog drink, dog water intake by weight, daily water for dogs, dog hydration calculator | T | About 50-60 ml/kg/day guideline plus modifiers. Puppy water and dehydration are planned articles. |

### 1c. Guides (`src/pages/guides/<slug>/index.astro`)

| Route | Page type | Primary keyword | Secondary cluster | Intent | Notes |
|---|---|---|---|---|---|
| `/guides/when-do-puppies-stop-growing/` | Guide | `when do puppies stop growing` | puppy growth timeline, how long do puppies grow, when do dogs stop growing, large breed puppy growth, when to switch to adult dog food | I | Supports `/tools/puppy-weight-calculator/`. Breed-size table with sources. |
| `/guides/how-much-to-feed-a-puppy/` | Guide | `how much to feed a puppy` | puppy feeding schedule, puppy feeding chart, how many times a day to feed a puppy, how much should a puppy eat, puppy overfeeding | I | Owns the "how much" question for puppies; embeds/links the puppy food calculator. |
| `/guides/dog-years-myth/` | Guide | `dog years myth` | is one dog year seven human years, 7 dog years rule, why 7 to 1 is wrong, dog aging research, epigenetic clock dog age | I | Supports `/tools/dog-age-calculator/` and `/tools/cat-age-calculator/`. |
| `/guides/raw-feeding-basics/` | Guide | `raw feeding for dogs` | what is BARF diet, prey model raw, is raw feeding safe for dogs, raw dog food risks, raw vs kibble | I | Risk-forward, sourced (pathogens, nutritional balance). Supports the homemade calculator. |
| `/guides/cat-feeding-guide/` | Guide | `cat feeding guide` | wet vs dry cat food, how often to feed a cat, cat feeding schedule, cat weight and calories, free feeding vs scheduled feeding | I | Supports `/tools/cat-food-calculator/`. "How much to feed a cat" stays on the tool. |
| `/guides/chocolate-and-dogs-safety/` | Guide | `can dogs eat chocolate` | dog ate chocolate what to do, theobromine toxicity dogs, chocolate poisoning symptoms dogs, dark chocolate vs milk chocolate dogs, pet poison hotline | I/E | Supports `/tools/dog-chocolate-toxicity-calculator/`. Hotline numbers verified against official sources. |

### 1d. Trust and utility pages (no ranking target)

These pages exist for E-E-A-T and AdSense. They must not target commercial keywords. Their only keyword is the brand name.

| Route | Page type | Primary keyword | Secondary cluster | Intent | Notes |
|---|---|---|---|---|---|
| `/about/` | Trust | `petcalc tools` | who runs PetCalc, about PetCalc | N | Brand/entity page. Real people, mission, editorial standards. |
| `/methodology/` | Trust | `how petcalc calculators work` | pet calculator formulas, pet calculator sources, editorial policy | N | Formula index with sources. Link every tool's formula section here. |
| `/authors/` | Trust | `petcalc tools editorial team` | petcalc authors, petcalc veterinary reviewers | N | Byline/reviewer credits page; linked from every `Article` author. |
| `/contact/` | Trust | `none` | n/a | N | `mailto:` or form. No keyword target. |
| `/privacy/` | Trust | `none` | n/a | N | Must contain the AdSense/cookie/opt-out disclosures (`npm run audit:adsense`). |
| `/terms/` | Trust | `none` | n/a | N | Includes the veterinary disclaimer. |
| `/authors/` | Trust | `none` | n/a | N | Author and reviewer bios; no commercial keyword target. |

### 1e. Excluded from the index

| Route | Rule |
|---|---|
| `/embed/*` | Excluded from the sitemap; `noindex` or canonical to the parent tool. No ads, no keywords. |
| `/404.html` | `noindex`; no ads. |
| `/embed/dog-food-calculator/`, `/embed/puppy-weight-calculator/` | The only two embeds; canonical to the parent tool, `noindex, follow`. |

## 2. Planned articles (next 20, see the calendar in [SEO-GUIDE.md](./SEO-GUIDE.md#content-calendar-next-20-articles))

Each row reserves its keyword **now** so later work cannot cannibalize it. Do not create the page until the `keyword-research` skill has verified demand and the `vet-source-citation` skill has produced the source list.

| Route | Page type | Primary keyword | Secondary cluster | Intent | Notes |
|---|---|---|---|---|---|
| `/guides/how-to-switch-dog-food/` | Guide | `how to switch dog food` | transitioning dog food schedule, mixing old and new dog food, dog diarrhea after changing food | I | Gradual-transition schedule table. Seeds the backlog "dog food transition calculator" (ideas/README.md bonus table). |
| `/guides/dog-body-condition-score-chart/` | Guide | `dog body condition score chart` | BCS 1 to 9 dog, how to tell if a dog is overweight, dog ideal body shape, feel ribs test | I | Original diagrams only (no copied WSAVA images). Supports `/tools/dog-bmi-calculator/`. |
| `/guides/dog-calorie-formula-rer-mer/` | Guide | `dog calorie formula` | resting energy requirement dogs, RER formula dog, MER multipliers dogs, how many calories does a dog need | I | Worked examples at 5, 20, 40 kg. Supports `/tools/dog-food-calculator/`. |
| `/guides/help-dog-lose-weight/` | Guide | `how to help a dog lose weight` | dog weight loss plan, dog diet for weight loss, safe rate of weight loss dogs, dog weight loss treats | I | Non-medical, vet-supervised framing. Supports the BMI and food calculators. |
| `/guides/cat-life-stages/` | Guide | `cat life stages` | kitten to senior cat stages, cat age categories, when is a cat a senior, feline life stage guidelines | I | AAFP/AAHA life-stage definitions. Supports `/tools/cat-age-calculator/`. |
| `/guides/how-much-wet-food-to-feed-a-cat/` | Guide | `how much wet food to feed a cat` | wet food portions by cat weight, cans per day cat, mixed feeding wet and dry cat | I | Per-can kcal table. Distinct from the tool because it is about can sizes and mixed feeding. |
| `/guides/kitten-feeding-schedule/` | Guide | `kitten feeding schedule` | kitten feeding chart by age, how often to feed a kitten, how much to feed a kitten, kitten weaning | I | Supports `/tools/cat-food-calculator/` (kitten factor). |
| `/guides/how-long-are-dogs-pregnant/` | Guide | `how long are dogs pregnant` | dog gestation period, dog pregnancy stages week by week, dog pregnancy timeline, whelping signs | I | Supports `/tools/dog-pregnancy-calculator/`. Vet confirmation (ultrasound/X-ray) dates sourced. |
| `/guides/signs-of-pregnancy-in-dogs/` | Guide | `signs of pregnancy in dogs` | is my dog pregnant, early dog pregnancy symptoms, false pregnancy dogs, dog pregnancy test vet | I | Strictly "confirm with your vet". Do not cross-target the gestation article. |
| `/guides/feeding-a-pregnant-dog/` | Guide | `feeding a pregnant dog` | what to feed a pregnant dog, pregnant dog calories, lactating dog feeding, pregnant dog food switch to puppy food | I | Calorie multipliers sourced. Supports the dog food calculator. |
| `/guides/foods-toxic-to-dogs/` | Guide | `foods toxic to dogs` | what human foods can dogs not eat, dangerous foods for dogs list, poison hotline dog, dogs and onions garlic | I/E | Hub-style article linking to chocolate, grape and xylitol articles. Source: ASPCA APCC, Pet Poison Helpline. |
| `/guides/xylitol-poisoning-in-dogs/` | Guide | `xylitol poisoning in dogs` | dogs and xylitol, products containing xylitol, xylitol dog symptoms hypoglycemia, sugar free gum dogs | I/E | Emergency copy first. |
| `/guides/can-dogs-eat-grapes/` | Guide | `can dogs eat grapes` | grape and raisin toxicity dogs, dog ate raisins, grapes kidney failure dogs | I/E | Separate intent from chocolate. Do not add a thin calculator. |
| `/guides/how-much-water-should-a-puppy-drink/` | Guide | `how much water should a puppy drink` | puppy water intake, puppy water schedule, puppy water at night | I | Supports `/tools/dog-water-intake-calculator/`; the tool keeps the adult "dog" phrasing. |
| `/guides/dehydration-in-dogs/` | Guide | `dehydration in dogs` | signs of dehydration in dogs, skin tent test dog, dog not drinking water, dog water intake too high | I/E | Triage framing ("call your vet if..."). Cross-links the water calculator. |
| `/guides/how-long-do-dogs-live/` | Guide | `how long do dogs live` | dog lifespan by breed, average dog lifespan by size, oldest dog, small vs large dog lifespan | I | Supports `/tools/dog-age-calculator/`. Needs a dated source for every lifespan figure. |
| `/guides/when-is-a-dog-a-senior/` | Guide | `when is a dog considered senior` | senior dog age by breed size, senior dog care, senior dog feeding, geriatric dog age | I | Supports the age and food calculators. |
| `/guides/how-to-tell-a-cats-age/` | Guide | `how to tell a cat's age` | cat age by teeth, cat age by eyes, how old is a stray cat, kitten age by weight | I | Distinct from the calculator: this is physical-sign estimation. Do not target "how old is my cat". |
| `/guides/calcium-phosphorus-ratio-dog-food/` | Guide | `calcium to phosphorus ratio in dog food` | homemade dog food calcium, dog food recipe balance, AAFCO calcium phosphorus dog, raw diet calcium | I | Supports the homemade calculator; risk-forward. Source: AAFCO profiles, WSAVA. |
| `/guides/how-often-to-feed-a-dog/` | Guide | `how often to feed a dog` | how many times a day should a dog eat, dog feeding schedule, once or twice a day dog food, adult dog meal frequency | I | Meal frequency only. Amounts stay on the dog food calculator; puppies stay in `how-much-to-feed-a-puppy`. |

## 3. Backlog tools (reserved keywords, not yet built)

From the bonus table in [ideas/README.md](./ideas/README.md). Only build a page when it has unique formulas/content; otherwise skip it.

| Route (reserved) | Primary keyword | Secondary cluster | Dependency |
|---|---|---|---|
| `/tools/dog-food-transition-calculator/` | `dog food transition calculator` | dog food switch calculator, how to mix old and new dog food | Needs `/guides/how-to-switch-dog-food/` published first. |
| `/tools/raw-feeding-calculator/` | `raw feeding macro calculator` | prey model raw calculator, BARF percentages calculator | Must go deeper than `/tools/homemade-dog-food-calculator/` (macros, organ %, bone %) or not ship. |
| `/tools/pet-crate-size-calculator/` | `dog crate size calculator` | airline crate size dog, travel crate size by breed | Requires an original breed-dimension chart. |
| `/tools/litter-box-calculator/` | `how many litter boxes do I need` | litter box size for cat, litter box number per cat | Requires an original sizing table. |
| `/tools/aquarium-volume-calculator/` | `aquarium volume calculator` | fish tank gallons calculator | Spin out as a separate site per ideas/README.md. |

Reserved keywords in section 3 are **not** machine-checked against live pages until a route exists. Add a row to section 1 when the page ships and remove it here.

## 4. Not allowed (cannibalization and doorway traps)

- No page for each phrasing: "dog calorie calculator", "dog feeding calculator by weight", "how many cups should my dog eat" are all secondary keywords of `/tools/dog-food-calculator/`.
- No `puppy weight calculator <breed>` pages unless every page carries unique, sourced data (growth curve points, breed-specific notes, breed vet-health considerations) and a human reviewed it. The fan-out and scaled-content rules in SEO-PLAYBOOK sections 6 and 7 apply. Use the breed picker on the single tool page instead.
- No duplicated chocolate/xylitol/grape pages that differ only by food name. Merge into `foods-toxic-to-dogs` unless each has distinct symptoms, doses and sources.
- No second page for an existing primary keyword, even in a different folder (for example `/dogs/puppy-weight/` next to `/tools/puppy-weight-calculator/`). Hubs link, they do not duplicate.
- No translating or city/state variants of any page.

## 5. Known mismatches to fix when touched

| Where | Issue | Fix |
|---|---|---|
| `src/data/tools.ts` `puppy-food-calculator.keywords` | Contains `how much to feed a puppy`, which this map assigns to the guide. | Replace with `puppy feeding calculator`. |
| `src/data/guides.ts` titles | Titles are fine, but `description` fields are reused as meta descriptions. | Keep each description unique and <= 160 characters. |
| `public/_redirects`, `vercel.json` | Redirect `/tools/dog-years-calculator` and `/tools/puppy-growth-calculator` to the owning tools. | Keep: these are legacy-phrasing redirects, which is the correct way to handle a phrasing that is not its own page. |
