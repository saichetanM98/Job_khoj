'use client';

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loginWithProvider } from "@/app/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'oauth_missing_data') {
        setError('Authentication response was missing required verification data. Please try again.');
      } else if (errorParam === 'auth_failed') {
        setError('Authentication failed. Please try again.');
      } else {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setError(null);
      setLoadingProvider(provider);
      const result = await loginWithProvider(provider);
      if (result?.error) {
        setError(result.error);
        setLoadingProvider(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start sign in flow.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full max-w-[440px] rounded-xl border border-border bg-surface p-8 shadow-lg md:p-10">
      <div className="flex flex-col items-center text-center">
        <Link href="/" aria-label="JobPilot homepage" className="mb-8">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={160}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text-black">
          Welcome to JobPilot
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          Sign in to start matching and applying with AI
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-error-light p-3 text-sm text-error border border-error-border">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={!!loadingProvider}
          className="flex w-full cursor-pointer items-center justify-center gap-3.5 rounded-md border border-border bg-surface py-2 px-4 text-sm font-medium text-text-primary transition-all hover:bg-surface-secondary hover:shadow-sm disabled:opacity-50"
        >
          {loadingProvider === 'google' ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.01c2.34-2.16 3.69-5.32 3.69-8.74z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.01-3.12c-1.12.75-2.54 1.19-3.92 1.19-3.02 0-5.58-2.03-6.5-4.76H1.31v3.23C3.29 21.57 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.5 14.44a7.12 7.12 0 0 1 0-4.88V6.33H1.31a11.94 11.94 0 0 0 0 11.34L5.5 14.44z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.29 2.43 1.31 6.33L5.5 9.56c.92-2.73 3.48-4.81 6.5-4.81z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin('github')}
          disabled={!!loadingProvider}
          className="flex w-full cursor-pointer items-center justify-center gap-3.5 rounded-md border border-border bg-surface py-2 px-4 text-sm font-medium text-text-primary transition-all hover:bg-surface-secondary hover:shadow-sm disabled:opacity-50"
        >
          {loadingProvider === 'github' ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          )}
          <span>Continue with GitHub</span>
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-text-muted leading-relaxed">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline transition-colors hover:text-text-secondary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline transition-colors hover:text-text-secondary">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center hero-gradient px-6 py-12">
      <Suspense fallback={<div className="h-64 w-full max-w-[440px] animate-pulse rounded-xl bg-surface" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
