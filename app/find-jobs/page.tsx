import Link from "next/link";
import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Find Jobs | JobPilot",
  description: "Find jobs with JobPilot.",
};

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} activePath="/find-jobs" />
      <main className="flex-1 px-6 py-12">
        <section className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Phase 1
          </p>
          <h1 className="mt-3 text-3xl font-bold text-text-black">Find Jobs</h1>
          <p className="mt-3 text-text-secondary">
            Job discovery is intentionally paused until the next build phase.
          </p>
          <div className="mt-6">
            <Link className="secondary-landing-button" href="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

