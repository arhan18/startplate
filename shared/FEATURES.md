# Shared Library - Complete Features

## Overview

Production-ready shared component library with 100% Supastarter feature parity at $0 cost.

## Features

### Core (Previously Built)
- ✅ Type-safe API (Hono + Zod)
- ✅ Multi-tenancy schema
- ✅ Database helpers (Turso/SQLite)
- ✅ Blog system (MDX + Astro)
- ✅ Health endpoint
- ✅ Auth helpers (Better Auth)

### New Features (Just Built)

#### 1. Email Templates (`shared/email/`)
- Welcome email
- Password reset email
- Invoice email
- Notification email
- Trial ending email
- **Cost:** $0 (React Email MIT + Resend free tier 100/day)

#### 2. Notifications System (`shared/lib/notifications.ts`)
- In-app notifications
- CRUD operations
- Unread count
- Cleanup job
- **Cost:** $0 (Turso free tier)

#### 3. Contact Form (`shared/lib/contact.ts` + `src/pages/contact.astro`)
- Server-side validation (Zod)
- Honeypot anti-spam
- Resend delivery
- **Cost:** $0 (Resend free tier)

#### 4. File Storage (`shared/lib/r2.ts`)
- S3-compatible (works with R2, MinIO, S3)
- Presigned URLs
- File validation
- **Cost:** $0 (R2 free tier: 10GB)

#### 5. Analytics (`shared/lib/analytics.ts`)
- PostHog (1M events/month free)
- Umami (self-hosted, unlimited)
- Plausible (self-hosted, unlimited)
- **Cost:** $0

#### 6. Background Jobs (`shared/lib/jobs.ts`)
- Cloudflare Cron triggers
- Scheduled tasks
- **Cost:** $0 (100K invocations/day)

#### 7. Offline Development (`docker-compose.yml`)
- PostgreSQL 16
- MinIO (S3-compatible)
- Redis
- **Cost:** $0 (Docker)

#### 8. E2E Testing (`playwright.config.ts` + `tests/`)
- Cross-browser (Chrome, Firefox, Safari)
- Mobile viewports
- API testing
- **Cost:** $0 (Playwright open source)

#### 9. Admin Dashboard (`shared/components/admin/`)
- Dashboard layout
- Sidebar navigation
- Data table
- Stats cards
- **Cost:** $0

#### 10. Onboarding Flow (`shared/components/onboarding/`)
- Multi-step form
- Step indicator
- Progress tracking
- **Cost:** $0

#### 11. Notifications UI (`shared/components/notifications/`)
- Notification list
- Notification badge
- Mark as read
- **Cost:** $0

## Installation

```bash
# Copy shared folder to your project
cp -r /path/to/shared ./shared

# Install dependencies
npm install hono zod resend @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# For offline dev
docker compose up -d

# For E2E testing
npm install -D @playwright/test
npx playwright install
npx playwright test
```

## Environment Variables

```env
# Database
TURSO_DATABASE_URL=libsql://xxx.turso.io
TURSO_AUTH_TOKEN=xxx

# Auth
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=http://localhost:4321

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com
CONTACT_EMAIL=hello@yourdomain.com

# File Storage (R2)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx

# Analytics (PostHog)
PUBLIC_POSTHOG_KEY=phc_xxx
PUBLIC_POSTHOG_HOST=https://app.posthog.com

# DodoPayments
DODO_PAYMENTS_API_KEY=xxx
```

## Cost Summary

| Feature | Free Alternative | Cost |
|---------|-----------------|------|
| Mails | React Email + Resend | $0 |
| Background jobs | Cloudflare Cron | $0 |
| Analytics | PostHog/Umami/Plausible | $0 |
| File storage | Cloudflare R2 | $0 |
| Notifications | Turso | $0 |
| Onboarding | Build component | $0 |
| Contact form | Resend | $0 |
| Offline dev | Docker Compose | $0 |
| E2E testing | Playwright | $0 |
| Admin UI | Build component | $0 |
| **Total** | | **$0** |

## Usage with Products

Each product in `products/` can import from shared:

```typescript
import { createNotification } from '../shared/lib/notifications';
import { handleContactForm } from '../shared/lib/contact';
import { uploadFile } from '../shared/lib/r2';
```
