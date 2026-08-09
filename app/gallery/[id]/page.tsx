"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BackHeader } from "@/components/BackHeader";
import { EntryInteractions } from "@/components/EntryInteractions";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Star, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4 text-primary"
          fill={value >= n - 0.5 ? "currentColor" : "none"}
        />
      ))}
      <span className="text-xs text-card-muted">{value.toFixed(1)}</span>
    </div>
  );
}

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMyName(localStorage.getItem("myName"));

    async function loadWork() {
      const { id } = await params;
      const { data, error } = await supabase.from("works").select("*").eq("id", id).single();

      if (error) {
        console.log(error.message);
        setLoading(false);
        return;
      }

      setWork(data);
      setLoading(false);
    }

    loadWork();
  }, [params]);

  const deleteWork = async () => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    const { error } = await supabase.from("works").delete().eq("id", work.id);
    if (error) {
      console.log(error.message);
      return;
    }
    router.push("/gallery");
  };

  if (loading) return <div className="p-6 text-text">불러오는 중...</div>;
  if (!work) return <div className="p-6 text-text">작품을 찾을 수 없습니다.</div>;

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="작품 기록" />

        <div className={`${cardStyle} mt-4 overflow-hidden`}>
          {work.cover_url && (
            <img src={work.cover_url} alt={work.title} className="h-64 w-full object-cover" />
          )}

          <div className="p-6">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-card-muted">
              {work.type}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-card">{work.title}</h1>

            <div className="mt-2">
              <StarRating value={Number(work.rating)} />
            </div>

            <p className="mt-4 whitespace-pre-wrap text-card">{work.review}</p>

            <div className="mt-6 flex items-center gap-1 text-xs text-card-muted">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(work.created_at).toLocaleDateString()}
            </div>

            <EntryInteractions type="work" entryId={work.id} myName={myName} />

            <div className="mt-6 flex gap-3">
  <button
    onClick={() => router.push(`/gallery/new?edit=${work.id}`)}
    style={pillButtonStyle(false)}
    className="flex-1 rounded-xl py-3 text-sm font-bold"
  >
    수정
  </button>
  <button
    onClick={deleteWork}
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