"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import type { TemplateCard as Template } from "@/data/content";

export type TemplateViewMode = "cards" | "list";

export const templateGroupStyle: Record<string, string> = {
  Speaking: "bg-violet-50 text-violet-600",
  Writing: "bg-blue-50 text-blue-600",
};

function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

function TemplateCardItem({ template }: { template: Template }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
            templateGroupStyle[template.group] ?? "bg-zinc-100 text-zinc-600"
          }`}
        >
          <Icon name={template.icon} size={18} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {template.group}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold leading-snug text-zinc-900">
        {template.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">{template.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600"
          >
            {tag}
          </span>
        ))}
        <span className="ml-auto text-[11px] font-semibold text-zinc-400">
          {template.level}
        </span>
      </div>
      <Link
        href={template.href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
      >
        Explore template
        <Icon name="arrow-right" size={15} />
      </Link>
    </article>
  );
}

function TemplateRowItem({ template }: { template: Template }) {
  return (
    <Link
      href={template.href}
      className="group flex items-center gap-4 p-4 transition-colors hover:bg-zinc-50 sm:gap-5 sm:p-5"
    >
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          templateGroupStyle[template.group] ?? "bg-zinc-100 text-zinc-600"
        }`}
      >
        <Icon name={template.icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-[15px] font-bold leading-snug text-zinc-900 group-hover:text-blue-700">
            {template.title}
          </span>
          <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 sm:inline">
            {template.level}
          </span>
        </span>
        <span className="mt-1 line-clamp-2 block text-sm leading-6 text-zinc-500">
          {template.description}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {template.group}
          </span>
          <span aria-hidden="true" className="text-zinc-300">
            ·
          </span>
          {template.tags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-zinc-500">
              {tag}
            </span>
          ))}
        </span>
      </span>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-400 transition-all group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon name="arrow-right" size={16} />
      </span>
    </Link>
  );
}

function TemplateSection({
  id,
  sectionKey,
  title,
  hint,
  count,
  items,
  view,
  collapsed,
  onToggle,
}: {
  id: string;
  sectionKey: string;
  title: string;
  hint?: string;
  count: number;
  items: Template[];
  view: TemplateViewMode;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <section aria-labelledby={id} className="mb-12 last:mb-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-display text-2xl font-bold text-zinc-900">
          <span id={id}>{title}</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-sans text-xs font-semibold text-zinc-500">
            {count}
          </span>
          {hint ? (
            <span className="hidden text-xs font-normal text-zinc-400 sm:inline">{hint}</span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={`${title}: ${collapsed ? "expand" : "collapse"}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
        >
          <Icon
            name="chevron-down"
            size={16}
            className={`transition-transform ${collapsed ? "" : "rotate-180"}`}
          />
        </button>
      </div>
      {!collapsed ? (
        view === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((template) => (
              <TemplateCardItem key={template.title} template={template} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {items.map((template) => (
              <TemplateRowItem key={template.title} template={template} />
            ))}
          </div>
        )
      ) : null}
    </section>
  );
}

export function TemplatesBrowser({ templates }: { templates: Template[] }) {
  const [view, setView] = useLocalStorage<TemplateViewMode>(
    "linguaband.templates.view",
    "cards",
  );
  const [collapsed, setCollapsed] = useLocalStorage<string[]>(
    "linguaband.templates.collapsed",
    [],
  );
  const speaking = templates.filter((t) => t.group === "Speaking");
  const writing = templates.filter((t) => t.group === "Writing");
  const toggleCollapse = (key: string) =>
    setCollapsed(
      collapsed.includes(key) ? collapsed.filter((k) => k !== key) : [...collapsed, key],
    );
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Template library</p>
          <p className="mt-1 text-sm text-zinc-500">
            {speaking.length} Speaking and {writing.length} Writing frameworks
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2" aria-label="Template categories">
            {["Speaking", "Writing"].map((group) => (
              <span
                key={group}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${templateGroupStyle[group]}`}
              >
                {group}
              </span>
            ))}
          </div>
          <div
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1"
            role="group"
            aria-label="Change layout"
          >
            {(["cards", "list"] as TemplateViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                title={v === "cards" ? "Card view" : "List view"}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === v
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Icon name={v === "cards" ? "grid" : "list"} size={14} />
                {v === "cards" ? "Cards" : "List"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <TemplateSection
        id="speaking-templates-heading"
        sectionKey="speaking"
        title="Speaking templates"
        hint="Guides for all eight CELPIP Speaking tasks"
        count={speaking.length}
        items={speaking}
        view={view}
        collapsed={collapsed.includes("speaking")}
        onToggle={() => toggleCollapse("speaking")}
      />
      <TemplateSection
        id="writing-templates-heading"
        sectionKey="writing"
        title="Writing templates"
        hint="Reusable structures for both Writing tasks"
        count={writing.length}
        items={writing}
        view={view}
        collapsed={collapsed.includes("writing")}
        onToggle={() => toggleCollapse("writing")}
      />
    </div>
  );
}
