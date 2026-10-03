import { sanityClient } from "./SanityClient";
import { IMAGE_PROJECTION, type SanityImage } from "./SanityImage";

export type EventEntry = {
  _id: string;
  name: string;
  date: string;
  endDate: string | null;
  link: string | null;
  description: string | null;
  image: SanityImage;
  hoverImage: SanityImage | null;
};

// Required fields keep an image on every published event, but a document can
// still be mid-edit — dropping those is cheaper than guarding every read.
const EVENTS_QUERY = `*[_type == "event" && defined(image.asset)] | order(date desc) {
  _id,
  name,
  date,
  endDate,
  link,
  description,
  image ${IMAGE_PROJECTION},
  hoverImage ${IMAGE_PROJECTION}
}`;

/**
 * Unlike the GitHub and Medium widgets there is no local copy to fall back on,
 * so a failed fetch is left to fail the build: Vercel then keeps the previous
 * deploy live instead of publishing an empty gallery.
 */
const fetchEvents = async (): Promise<EventEntry[]> => {
  const events = await sanityClient.fetch<EventEntry[]>(EVENTS_QUERY);
  if (events.length === 0) {
    console.warn("[sanity] no published events — the gallery will be empty");
  }
  return events;
};

export default fetchEvents;
