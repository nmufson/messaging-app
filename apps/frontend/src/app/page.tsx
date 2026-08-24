import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-brand-accent px-4 py-10">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-10">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-lg shadow-brand/25">
            S
          </div>
        </div>

        <h1 className="m-0 text-center text-4xl tracking-tight text-slate-900">
          Welcome to Synk
        </h1>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-brand-neutral p-5 text-center shadow-sm">
          <p className="text-base text-slate-700">
            Sign up or log in to start messaging your friends and creating group
            chats.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-md shadow-brand/30 transition hover:bg-blue-600"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Log In
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Or continue as{' '}
            <Link
              href="/chats"
              className="font-semibold text-brand hover:underline"
            >
              guest
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
