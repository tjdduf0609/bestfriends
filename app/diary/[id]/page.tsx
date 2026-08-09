"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BackHeader } from "@/components/BackHeader";
import { EntryInteractions } from "@/components/EntryInteractions";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { User, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Diary = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

const cardStyle = "rounded-3xl bg-white shadow-sm";

export default function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMyName(localStorage.getItem("myName"));

    async function loadDiary() {
      const { id } = await params;

      const { data, error } = await supabase
        .from("diaries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("Supabase error:", error);
        setLoading(false);
        return;
      }

      setDiary(data);
      setLoading(false);
    }

    loadDiary();
  }, [params]);

  const deleteDiary = async () => {
    if (!confirm("이 기록을 삭제할까요?")) return;

    const { error } = await supabase.from("diaries").delete().eq("id", diary?.id);

    if (error) {
      console.log(error.message);
      return;
    }

    router.push("/diary");
  };

  if (loading) {
    return <div className="p-6 text-text">불러오는 중...</div>;
  }

  if (!diary) {
    return <div className="p-6 text-text">일기를 찾을 수 없습니다.</div>;
  }

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="일기" />

        <div className={`${cardStyle} mt-4 p-6`}>
          <h1 className="text-2xl font-bold text-card">{diary.title}</h1>

          <div className="mt-2 flex items-center gap-1 text-sm text-card-muted">
            <User className="h-4 w-4" /> {diary.author}
          </div>

          <div className="mt-6 whitespace-pre-wrap text-card">{diary.content}</div>

          <div className="mt-6 flex items-center gap-1 text-xs text-card-muted">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(diary.created_at).toLocaleDateString()}
          </div>

          <EntryInteractions type="diary" entryId={diary.id} myName={myName} />

          <div className="mt-8 flex gap-3">
            <button
onClick={() => router.push(`/diary/new?edit=${diary.id}`)}
              style={pillButtonStyle(false)}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
            >
              수정
            </button>

            <button
              onClick={deleteDiary}
              style={pillButtonStyle(true)}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
 <BottomNav />
    </main>
  );
}