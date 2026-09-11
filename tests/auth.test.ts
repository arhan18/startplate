import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Full auth lifecycle against a throwaway file DB.
// Resend is stubbed at fetch level (captures verification URL, never sends).

process.env.TURSO_DATABASE_URL = 'file:/tmp/startplate-auth-test.db';
delete process.env.TURSO_AUTH_TOKEN;
process.env.BETTER_AUTH_SECRET = 'test-secret-min-32-chars-long-1234567890';
process.env.BETTER_AUTH_URL = 'http://localhost:4321';
process.env.RESEND_API_KEY = 'test-key-never-sent';
process.env.EMAIL_FROM = 'test@example.com';

let capturedVerifyUrl = '';
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  const url = String(input?.url || input);
  if (url.includes('api.resend.com')) {
    try {
      const body = JSON.parse(String(init?.body || '{}'));
      const m = /https?:\/\/[^\s"'<>]+verify[^\s"'<>]*/i.exec(body.html || '');
      if (m) capturedVerifyUrl = m[0];
    } catch { /* ignore */ }
    return new Response(JSON.stringify({ id: 'stubbed' }), { status: 200 });
  }
  return realFetch(input, init);
}) as typeof fetch;

afterAll(() => {
  globalThis.fetch = realFetch;
});

describe('auth lifecycle (real betterAuth)', () => {
  it('signs up, verifies, signs in, serves session, signs out', async () => {
    const { auth } = await import('../shared/lib/auth');
    // Create better-auth tables (user, session, account, verification, ...)
    const { getMigrations } = await import('better-auth/db/migration');
    const mig = await getMigrations((auth as any).options);
    await mig.runMigrations();
    const email = `qa${Date.now()}@example.com`;

    // 1. Sign up
    const signup = await auth.api.signUpEmail({ body: { name: 'QA', email, password: 'Str0ng!Pass123' } });
    expect(signup.user?.email).toBe(email);

    // 2. Duplicate: must NOT issue a session (enumeration-safe) and must NOT duplicate the user
    const dup = (await auth.api.signUpEmail({ body: { name: 'QA', email, password: 'Str0ng!Pass123' } })) as any;
    expect(dup.token ?? dup.session?.token ?? null, 'no session on duplicate').toBeNull();

    // 3. Wrong password rejected
    await expect(
      auth.api.signInEmail({ body: { email, password: 'Wrong!Pass123' } })
    ).rejects.toThrow();

    // 4. Verify via captured link token
    expect(capturedVerifyUrl, 'verification email captured').toContain('http');
    const token = new URL(capturedVerifyUrl).searchParams.get('token');
    expect(token, 'verification token present').toBeTruthy();
    await auth.api.verifyEmail({ query: { token: token! } });

    // 5. Sign in works after verification
    const signin = await auth.api.signInEmail({ body: { email, password: 'Str0ng!Pass123' } });
    const sessionToken =
      (signin as any).token || (signin as any).session?.token;
    expect(sessionToken, 'session token issued').toBeTruthy();

    // 6. Session resolves to the user
    const session = await auth.api.getSession({
      headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
    });
    expect(session?.user?.email).toBe(email);

    // 7. Garbage token resolves to nothing
    const bad = await auth.api.getSession({
      headers: new Headers({ authorization: 'Bearer garbage-token-xyz' }),
    });
    expect(bad).toBeNull();

    // 8. Sign out invalidates
    await auth.api.signOut({ headers: new Headers({ authorization: `Bearer ${sessionToken}` }) });
    const after = await auth.api.getSession({
      headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
    });
    expect(after).toBeNull();
  }, 30000);
});
