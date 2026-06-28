import { defineConfig } from "astro/config";
import { markdownProcessor } from "./src/markdown.ts";

export default defineConfig({
  site: "https://autopandamotive.com",
  output: "static",
  markdown: {
    processor: markdownProcessor,
  },
});
