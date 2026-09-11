import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    // Set session cookie
    if (result.session) {
      cookies.set('session', result.session.token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return new Response(JSON.stringify({ success: true, user: result.user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error.message || 'Sign up failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
