"use client";

import { BackHeader } from "@/components/BackHeader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { BookOpen, User, NotebookText, Plus, Heart, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";

export default function DiaryPage() {
  const router = useRouter();
  const [diaries, setDiaries] = useState<any[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const loadDiaries = async () => {
    const { data, error } = await supabase
      .from("diaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("조회 실패", error.message);
      return;
    }

    setDiaries(data ?? []);

    const { data: likes } = await supabase.from("diary_likes").select("diary_id");
    const { data: comments } = await supabase.from("diary_comments").select("diary_id");

    const likeMap: Record<string, number> = {};
    (likes ?? []).forEach((l: any) => {
      likeMap[l.diary_id] = (likeMap[l.diary_id] ?? 0) + 1;
    });
    setLikeCounts(likeMap);

    const commentMap: Record<string, number> = {};
    (comments ?? []).forEach((c: any) => {
      commentMap[c.diary_id] = (commentMap[c.diary_id] ?? 0) + 1;
    });
    setCommentCounts(commentMap);
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  const formatDiaryDate = (isoString: string) =>
    new Date(isoString).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="교환 일기" />
        <p className="mb-4 text-sm text-text-muted">우리 둘의 이야기를 모아요.</p>

        <button
          onClick={() => router.push("/diary/new")}
          style={pillButtonStyle(true)}
          className="flex w-full items-center justify-center gap-1 rounded-xl py-3 text-sm font-bold"
        >
          <Plus className="h-4 w-4" /> 일기 추가
        </button>

        <section className="mt-8">
          {diaries.length === 0 ? (
            <div className={`${cardStyle} flex flex-col items-center gap-3 p-10 text-center`}>
              <NotebookText className="h-10 w-10 text-primary" strokeWidth={1.5} />
              <p className="text-sm text-card-muted">
                아직 작성된 일기가 없어요
                <br />
                첫 이야기를 남겨보세요 ✨
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {diaries.map((diary) => (
                <div
                  key={diary.id}
                  onClick={() => router.push(`/diary/${diary.id}`)}
                  className={`${cardStyle} cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="flex items-center gap-1 text-base font-bold text-card">
                      <BookOpen className="h-4 w-4 text-primary" /> {diary.title}
                    </h3>
                    <span className="text-xs text-card-muted">{formatDiaryDate(diary.created_at)}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-card-muted">
                    <User className="h-3.5 w-3.5" /> {diary.author}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-card-muted">{diary.content}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-card-muted">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" /> {likeCounts[diary.id] ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" /> {commentCounts[diary.id] ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}