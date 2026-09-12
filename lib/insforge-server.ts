import { createServerClient } from "@insforge/sdk/ssr";
import { createClient } from "@insforge/sdk";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  try {
    const cookieStore = await cookies();
    return createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });
  } catch {
    // Outside Next.js request lifecycle (e.g. background tasks or direct script tests)
    return createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    });
  }
};
