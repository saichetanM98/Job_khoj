'use server';

import { createAuthActions } from '@insforge/sdk/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type LoginResult = {
  success: false;
  error: string;
};

export async function loginWithProvider(provider: 'google' | 'github') {
  const cookieStore = await cookies();
  const auth = createAuthActions({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    cookies: cookieStore,
  });
  
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;
  
  let result: Awaited<ReturnType<typeof auth.signInWithOAuth>>;

  try {
    result = await auth.signInWithOAuth(provider, {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    });
  } catch (error) {
    console.error(`OAuth initiation failed for ${provider}:`, error);
    return {
      success: false,
      error: 'Sign in is temporarily unavailable. Please try again in a moment.',
    } satisfies LoginResult;
  }

  const { data, error } = result;

  if (error) {
    console.error(`OAuth initiation failed for ${provider}:`, error.message);
    return {
      success: false,
      error: 'Sign in is temporarily unavailable. Please try again in a moment.',
    } satisfies LoginResult;
  }

  if (!data?.url || !data.codeVerifier) {
    console.error(`OAuth initiation failed for ${provider}: missing redirect data`);
    return {
      success: false,
      error: 'Sign in could not be started. Please try again.',
    } satisfies LoginResult;
  }

  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  redirect(data.url);
}

export async function logout() {
  const cookieStore = await cookies();
  const auth = createAuthActions({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    cookies: cookieStore,
  });
  await auth.signOut();
  redirect('/login');
}
