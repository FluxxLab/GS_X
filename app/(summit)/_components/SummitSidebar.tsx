'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  Gamepad2,
  icons,
  LayoutDashboard,
  LogOut,
  Megaphone,
  RadioTower,
  ShieldAlert,
  Users,
  LucideIcon,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { string } from "zod";

const NAV = [
    {href: "/overview", label: "Overview", icon: LayoutDashboard},
    {href: "/sessions", label: "Sessions", icon: CalendarClock},
    {href: "/delegates", label: "Delegates", icon: Users},
    {href: "/live-ops", label:"Live Ops", icon: Zap},
    {href: "/trivia", label: "Trivia", icon: Gamepad2},
    {href: "/announce", label: "Announce", icon: Megaphone},
    {href: "/security", label: "Security", icon: ShieldAlert},
    
];

export function SummitSidebar(){
    const pathname = usePathname();

    return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-center p-4 md:flex">
      <div className="flex h-full flex-col rounded-3xl border border-summit-lilac/[0.18] bg-summit-lilac/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_1px_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between pb-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xs text-summit-smoke transition-colors hover:text-summit-lilac"
          >
            <LogOut className="size-4" />
            Exit
          </Link>
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
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-[20px] px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-summit-cerise text-white"
                    : "text-summit-smoke hover:bg-summit-lilac/5 hover:text-summit-lilac",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}