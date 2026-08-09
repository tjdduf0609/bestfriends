"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BackHeader } from "@/components/BackHeader";
import { EntryInteractions } from "@/components/EntryInteractions";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Link2, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";

function getYoutubeThumbnail(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function MusicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [music, setMusic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMyName(localStorage.getItem("myName"));

    async function loadMusic() {
      const { id } = await params;
      const { data, error } = await supabase.from("music").select("*").eq("id", id).single();

      if (error) {
        console.log(error.message);
        setLoading(false);
        return;
      }

      setMusic(data);
      setLoading(false);
    }

    loadMusic();
  }, [params]);

  const deleteMusic = async () => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    const { error } = await supabase.from("music").delete().eq("id", music.id);
    if (error) {
      console.log(error.message);
      return;
    }
    router.push("/music");
  };

  if (loading) return <div className="p-6 text-text">불러오는 중...</div>;
  if (!music) return <div className="p-6 text-text">음악을 찾을 수 없습니다.</div>;

  const thumb = music.youtube_url ? getYoutubeThumbnail(music.youtube_url) : null;

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl md:max-w-2xl lg:max-w-4xl">
        <BackHeader title="음악 기록" />

        <div className={`${cardStyle} mt-4 overflow-hidden`}>
          {thumb && <img src={thumb} alt={music.title} className="h-64 w-full object-cover" />}

          <div className="p-6">
            <h1 className="text-2xl font-bold text-card">{music.title}</h1>
            <p className="mt-1 text-sm text-card-muted">{music.artist}</p>
{music.author && <p className="mt-1 text-xs text-card-muted">{music.author}이 등록함</p>}

            {music.youtube_url && (
              <a
    href={music.youtube_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 text-xs text-primary"
  >
                <Link2 className="h-4 w-4" /> YouTube에서 열기
              </a>
            )}

            {music.review && <p className="mt-4 whitespace-pre-wrap text-card">{music.review}</p>}

            <div className="mt-6 flex items-center gap-1 text-xs text-card-muted">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(music.created_at).toLocaleDateString()}
            </div>

            <EntryInteractions type="music" entryId={music.id} myName={myName} />

<div className="mt-6 flex gap-3">
            <button
                onClick={() => router.push(`/music/new?edit=${music.id}`)}
                style={pillButtonStyle(false)}
                className="flex-1 rounded-xl py-3 text-sm font-bold"
              >
                수정
              </button>

            <button
              onClick={deleteMusic}
              style={pillButtonStyle(true)}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
            >
              삭제
            </button>
          </div>
          </div>
        </div>
      </div>
 <BottomNav />
    </main>
  );
}