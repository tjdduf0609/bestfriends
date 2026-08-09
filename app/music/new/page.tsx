"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BackHeader } from "@/components/BackHeader";
import { supabase } from "@/lib/supabase";
import { Music } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

function NewMusicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!editId) return;

    async function loadMusic() {
      const { data, error } = await supabase.from("music").select("*").eq("id", editId).single();
      if (error) {
        console.log(error.message);
        return;
      }
      setTitle(data.title);
      setArtist(data.artist);
      setYoutubeUrl(data.youtube_url ?? "");
      setReview(data.review ?? "");
    }

    loadMusic();
  }, [editId]);

  async function saveMusic() {
    if (!title.trim()) return;

    const payload = { title, artist, youtube_url: youtubeUrl, review };

    const { error } = editId
      ? await supabase.from("music").update(payload).eq("id", editId)
      : await supabase.from("music").insert(payload);

    if (error) {
      console.log("저장 실패", error.message);
      return;
    }

    router.push(editId ? `/music/${editId}` : "/music");
  }

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title={editId ? "음악 수정" : "새로운 음악 기록"} />

        <div className={`${cardStyle} mt-4 p-5`}>
          <div className="mb-4 flex items-center gap-2 font-bold text-card">
            <Music className="h-5 w-5 text-primary" /> {editId ? "음악 수정" : "새로운 음악 기록"}
          </div>

          <p className="mb-1 text-xs font-semibold text-card-muted">노래 제목</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="노래 제목을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-card-muted">가수 이름</p>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="가수 이름을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-card-muted">YouTube URL</p>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-card-muted">한 줄 평 (선택)</p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="노래에 대한 감상을 적어보세요"
            className="mb-4 h-20 w-full resize-none rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
          />

          <button onClick={saveMusic} className={gradientButton} style={gradientStyle}>
            {editId ? "수정 저장하기" : "저장하기"}
          </button>
        </div>
      </div>
 <BottomNav />
    </main>
  );
}

export default function NewMusicPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewMusicForm />
    </Suspense>
  );
}