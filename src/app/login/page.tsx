import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { EmailAuthForm } from "@/app/login/EmailAuthForm";
import { getLearner, googleAuthConfigured, safeLoginReturnPath } from "@/lib/learner-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[]; error?: string }>;
}) {
  const [params, learner] = await Promise.all([searchParams, getLearner()]);
  const requestedReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnTo = safeLoginReturnPath(requestedReturnTo);
  if (learner) redirect(returnTo);

  const configured = googleAuthConfigured();
  const signInUrl = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center py-16 sm:py-24">
        <Container className="max-w-lg">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Welcome back</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-zinc-900">Sign in to Linguaband</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Sign in with email or Google to access personalized AI writing feedback and keep your review allowance tied to your account.
            </p>

            <EmailAuthForm returnTo={returnTo} />

            <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" />
              or
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            {params.error === "google" || params.error === "google-config" ? (
              <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                {params.error === "google-config"
                  ? "Google sign-in is not configured yet. Please try again later."
                  : "Google sign-in could not be completed. Please try again."}
              </p>
            ) : null}

            {configured ? (
              <a
                href={signInUrl}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.92 46.98 31.9 46.98 24.55Z" />
                  <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 0)" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.13 1.43-4.86 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                </svg>
                Continue with Google
              </a>
            ) : (
              <p role="status" className="mt-7 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                Google sign-in is temporarily unavailable because it hasn’t been configured.
              </p>
            )}

            <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
              By continuing, you agree to use AI feedback for practice only. It is not an official CELPIP score.
            </p>
            <p className="mt-6 text-center text-sm text-zinc-600">
              <Link href="/writing" className="font-semibold text-blue-600 hover:text-blue-700">Back to writing practice</Link>
            </p>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}