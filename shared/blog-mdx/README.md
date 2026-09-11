# MDX Blog Setup — Replace JSON Blog

## 1. Install
```bash
npm install @astrojs/mdx
```

## 2. Add to astro.config.mjs
```js
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    sitemap(),
    mdx(),
  ],
});
```

## 3. Create Content Collection
Create `src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().default('Arhan Ahmad'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

## 4. Create Blog Posts
Create `src/content/blog/` directory:
```
src/content/blog/
├── first-post.mdx
├── second-post.mdx
└── ...
```

## 5. Example MDX Post
```mdx
---
title: "How I Built 24 Products in 30 Days"
description: "My journey building a portfolio of small web products"
date: 2026-09-01
author: "Arhan Ahmad"
tags: ["indie-hacking", "saas", "portfolio"]
image: "/images/blog/building-products.jpg"
---

## Introduction

Building products as an indie hacker is both exciting and challenging.

## The Stack

I used Astro 7 + Tailwind CSS 4 + Cloudflare Pages.

## Results

- 24 products planned
- $0 hosting cost
- 85% feature parity with Supastarter

## Conclusion

The key is starting small and iterating fast.
```

## 6. Blog Listing Page
Create `src/pages/blog/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = await getCollection('blog', ({ data }) => !data.draft);
const sortedPosts = posts.sort((a, b) => 
  b.data.date.valueOf() - a.data.date.valueOf()
);
---

<BaseLayout title="Blog">
  <h1>Blog</h1>
  <div class="blog-grid">
    {sortedPosts.map(post => (
      <article class="blog-card">
        <a href={`/blog/${post.id}`}>
          {post.data.image && (
            <img src={post.data.image} alt={post.data.title} />
          )}
          <h2>{post.data.title}</h2>
          <p>{post.data.description}</p>
          <time>{post.data.date.toLocaleDateString()}</time>
          <div class="tags">
            {post.data.tags.map(tag => (
              <span class="tag">{tag}</span>
            ))}
          </div>
        </a>
      </article>
    ))}
  </div>
</BaseLayout>
```

## 7. Blog Post Page
Create `src/pages/blog/[...slug].astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BaseLayout title={post.data.title}>
  <article>
    <h1>{post.data.title}</h1>
    <time>{post.data.date.toLocaleDateString()}</time>
    <div class="tags">
      {post.data.tags.map(tag => (
        <span class="tag">{tag}</span>
      ))}
    </div>
    <div class="content">
      <Content />
    </div>
  </article>
</BaseLayout>
```

## Benefits Over JSON Blog
- Rich content (MDX supports components, code blocks, images)
- Better SEO (proper heading hierarchy, frontmatter)
- Easier to write (Markdown syntax)
- Content collections (type-safe, validated)
- Draft support
- Image optimization
