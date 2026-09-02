import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    excerpt: z.string(),
    author: z.string(),
    role: z.string(),
    date: z.date(),
    readTime: z.string(),
    category: z.enum(["Engineering", "Design", "Culture", "Career", "Other"]),
    image: z.url(),
    featured: z.boolean().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ base: "./src/content/events", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    excerpt: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    location: z.string(),
    venue: z.string().optional(),
    registrationUrl: z.url().optional(),
    category: z.enum(["Meetup", "Workshop", "Online", "Conference", "Other"]),
    image: z.url(),
    featured: z.boolean().optional(),
  }),
});

export const collections = { articles, events };
