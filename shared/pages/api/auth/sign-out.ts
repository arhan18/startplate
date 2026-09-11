import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;

    if (sessionToken) {
      await auth.api.signOut({
        headers: new Headers({ 'authorization': `Bearer ${sessionToken}` }),
      });
    }

    cookies.delete('session', { path: '/' });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error.message || 'Sign out failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
