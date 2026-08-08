"use client";

import { BackHeader } from "@/components/BackHeader";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bookmark, ImageIcon, FolderUp, Link2, Clapperboard, Star } from "lucide-react";

type WorkType = "영화" | "드라마" | "책" | "게임" | "공연";
const WORK_TYPES: WorkType[] = ["영화", "드라마", "책", "게임", "공연"];

const cardStyle = "rounded-3xl bg-surface shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

interface Work {
  id: string;
  title: string;
  type: WorkType;
  rating: number;
  review: string;
  cover_url: string | null;
  created_at: string;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className="h-4 w-4 text-primary"
            fill={value >= n ? "currentColor" : value >= n - 0.5 ? "currentColor" : "none"}
            fillOpacity={value >= n ? 1 : value >= n - 0.5 ? 0.5 : 0}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">{value.toFixed(1)}</span>
    </div>
  );
}

export default function GalleryPage() {
  const [type, setType] = useState<WorkType>("영화");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [works, setWorks] = useState<Work[]>([]);
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

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
    if (!confirm("이 기록을 삭제할까요?")) return;
    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) {
      console.log("삭제 실패", error.message);
      return;
    }
    await loadWorks();
  };

  const uploadCoverFile = async (file: File) => {
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("covers").upload(fileName, file);

    if (error) {
      alert("업로드 실패: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
    setCoverUrl(data.publicUrl);
    setUploading(false);
  };

  useEffect(() => {
    loadWorks();
  }, []);

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="본 작품 기록" />

        <div className={`${cardStyle} mt-4 p-5`}>
          <div className="mb-4 flex items-center gap-2 font-bold text-text">
            <Bookmark className="h-5 w-5 text-primary" /> 새로운 작품 기록
          </div>

          <p className="mb-1 text-xs font-semibold text-text-muted">작품 제목</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품 제목을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-text-muted">포스터 / 표지</p>

          <div className="mb-2 flex gap-2">
            <button
              onClick={() => setCoverMode("upload")}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold ${
                coverMode === "upload" ? "bg-primary text-white" : "bg-primary-soft text-text"
              }`}
            >
              <FolderUp className="h-3.5 w-3.5" /> 파일 업로드
            </button>
            <button
              onClick={() => setCoverMode("url")}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold ${
                coverMode === "url" ? "bg-primary text-white" : "bg-primary-soft text-text"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" /> URL 입력
            </button>
          </div>

          <div className="mb-4 rounded-xl border-2 border-dashed border-border p-6 text-center">
            {coverUrl ? (
              <img src={coverUrl} className="mx-auto mb-2 h-32 rounded-lg object-cover" />
            ) : (
              <ImageIcon className="mx-auto mb-2 h-8 w-8 text-text-muted" strokeWidth={1.5} />
            )}

            {coverMode === "upload" ? (
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCoverFile(file);
                }}
                className="w-full text-xs text-text-muted"
              />
            ) : (
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="이미지 URL 입력"
                className="w-full bg-transparent text-center text-xs text-text-muted outline-none"
              />
            )}

            {uploading && <p className="mt-2 text-xs text-text-muted">업로드 중...</p>}
          </div>

          <p className="mb-1 text-xs font-semibold text-text-muted">작품 종류</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WorkType)}
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          >
            {WORK_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="mb-1 text-xs font-semibold text-text-muted">별점 {rating.toFixed(1)}</p>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mb-4 mt-1">
            <StarRating value={rating} />
          </div>

          <p className="mb-1 text-xs font-semibold text-text-muted">한 줄 평</p>
          <input
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="한 줄 평을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />

          <button onClick={saveWork} className={gradientButton} style={gradientStyle}>
            저장하기
          </button>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-bold text-text">지난 기록</h2>

          {works.length === 0 ? (
            <EmptyState
              icon={Clapperboard}
              title="아직 기록이 없어요"
              description="함께 본 작품을 기록해 보세요."
            />
          ) : (
            <div className="space-y-3">
              {works.map((work) => (
                <div key={work.id} className={`${cardStyle} flex gap-3 p-3`}>
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                    {work.cover_url ? (
                      <img
                        src={work.cover_url}
                        alt={work.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Clapperboard className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-text">{work.title}</h3>
                      <button
                        onClick={() => deleteWork(work.id)}
                        className="text-xs text-text-muted"
                      >
                        삭제
                      </button>
                    </div>
                    <p className="text-xs text-text-muted">{work.type}</p>
                    <div className="mt-1">
                      <StarRating value={Number(work.rating)} />
                    </div>
                    <p className="mt-1 text-xs text-text-muted line-clamp-1">{work.review}</p>
                    <p className="mt-1 text-[10px] text-text-muted">
                      {new Date(work.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}