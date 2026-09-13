import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/Navbar";
import { JobDetailsView } from "@/components/job-details/JobDetailsView";
import {
  DEMO_JOB_DETAILS,
  JobDetails,
  mapDbJobToJobDetails,
} from "@/types/job-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Job Details | JobKhoj`,
    description: "Detailed job match analysis and role breakdown.",
  };
}

export default async function JobDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  // Attempt to fetch real job from InsForge database
  let jobData: JobDetails | null = null;

  try {
    const { data: dbJob, error } = await insforge.database
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (dbJob && !error) {
      jobData = mapDbJobToJobDetails(dbJob);
    }
  } catch (err) {
    console.warn("[JobDetailsPage] Could not load job from DB, using fallback:", err);
  }

  // If not found in DB (e.g. test id or demo item), use the high-fidelity demo spec from job-details.png
  if (!jobData) {
    jobData = {
      ...DEMO_JOB_DETAILS,
      id,
    };
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} activePath="/find-jobs" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <JobDetailsView job={jobData} />
      </main>
    </div>
  );
}
