"use client";

import { Menu, Search, Bell, Palette, Pencil, Heart, CalendarHeart, Unlock, Cloud, BookOpen, Clapperboard, Archive } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

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
  const [counts, setCounts] = useState({ diary: 0, gallery: 0, archive: 0 });
  const [editingMessage, setEditingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");

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

    const { data: archiveItems } = await supabase.from("archive_items").select("id");
    setCounts((c) => ({ ...c, archive: archiveItems?.length ?? 0 }));
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
            ☰
          </Link>
          <p className="font-bold text-text">{coupleName}</p>
          <div className="flex gap-3 text-lg">
          </div>
        </div>

        {/* 커스텀 배경 배너 */}
        <div
          className="mt-3 rounded-3xl p-6 text-white relative overflow-hidden shadow-sm"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-soft))",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
  <Palette className="h-3.5 w-3.5" /> 배경
</span>
<button onClick={() => setEditingMessage((v) => !v)} className="rounded-full bg-white/20 p-2">
  <Pencil className="h-4 w-4" />
</button>
          </div>

          {editingMessage ? (
            <div className="mt-4 space-y-2">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="닉네임이나 하고 싶은 말을 적어보세요"
                className="w-full rounded-xl bg-white/90 p-3 text-sm text-text outline-none"
                rows={2}
              />
              <button
                onClick={saveMessage}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary"
              >
                저장
              </button>
            </div>
          ) : (
            <p className="mt-4 whitespace-pre-line text-sm font-medium leading-relaxed">
              {settings?.home_message || "닉네임이나 하고 싶은 말을 입력해 커스텀할 수 있어요 ✏️"}
            </p>
          )}
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
              <p className="mt-3 font-semibold text-text">{settings?.person1_name}</p>
            </div>

            <Heart className="h-9 w-9 text-primary animate-pulse" fill="currentColor" />

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
              <p className="mt-3 font-semibold text-text">{settings?.person2_name}</p>
            </div>
          </div>
        </div>

        {/* D-DAY / 열린 일기 / 동기화 — 아이콘 박스 + 정사각형 구조 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className={`${cardStyle} p-4 text-center`}>
            <div className={iconBoxStyle}><CalendarHeart className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-xs text-text-muted">함께한 시간</p>
            <p className="mt-1 text-lg font-bold text-text">
              {daysSinceMeeting !== null ? `D+${daysSinceMeeting}` : "-"}
            </p>
          </div>

          <div className={`${cardStyle} p-4 text-center`}>
            <div className={iconBoxStyle}><Unlock className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-xs text-text-muted">열린 일기</p>
            <p className="mt-1 text-lg font-bold text-text">{openedCount}쌍</p>
          </div>

          <div className={`${cardStyle} p-4 text-center`}>
            <div className={iconBoxStyle}><Cloud className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-xs text-text-muted">동기화</p>
            <p className="mt-1 text-lg font-bold text-text">{connected ? "연결됨" : "끊김"}</p>
          </div>
        </div>

        {/* 기록 둘러보기 — 기존에 마음에 들어하셨던 정사각형 구조 유지 */}
        <div className="mt-8">
          <h2 className="mb-3 font-bold text-text">기록 둘러보기</h2>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/diary" className={`${cardStyle} group p-4 text-center`}>
              <div className={iconBoxStyle}><BookOpen className="h-6 w-6 text-primary" /></div>
              <p className="mt-3 text-sm font-bold text-text">서재</p>
              <p className="text-xs text-text-muted">{counts.diary}개</p>
            </Link>

            <Link href="/gallery" className={`${cardStyle} group p-4 text-center`}>
              <div className={iconBoxStyle}><Clapperboard className="h-6 w-6 text-primary" /></div>
              <p className="mt-3 text-sm font-bold text-text">시네마</p>
              <p className="text-xs text-text-muted">{counts.gallery}개</p>
            </Link>

            <Link href="/archive" className={`${cardStyle} group p-4 text-center`}>
              <div className={iconBoxStyle}><Archive className="h-6 w-6 text-primary" /></div>
              <p className="mt-3 text-sm font-bold text-text">아카이브</p>
              <p className="text-xs text-text-muted">{counts.archive}개</p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}