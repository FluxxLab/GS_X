"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Mic,
  Mic2,
  RadioTower,
  ShieldAlert,
  UserCog,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/summit/auth";

const NAV = [
    {href: "/overview", label: "Overview", icon: LayoutDashboard},
    {href: "/sessions", label: "Sessions", icon: CalendarClock},
    {href: "/delegates", label: "Delegates", icon: UsersRound},
    {href: "/live-ops", label:"Live Ops", icon: Zap},
    {href: "/trivia", label: "Trivia", icon: Gamepad2},
    {href: "/announce", label: "Announce", icon: Megaphone},
    {href: "/security", label: "Security", icon: ShieldAlert},
    {href: "/discussions", label: "Discussions", icon: RadioTower},
    { href: "/capture", label: "Capture", icon: Mic },
    { href: "/pitchathon", label: "Pitchathon", icon: Mic2 },
    { href: "/admin", label: "Admin", icon: UsersRound },




    
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-[20px] px-3 py-2 text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-summit-cerise text-white"
                : "text-summit-smoke hover:bg-summit-lilac/5 hover:text-summit-lilac",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-summit-lilac/10 pt-2">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-[20px] px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/admin")
              ? "bg-summit-cerise text-white"
              : "text-summit-smoke hover:bg-summit-lilac/5 hover:text-summit-lilac",
          )}
        >
          <UserCog className="size-4" />
          Admin
        </Link>
      </div>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/Gender-Summit-Logo-02.png"
        alt="GS-26 logo"
        width={40}
        height={40}
        className="h-5 w-auto"
      />
      <span className="font-[family-name:var(--font-archivo)] text-sm font-bold tracking-[-0.02em]">
        GS-26 Admin
      </span>
    </div>
  );
}

export function SummitSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes — otherwise it stays open on
  // top of the page you just navigated to.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Mobile top bar — fixed, so it sits outside the layout's flex row */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-summit-lilac/10 bg-summit-violet/95 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-full p-2 text-summit-smoke hover:text-summit-lilac"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-summit-violet/80 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-summit-lilac/[0.18] bg-summit-violet p-5"
          >
            <div className="flex items-center justify-between pb-6">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-full p-1 text-summit-smoke hover:text-summit-lilac"
              >
                <X className="size-5" />
              </button>
            </div>

            <NavLinks onNavigate={() => setOpen(false)} />

            <button
              onClick={() => void logout()}
              className="mt-3 flex items-center gap-2 px-3 py-2 text-xs text-summit-smoke hover:text-summit-lilac"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar — unchanged behaviour */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-center p-4 md:flex">
        <div className="flex h-full flex-col rounded-3xl border border-summit-lilac/[0.18] bg-summit-lilac/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_1px_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between pb-6">
            <button
              onClick={() => void logout()}
              className="flex items-center gap-2 text-xs text-summit-smoke transition-colors hover:text-summit-lilac"
            >
              <LogOut className="size-4" />
              Exit
            </button>
            <Brand />
          </div>

          <NavLinks />
        </div>
      </aside>
    </>
  );
}
