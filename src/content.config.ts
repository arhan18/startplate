import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Manual registration: auto-injection doesn't fire on this Astro minor.
// Slugs come from src/content/docs/**/*.mdx (no index.mdx — / stays marketing).
// ponytail: generateId strips the extension (this glob default keeps it,
// which breaks Starlight sidebar slug lookup). Revisit on Starlight upgrade.
export const collections = {
  docs: defineCollection({
    loader: docsLoader({ generateId: ({ entry }) => entry.replace(/\.[^.]+$/, '') }),
    schema: docsSchema(),
  }),
};
