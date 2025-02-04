// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import solidJs from '@astrojs/solid-js';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), solidJs()],
  adapter: vercel(),
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
    routing: {
        prefixDefaultLocale: true
    }
  }
});