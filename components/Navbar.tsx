import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Search, User } from "lucide-react";
import { logout } from "@/app/actions/auth";

interface UserProfile {
  name?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
}

interface User {
  email?: string;
  profile?: UserProfile | null;
  [key: string]: unknown;
}

interface NavbarProps {
  user?: User | null;
  activePath?: string;
}

export function Navbar({ user, activePath }: NavbarProps) {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" aria-label="JobKhoj homepage" className="flex items-center">
          <Image
            src="/jobkhoj-logo.png"
            alt="JobKhoj"
            width={160}
            height={40}
            className="h-8 sm:h-9 w-auto"
            priority
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          <Link
            className={`flex items-center gap-2 text-[14px] font-medium transition-colors ${
              activePath === "/dashboard"
                ? "text-accent font-medium"
                : "text-text-dark hover:text-text-black"
            }`}
            href="/dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            className={`flex items-center gap-2 text-[14px] font-medium transition-colors ${
              activePath === "/find-jobs"
                ? "text-accent font-medium"
                : "text-text-dark hover:text-text-black"
            }`}
            href="/find-jobs"
          >
            <Search className="h-4 w-4" />
            Find Jobs
          </Link>
          <Link
            className={`flex items-center gap-2 text-[14px] font-medium transition-colors ${
              activePath === "/profile"
                ? "text-accent font-medium"
                : "text-text-dark hover:text-text-black"
            }`}
            href="/profile"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-text-slate-medium sm:inline">
              Signed in as <strong className="text-text-dark">{user.profile?.name || user.email}</strong>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-overlay-dark px-4 py-2 text-[14px] font-semibold text-accent-foreground shadow-sm transition-all hover:bg-overlay-dark-hover hover:shadow cursor-pointer"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <Link
            className="rounded-md bg-overlay-dark px-4 py-2 text-[14px] font-semibold text-accent-foreground shadow-sm transition-all hover:bg-overlay-dark-hover hover:shadow"
            href="/login"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
