import Link from "next/link";

export function Logo({ className = "", isFooter }: { className?: string; isFooter?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Linguaband home"
      className={`flex items-center gap-2 ${className}`}
    >
      {/* Stylized brand mark */}
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 8a4 4 0 0 1 8 0" />
          <path d="M8 16a4 4 0 0 0 8 0" />
        </svg>
      </span>
      <span className={`font-display text-lg font-bold tracking-tight ${isFooter ? "text-zinc-100" : "text-zinc-900"}`}>
        Lingua<span className="text-blue-600">band</span>
      </span>
    </Link>
  );
}
