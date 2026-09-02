import { sanityClient } from "./SanityClient";

export type TimelineEntry = {
  _id: string;
  /** ISO date; the year label and the "August 2021" line both come from it. */
  date: string;
  title: string;
  org: string | null;
  description: string;
  tags: string[] | null;
  accent: string;
};

const TIMELINE_QUERY = `*[_type == "timelineEntry"] | order(date asc) {
  _id,
  date,
  title,
  org,
  description,
  tags,
  accent
}`;

const fetchTimeline = async (): Promise<TimelineEntry[]> => {
  const entries = await sanityClient.fetch<TimelineEntry[]>(TIMELINE_QUERY);
  if (entries.length === 0) {
    console.warn("[sanity] no published timeline entries — the rail will be empty");
  }
  return entries;
};

export default fetchTimeline;
