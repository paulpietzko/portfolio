# Portfolio

## Table of Contents

1. [Description](#description)
2. [Team](#team)
3. [Technologies Used](#technologies-used)
4. [Hosting & Deployment](#hosting--deployment)
5. [Content](#content)
6. [Expenses & Budget](#expenses--budget)
7. [Installation & Setup](#installation--setup)
8. [License](#license)
9. [Contact](#contact)

## Description

The Portfolio website of Paul Pietzko. Using various APIs, Technologies and Frameworks.

## Team

- **[Paul Pietzko]** - Project Manager, Frontend Developer, Backend Developer
- (Add more as needed)

## Technologies Used

Used Technologies, Frameworks, and Tools used in the project:

### Dashboard
- [Git](https://github.com/paulpietzko/portfolio)
- Programming Languages: TypeScript
- Frameworks: AstroJS, Tailwind
- Database: -
- APIs: GitHub REST and GraphQL, Medium, Sanity Content Lake
- CMS: Sanity Studio (`../portfolio-studio`)

## Hosting & Deployment

- **Hosting Provider**: Vercel
- **Domain Name**: paulpietzko.com
- **Deployment Process**: CI/CD pipelines on main branch

## Content

The four data-driven sections of the home page live in Sanity, so they can be
edited without a code change:

| Section  | Type            | Schema                                    | Query                        |
| -------- | --------------- | ----------------------------------------- | ---------------------------- |
| Projects | `project`       | `portfolio-studio/schemaTypes/project.ts` | `src/utils/FetchProjects.ts` |
| Skills   | `skill`         | `portfolio-studio/schemaTypes/skill.ts`   | `src/utils/FetchSkills.ts`   |
| Timeline | `timelineEntry` | `portfolio-studio/schemaTypes/timelineEntry.ts` | `src/utils/FetchTimeline.ts` |
| Events   | `event`         | `portfolio-studio/schemaTypes/event.ts`   | `src/utils/FetchEvents.ts`   |

- **Studio**: `../portfolio-studio` (standalone, run it with `npm run dev` from there)
- **Project**: Portfolio (`jzcwxf3j`), dataset `production`
- **Images**: served and resized by Sanity's CDN — see `src/utils/SanityImage.ts`

Everything else — the hero, the section headings, the socials and legal pages, and
the colophon on `/references` — is still authored in the components, because it
changes when the code does.

The pages are prerendered, so publishing in the Studio does not change the live site
on its own — the site has to be rebuilt. Add a Sanity webhook pointing at a Vercel
deploy hook if that should happen automatically.

### The atlas

`src/data/visited.ts` is the list of countries the map lights up — ISO 3166-1
alpha-2 codes, plus `XK`/`XN`/`XS` for Kosovo, Northern Cyprus and Somaliland,
which the map carries and ISO does not.

The fastest way to edit it is the map itself: load the page with `?edit` on the
URL and the section turns into its own editor. Click countries to toggle them,
watch the counters follow, then hit **Copy list** and paste the result over
`VISITED`. Picks are held in `localStorage` while you work, so a reload doesn't
lose them, and `?edit` changes nothing for anyone else — it is a client-side
flag, not a mode the site ships in.

The geometry in `src/data/world-map.ts` is generated, not hand-written: Natural
Earth 1:50m, reprojected to Equal Earth and simplified per shared arc so
neighbouring borders stay identical. Regenerate it only to retune the
projection or the simplification:

```sh
npm i --no-save world-atlas@2 i18n-iso-countries
node scripts/gen-map.mjs src/data/world-map.ts
```

Equal Earth is an equal-area projection, which is what makes the "% of the
world's land" figure on the section a real measurement rather than a guess.
Antarctica is left out; the 242 entities on the map include territories, so the
"still to go" count is against that, not against the 195 UN member states.

### Credits

`src/data/credits.ts` drives the uni section: the degree, the date it started,
and two numbers — `EARNED` (credits on the transcript) and `IN_PROGRESS`
(credits booked for the current semester, drawn as pending rather than earned).
Update them after each exam session and redeploy.

The semester track and the "semester N · day N" line are worked out in the
browser from the start date, so they stay correct between deploys; the credit
numbers only change when the file does.

## Expenses & Budget

Associated costs for running the project:

- **Domain**: $20 per year per domain
- **Hosting**: -
- **APIs & Services**: -
- **Other Costs**: -

## Installation & Setup

Provide steps for setting up the project locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/paulpietzko/portfolio.git
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` from the template and fill in the GitHub token:
   ```sh
   cp .env.example .env
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

## License
This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this project under the terms of the license.

## Contact

Provide contact details for support or inquiries:

- Email: [paul.pietzko@icloud.com](mailto:paul.pietzko@icloud.com)
- Twitter: @paulpietzko