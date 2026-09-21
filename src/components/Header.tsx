"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation } from "@/data/navigation";
import { Logo } from "@/components/ui/Logo";
import { Dropdown } from "@/components/ui/Dropdown";
import { Icon } from "@/components/icons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-zinc-200/80 bg-white/90 shadow-sm shadow-zinc-900/5 backdrop-blur-md"
          : "border-transparent bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) =>
            item.children ? (
              <Dropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/#"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Log In
          </Link>
          <Link
            href="/#"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <Icon name={mobileOpen ? "x" : "menu"} size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-16 z-50 bg-zinc-50 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col gap-1 overflow-y-auto px-6 py-8">
          {navigation.map((item) =>
            item.children ? (
              <details key={item.label} className="group border-b border-zinc-200 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-zinc-900">
                  {item.label}
                  <Icon
                    name="chevron-down"
                    size={16}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-2 flex flex-col gap-1 pl-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-zinc-200 py-3 text-base font-medium text-zinc-900"
              >
                {item.label}
              </Link>
            ),
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/#"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-900"
            >
              Log In
            </Link>
            <Link
              href="/#"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
