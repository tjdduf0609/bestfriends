"use client";

import { useEffect, useState } from "react";
import { BackHeader } from "@/components/BackHeader";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { Music, Link2 } from "lucide-react";

const cardStyle = "rounded-3xl bg-surface shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

function getYoutubeThumbnail(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function MusicPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [review, setReview] = useState("");
  const [musicList, setMusicList] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadMusic();
  }, []);

  async function loadMusic() {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }
    setMusicList(data ?? []);
  }

  async function saveMusic() {
    if (!title.trim()) return;

    if (editId) {
      await supabase
        .from("music")
        .update({ title, artist, youtube_url: youtubeUrl, review })
        .eq("id", editId);
    } else {
      await supabase.from("music").insert({ title, artist, youtube_url: youtubeUrl, review });
    }

    resetForm();
    loadMusic();
  }

  function resetForm() {
    setTitle("");
    setArtist("");
    setYoutubeUrl("");
    setReview("");
    setEditId(null);
  }

  function editMusic(item: any) {
    setTitle(item.title);
    setArtist(item.artist);
    setYoutubeUrl(item.youtube_url ?? "");
    setReview(item.review);
    setEditId(item.id);
  }

  async function deleteMusic(id: number) {
    await supabase.from("music").delete().eq("id", id);
    loadMusic();
  }

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="음악" />

        <div className={cardStyle + " mt-4 p-5"}>
          <div className="mb-4 flex items-center gap-2 font-bold text-text">
            <Music className="h-5 w-5 text-primary" />
            <span>새로운 음악 기록</span>
          </div>

          <p className="mb-1 text-xs font-semibold text-text-muted">노래 제목</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="노래 제목을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-text-muted">가수 이름</p>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="가수 이름을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-text-muted">YouTube URL</p>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-text-muted">한 줄 평 (선택)</p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="노래에 대한 감상을 적어보세요"
            className="mb-4 h-20 w-full resize-none rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />

          <button onClick={saveMusic} className={gradientButton} style={gradientStyle}>
            {editId ? "수정하기" : "저장하기"}
          </button>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-bold text-text">지난 음악</h2>

          {musicList.length === 0 ? (
            <EmptyState
              icon={Music}
              title="아직 음악이 없어요"
              description="함께 들은 음악을 기록해 보세요."
            />
          ) : (
            <div className="space-y-3">
              {musicList.map((music) => {
                const thumb = music.youtube_url ? getYoutubeThumbnail(music.youtube_url) : null;

                return (
                  <div key={music.id} className={cardStyle + " flex gap-3 p-3"}>
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                      {thumb ? (
                        <img src={thumb} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-text">{music.title}</h3>
                        <div className="flex gap-2 text-xs text-text-muted">
                          <button onClick={() => editMusic(music)}>수정</button>
                          <button onClick={() => deleteMusic(music.id)}>삭제</button>
                        </div>
                      </div>

                      <p className="text-xs text-text-muted">{music.artist}</p>

{music.youtube_url ? (
  <a
    href={music.youtube_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 text-xs text-primary"
  >
    <Link2 className="h-3 w-3" />
    <span>링크 열기</span>
  </a>
) : null}

{music.review ? (
  <p className="mt-1 text-xs text-text-muted line-clamp-1">
    {music.review}
  </p>
) : null}

<p className="mt-1 text-[10px] text-text-muted">
  {new Date(music.created_at).toLocaleDateString()}
</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}