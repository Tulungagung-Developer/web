import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";

export default defineConfig({
  adapter: cloudflare({
    prerenderEnvironment: "node",
  }),
  integrations: [react(), mdx()],
  output: "static",
  fonts: [
    {
      provider: fontProviders.google(),
      name: "DM Sans",
      cssVariable: "--font-heading",
      weights: [400, 500, 600, 700],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-body",
      weights: [400, 500, 600, 700],
    },
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    ssr: {
      noExternal: ["@base-ui/react"],
    },
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      SPREADSHEET_ID: envField.string({
        access: "secret",
        context: "server",
      }),
      SPREADSHEET_RANGE: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      GOOGLE_SERVICE_ACCOUNT_JSON: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
    },
  },
});
