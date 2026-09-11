import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;

    if (!sessionToken) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await auth.api.getSession({
      headers: new Headers({ 'authorization': `Bearer ${sessionToken}` }),
    });

    return new Response(JSON.stringify({ user: session?.user || null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
