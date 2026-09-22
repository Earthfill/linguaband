"use client";

export function LoginForm() {
  return (
    <form action="/api/admin/login" method="post" className="mt-6 max-w-sm">
      <input
        type="password"
        name="password"
        required
        placeholder="Admin password"
        className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-400"
      />
      <button
        type="submit"
        className="mt-3 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        Log in
      </button>
    </form>
  );
}
