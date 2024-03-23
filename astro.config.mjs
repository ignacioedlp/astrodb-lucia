import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel/serverless";
import db from "@astrojs/db";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imagesConfig: {
      sizes: [320, 640, 1280],
    },
  }),
  integrations: [db(), tailwind({ applyBaseStyles: false })]
});