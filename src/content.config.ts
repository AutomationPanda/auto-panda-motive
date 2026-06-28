import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const cars = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cars" }),
  schema: z.object({
    name: z.string(),
    year: z.number(),
    make: z.string(),
    model: z.string(),
    section: z.enum(["garage", "memory-lane"]),
    hook: z.string(),
    heroImage: z.string(),
    gallery: z.array(z.string()).default([]),
    qrSlug: z.string(),
    sortOrder: z.number(),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/stories" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    images: z.array(z.string()).default([]),
  }),
});

export const collections = { cars, stories };
