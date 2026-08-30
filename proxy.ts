import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@insforge/sdk/ssr/middleware';
import { createServerClient } from '@insforge/sdk/ssr';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Update session (refreshes tokens)
  await updateSession({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  // Verify auth session
  const insforge = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
    },
  });

  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  const path = request.nextUrl.pathname;

  const protectedRoutes = ['/dashboard', '/profile', '/find-jobs'];
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/find-jobs/:path*',
    '/login',
  ],
};
