# Skill: SEO Audit

**Trigger:** "SEO audit" or "Check my rankings" or "Why isn't my page ranking" or "Site health check"

## Description

Systematic SEO audit producing a 0–100 health score + prioritized action plan (Critical → High → Medium → Low). Run on every product before launch and quarterly after.

## Steps

1. **Technical (22%)** — robots.txt valid, sitemap.xml submitted, canonicals self-referencing, HTTPS, security headers, noindex on transactional pages (claim/success/checkout), 404s fixed, redirects ≤3 hops
2. **Content (23%)** — every money page has one H1, unique titles (<60 chars) + descriptions (<155), no thin pages (<300 words without purpose), E-E-A-T signals (author, dates, testimonials), internal links to pricing from every page
3. **On-Page (20%)** — heading hierarchy unbroken, images have alt text, OG tags + 1200×630 image per page, favicon present
4. **Schema (10%)** — JSON-LD valid (WebPage + Breadcrumb minimum; Product/Offer on pricing; FAQ where real FAQs exist). Validate, don't guess
5. **Performance (10%)** — LCP <2.5s, INP <200ms, CLS <0.1 on mobile. Images WebP/AVIF + sized, no render-blocking third-party above the fold
6. **AI Search Readiness (10%)** — clean semantic HTML, facts in plain sentences (citable by LLMs), llms.txt present
7. **Images (5%)** — compressed, responsive sizes, lazy-loaded below fold
8. **Score + report** — weight above into 0–100, list top 5 critical issues + top 5 quick wins with file-level fixes

## Rules

- Evidence before claims: fetch the page, don't audit from memory
- One finding = title + severity + evidence + exact fix (file + change)
- Re-run after fixes and diff the score — audits without follow-up are theater
- Track the score per product in one place; declining scores page the owner
