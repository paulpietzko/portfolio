/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
			colors: {
				dark: {
					100: "#0a0a0a",
					200: "#1A1A1A",
					300: "#262626",
					400: "#404040",
					700: "#4D4D4D",
				},
			},
		},
  },
  safelist: [
    'bg-[rgba(221,27,36,0.2)]',
    'bg-[rgba(255,255,255,0.1)]',
    'bg-[rgba(139,195,74,0.2)]',
    'bg-[rgba(10,207,131,0.2)]',
    'bg-[rgba(49,120,198,0.2)]',
    'bg-[rgba(97,218,251,0.2)]',
    'bg-[rgba(14,165,233,0.2)]',
    'bg-[rgba(241,80,47,0.2)]',
    'bg-[rgba(255,105,180,0.2)]',
  ],
  plugins: [],
};
