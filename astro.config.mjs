import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";

export default defineConfig({
  site: "https://aiexpertscorner.com",

  output: "static",

  integrations: [
    tailwind(),
    pagefind({
      // standaard instellingen zijn al goed
      // maar dit maakt search sneller en cleaner
      verbose: false
    })
  ]
});