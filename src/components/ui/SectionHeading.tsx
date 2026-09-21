import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 flex flex-col gap-4 ${
        align === "center" ? "items-center text-center" : "items-start text-left"
      }`}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          {eyebrow}
        </span>
      ) : null}
      <h2
        id={id}
        className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
