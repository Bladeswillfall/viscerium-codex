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
const optionalString = z.string().nullable().optional();
const optionalNumber = z.number().nullable().optional();
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
        status: optionalString,
        slug: optionalString,
        sourcePath: optionalString,
        type: optionalString,
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
        species: stringOrStrings.optional(),
        occupation: stringOrStrings.optional(),
        alignment: stringOrStrings.optional(),
        capital: stringOrStrings.optional(),
        territory: stringOrStrings.optional(),
        tags: z.array(z.string()).optional(),
        aliases: z.array(z.string()).optional(),
        image: optionalString,
        headerImage: optionalString,
        imagePage: optionalString,
        imageTitle: optionalString,
        asset: optionalString,
        alt: optionalString,
        credit: optionalString,
        artist: optionalString,
        editor: optionalString,
        source: optionalString,
        sourceUrl: optionalString,
        license: optionalString,
        rights: optionalString,
        usage: optionalString,
        mapId: optionalString,
        width: optionalNumber,
        height: optionalNumber,
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