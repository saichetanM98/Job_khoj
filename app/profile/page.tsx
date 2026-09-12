import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/Navbar";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { UserProfile } from "@/types";

export const metadata = {
  title: "Profile | JobKhoj",
  description: "Manage your profile, resume, and job preferences.",
};

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  let profile: UserProfile | null = null;
  try {
    const { data: profileRecord, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile from database:", profileError);
    } else if (profileRecord) {
      profile = profileRecord as UserProfile;
    }
  } catch (err) {
    console.error("Error fetching profile from database:", err);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} activePath="/profile" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ProfileClient
          initialProfile={profile}
          userEmail={user.email || ""}
        />
      </main>
    </div>
  );
}
