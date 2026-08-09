"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/BackHeader";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Music, Plus, Heart, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";

function getYoutubeThumbnail(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function MusicPage() {
  const router = useRouter();
  const [musicList, setMusicList] = useState<any[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

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

    const { data: likes } = await supabase.from("music_likes").select("music_id");
    const { data: comments } = await supabase.from("music_comments").select("music_id");

    const likeMap: Record<string, number> = {};
    (likes ?? []).forEach((l: any) => {
      likeMap[l.music_id] = (likeMap[l.music_id] ?? 0) + 1;
    });
    setLikeCounts(likeMap);

    const commentMap: Record<string, number> = {};
    (comments ?? []).forEach((c: any) => {
      commentMap[c.music_id] = (commentMap[c.music_id] ?? 0) + 1;
    });
    setCommentCounts(commentMap);
  }

  useEffect(() => {
    loadMusic();
  }, []);

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="음악" />
        <p className="mb-4 text-sm text-text-muted">함께 들은 노래</p>

        <button
          onClick={() => router.push("/music/new")}
          style={pillButtonStyle(true)}
          className="flex w-full items-center justify-center gap-1 rounded-xl py-3 text-sm font-bold"
        >
          <Plus className="h-4 w-4" /> 음악 추가
        </button>

        <section className="mt-8">
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
                  <div
                    key={music.id}
                    onClick={() => router.push(`/music/${music.id}`)}
                    className={`${cardStyle} flex cursor-pointer gap-3 p-3`}
                  >
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
                      <h3 className="font-bold text-card">{music.title}</h3>
                      <p className="text-xs text-card-muted">{music.artist}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-card-muted">
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" /> {likeCounts[music.id] ?? 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="h-3 w-3" /> {commentCounts[music.id] ?? 0}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-card-muted">
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
 <BottomNav />
    </main>
  );
}