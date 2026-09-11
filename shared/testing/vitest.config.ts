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
