import { sanityClient } from "./SanityClient";
import { IMAGE_PROJECTION, type SanityImage } from "./SanityImage";

export type Skill = {
  _id: string;
  name: string;
  order: number;
  description: string;
  link: string | null;
  /** Usually an SVG, which the CDN serves untransformed. */
  logo: SanityImage;
  /** CSS colour for the square the logo sits on. */
  tint: string;
};

const SKILLS_QUERY = `*[_type == "skill" && defined(logo.asset)] | order(order asc) {
  _id,
  name,
  order,
  description,
  link,
  tint,
  logo ${IMAGE_PROJECTION}
}`;

const fetchSkills = async (): Promise<Skill[]> => {
  const skills = await sanityClient.fetch<Skill[]>(SKILLS_QUERY);
  if (skills.length === 0) {
    console.warn("[sanity] no published skills — the grid will be empty");
  }
  return skills;
};

export default fetchSkills;
