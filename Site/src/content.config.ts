import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { changelogsLoader } from 'starlight-changelogs/loader';
import { pageSiteGraphSchema } from 'starlight-site-graph/schema';
import { starlightTagsExtension } from 'starlight-tags/schema';

const stringOrStrings = z.union([z.string(), z.array(z.string())]);
const looseRecord = z.record(z.unknown());
const frontmatterDate = z.coerce.date();
const calendarDateSchema = z.object({
  calendar: z.string(),
  year: z.number().int(),
  month: z.string().optional(),
  day: z.number().int().optional(),
  intercalaryDay: z.string().optional(),
  precision: z.enum(['day', 'month', 'year']).optional(),
  displayCalendars: z.array(z.string()).optional(),
});
const calendarEventLinkSchema = z.union([
  z.string(),
  z.object({
    href: z.string().optional(),
    article: z.string().optional(),
    label: z.string().optional(),
  }),
]);
const calendarEventLinksSchema = z.record(calendarEventLinkSchema);
const calendarShowcaseSchema = z.object({
  calendar: z.string(),
  year: z.number().int().optional(),
  eventLinks: calendarEventLinksSchema.optional(),
  observanceLinks: calendarEventLinksSchema.optional(),
  links: calendarEventLinksSchema.optional(),
});

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
        calendarDate: calendarDateSchema.optional(),
        calendarShowcase: calendarShowcaseSchema.optional(),
        calendarBlocks: z.record(calendarShowcaseSchema).optional(),
        date: frontmatterDate.optional(),
        published: frontmatterDate.optional(),
        updated: frontmatterDate.optional(),
        era: stringOrStrings.optional(),
        faction: stringOrStrings.optional(),
        character: stringOrStrings.optional(),
        location: stringOrStrings.optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        headerImage: z.string().optional(),
        imagePage: z.string().optional(),
        imageTitle: z.string().optional(),
        asset: z.string().optional(),
        alt: z.string().optional(),
        credit: z.string().optional(),
        artist: z.string().optional(),
        editor: z.string().optional(),
        source: z.string().optional(),
        sourceUrl: z.string().optional(),
        license: z.string().optional(),
        rights: z.string().optional(),
        usage: z.string().optional(),
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
  changelogs: defineCollection({
    loader: changelogsLoader([
      {
        provider: 'keep-a-changelog',
        base: 'changelog',
        title: 'VISCERIUM Codex',
        changelog: './CHANGELOG.md',
        pageSize: 10,
      },
    ]),
  }),
};