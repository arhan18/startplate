import { describe, it, expect } from 'vitest';

// Admin guard: 401 without session, 401 for members, pass for admins.
// Throwaway file DB; Resend stubbed (captures verification URLs).

process.env.TURSO_DATABASE_URL = 'file:/tmp/startplate-guard-test.db';
delete process.env.TURSO_AUTH_TOKEN;
process.env.BETTER_AUTH_SECRET = 'test-secret-min-32-chars-long-1234567890';
process.env.BETTER_AUTH_URL = 'http://localhost:4321';
process.env.RESEND_API_KEY = 'test-key-never-sent';

let capturedVerifyUrl = '';
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
  const url = String((input as { url?: string })?.url || input);
  if (url.includes('api.resend.com')) {
    try {
      const body = JSON.parse(String((init as { body: string }).body || '{}'));
      const m = /https?:\/\/[^\s"'<>]+verify[^\s"'<>]*/i.exec(body.html || '');
      if (m) capturedVerifyUrl = m[0];
    } catch { /* ignore */ }
    return new Response(JSON.stringify({ id: 'stubbed' }), { status: 200 });
  }
  return realFetch(input as never, init as never);
}) as typeof fetch;

describe('admin guard', () => {
  it('rejects anonymous + members, admits admins', async () => {
    const { auth } = await import('../shared/lib/auth');
    const { getMigrations } = await import('better-auth/db/migration');
    await (await getMigrations((auth as { options: unknown }).options)).runMigrations();
    const { requireRole } = await import('../shared/lib/guard');
    const { createClient } = await import('@libsql/client');
    const db = createClient({ url: process.env.TURSO_DATABASE_URL as string });
    const stamp = Date.now();

    const verifiedToken = async (email: string, role: string | null) => {
      await auth.api.signUpEmail({ body: { name: 'G', email, password: 'Str0ng!Pass123' } });
      const token = new URL(capturedVerifyUrl).searchParams.get('token');
      await auth.api.verifyEmail({ query: { token: token as string } });
      if (role) {
        await db.execute({ sql: 'UPDATE user SET role = ? WHERE email = ?', args: [role, email] });
      }
      const signin = (await auth.api.signInEmail({ body: { email, password: 'Str0ng!Pass123' } })) as {
        token?: string;
        session?: { token: string };
      };
      return signin.token || signin.session?.token || '';
    };

    // 1. No session -> 401
    await expect(requireRole(new Headers())).rejects.toMatchObject({ status: 401 });

    // 2. Garbage token -> 401
    await expect(
      requireRole(new Headers({ authorization: 'Bearer garbage-xyz' }))
    ).rejects.toMatchObject({ status: 401 });

    // 3. Member session -> 401
    const memberToken = await verifiedToken(`member${stamp}@x.com`, 'user');
    expect(memberToken, 'member signed in').not.toBe('');
    await expect(
      requireRole(new Headers({ authorization: `Bearer ${memberToken}` }))
    ).rejects.toMatchObject({ status: 401 });

    // 4. Admin session -> passes with role
    const adminToken = await verifiedToken(`admin${stamp}@x.com`, 'admin');
    expect(adminToken, 'admin signed in').not.toBe('');
    const got = await requireRole(new Headers({ authorization: `Bearer ${adminToken}` }));
    expect(got.role).toBe('admin');
    expect(got.userId).toBeTruthy();
  }, 30000);
});
