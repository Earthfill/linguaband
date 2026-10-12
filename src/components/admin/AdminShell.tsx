"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/ui/Logo";

type NavItem = { href: string; label: string; icon: IconName; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "grid", exact: true },
  { href: "/admin/uploads", label: "Uploads", icon: "upload" },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: "book" },
  { href: "/admin/audio", label: "Audio jobs", icon: "waveform" },
];

function isActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Admin sections">
      {NAV.map((item) => {
        const active = isActive(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Icon name={item.icon} size={18} className={active ? "text-violet-300" : "text-zinc-400"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action="/api/admin/logout" method="post" className={className}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <Icon name="log-out" size={18} className="text-zinc-400" />
        Log out
      </button>
    </form>
  );
}

export function AdminShell({ attention = 0, children }: { attention?: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = NAV.find((item) => isActive(item, pathname))?.label ?? "Admin";

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 items-center justify-between gap-2 border-b border-zinc-100 px-5">
          <Logo />
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
            Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-5">
          <p className="mb-2 px-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Manage</p>
          <SidebarNav pathname={pathname} />
        </div>
        <div className="border-t border-zinc-100 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Icon name="globe" size={18} className="text-zinc-400" />
            View site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin navigation"
          >
            <Icon name="menu" size={22} />
          </button>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <Logo className="scale-90" />
          </div>
          <p className="hidden truncate font-display text-lg font-bold tracking-tight text-zinc-900 lg:block">{title}</p>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/audio"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                attention
                  ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${attention ? "bg-amber-500" : "bg-emerald-500"}`} />
              {attention ? `${attention} need attention` : "All audio healthy"}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close admin navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-5">
              <p className="mb-2 px-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Manage</p>
              <SidebarNav pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="border-t border-zinc-100 p-3">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Icon name="globe" size={18} className="text-zinc-400" />
                View site
              </Link>
              <LogoutButton />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
