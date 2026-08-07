"use client";

import {
  Button,
  Card,
  Input,
  Textarea,
  PageHeader,
  EmptyState,
} from "@/components";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const workTypes = [
  "영화",
  "드라마",
  "책",
  "게임",
  "공연",
] as const;

type WorkType = "영화" | "드라마" | "책" | "게임" | "공연";

const WORK_TYPES: WorkType[] = ["영화", "드라마", "책", "게임", "공연"];

interface Work {
  id: string;
  title: string;
  type: WorkType;
  rating: number;
  review: string;
  cover_url: string | null;
  created_at: string;
}

export default function GalleryPage() {
  const [type, setType] = useState<WorkType>("영화");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [works, setWorks] = useState<Work[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  const loadWorks = async () => {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("작품 조회 실패", error.message);
      return;
    }

    setWorks(data ?? []);
  };

  const saveWork = async () => {
    if (!title.trim()) return;

   const { error } = await supabase.from("works").insert({
  title,
  type,
  rating,
  review,
  cover_url: coverUrl || null,
});

    if (error) {
      console.log("작품 저장 실패", error.message);
      return;
    }

    setTitle("");
    setReview("");
    setRating(5);
    setType("영화");
    setCoverUrl("");
    await loadWorks();
  };

  const deleteWork = async (id: string) => {
    const confirmDelete = confirm("이 기록을 삭제할까요?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) {
      console.log("삭제 실패", error.message);
      return;
    }
    await loadWorks();
  };

  useEffect(() => {
    loadWorks();
  }, []);

  // ▼ 평균 별점 계산
  const averageRating =
    works.length > 0
      ? (works.reduce((sum, w) => sum + Number(w.rating), 0) / works.length).toFixed(1)
      : "0.0";

  // ▼ 별점을 별 이모지 문자열로 변환 (0.5단위 반영)
  const renderStars = (value: number) => {
    const full = Math.floor(value);
    const hasHalf = value - full >= 0.5;
    return "⭐".repeat(full) + (hasHalf ? "🌟" : "") + ` ${value.toFixed(1)}`;
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader
          emoji="🎬"
          title="함께 본 작품"
          description="영화와 책을 기록해요"
        />

        <div className="mt-2 flex items-center justify-between">
          <p className="text-gray-500">함께 본 영화, 드라마, 책을 기록해 보세요.</p>
          {works.length > 0 && (
            <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-bold border border-gray-200">
              평균 {renderStars(Number(averageRating))}
            </span>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품 제목"
          />
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
          <Input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="표지/포스터 이미지 URL (선택)"
          />
        </div>

        <div className="mt-5">
          <p className="mb-3 font-semibold">작품 종류</p>
          <div className="flex flex-wrap gap-2">
            {WORK_TYPES.map((item) => (
              <button
                key={item}
                onClick={() => setType(item)}
                className={`rounded-full px-4 py-2 border transition ${
                  type === item ? "bg-black text-white" : "bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 font-semibold">별점 {rating.toFixed(1)}</p>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full accent-black"
          />
          <p className="mt-2 text-2xl">{renderStars(rating)}</p>
        </div>

        <div className="mt-6">
          <p className="mb-3 font-semibold">한줄평</p>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="오늘 어땠나요?"
          />
        </div>

        <Button onClick={saveWork}>기록 저장하기</Button>

        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">지난 기록</h2>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setView("grid")}
                className={`rounded-full px-3 py-1 border ${
                  view === "grid" ? "bg-black text-white" : "bg-white"
                }`}
              >
                갤러리
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-full px-3 py-1 border ${
                  view === "list" ? "bg-black text-white" : "bg-white"
                }`}
              >
                목록
              </button>
            </div>
          </div>

          {works.length === 0 ? (
            <EmptyState
              emoji="🎬"
              title="아직 기록이 없어요"
              description="함께 본 작품을 기록해 보세요."
            />
          ) : view === "grid" ? (
            // ▼ 갤러리 그리드 뷰
            <div className="grid grid-cols-2 gap-3">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="aspect-[2/3] w-full bg-gray-100">
                    {work.cover_url ? (
                      <img
                        src={work.cover_url}
                        alt={work.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        🎬
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate font-bold text-sm">{work.title}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {renderStars(Number(work.rating))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ▼ 기존 목록 뷰
            works.map((work) => (
              <Card key={work.id}>
                <div className="flex justify-between">
                  <h3 className="font-bold">{work.title}</h3>
                  <span>{work.type}</span>
                </div>

                <p className="mt-2">{renderStars(Number(work.rating))}</p>

                <p className="mt-2 text-gray-600">{work.review}</p>

                <p className="mt-4 text-sm text-gray-400">
                  {new Date(work.created_at).toLocaleDateString()}
                </p>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => deleteWork(work.id)}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                  >
                    삭제
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}