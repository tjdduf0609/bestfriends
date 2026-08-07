"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
      fixed
      bottom-0
      left-0
      right-0
      mx-auto
      flex
      max-w-md
      justify-around
      border-t
      border-border
      bg-surface
      px-4
      py-3
      shadow-lg
      "
    >
      <Link href="/">
        <NavItem emoji="🏠" text="홈" active={pathname === "/"} />
      </Link>

      <Link href="/diary">
        <NavItem emoji="📖" text="일기" active={pathname.startsWith("/diary")} />
      </Link>

      <Link href="/gallery">
        <NavItem emoji="🎬" text="작품" active={pathname.startsWith("/gallery")} />
      </Link>

      <Link href="/music">
        <NavItem emoji="🎵" text="음악" active={pathname.startsWith("/music")} />
      </Link>

      <Link href="/calendar">
        <NavItem emoji="📅" text="기록" active={pathname.startsWith("/calendar")} />
      </Link>

      <Link href="/settings">
        <NavItem emoji="⚙️" text="설정" active={pathname.startsWith("/settings")} />
      </Link>
    </nav>
  );
}

function NavItem({
  emoji,
  text,
  active = false,
}: {
  emoji: string;
  text: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center text-xs transition ${
        active ? "text-primary" : "text-text-muted"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="font-bold">{text}</span>
    </button>
  );
}