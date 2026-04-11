// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.paulpietzko.com",
  integrations: [solidJs(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel(),
});
