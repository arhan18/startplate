# Vitest Testing Setup

## 1. Install
```bash
npm install -D vitest @astrojs/test
```

## 2. Add to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 3. Create vitest.config.ts
```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'astro',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## 4. Example Tests

### src/lib/utils.test.ts
```ts
import { describe, it, expect } from 'vitest';
import { formatPrice, slugify, truncate } from './utils';

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(9.99)).toBe('$9.99');
  });

  it('formats whole numbers', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('What?! No way...')).toBe('what-no-way');
  });
});

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('does not truncate short text', () => {
    expect(truncate('Hi', 5)).toBe('Hi');
  });
});
```

### src/components/Button.test.ts
```ts
import { describe, it, expect } from 'vitest';
import { render } from 'astro-html-testing-library';
import Button from './Button.astro';

describe('Button', () => {
  it('renders with correct text', async () => {
    const { container } = await render(Button, {
      props: { text: 'Click me' },
    });
    expect(container.textContent).toContain('Click me');
  });

  it('applies variant class', async () => {
    const { container } = await render(Button, {
      props: { text: 'Click', variant: 'primary' },
    });
    expect(container.querySelector('.btn-primary')).toBeTruthy();
  });
});
```

### src/pages/api/slots.test.ts
```ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from './slots';

vi.mock('../../lib/turso', () => ({
  getSlots: vi.fn().mockResolvedValue([
    { position: 1, brand_name: 'Test', bid_amount: 1 },
  ]),
}));

describe('GET /api/slots', () => {
  it('returns slots as JSON', async () => {
    const request = new Request('http://localhost/api/slots');
    const response = await GET({ request } as any);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].brand_name).toBe('Test');
  });
});
```

## 5. Running Tests
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- src/lib/utils.test.ts
```

## 6. CI/CD Integration
Add to `.github/workflows/test.yml`:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## 7. File Structure
```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
├── components/
│   ├── Button.astro
│   └── Button.test.ts
└── pages/
    └── api/
        └── slots.test.ts
vitest.config.ts
```
