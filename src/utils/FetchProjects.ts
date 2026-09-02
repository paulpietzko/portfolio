import { sanityClient } from "./SanityClient";
import { IMAGE_PROJECTION, type SanityImage } from "./SanityImage";

export type Project = {
  _id: string;
  title: string;
  order: number;
  year: string | null;
  role: string | null;
  text: string;
  stack: string[] | null;
  link: string | null;
  image: SanityImage;
};

const PROJECTS_QUERY = `*[_type == "project" && defined(image.asset)] | order(order asc) {
  _id,
  title,
  order,
  year,
  role,
  text,
  stack,
  link,
  image ${IMAGE_PROJECTION}
}`;

const fetchProjects = async (): Promise<Project[]> => {
  const projects = await sanityClient.fetch<Project[]>(PROJECTS_QUERY);
  if (projects.length === 0) {
    console.warn("[sanity] no published projects — the deck will be empty");
  }
  return projects;
};

export default fetchProjects;
