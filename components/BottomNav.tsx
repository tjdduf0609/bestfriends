import Link from "next/link";
export default function BottomNav() {
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
      border-gray-200
      bg-white
      px-4
      py-3
      shadow-lg
      "
    >

      <NavItem
        emoji="🏠"
        text="홈"
      />

      <Link href="/diary">
       <NavItem
          emoji="📖"
          text="일기"
       />
      </Link>

      <Link href="/gallery">
       <NavItem
           emoji="🎬"
         text="작품"
       />
       </Link>

      <Link href="/music">
       <NavItem
         emoji="🎵"
         text="음악"
      />
       </Link>

      <Link href="/calendar">
       <NavItem
          emoji="📅"
         text="기록"
      />
      </Link>

    </nav>
  );
}


function NavItem({
  emoji,
  text,
}: {
  emoji: string;
  text: string;
}) {

  return (
    <button
      className="
      flex
      flex-col
      items-center
      text-xs
      text-gray-500
      "
    >

      <span className="text-xl">
        {emoji}
      </span>

      <span>
        {text}
      </span>

    </button>
  );
}