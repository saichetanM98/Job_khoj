import Image from "next/image";
import Link from "next/link";
import { createInsforgeServer } from "@/lib/insforge-server";
import { logout } from "@/app/actions/auth";

const features = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    active: true,
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobKhoj browses their site and gives you everything you need to apply with confidence.",
    active: false,
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
    active: false,
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobKhoj scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export default async function Home() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
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

          <nav aria-label="Primary navigation" className="hidden items-center gap-10 md:flex">
            <Link
              className="text-[15px] font-medium text-text-dark transition-colors hover:text-text-black"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-[15px] font-medium text-text-dark transition-colors hover:text-text-black"
              href="/find-jobs"
            >
              Find Jobs
            </Link>
            <Link
              className="text-[15px] font-medium text-text-dark transition-colors hover:text-text-black"
              href="/profile"
            >
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
                  className="rounded-md bg-overlay-dark px-5 py-2.5 text-[15px] font-semibold text-accent-foreground shadow-sm transition-all hover:bg-overlay-dark-hover hover:shadow cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              className="rounded-md bg-overlay-dark px-5 py-2.5 text-[15px] font-semibold text-accent-foreground shadow-sm transition-all hover:bg-overlay-dark-hover hover:shadow"
              href="/login"
            >
              Start for free
            </Link>
          )}
        </div>
      </header>

      {/* Main Container bounded by vertical borders */}
      <div className="mx-auto max-w-[1440px] border-x border-border bg-surface">
        {/* Hero Section */}
        <section className="hero-gradient px-6 pt-16 pb-20 sm:px-10 lg:px-16 lg:pt-24 lg:pb-24 text-center">
          <h1 className="mx-auto max-w-[780px] text-4xl sm:text-5xl lg:text-[62px] font-bold leading-[1.08] tracking-tight text-text-black">
            Job hunting is hard.
            <br />
            Your tools shouldn’t be.
          </h1>
          <p className="mx-auto mt-6 max-w-[660px] text-lg sm:text-xl lg:text-[20px] font-normal leading-relaxed text-text-slate-medium">
            Stop applying blind. JobKhoj finds the jobs, researches the companies, and gives you
            everything you need to stand out.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link className="primary-landing-button" href={user ? "/dashboard" : "/login"}>
              {user ? "Go to Dashboard" : "Get Started"} <span aria-hidden="true" className="button-caret" />
            </Link>
            <Link className="secondary-landing-button" href="/find-jobs">
              Find Your First Match
            </Link>
          </div>

          {/* Floating Dashboard Preview Image */}
          <div className="mt-12 sm:mt-16 mx-auto max-w-[1120px]">
            <Image
              src="/images/dashboard-demo.png"
              alt="JobKhoj dashboard preview"
              width={2394}
              height={1208}
              className="h-auto w-full drop-shadow-sm"
              priority
            />
          </div>
        </section>

        {/* Feature Section 1: Manage Your Job Search With Ease */}
        <section className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
          <div className="bg-surface lg:border-r border-border">
            <div className="px-8 py-12 sm:px-12 lg:px-14 lg:py-16">
              <h2 className="max-w-[480px] text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.15] text-text-slate">
                Manage Your Job Search With Ease
              </h2>
            </div>
            <div>
              {features.map((feature) => (
                <article
                  className={`feature-row ${feature.active ? "feature-row-active" : ""}`}
                  key={feature.title}
                >
                  <h3 className="text-xl lg:text-[22px] font-bold leading-snug text-text-darker">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-[540px] text-base lg:text-[17px] font-normal leading-relaxed text-text-slate-medium">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center bg-surface-muted p-8 sm:p-12 lg:p-14">
            <Image
              src="/images/jobs-lists.png"
              alt="Matched jobs list preview"
              width={1182}
              height={889}
              className="h-auto w-full max-w-[560px]"
            />
          </div>
        </section>

        {/* Hatched Divider 1 */}
        <div className="hatched-divider" aria-hidden="true" />

        {/* Feature Section 2: Apply With More Confidence, Every Time */}
        <section className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
          <div className="flex items-center justify-center bg-surface-muted p-8 sm:p-12 lg:p-14 lg:border-r border-border order-2 lg:order-1">
            <Image
              src="/images/agnet-log.png"
              alt="JobKhoj agent log preview"
              width={1072}
              height={828}
              className="h-auto w-full max-w-[560px]"
            />
          </div>

          <div className="bg-surface order-1 lg:order-2">
            <div className="px-8 py-12 sm:px-12 lg:px-14 lg:py-16">
              <h2 className="max-w-[540px] text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.15] text-text-slate">
                Apply With More Confidence, Every Time
              </h2>
            </div>
            <div>
              {confidenceFeatures.map((feature) => (
                <article className="feature-row" key={feature.title}>
                  <h3 className="text-xl lg:text-[22px] font-bold leading-snug text-text-darker">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-[560px] text-base lg:text-[17px] font-normal leading-relaxed text-text-slate-medium">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Hatched Divider 2 */}
        <div className="hatched-divider" aria-hidden="true" />

        {/* Testimonials Section */}
        <section className="border-t border-border bg-surface px-6 py-20 text-center sm:px-10 lg:px-16 lg:py-24">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-accent">
            Success Stories
          </p>
          <blockquote className="mx-auto mt-6 max-w-[860px] text-2xl sm:text-3xl lg:text-[34px] font-semibold leading-[1.38] text-text-darker">
            “I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see
            interviews waiting. It feels like cheating. Had 3 offers on the table simultaneously.”
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3.5">
            <Image
              src="/images/user-icon.png"
              alt="Tom Wilson"
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-cover"
            />
            <div className="text-left">
              <p className="text-[16px] font-bold leading-tight text-text-black">Tom Wilson</p>
              <p className="mt-0.5 text-[14px] font-normal text-text-slate-medium">
                Junior Developer
              </p>
            </div>
          </div>
        </section>

        {/* Hatched Divider 3 */}
        <div className="hatched-divider" aria-hidden="true" />

        {/* Call to Action Section */}
        <section className="hero-gradient border-t border-border px-6 py-20 text-center sm:px-10 lg:px-16 lg:py-24">
          <h2 className="mx-auto max-w-[820px] text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.12] tracking-tight text-text-black">
            Your next job search can feel a lot less overwhelming
          </h2>
          <p className="mx-auto mt-6 max-w-[680px] text-lg sm:text-xl lg:text-[20px] font-normal leading-relaxed text-text-slate-medium">
            Set up your profile, upload your resume, and start finding matches in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link className="primary-landing-button" href={user ? "/dashboard" : "/login"}>
              {user ? "Go to Dashboard" : "Get Started"} <span aria-hidden="true" className="button-caret" />
            </Link>
            <Link className="secondary-landing-button" href="/find-jobs">
              Find Your First Match
            </Link>
          </div>
        </section>

        {/* Hatched Divider 4 */}
        <div className="hatched-divider" aria-hidden="true" />

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-6 border-t border-border bg-surface px-6 py-10 sm:px-10 lg:flex-row lg:px-16">
          <Link href="/" aria-label="JobKhoj homepage">
            <Image
              src="/jobkhoj-logo.png"
              alt="JobKhoj"
              width={150}
              height={38}
              className="h-8 w-auto"
            />
          </Link>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-8 text-[15px] font-normal text-text-dark"
          >
            <Link href="/dashboard" className="transition-colors hover:text-text-black">
              Dashboard
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-text-black">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-text-black">
              Terms &amp; Condition
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
