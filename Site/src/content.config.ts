import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { pageSiteGraphSchema } from 'starlight-site-graph/schema';
import { starlightTagsExtension } from 'starlight-tags/schema';

const stringOrStrings = z.union([z.string(), z.array(z.string())]);
const looseRecord = z.record(z.unknown());

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: pageSiteGraphSchema.merge(starlightTagsExtension).extend({
        publish: z.boolean().optional(),
        status: z.string().optional(),
        slug: z.string().optional(),
        sourcePath: z.string().optional(),
        type: z.string().optional(),
        era: stringOrStrings.optional(),
        faction: stringOrStrings.optional(),
        character: stringOrStrings.optional(),
        location: stringOrStrings.optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        headerImage: z.string().optional(),
        asset: z.string().optional(),
        alt: z.string().optional(),
        credit: z.string().optional(),
        license: z.string().optional(),
        mapId: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        map: looseRecord.optional(),
        timeline: looseRecord.optional(),
        relationships: looseRecord.optional(),
        related: z.array(z.string()).optional(),
      }),
    }),
  }),
};
