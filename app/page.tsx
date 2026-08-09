"use client";

import { CalendarDays, Pencil, Heart, CalendarHeart, Cloud, BookOpen, Clapperboard, Music } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Settings {
  id: number;
  person1_name: string;
  person2_name: string;
  person1_image?: string | null;
  person2_image?: string | null;
  start_date: string;
  couple_name?: string;
  home_message?: string;
}

function calculateDDay(startDate: string) {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ▼ 카드 전체 톤: 테두리 없이 그림자만, 큰 라운드값, 호버 시 살짝 떠오름
const cardStyle =
  "rounded-3xl bg-white shadow-sm transition-all duration-300";

// ▼ 아이콘 전용 파스텔 박스
const iconBoxStyle =
  "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl transition group-hover:scale-110";

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [myName, setMyName] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const [counts, setCounts] = useState({ diary: 0, gallery: 0, music: 0 });
  const [editingMessage, setEditingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const router = useRouter();
  const [nextEvent, setNextEvent] = useState<{
  title: string;
  date: string;
} | null>(null);
  

  useEffect(() => {
    setMyName(localStorage.getItem("myName"));
    loadEverything();
  }, []);

  async function loadEverything() {
    
    const { data: settingsData, error: settingsError } = await supabase
      .from("profileSettings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    const { data: eventData, error: eventError } = await supabase
  .from("anniversaries")
  .select("id, title, date, repeat_type");

if (eventError) {
  console.log("다가오는 일정 조회 실패", eventError.message);
  setNextEvent(null);
} else {
  // 오늘 날짜를 YYYY-MM-DD 형태로 비교
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const upcomingEvents = (eventData ?? [])
    .map((event) => {
      const original = new Date(`${event.date}T00:00:00`);

      let nextDate: Date;

      // 매년 반복
      if (event.repeat_type === "yearly") {
        nextDate = new Date(
          today.getFullYear(),
          original.getMonth(),
          original.getDate()
        );

        // 올해 날짜가 이미 지났다면 내년
        if (event.date < todayString) {
          nextDate = new Date(
            today.getFullYear() + 1,
            original.getMonth(),
            original.getDate()
          );
        }
      }

      // 매주 반복
      else if (event.repeat_type === "weekly") {
        nextDate = new Date(original);

        while (
          `${nextDate.getFullYear()}-${String(
            nextDate.getMonth() + 1
          ).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}` <
          todayString
        ) {
          nextDate.setDate(nextDate.getDate() + 7);
        }
      }

      // 반복 없음
      else {
        nextDate = original;
      }

      return {
        ...event,
        nextDate,
      };
    })
    .filter((event) => {
      const date = event.nextDate;

      const dateString = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      return dateString >= todayString;
    })
    .sort(
      (a, b) =>
        a.nextDate.getTime() - b.nextDate.getTime()
    );

  if (upcomingEvents.length > 0) {
    setNextEvent({
      title: upcomingEvents[0].title,
      date: `${upcomingEvents[0].nextDate.getFullYear()}-${String(
        upcomingEvents[0].nextDate.getMonth() + 1
      ).padStart(2, "0")}-${String(
        upcomingEvents[0].nextDate.getDate()
      ).padStart(2, "0")}`,
    });
  } else {
    setNextEvent(null);
  }
}

    setConnected(!settingsError);

    if (settingsData) {
      setSettings(settingsData);
      setMessageInput(settingsData.home_message ?? "");
    }

    const { data: diaries } = await supabase.from("diaries").select("author");

    if (diaries && settingsData) {
      const p1 = diaries.filter((d) => d.author === settingsData.person1_name).length;
      const p2 = diaries.filter((d) => d.author === settingsData.person2_name).length;
      setOpenedCount(Math.min(p1, p2));
      setCounts((c) => ({ ...c, diary: diaries.length }));
    }

    const { data: works } = await supabase.from("works").select("id");
    setCounts((c) => ({ ...c, gallery: works?.length ?? 0 }));

    const { data: music } = await supabase.from("music").select("id");
    setCounts((c) => ({ ...c, music: music?.length ?? 0 }));
  }

  async function saveMessage() {
    const { error } = await supabase
      .from("profileSettings")
      .update({ home_message: messageInput })
      .eq("id", 1);

    if (error) {
      console.log("메시지 저장 실패", error.message);
      return;
    }

    setEditingMessage(false);
    await loadEverything();
  }

  const daysSinceMeeting = settings?.start_date ? calculateDDay(settings.start_date) : null;
  const coupleName =
    settings?.couple_name || `${settings?.person1_name ?? ""} ♥ ${settings?.person2_name ?? ""}`;

  return (
    <main className="min-h-screen bg-bg pb-24">
      <div className="mx-auto max-w-md p-4">
        {/* 상단 네비 */}
        <div className="flex items-center justify-between py-2">
          <Link href="/settings" className="text-xl">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          </Link>
          <p className="font-bold text-card-muted">{coupleName}</p>
          <div className="flex gap-3 text-lg">
          </div>
        </div>

        {/* 커스텀 배경 배너 */}
<div
  className="relative mt-3 h-32 overflow-hidden rounded-3xl p-6 text-white shadow-sm"
  style={{
    background:
      "linear-gradient(135deg, var(--color-primary), var(--color-primary-soft))",
  }}
>
  {/* 메시지 */}
  {editingMessage ? (
    <div className="flex h-full items-center justify-center">
      <div className="w-full space-y-2">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="닉네임이나 하고 싶은 말을 적어보세요"
          className="w-full rounded-xl bg-primary p-3 text-sm text-card-mute"
          rows={2}
        />

        <button
          onClick={saveMessage}
          className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-card-mute"
        >
          저장
        </button>
      </div>
    </div>
  ) : (
    <div className="flex h-full items-center justify-center text-center">
      <p className="whitespace-pre-line text-sm font-medium leading-relaxed">
        {settings?.home_message ||
          "닉네임이나 하고 싶은 말을 입력해 커스텀할 수 있어요 ✏️"}
      </p>
    </div>
  )}

  {/* 수정 버튼 */}
  <button
    onClick={() => setEditingMessage((v) => !v)}
    className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 active:scale-95"
    aria-label="메시지 수정"
  >
    <Pencil className="h-3.5 w-3.5" />
  </button>
</div>

        {/* 커플 프로필: 사진 ♡ 사진 / 닉네임  닉네임 */}
        <div className={`${cardStyle} mt-4 p-8`}>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-primary-soft">
                {settings?.person1_image ? (
                  <img
                    src={settings.person1_image}
                    alt={settings.person1_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">🙂</div>
                )}
              </div>
              <p className="mt-3 font-semibold text-card-muted">{settings?.person1_name}</p>
            </div>

            <Heart className="h-9 w-9 text-primary" fill="currentColor" />

            <div className="text-center">
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-primary-soft">
                {settings?.person2_image ? (
                  <img
                    src={settings.person2_image}
                    alt={settings.person2_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">🙂</div>
                )}
              </div>
              <p className="mt-3 font-semibold text-card-muted">{settings?.person2_name}</p>
            </div>
          </div>
        </div>

        {/* D-DAY / 열린 일기 / 동기화 — 아이콘 박스 + 정사각형 구조 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className={`${cardStyle} p-4 text-center`}>
  <div className={iconBoxStyle}><CalendarHeart className="h-6 w-6 text-card-muted" /></div>
  <p className="mt-3 text-xs text-card-muted">함께한 시간</p>
  <p className="mt-1 text-lg font-bold text-card">
    {daysSinceMeeting !== null ? `D+${daysSinceMeeting+1}` : "-"}
  </p>
</div>
<div className={`${cardStyle} p-4 text-center`}>
  <div className={iconBoxStyle}>
    <CalendarDays className="h-6 w-6 text-card-muted" />
  </div>

  <p className="mt-3 text-xs text-card-muted">
    다가오는 일정
  </p>

  <div
    onClick={() => {
  if (nextEvent) {
    router.push(`/calendar?date=${nextEvent.date}`);
  }
}}
    className={nextEvent ? "cursor-pointer" : ""}
  >
    {nextEvent ? (
      <>
        <p className="mt-1 text-lg font-bold text-card">
          {nextEvent.title}
        </p>

    
      </>
    ) : (
      <p className="mt-1 text-lg font-bold text-card">
        예정된 일정 없음
      </p>
    )}
  </div>
</div>


          <div className={`${cardStyle} p-4 text-center`}>
  <div className={iconBoxStyle}><Cloud className="h-6 w-6 text-card-muted" /></div>
  <p className="mt-3 text-xs text-card-muted">동기화</p>
  <p className="mt-1 text-lg font-bold text-card">{connected ? "연결 중" : "끊김"}</p>
          </div>
        </div>

        {/* 기록 둘러보기 — 기존에 마음에 들어하셨던 정사각형 구조 유지 */}
        <div className="mt-4">
          <h2 className="mb-3 font-bold text-card-muted">우리의 기록</h2>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/diary" className={`${cardStyle} group p-4 text-center`}>
              <div className={iconBoxStyle}><BookOpen className="h-6 w-6 text-card-muted" /></div>
              <p className="mt-3 text-xs text-card-muted">일기</p>
              <p className="mt-1 text-s font-bold text-card">{counts.diary}개</p>
            </Link>

            <Link href="/gallery" className={`${cardStyle} group p-4 text-center`}>
              <div className={iconBoxStyle}><Clapperboard className="h-6 w-6 text-card-muted" /></div>
              <p className="mt-3 text-xs text-card-muted">작품</p>
              <p className="mt-1 text-s font-bold text-card">{counts.gallery}개</p>
            </Link>

            <Link href="/music" className={`${cardStyle} group p-4 text-center`}>
              <div className={iconBoxStyle}><Music className="h-6 w-6 text-card-muted" /></div>
              <p className="mt-3 text-xs text-card-muted">음악</p>
              <p className="mt-1 text-s font-bold text-card">{counts.music}곡</p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}