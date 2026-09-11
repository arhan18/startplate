import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    starlight({
      title: 'Startplate Docs',
      sidebar: [
        { label: 'Get Startplate ↗', link: 'https://startplate.dev/' },
        { label: 'Quickstart', slug: 'quickstart' },
        {
          label: 'Guides',
          items: [
            { label: 'Deployment', slug: 'guides/deployment' },
            { label: 'Payments', slug: 'guides/payments' },
            { label: 'Emails', slug: 'guides/emails' },
            { label: 'Database', slug: 'guides/database' },
            { label: 'Authentication', slug: 'guides/auth' },
            { label: 'Themes', slug: 'guides/themes' },
            { label: 'License & updates', slug: 'guides/updates-license' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Environment variables', slug: 'reference/env-vars' },
            { label: 'FAQ & troubleshooting', slug: 'faq' },
          ],
        },
      ],
    }),
    mdx(),
    sitemap(),
  ],
  site: 'https://yourdomain.com',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@shared': new URL('./shared', import.meta.url).pathname,
      },
    },
  },
});
