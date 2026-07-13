import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-indigo-950 via-slate-900 to-violet-950 text-slate-100 font-sans">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>

      {/* Header Navigation */}
      <header className="border-b border-slate-800/50 bg-slate-950/20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.5-.413 8.084-1.205a60.43 60.43 0 00-.49-6.347m-15.344 0C4.3 7.299 8 7 12 7s7.7 2.999 7.75 3.147m-15.344 0C3.46 11.584 3 13.088 3 14.7c0 1.71.533 3.32 1.455 4.654M19.75 10.147c.79 1.437 1.25 3.1 1.25 4.853 0 1.612-.46 3.116-1.205 4.454M12 2.25V5.25m0 0a3 3 0 100 6 3 3 0 000-6zm0 0v3.75" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">
                Coach
              </span>
            </div>

            {/* Nav Links */}
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center items-center text-sm font-semibold rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white transition-all hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98]"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-6">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Introducing Next Gen AI Coaching
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-indigo-100 via-slate-100 to-violet-100 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
            Empower Your Growth with Personal AI Coaching
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
            Unlock your potential with structured development tracks, real-time AI feedback, and daily personalized goals designed to elevate your career and lifestyle.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-base font-semibold text-white transition-all hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="text-sm font-semibold leading-6 text-slate-300 hover:text-white transition-colors"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32 sm:mt-40">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent sm:text-4xl">
              Everything you need to accelerate your path
            </h2>
            <p className="mt-4 text-base text-slate-400">
              A curated experience built on top of state-of-the-art coaching methodologies.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md hover:border-indigo-500/20 transition-all hover:-translate-y-1 duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Development Tracks</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Step-by-step pathways designed by industry experts to guide you from foundation to mastery.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md hover:border-indigo-500/20 transition-all hover:-translate-y-1 duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Real-Time AI Feedback</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Submit audio or text journals and receive instant, personalized advice to navigate roadblocks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md hover:border-indigo-500/20 transition-all hover:-translate-y-1 duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Milestone Tracking</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Visualize your growth with dynamic milestones, streaks, and progress reports.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 bg-slate-950/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
