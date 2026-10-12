export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
