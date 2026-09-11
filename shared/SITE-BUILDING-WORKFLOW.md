# Site Building Workflow — Master Reference

> Learned from award-winning sites (Awwwards, FWA), ui-ux-pro-max, 21st-ai, motion-dev-animations skills, real site analysis, and critical audit findings from arhanahmad.com (Sept 2026).

## The Workflow (MANDATORY for ALL sites)

### Phase 1: Research (BEFORE any code)
1. **Study the reference site pixel-by-pixel**
   - Screenshot every page section
   - Note: typography, colors, spacing, animations, interactions
   - Copy the BUSINESS MECHANISM (flow, not visual)
   - Understand the DATABASE structure (what data is stored, relationships)
2. **STUDY COMPETITOR DATA FLOW (MANDATORY)**
   For EACH competitor site, document:
   - What each button does (API call, redirect, modal, etc.)
   - Where data goes (database tables, API endpoints, webhooks)
   - Database schema (tables, columns, relationships, indexes)
   - API endpoints (request/response format, auth, validation)
   - Payment flow (checkout → webhook → delivery → email)
   - Redirect flows (success, cancel, error states)
   - Email triggers (what action sends what email)
   - Error handling (what happens when API fails, payment fails, etc.)
   Save ALL of this in plan.md before writing any code.
3. **Search Pinterest/GitHub for aesthetic inspiration**
   - Awwwards.com, FWA, Dribbble, darkmodedesign.com
   - Search: "glassmorphism dark mode", "award winning website [year]"
   - Save specific design patterns to copy
4. **Load skills and generate design system**
   - Use `ui-ux-pro-max` to generate design system (colors, fonts, patterns)
   - Use `21st-ai` to sketch UI variants
   - Use `motion-dev-animations` to plan animation strategy

### Phase 2: Architecture Audit (BEFORE any code)
5. **Inspect the existing codebase**
   - Search the ENTIRE repository for existing implementations of the same functionality
   - Reuse or refactor existing functionality rather than creating parallel implementations
   - Check: package.json, config files, existing components, API endpoints, database schemas
   - Identify: what already exists, what can be reused, what conflicts

### Phase 3: Plan (BEFORE any code)
6. **Create detailed page plan**
   - Each page: layout, sections, animations, interactions
   - Each button: what it does, where data goes, what happens next
   - Database schema: tables, columns, relationships
   - API endpoints: what they accept, what they return
   - Payment flow: complete user journey from landing to success
   - Each interaction needs a complete state model:
     - Default state
     - Hover/focus state
     - Loading state
     - Success state
     - Error state
     - Disabled state where appropriate
     - Empty state where appropriate
7. **Save plan to `products/[name]/plan.md`**
   - Include: design system, page-by-page breakdown, mechanism flow, database schema

### Phase 4: UX/UI Design (AFTER plan is approved)
8. **Generate design system first**
   ```bash
   python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <keywords>" --design-system -p "Project Name"
   ```
9. **Use 21st-ai to sketch key sections**
   ```bash
   21st generate "hero section for [product] with glassmorphism dark mode"
   ```
10. **Design quality gate — every page must be production-quality**
    - Layout: proper hierarchy, clear sections, intentional whitespace
    - Spacing: consistent 8px grid, no cramped or bloated sections
    - Typography: heading hierarchy, readable body text, proper line-height
    - Visual polish: consistent colors, proper contrast, clean edges
    - Content clarity: every word earns its place, no filler
    - Interaction quality: every clickable thing feels intentional
    - No "looks unfinished" — if it ships, it looks done

### Phase 5: Build (AFTER design is approved)
11. **Implement with proper animations**
    - Install motion: `npm install motion`
    - Use spring physics (stiffness: 300-400, damping: 20)
    - Staggered entrances (0.1-0.2s between items)
    - Scroll reveal with `whileInView`
    - Hover effects with `whileHover`
    - All animations GPU-accelerated (transform/opacity only)
    - Animation must SUPPORT the experience — never add animation just because the workflow says "Animate"
12. **Build the MECHANISM, not just the UI**
    - Database: Turso/SQLite with proper schema
    - APIs: Hono + Zod for type safety
    - Payments: DodoPayments with webhooks
    - Emails: Resend with verified domain
    - Auth: Better Auth if needed

### Phase 6: Integrate
13. **Wire everything together**
    - Connect frontend to API endpoints
    - Test each integration point individually
    - Verify data flows correctly through the chain

### Phase 7: Test (BEFORE hostile QA)
14. **Trace critical workflows end-to-end**
    - Do NOT verify only individual functions
    - Follow the complete journey:
      ```
      User → UI → validation → API → business logic → database → external service → response → UI → notification/email → final state
      ```
    - Test failure paths, not only happy paths:
      - Invalid input
      - API failure
      - Network failure
      - Duplicate submission
      - Refresh/reload
      - Timeout
      - Missing data
      - Unauthorized access
15. **Never claim functionality is working without verification**
    - "Code exists" is not evidence that a feature works
    - Run the relevant test/build/browser/API/database verification
    - Distinguish between:
      - VERIFIED WORKING
      - VERIFIED BROKEN
      - NOT TESTED
      - NOT IMPLEMENTED
      - CANNOT VERIFY
    - Never turn "not tested" into "working"

### Phase 8: Hostile QA (AFTER normal testing)
16. **Act as a hostile QA engineer — try to break everything**
    - Double-click submissions
    - Rapid repeated clicks
    - Invalid input (empty, extremely long, special characters)
    - Invalid IDs and missing data
    - Expired sessions and unauthorized access
    - Direct API calls bypassing UI
    - API failures and network failures
    - Refreshing during workflows
    - Browser back/forward navigation
    - Multiple tabs with same flow
    - Interrupted checkout/payment
    - Duplicate webhook events and webhook replay
    - Mobile viewport failures
    - Missing environment variables
    - Production build failures
    - Fix issues discovered, then repeat affected tests

### Phase 9: Visual QA
17. **Responsive design gate**
    - Test every page at mobile (375px), tablet (768px), and desktop (1440px)
    - Check for: overflow, clipping, broken navigation, inaccessible dialogs, unusable forms, overlapping elements, poor spacing
    - "Responsive" does NOT mean "has a media query"
18. **Accessibility gate**
    - Semantic HTML
    - Keyboard navigation (tab through all interactive elements)
    - Visible focus states
    - Labels on all form inputs
    - Alt text on all meaningful images
    - Sufficient contrast (4.5:1 minimum)
    - Accessible dialogs and modals
    - Screen-reader-friendly error messages
    - Reduced-motion consideration (`prefers-reduced-motion`)

### Phase 10: Security QA
19. **Security checklist**
    - Webhook signatures verified
    - CORS restricted to allowed origins
    - User input sanitized before HTML injection
    - No hardcoded secrets or API URLs
    - No placeholder IDs in production
    - Rate limiting on public endpoints
    - Authentication enforced on protected routes
    - No duplicate implementations of critical functionality

### Phase 11: Production Build
20. **Build and verify**
    - `npm run build` succeeds with no errors
    - No warnings about missing env vars
    - All pages generate correctly
    - No broken imports or missing dependencies
    - Unused dependencies removed

### Phase 12: Final Release Gate
21. **Before declaring complete, answer ALL of these:**
    - [ ] Does every important user journey actually work end-to-end?
    - [ ] Does every button/action have a real purpose and working behavior?
    - [ ] Are there any fake, mocked, placeholder, or unfinished production features?
    - [ ] Are all async actions protected against duplicate submission?
    - [ ] Are authentication and authorization enforced correctly?
    - [ ] Are webhook signatures verified?
    - [ ] Are public endpoints protected appropriately?
    - [ ] Are user inputs validated and safely handled?
    - [ ] Is there only one source of truth for critical data?
    - [ ] Are there duplicate implementations of important functionality?
    - [ ] Are all production IDs/configuration valid?
    - [ ] Does the site work on mobile, tablet, and desktop?
    - [ ] Is the UI visually consistent and polished?
    - [ ] Are loading, empty, success, and error states handled?
    - [ ] Is the product accessible?
    - [ ] Is the production build successful?
    - [ ] Do automated tests pass?
    - [ ] Have critical workflows been tested end-to-end?
    - [ ] Has hostile QA been performed?
    - [ ] Are there any known issues that would make the product unsafe, broken, or embarrassing to release?
    - **Do not declare READY if any critical or high-severity issue remains unresolved.**

---

## Product & Implementation Rules

### Rule: Never build before understanding the existing system
Before adding functionality, inspect the repository, architecture, existing components, APIs, database, configuration, and related implementations.

### Rule: Never duplicate existing functionality
Search the entire codebase before creating a new implementation. Reuse, consolidate, or refactor existing functionality where appropriate.

### Rule: No fake or partially functional production features
Do not use mock data, fake success states, placeholder API responses, temporary product IDs, or simulated functionality in production unless explicitly requested.

### Rule: Incomplete means incomplete
If a feature cannot be fully implemented, do not make it look finished. Clearly identify what is missing.

### Rule: Every interactive element needs a complete state model
Interactive actions must account for:
- Default state
- Hover/focus state
- Loading state
- Success state
- Error state
- Disabled state where appropriate
- Empty state where appropriate

### Rule: Animation must support the experience
Do not add animation simply because the workflow says "Animate." Animations must be purposeful, performant, consistent, and never interfere with usability.

### Rule: Responsive means genuinely usable
Test every page at mobile, tablet, and desktop widths. Check for overflow, clipping, broken navigation, unusable forms, overlapping elements, and poor spacing.

### Rule: Accessibility is part of functionality
Verify semantic HTML, keyboard navigation, focus states, labels, accessible errors, alt text, sufficient contrast, and appropriate reduced-motion behavior.

---

## Testing Rules

### Rule: Trace critical workflows end-to-end
Do not verify only individual functions. Follow the complete journey:
```
User → UI → validation → API → business logic → database → external service → response → UI → notification/email → final state
```

### Rule: Test failure paths, not only happy paths
Every critical workflow must be tested with invalid input, API failure, network failure, duplicate submission, refresh/reload, timeout, missing data, and unauthorized access where applicable.

### Rule: Never claim functionality is working without verification
"Code exists" is not evidence that a feature works. Run the relevant test/build/browser/API/database verification.

### Rule: Hostile QA is mandatory
After normal testing, actively try to break the product. Fix issues discovered and repeat affected tests.

---

## Design Styles — APPROVED ONLY (pick 1 or mix max 2)

| Style | Vibe | Best For | Key Elements |
|-------|------|----------|--------------|
| **Neoclassical** | Traditional, institutional | Heritage brands, luxury | Symmetry, columns, laurel motifs, marble textures, gold accents, muted palettes |
| **Aurora** | Dreamy, futuristic | AI tools, tech launches | Iridescent gradients, soft glows, translucent overlays, organic wave forms, northern lights |
| **Ethereal** | Weightless, transcendent | Wellness, spiritual, meditation | Pale pastels, gauzy overlays, low contrast, delicate serifs, feathered shadows |
| **Brutalism** | Raw, subversive | Artist portfolios, counterculture | Harsh edges, default buttons, monospaced type, broken conventions, no polish |
| **Pop Art** | Bold, playful | Creative, entertainment | Bold primary colors, comic-style, high contrast, halftone patterns |
| **Bento Box** | Editorial, modern | SaaS, landing pages, portfolios | Modular grid compartments, rounded blocks, labeled icons, micro-animations |
| **Tenebrism** | Cinematic, moody | Product photography, dramatic | Violent light/dark contrast, spotlit subjects on black void, Caravaggio-style |
| **Mixed Media** | Experimental, tactile | Magazines, art education | Photography + illustration + paper textures collaged together |
| **Glassmorphism** | Sleek, premium | Fintech, SaaS, dashboards | Frosted glass, background blur, semi-transparency, subtle neon tints, layered depth |

**NEVER use:** Neumorphism, Claymorphism, Y2K, Cyberpunk, Material Design, or any style not in this list.
**Mixing rule:** Max 2 styles per product. More than 2 = visual chaos.

## Design Principles (from research)

### Visual (from award-winning sites)
- **Dark mode**: True blacks (#08080d) + high contrast text
- **Typography**: Cormorant/Garamond for headings, Inter/Montserrat for body
- **Spacing**: 8px grid system, generous whitespace
- **Icons**: SVG only (Lucide, Heroicons), NEVER emojis
- **Colors**: 1-2 accent colors max, rest neutral

### Animation — MANDATORY on EVERY site
> **NEVER ship a static page. Every site MUST have motion.**

**Use `motion-dev-animations` skill (motion.dev JS) for implementation.**

#### Required Animation Categories (use at least 3 per product)
| Category | Pattern | motion.dev Example |
|----------|---------|-------------------|
| **Scroll Reveal** | Elements fade up on scroll | `scroll-triggered`, `scroll-fade` |
| **Stagger** | List items animate in sequence | `stagger`, `staggered-grid` |
| **Spring** | Physics-based natural motion | `spring`, `spring-follow-cursor` |
| **Hover** | Scale, glow, tilt on hover | `hover`, `tilt-card`, `gestures` |
| **Page Transition** | Smooth page-to-page flow | `page-wipe`, Curtains effects |
| **Loading** | Skeleton/spinner while loading | `loading-circle-spinner`, `loading-progress-bar` |
| **Text** | Typewriter, split, scramble | `typewriter`, `split-text`, `scramble-text` |
| **Layout** | Shared element transitions | `layout-animation`, `shared-layout-animation` |
| **Microinteraction** | Button press, toggle, ripple | `press`, `material-design-ripple`, `hold-to-confirm` |
| **Parallax** | Depth on scroll | `parallax` |

#### Inspiration Sources
- **svgator.com/blog/website-animation-examples-and-effects/** — 31 trending animation types
- **motion.dev/examples?platform=js** — 74+ production-ready JS snippets

#### Key Animation Types (from svgator research)
1. **Scrollytelling** — narrative-driven scroll experiences
2. **Expressive Typography** — kinetic type, glitch effects, animated lettering
3. **Ambient Background Motion** — subtle gradients, particles, liquid flows
4. **Self-Drawing** — stroke-path animations, sketch-like reveals
5. **Morphing** — shape-to-shape transitions, liquid effects
6. **Animated Icons** — hover/click triggered icon animations
7. **Microinteractions** — button feedback, toggle slides, form animations
8. **Faux 3D** — depth illusion with layering, perspective, shadows
9. **Liquid Motion** — smooth flowing movements, ripple effects
10. **Page Transitions** — fade, slide, wipe, iris effects

#### Animation Rules
- **Duration**: 150-300ms micro-interactions, ≤400ms complex, ≤600ms page transitions
- **Easing**: spring (stiffness: 300-400, damping: 20) or ease [0.22, 1, 0.36, 1]
- **Performance**: transform/opacity ONLY, will-change for complex
- **Reduced motion**: ALWAYS respect `prefers-reduced-motion`
- **GPU-accelerated**: Never animate width/height/top/left

### UX (from ui-ux-pro-max skill)
- **Touch targets**: ≥44×44px
- **Loading**: Skeleton screens for >1s operations
- **Forms**: Visible labels, error near field, auto-save drafts
- **Navigation**: Predictable back, deep linking, max 5 bottom nav items
- **Accessibility**: 4.5:1 contrast, alt text, keyboard nav, ARIA labels
- **Responsive**: Mobile-first, 375/768/1024/1440 breakpoints

## MANDATORY TESTING RULE

> **NEVER leave any button unused. ALWAYS double-check the WHOLE website.**

### What to Test (EVERY function)
- [ ] Every button click → correct action fires
- [ ] Every form submission → validates, saves, sends email
- [ ] Every payment flow → checkout → webhook → delivery → email
- [ ] Every API endpoint → returns correct JSON, handles errors
- [ ] Every redirect → goes to right page
- [ ] Every error state → user sees helpful message
- [ ] Every loading state → skeleton/spinner shows
- [ ] Every mobile touch target → ≥44×44px
- [ ] Every animation → respects prefers-reduced-motion
- [ ] Every database write → data persists correctly
- [ ] Every email trigger → email actually sends
- [ ] Every webhook → idempotent, handles duplicates

### Testing Tools (Install These)
| Tool | Purpose | Cost |
|------|---------|------|
| **Playwright** | E2E testing, cross-browser | Free |
| **Vitest** | Unit testing, API testing | Free |
| **axe-core** | Accessibility testing | Free |
| **Lighthouse** | Performance auditing | Free |

### Test Checklist Before Deploy
- [ ] `npm test` passes (Vitest)
- [ ] `npx playwright test` passes
- [ ] Manual walkthrough: every button, every flow
- [ ] Payment end-to-end (test mode)
- [ ] Mobile test (375px, 768px, 1024px)
- [ ] No console errors
- [ ] All API endpoints return JSON
- [ ] Email sends correctly
- [ ] Database writes correctly
- [ ] Build succeeds with no errors

## Anti-Patterns (NEVER do these)
- ❌ Emojis as icons (use SVG)
- ❌ Static pages without mechanism
- ❌ **Static pages without animation** (EVERY site needs motion)
- ❌ No loading states
- ❌ No error handling
- ❌ No mobile testing
- ❌ Hardcoded colors (use CSS variables/tokens)
- ❌ Animating width/height/top/left (use transform)
- ❌ No reduced-motion support
- ❌ Deploying without testing
- ❌ Building before planning
- ❌ Not studying competitor data flows
- ❌ Dead buttons (every button MUST work)
- ❌ Untested workflows (test EVERYTHING)
- ❌ Ignoring motion-dev-animations skill (USE IT)
- ❌ Fake/mock/placeholder functionality in production
- ❌ Duplicate implementations of same functionality
- ❌ Building without inspecting existing codebase
- ❌ Claiming "it works" without verification
- ❌ Testing only happy paths
- ❌ Skipping hostile QA
- ❌ Ignoring accessibility
- ❌ Hardcoded API URLs (use env vars)
- ❌ Unverified webhook signatures
- ❌ Uns sanitized user input in HTML

## Competitor Data Flow Template

Use this template to document how competitor sites work:

```markdown
## Competitor: [Site Name]
**URL:** [url]
**What it does:** [one line]

### Data Flow
1. **Landing page** → User sees product
2. **Click "Buy"** → Modal opens (client-side, no API call)
3. **Fill form** → Client-side validation
4. **Click "Pay"** → POST /api/checkout {product, email, name}
5. **API response** → Redirect to DodoPayments checkout
6. **User pays** → DodoPayments webhook → POST /api/webhook
7. **Webhook** → Write to DB (registrations table), send email
8. **Email** → Certificate with download link
9. **Success page** → Fetch from DB, show certificate

### Database Schema
- **registrations**: id, star_name, sender, recipient, email, message, created_at
- **payments**: id, registration_id, amount, status, dodo_payment_id

### API Endpoints
- POST /api/checkout → {checkoutUrl}
- POST /api/webhook → {received: true}
- GET /api/certificate?id=xxx → {html}

### Error States
- Payment failed → Show retry button
- Webhook duplicate → Ignore (idempotent)
- Email failed → Log error, don't block
```

## File Structure for Each Product
```
products/[name]/
├── plan.md              ← DETAILED plan (must read before building)
├── src/
│   ├── pages/           ← Astro pages
│   ├── layouts/         ← Reusable layouts
│   ├── components/      ← UI components
│   └── lib/             ← Utilities, DB helpers
├── functions/           ← Cloudflare Pages Functions (APIs)
├── public/              ← Static assets
├── migrations/          ← SQL schemas
└── package.json
```

## AI Execution Discipline (Rules 26-34)

> These rules make the difference between "it compiles" and "it's actually ready."

### Rule 26: Requirement Traceability
At the beginning of every project, extract ALL requirements into a checklist. Include:
- Product requirements, user-facing features, pages/screens, user journeys
- Design requirements, technical requirements, security requirements
- Performance requirements, accessibility requirements
- Integrations, business rules, constraints, existing project rules

Every requirement must have: **Requirement → Implementation → Test → Verification**

Before declaring the project complete, check every requirement individually. Never assume a requirement was satisfied because related work was completed.

### Rule 27: Complete Feature Inventory
Before implementation, create an inventory of:
- Pages, components, features, user roles, user journeys
- APIs, database operations, external services
- Emails/notifications, payments, background jobs
- Authentication, admin functionality

Compare this inventory against the actual codebase throughout the project. Do not allow an entire feature to be forgotten simply because it was not mentioned during implementation.

### Rule 28: Rendered UI Is the Source of Truth for UI Verification
For website functionality, source code and successful builds are NOT sufficient evidence.

Inspect the actual rendered application. Verify:
- Layout, typography, spacing, alignment, visual hierarchy
- Navigation, forms, buttons, modals
- Loading states, error states, empty states
- Animations, responsive behavior

Do not treat successful compilation, static analysis, or code inspection as proof that the UI works.

### Rule 29: Regression Testing Is Mandatory
A new feature must not be considered successful if it breaks an existing feature.

After significant changes:
1. Test the new functionality
2. Test related functionality
3. Test critical existing workflows
4. Test the complete critical workflow again before release

### Rule 30: Data Integrity
For every workflow that creates or modifies data, verify:
- Correct record creation and updates
- Correct relationships
- No duplicate records, no unintended overwrites, no orphaned data
- Correct transaction behavior
- Correct behavior after refresh, logout/login, retry, repeated requests

Check for: duplicate records, incorrect relationships, orphaned records, stale state, failed transactions, partial writes, duplicate submissions, idempotency, migration problems, inconsistent frontend/backend state.

### Rule 31: Production Observability
Critical failures must not disappear silently. Verify appropriate:
- Error handling, logging, error reporting
- Failed transaction visibility
- Webhook failure visibility
- External-service failure visibility

Never hide an error simply to make a workflow appear successful.

### Rule 32: Evidence-Based Completion
Every final status must be evidence-based. Use ONLY:
- **VERIFIED WORKING** — Evidence exists that functionality was tested successfully
- **VERIFIED BROKEN** — Testing demonstrated a failure
- **NOT TESTED** — Functionality exists but testing was not performed
- **NOT IMPLEMENTED** — Functionality does not exist
- **CANNOT VERIFY** — Verification requires something unavailable

NEVER convert: NOT TESTED → VERIFIED WORKING, CANNOT VERIFY → VERIFIED WORKING, Code exists → VERIFIED WORKING, Build succeeds → VERIFIED WORKING.

### Rule 33: Final Memory Check
Before completing the task, stop implementation and perform a full independent checklist review.

Ask: "What requirement, workflow, security control, UI state, edge case, integration, test, or release condition could I have forgotten?"

Review the repository and requirement checklist again specifically looking for omissions. Do not rely on memory.

### Rule 34: Release Means Release-Ready
"Build passes" does NOT mean "ready." "Tests pass" does NOT mean "ready." "Core workflow works" does NOT mean "ready."

The product is READY only when **Requirements + Functionality + UX + Visual Quality + Accessibility + Reliability + Security + Testing + Production Build + Regression Testing** have ALL passed their respective release gates.

---

## Visual QA Checklist
Inspect rendered UI for:
- [ ] Spacing consistency
- [ ] Typography hierarchy
- [ ] Alignment
- [ ] Component consistency
- [ ] Visual hierarchy
- [ ] Responsive layouts
- [ ] Mobile navigation
- [ ] Form usability
- [ ] Empty states
- [ ] Error states
- [ ] Image quality/cropping
- [ ] Button hierarchy
- [ ] Excessive whitespace
- [ ] Cramped layouts
- [ ] Inconsistent border/radius/shadows
- [ ] Animation quality
- [ ] Overall polish

## Skills Reference
- **ui-ux-pro-max**: Design system generation, UX rules, accessibility
- **21st-ai**: Quick UI sketching, variant generation
- **motion-dev-animations**: Animation patterns, spring physics, scroll effects
- **seo**: SEO optimization, schema markup
- **copywriting**: Marketing copy, conversion optimization

---

# MASTER RELEASE CHECKLIST

> Every item must be verified before release. Items that don't apply must be marked **N/A with justification**, not silently skipped. Every applicable item must ultimately be one of: **VERIFIED WORKING** / **BROKEN** / **NOT TESTED** / **NOT IMPLEMENTED** / **CANNOT VERIFY** / **N/A** (with justification).

---

## 1. Requirements, Scope & Traceability

- [ ] Every requirement extracted at project start
- [ ] Every requirement has explicit acceptance criterion
- [ ] Every requirement mapped: Requirement → Implementation → Test → Verification
- [ ] Security requirements documented
- [ ] Performance requirements documented
- [ ] Accessibility requirements documented
- [ ] Integration requirements documented
- [ ] Business rules documented
- [ ] Constraints documented
- [ ] Feature inventory created before building
- [ ] Feature inventory verified against codebase throughout project
- [ ] No requirement assumed satisfied because related work was completed
- [ ] Final requirement traceability review before release

## 2. Product & UX

- [ ] User journeys complete from entry to successful outcome
- [ ] Empty states handled
- [ ] Error states handled
- [ ] Offline/network-loss states handled (where relevant)
- [ ] Permission-denied states handled
- [ ] Unauthorized/expired-session states handled
- [ ] First-use/onboarding states handled
- [ ] Returning-user states handled
- [ ] Destructive-action confirmation implemented
- [ ] Undo/recovery where appropriate
- [ ] Unsaved-change handling
- [ ] Duplicate-submission prevention
- [ ] Back/forward navigation behavior correct
- [ ] Refresh/deep-link behavior correct
- [ ] Browser history/state preservation correct
- [ ] Search/filter/sort behavior correct
- [ ] Pagination/infinite-scroll behavior correct
- [ ] Large-data behavior correct
- [ ] Clear validation and actionable errors
- [ ] Consistent terminology and interaction patterns
- [ ] No misleading affordances

## 3. Visual QA

- [ ] Spacing consistent
- [ ] Typography hierarchy correct
- [ ] Visual hierarchy clear
- [ ] Alignment correct
- [ ] Component consistency maintained
- [ ] Responsive layouts tested at 375/768/1440px
- [ ] Mobile navigation functional
- [ ] Touch targets ≥44×44px
- [ ] Icons and imagery appropriate
- [ ] Form/layout consistency
- [ ] Loading/empty/error visual states present
- [ ] Modal/drawer/dropdown behavior correct
- [ ] Overflow and truncation handled
- [ ] Long text/localization resilience
- [ ] Dark/light themes correct (where supported)
- [ ] Cross-browser visual verification performed
- [ ] Real rendered UI verified (not just code inspection)
- [ ] Overall polish acceptable

## 4. Authentication, Authorization & Identity

- [ ] Authentication flows complete
- [ ] Authorization/role matrix enforced
- [ ] Object-level authorization enforced
- [ ] Session expiration handled
- [ ] Session revocation works
- [ ] Password/account recovery works
- [ ] MFA implemented (where required)
- [ ] Account deletion/deactivation works
- [ ] Enumeration protection in place
- [ ] Privilege-escalation tested
- [ ] Tenant/data isolation verified (multi-tenant systems)

## 5. Security & Privacy

- [ ] Input validation on all endpoints
- [ ] Output encoding correct
- [ ] Injection protection (SQL, NoSQL, command)
- [ ] CSRF protection (where applicable)
- [ ] XSS protection (stored, reflected, DOM-based)
- [ ] SSRF protection (where applicable)
- [ ] Secure file handling
- [ ] Secure headers/cookies
- [ ] Transport encryption (TLS)
- [ ] Sensitive data encrypted at rest (where required)
- [ ] Secrets never committed or exposed
- [ ] Least-privilege access enforced
- [ ] Dependency vulnerability review completed
- [ ] Supply-chain/package integrity review completed
- [ ] PII classification done
- [ ] PII minimization enforced
- [ ] Sensitive data redacted in logs/errors/analytics

## 6. Data & Database

- [ ] Schema correctness verified
- [ ] Foreign-key/referential integrity enforced
- [ ] Uniqueness constraints enforced
- [ ] Null/default semantics correct
- [ ] Transaction boundaries correct
- [ ] Atomicity of multi-step writes verified
- [ ] Idempotency ensured
- [ ] Concurrent-write handling tested
- [ ] Race-condition testing performed
- [ ] Migration testing completed
- [ ] Migration rollback strategy in place
- [ ] Backward compatibility during deployments verified
- [ ] Seed/test data isolated from production
- [ ] Backup verification completed
- [ ] Restore verification completed
- [ ] Data retention policy implemented
- [ ] Data deletion/erasure behavior verified
- [ ] Archival behavior verified
- [ ] Orphan cleanup implemented
- [ ] Stale-record cleanup implemented
- [ ] Index/query correctness verified
- [ ] N+1/query-performance checks completed
- [ ] Large-dataset testing performed
- [ ] Data reconciliation verified (external systems)

## 7. APIs & Backend

- [ ] API contract verification completed
- [ ] Request validation on all inputs
- [ ] Response validation on all outputs
- [ ] Correct HTTP/status semantics
- [ ] Authentication/authorization on every protected endpoint
- [ ] Timeout handling implemented
- [ ] Retry behavior implemented
- [ ] Exponential backoff where appropriate
- [ ] Idempotency keys where appropriate
- [ ] Pagination limits enforced
- [ ] Payload-size limits enforced
- [ ] Abuse/resource-exhaustion protection in place
- [ ] Versioning/backward compatibility maintained
- [ ] Contract tests passing
- [ ] Dependency failure handling implemented
- [ ] Graceful degradation working

## 8. Payments & Financial Operations

- [ ] Client-provided prices/amounts never trusted
- [ ] Server-side price verification enforced
- [ ] Currency correctness verified
- [ ] Tax/fee correctness verified (where applicable)
- [ ] Payment authorization handling correct
- [ ] Payment failure handling correct
- [ ] Refunds working
- [ ] Partial refunds working (where applicable)
- [ ] Cancellations working
- [ ] Duplicate-payment prevention enforced
- [ ] Payment/webhook idempotency ensured
- [ ] Webhook signature verification enforced
- [ ] Webhook replay protection in place
- [ ] Payment reconciliation working
- [ ] Failed-event recovery working
- [ ] Transaction/audit records created
- [ ] PCI/security requirements met (where applicable)

## 9. Integrations & Webhooks

- [ ] Third-party API failure handling implemented
- [ ] Timeout handling for external calls
- [ ] Rate-limit handling for external APIs
- [ ] Quota exhaustion handling
- [ ] Provider outage behavior defined
- [ ] Malformed third-party responses handled
- [ ] API-version changes accounted for
- [ ] Webhook authentication verified
- [ ] Duplicate webhook handling correct
- [ ] Out-of-order webhook handling correct
- [ ] Retry/dead-letter handling in place
- [ ] Replay/reconciliation capability verified
- [ ] External-system state reconciliation verified

## 10. Email, Notifications & Messaging

- [ ] Correct recipient selection
- [ ] Correct sender identity
- [ ] Template correctness verified
- [ ] Transactional vs marketing separation
- [ ] Unsubscribe handling (where required)
- [ ] Bounce handling implemented
- [ ] Complaint handling implemented
- [ ] SPF/DKIM/DMARC configured (where applicable)
- [ ] Duplicate notification prevention
- [ ] Notification retry behavior correct
- [ ] Notification preference enforcement
- [ ] Sensitive-information review completed
- [ ] Delivery observability in place

## 11. Files, Media & Storage

- [ ] Upload-size limits enforced
- [ ] File-type validation on uploads
- [ ] MIME/content validation on uploads
- [ ] Filename/path sanitization
- [ ] Malware/security scanning (where required)
- [ ] Authorization on downloads enforced
- [ ] Private/public storage correctness
- [ ] Signed URL expiration (where applicable)
- [ ] Upload failure recovery working
- [ ] Orphaned-object cleanup working
- [ ] Storage quota handling in place
- [ ] CDN/cache correctness verified

## 12. State, Concurrency & Reliability

- [ ] Explicit loading states implemented
- [ ] Explicit success states implemented
- [ ] Explicit failure states implemented
- [ ] Explicit empty states implemented
- [ ] Explicit partial-success states implemented
- [ ] Optimistic-update rollback working
- [ ] Retry-safe operations ensured
- [ ] Double-click protection in place
- [ ] Refresh-during-operation behavior correct
- [ ] Multi-tab behavior correct
- [ ] Concurrent-user behavior tested
- [ ] Race-condition handling verified
- [ ] Network interruption handling tested
- [ ] Browser crash/recovery behavior correct (where relevant)
- [ ] State synchronization correctness verified

## 13. Performance & Scalability

- [ ] Page-load performance acceptable
- [ ] API latency acceptable
- [ ] Database latency acceptable
- [ ] Bundle-size control enforced
- [ ] Image/media optimization completed
- [ ] Memory usage acceptable
- [ ] CPU usage acceptable
- [ ] Mobile/slow-network testing performed
- [ ] Large-data testing performed
- [ ] Concurrent-user/load testing performed
- [ ] Rate-limit/load-shedding behavior verified
- [ ] Caching correctness verified
- [ ] Cache invalidation working
- [ ] Background-job capacity sufficient
- [ ] Queue backpressure handled
- [ ] Autoscaling behavior verified (where applicable)

## 14. Testing

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] API/contract tests written and passing
- [ ] Database tests written and passing
- [ ] Component/UI tests written and passing
- [ ] End-to-end tests written and passing
- [ ] Accessibility tests written and passing
- [ ] Security tests written and passing
- [ ] Regression tests written and passing
- [ ] Failure-path tests written and passing
- [ ] Boundary-value tests written and passing
- [ ] Invalid-input tests written and passing
- [ ] Permission/role tests written and passing
- [ ] Concurrency tests written and passing
- [ ] Retry/idempotency tests written and passing
- [ ] Migration tests written and passing
- [ ] Cross-browser/device tests performed
- [ ] Production smoke tests performed
- [ ] Tests use realistic data and conditions
- [ ] Tests cannot pass merely because functionality is mocked
- [ ] Critical tests execute in CI/release validation

## 15. Observability & Operations

- [ ] Structured logging in place
- [ ] Error tracking configured
- [ ] Metrics collection configured
- [ ] Distributed tracing implemented (where appropriate)
- [ ] Health checks implemented
- [ ] Dependency health checks implemented
- [ ] Useful dashboards created
- [ ] Actionable alerts configured
- [ ] Alert routing has an owner
- [ ] No sensitive data in telemetry
- [ ] Correlation/request IDs in place
- [ ] Audit logging for security-sensitive actions
- [ ] Failed background jobs visible
- [ ] Queue failures visible
- [ ] Webhook failures visible
- [ ] Payment failures visible
- [ ] Alert delivery itself verified

## 16. Deployment & Infrastructure

- [ ] Environment configuration verified
- [ ] Environment variables verified
- [ ] Secrets/config separation enforced
- [ ] Staging/production parity checked
- [ ] Feature flags verified
- [ ] Domain/DNS configuration correct
- [ ] TLS/certificate validity verified
- [ ] CORS configuration correct
- [ ] CDN configuration correct
- [ ] Storage configuration correct
- [ ] Database connectivity verified
- [ ] External-service credentials working
- [ ] Deployment reproducibility verified
- [ ] CI/CD verification completed
- [ ] Zero/minimal-downtime strategy (where required)
- [ ] Rollback procedure documented
- [ ] Rollback actually tested
- [ ] Database/application compatibility during rollout verified
- [ ] Post-deployment smoke test performed
- [ ] Post-deployment monitoring period established

## 17. Disaster Recovery & Business Continuity

- [ ] Backup exists
- [ ] Backup is monitored
- [ ] Restore has been tested
- [ ] Recovery objectives defined (where required)
- [ ] Disaster-recovery procedure documented
- [ ] Critical dependencies identified
- [ ] Provider outage plan in place
- [ ] Data-corruption recovery plan in place
- [ ] Incident escalation path defined
- [ ] Recovery drill for critical systems performed

## 18. Compliance, Legal & Governance

- [ ] Privacy requirements reviewed
- [ ] Terms/legal requirements reviewed (where applicable)
- [ ] Consent requirements implemented
- [ ] Data-retention requirements implemented
- [ ] Data-deletion requirements implemented
- [ ] Regional requirements addressed
- [ ] Accessibility/legal requirements addressed (where applicable)
- [ ] Financial/industry regulations addressed (where applicable)
- [ ] Third-party license compliance verified
- [ ] Open-source license review completed
- [ ] Required audit trail in place
- [ ] Required records/export capability verified

## 19. Localization & Internationalization

- [ ] Timezone correctness verified
- [ ] Date/time formatting correct
- [ ] Currency formatting correct
- [ ] Number formatting correct
- [ ] Locale-specific validation correct
- [ ] DST behavior correct (where applicable)
- [ ] Translation completeness verified
- [ ] Text expansion/contraction handled
- [ ] RTL support implemented (where applicable)
- [ ] Unicode handling correct

## 20. Production Data & Analytics

- [ ] Analytics events are accurate
- [ ] No duplicate events
- [ ] No sensitive data leakage
- [ ] Funnel/event names consistent
- [ ] Business-critical metrics reconcile with source data
- [ ] Tracking failures are observable
- [ ] Analytics cannot break core functionality
- [ ] Data exports are correct
- [ ] Reporting handles timezone/filter boundaries

## 21. Final Hostile QA

- [ ] Every button tested
- [ ] Every link tested
- [ ] Every form tested
- [ ] Every navigation path tested
- [ ] Every permission boundary tested
- [ ] Invalid input tested
- [ ] Empty input tested
- [ ] Extreme input tested
- [ ] Refresh tested
- [ ] Back/forward tested
- [ ] Duplicate actions tested
- [ ] Network failure tested
- [ ] Server failure tested
- [ ] Third-party failure tested
- [ ] Expired sessions tested
- [ ] Concurrent actions tested
- [ ] Mobile tested
- [ ] Keyboard-only operation tested
- [ ] Accessibility semantics tested
- [ ] Large datasets tested
- [ ] Recovery after failure tested

## 22. Evidence & Release

- [ ] Every requirement has evidence
- [ ] Every test has a result
- [ ] Every failure has a documented status
- [ ] No "assumed working" functionality
- [ ] No unverified claims
- [ ] No hidden TODOs for required functionality
- [ ] No dead code affecting required functionality
- [ ] No unresolved critical security issues
- [ ] No unresolved critical data-integrity issues
- [ ] No unresolved critical payment issues
- [ ] No unresolved critical authorization issues
- [ ] No unresolved release-blocking regressions
- [ ] Final rendered UI inspected
- [ ] Final production/staging behavior inspected
- [ ] Final requirement traceability reviewed
- [ ] Final regression suite passed
- [ ] Final observability verified
- [ ] Final deployment/rollback path verified
- [ ] Final checklist reviewed
- [ ] Release decision explicitly recorded

---

## FINAL RULE: RELEASE = ALL APPLICABLE GATES PASSED

A gate that doesn't apply should be marked **N/A with justification**, not silently skipped.

Every applicable item must ultimately be one of:

| Status | Meaning |
|--------|---------|
| **VERIFIED WORKING** | Evidence exists that functionality was tested successfully |
| **BROKEN** | Testing demonstrated a failure |
| **NOT TESTED** | Functionality exists but testing was not performed |
| **NOT IMPLEMENTED** | Functionality does not exist |
| **CANNOT VERIFY** | Verification requires something unavailable |
| **N/A** | Demonstrably not applicable (with justification) |

**Never convert:**
- NOT TESTED → VERIFIED WORKING
- CANNOT VERIFY → VERIFIED WORKING
- Code exists → VERIFIED WORKING
- Build succeeds → VERIFIED WORKING
