import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { ExtendDocsSchema } from 'lucode-starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: ExtendDocsSchema }),
      extend: z.object({
        publish: z.boolean().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        era: z.union([z.string(), z.array(z.string())]).optional(),
        faction: z.union([z.string(), z.array(z.string())]).optional(),
      }),
    }),
  }),
};
