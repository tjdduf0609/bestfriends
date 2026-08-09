"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Clapperboard, Music, Calendar, Settings, LucideIcon } from "lucide-react";
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-md md:max-w-2xl lg:max-w-4xl justify-around bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <Link href="/">
        <NavItem icon={Home} text="홈" active={pathname === "/"} />
      </Link>
      <Link href="/diary">
        <NavItem icon={BookOpen} text="일기" active={pathname.startsWith("/diary")} />
      </Link>
      <Link href="/gallery">
        <NavItem icon={Clapperboard} text="작품" active={pathname.startsWith("/gallery")} />
      </Link>
      <Link href="/music">
        <NavItem icon={Music} text="음악" active={pathname.startsWith("/music")} />
      </Link>
      <Link href="/calendar">
        <NavItem icon={Calendar} text="달력" active={pathname.startsWith("/calendar")} />
      </Link>
      <Link href="/settings">
        <NavItem icon={Settings} text="설정" active={pathname.startsWith("/settings")} />
      </Link>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  text,
  active = false,
}: {
  icon: LucideIcon;
  text: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-0.5 text-xs transition ${
        active ? "text-primary" : "text-card-muted"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      <span className="font-bold">{text}</span>
    </button>
  );
}