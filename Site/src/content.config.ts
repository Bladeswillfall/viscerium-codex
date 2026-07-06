import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const stringOrStrings = z.union([z.string(), z.array(z.string())]);

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        publish: z.boolean().optional(),
        status: z.string().optional(),
        slug: z.string().optional(),
        type: z.string().optional(),
        era: stringOrStrings.optional(),
        faction: stringOrStrings.optional(),
        character: stringOrStrings.optional(),
        location: stringOrStrings.optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        asset: z.string().optional(),
        alt: z.string().optional(),
        credit: z.string().optional(),
        license: z.string().optional(),
        mapId: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        map: z.record(z.any()).optional(),
        timeline: z.record(z.any()).optional(),
        relationships: z.record(z.any()).optional(),
        related: z.array(z.string()).optional(),
      }),
    }),
  }),
};
