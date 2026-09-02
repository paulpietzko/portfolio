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
- Frameworks: AstroJS, Tailwind, SolidJS, ChartJS
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