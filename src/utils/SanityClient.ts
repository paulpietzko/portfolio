import { createClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "[sanity] missing PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET — " +
      "copy .env.example to .env locally, and set both on the Vercel project.",
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  // Pinned so a future API release can't quietly reshape query results.
  apiVersion: "2025-01-01",
  // Pages are prerendered, so this runs once per deploy rather than per
  // request. The CDN can lag a publish by a few seconds — precisely the window
  // a publish-triggered rebuild lands in — so go straight to the API.
  useCdn: false,
  perspective: "published",
});

const builder = createImageUrlBuilder(sanityClient);

/**
 * Sanity resizes and re-encodes on its own CDN, so images are requested at the
 * size they are displayed rather than being pulled through the Astro build.
 */
export const urlFor = (source: SanityImageSource) => builder.image(source);
