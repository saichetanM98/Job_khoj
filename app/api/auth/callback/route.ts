import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { createAuthActions } from '@insforge/sdk/ssr';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('insforge_code') || request.nextUrl.searchParams.get('code');
  const cookieStore = await cookies();
  const verifier = cookieStore.get('insforge_code_verifier')?.value || request.cookies.get('insforge_code_verifier')?.value;

  if (!code || !verifier) {
    console.error('OAuth callback missing code or verifier:', { code: !!code, verifier: !!verifier });
    return NextResponse.redirect(new URL('/login?error=oauth_missing_data', request.url));
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  const auth = createAuthActions({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const { error } = await auth.exchangeOAuthCode(code, verifier);

  if (error) {
    console.error('OAuth exchange error:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'auth_failed')}`, request.url));
  }

  response.cookies.delete('insforge_code_verifier');
  return response;
}
