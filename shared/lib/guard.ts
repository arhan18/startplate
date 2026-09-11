import { auth } from './auth';

/** Throw 401 unless the bearer session belongs to one of the allowed roles. */
export async function requireRole(
  headers: Headers,
  allowed: string[] = ['admin'],
): Promise<{ userId: string; role: string }> {
  const session = await auth.api.getSession({ headers });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !role || !allowed.includes(role)) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  return { userId: session.user.id, role };
}
