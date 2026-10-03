// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

// Legal pages rarely change and carry little search value, so they're kept
// in the sitemap but ranked below the actual content.
const LEGAL_PAGES = ["/privacy/", "/terms/", "/imprint/", "/cookies/"];

export default defineConfig({
  site: "https://www.paulpietzko.com",
  integrations: [
    sitemap({
      // Every page is prerendered, so the build date is when content (Sanity
      // included) was last pulled in.
      lastmod: new Date(),
      // No i18n, news, images or video entries — keep the XML lean.
      namespaces: { news: false, xhtml: false, image: false, video: false },
      serialize(item) {
        const { pathname } = new URL(item.url);

        if (pathname === "/") {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 1.0;
        } else if (LEGAL_PAGES.includes(pathname)) {
          item.changefreq = ChangeFreqEnum.YEARLY;
          item.priority = 0.3;
        } else {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.7;
        }

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel(),
});
