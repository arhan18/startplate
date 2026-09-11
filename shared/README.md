# Shared Component Library

Reusable components, utilities, and patterns for all Arhan Ahmad web products.

## Structure

```
shared/
├── components/
│   ├── auth/           # Authentication components
│   │   ├── SignIn.astro
│   │   ├── SignUp.astro
│   │   └── UserMenu.astro
│   ├── payment/        # Payment components
│   │   ├── PayButton.astro
│   │   └── SubscriptionButton.astro
│   ├── admin/          # Admin dashboard components
│   │   ├── Sidebar.astro
│   │   ├── StatsCard.astro
│   │   ├── DataTable.astro
│   │   └── DashboardLayout.astro
│   ├── onboarding/     # Onboarding flow components
│   │   ├── StepIndicator.astro
│   │   └── OnboardingForm.astro
│   ├── ui/             # UI components
│   │   ├── Toast.astro
│   │   └── Modal.astro
│   └── seo/            # SEO components
│       ├── SEOHead.astro
│       └── JsonLd.astro
├── layouts/
│   └── ProductLayout.astro
├── lib/                # Utility libraries
│   ├── auth.ts         # Better Auth configuration
│   ├── jobs.ts         # Background job utilities
│   └── monitoring.ts   # Sentry/GlitchTip integration
├── pages/              # API endpoints
│   └── api/
│       ├── auth/
│       │   ├── sign-in.ts
│       │   ├── sign-up.ts
│       │   ├── sign-out.ts
│       │   └── session.ts
│       └── webhook.ts  # DodoPayments webhook
└── styles/
    └── shared.css      # Shared design tokens
```

## Usage

### 1. Copy to Your Product

```bash
# Copy the shared directory to your product
cp -r ~/Documents/arhan-hub/shared ~/Documents/arhan-hub/products/your-product/src/shared
```

### 2. Update Import Paths

In your Astro components, update the import paths:

```astro
---
// Before
import BaseLayout from '../layouts/BaseLayout.astro';

// After
import ProductLayout from '../shared/layouts/ProductLayout.astro';
---
```

### 3. Import Shared CSS

In your global CSS file:

```css
@import '../shared/styles/shared.css';
```

### 4. Use Components

```astro
---
import PayButton from '../shared/components/payment/PayButton.astro';
import SignIn from '../shared/components/auth/SignIn.astro';
import Toast from '../shared/components/ui/Toast.astro';
---

<PayButton 
  productId="prod_xxx" 
  productName="My Product" 
  price={9.99} 
/>

<SignIn />

<Toast />
```

## Features

### Auth (Better Auth)
- Email/password authentication
- OAuth (Google, GitHub)
- Session management
- Protected routes

### Payments (DodoPayments)
- One-time payments
- Subscriptions
- Webhook handling
- Checkout integration

### Admin Dashboard
- Sidebar navigation
- Stats cards
- Data tables
- Dashboard layout

### Onboarding
- Step indicator
- Multi-step forms
- Progress tracking

### UI Components
- Toast notifications
- Modals
- Buttons, inputs, cards
- Badges

### SEO
- Meta tags (Open Graph, Twitter)
- JSON-LD structured data
- Canonical URLs

### Background Jobs
- Cloudflare Workers Cron Triggers
- Scheduled tasks
- Job configuration

### Monitoring
- Sentry/GlitchTip integration
- Error capture
- Breadcrumbs

## Environment Variables

```env
# Auth
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Payments
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

## Design System

All components use the shared CSS tokens from `shared.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 4%;
  --muted: 0 0% 96%;
  --border: 0 0% 89.8%;
  --primary: 0 0% 9%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

## Adding New Products

1. Create a new directory in `products/`
2. Copy the shared library
3. Update import paths
4. Add product-specific components
5. Configure environment variables
6. Deploy to Cloudflare Pages
