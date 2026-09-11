import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

/**
 * Catch-all better-auth handler — REQUIRED for every auth method
 * beyond the custom email/password routes in this folder:
 * OAuth callbacks, magic-link + email-verification links,
 * 2FA verification, session refresh.
 * Without this file, all of those return 404.
 *
 * When scaffolding, copy this file to src/pages/api/auth/[...all].ts
 * so Astro serves it at /api/auth/*.
 */
export const ALL: APIRoute = async (context) => {
  return auth.handler(context.request);
};
