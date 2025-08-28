// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import solidJs from "@astrojs/solid-js";

import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.paulpietzko.com',
  integrations: [tailwind(), solidJs(), sitemap()],
  adapter: vercel(),
});