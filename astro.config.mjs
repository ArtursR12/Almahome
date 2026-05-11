// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://almahome.lv',
  output: 'server',
  adapter: vercel(),
  i18n: {
    defaultLocale: 'lv',
    locales: ['lv', 'ru', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Astro's i18n serves the LV default locale at /, not /lv/. Bank-partner
  // deep links (Luminor, Bigbank) point at /lv/... — without these redirects
  // every such URL 404s.
  redirects: {
    '/lv': '/',
    '/lv/': '/',
    '/lv/[...path]': '/[...path]',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [svelte()],
});
