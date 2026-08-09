"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BackHeader } from "@/components/BackHeader";
import { EntryInteractions } from "@/components/EntryInteractions";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Star, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-card-muted">아직 평가 안 함</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className="h-4 w-4 text-primary" fill={value >= n - 0.5 ? "currentColor" : "none"} />
      ))}
      <span className="text-xs text-card-muted">{value.toFixed(1)}</span>
    </div>
  );
}

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [work, setWork] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState<string | null>(null);
  const [myRating, setMyRating] = useState(5);
  const [myReview, setMyReview] = useState("");
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("myName");
    setMyName(name);

    async function load() {
      const { id } = await params;
      const { data, error } = await supabase.from("works").select("*").eq("id", id).single();
      const { data: settingsData } = await supabase.from("profileSettings").select("*").eq("id", 1).maybeSingle();

      if (error) {
        console.log(error.message);
        setLoading(false);
        return;
      }

      setWork(data);
      setSettings(settingsData);

      const key = name === settingsData?.person1_name ? "person1" : "person2";
      setMyRating(data[`${key}_rating`] ?? 5);
      setMyReview(data[`${key}_review`] ?? "");

      setLoading(false);
    }

    load();
  }, [params]);

  const myKey: "person1" | "person2" | null =
    myName && settings
      ? myName === settings.person1_name
        ? "person1"
        : myName === settings.person2_name
        ? "person2"
        : null
      : null;

  const saveMyRating = async () => {
    if (!myKey) {
      alert("먼저 '나는 누구인가요'를 선택해주세요.");
      return;
    }

    const { error } = await supabase
      .from("works")
      .update({ [`${myKey}_rating`]: myRating, [`${myKey}_review`]: myReview })
      .eq("id", work.id);

    if (error) {
      console.log(error.message);
      return;
    }

    setWork({ ...work, [`${myKey}_rating`]: myRating, [`${myKey}_review`]: myReview });
  };

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
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl md:max-w-2xl lg:max-w-4xl">
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

            {work.author && (
              <p className="mt-1 flex items-center gap-1 text-xs text-card-muted">
                <User className="h-3.5 w-3.5" /> {work.author}이 처음 등록함
              </p>
            )}

            {/* 두 사람 평가 비교 */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-primary-soft/30 p-3">
                <p className="mb-1 text-xs font-bold text-card-muted">{settings?.person1_name}</p>
                <StarRating value={work.person1_rating !== null ? Number(work.person1_rating) : null} />
                {work.person1_review && <p className="mt-1 text-xs text-card">{work.person1_review}</p>}
              </div>
              <div className="rounded-2xl bg-primary-soft/30 p-3">
                <p className="mb-1 text-xs font-bold text-card-muted">{settings?.person2_name}</p>
                <StarRating value={work.person2_rating !== null ? Number(work.person2_rating) : null} />
                {work.person2_review && <p className="mt-1 text-xs text-card">{work.person2_review}</p>}
              </div>
            </div>

            {/* 내 평가 입력/수정 */}
            {myKey && (
              <div className="mt-5 rounded-2xl border border-dashed border-border p-4">
                <p className="mb-2 text-xs font-bold text-card-muted">내 별점 수정 ({myName})</p>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={myRating}
                  onChange={(e) => setMyRating(Number(e.target.value))}
                  className="mb-2 w-full accent-primary"
                />
                <p className="mb-2 text-sm text-card">{myRating.toFixed(1)}점</p>
                <input
                  value={myReview}
                  onChange={(e) => setMyReview(e.target.value)}
                  placeholder="한 줄 평을 입력해 주세요"
                  className="mb-3 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
                />
                <button
                  onClick={saveMyRating}
                  style={pillButtonStyle(true)}
                  className="w-full rounded-xl py-2.5 text-sm font-bold"
                >
                  내 평가 저장하기
                </button>
              </div>
            )}

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