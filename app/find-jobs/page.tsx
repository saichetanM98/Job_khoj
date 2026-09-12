import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/Navbar";
import { FindJobsClient } from "@/components/find-jobs/FindJobsClient";

export const metadata = {
  title: "Find Jobs | JobKhoj",
  description: "Discover and match jobs tailored to your experience and skills.",
};

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  // Preload user's saved jobs from InsForge DB for instantaneous SSR
  const { data: initialJobs } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("found_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} activePath="/find-jobs" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <FindJobsClient initialJobs={initialJobs || []} userId={user.id} />
      </main>
    </div>
  );
}


