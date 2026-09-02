import { urlFor } from "./SanityClient";

export type SanityImage = {
  alt: string | null;
  asset: {
    url: string;
    metadata: {
      /** Base64 thumbnail, painted underneath the image until it decodes. */
      lqip: string | null;
      dimensions: { width: number; height: number };
    };
  };
};

/**
 * GROQ fragment for the shape above. Interpolate it after an image field:
 * `image ${IMAGE_PROJECTION}`.
 */
export const IMAGE_PROJECTION = `{
    alt,
    asset->{url, metadata{lqip, dimensions{width, height}}}
  }`;

/** One CDN URL at a given width. Sanity picks the format from Accept. */
export const imageSrc = (image: SanityImage, width: number) =>
  urlFor(image).width(width).quality(70).auto("format").url();

/** A `srcset` string covering the widths a component actually renders at. */
export const imageSrcSet = (image: SanityImage, widths: number[]) =>
  widths.map((width) => `${imageSrc(image, width)} ${width}w`).join(", ");

/**
 * Inline style painting the low-quality placeholder behind the image, so a
 * card carries its colours before the photo decodes.
 */
export const imagePlaceholder = (image: SanityImage) =>
  image.asset.metadata.lqip
    ? `background-image:url(${image.asset.metadata.lqip})`
    : undefined;
