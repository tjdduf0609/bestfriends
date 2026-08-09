"use client";

import { BackHeader } from "@/components/BackHeader";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Bookmark, ImageIcon, FolderUp, Link2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type WorkType = "영화" | "드라마" | "책" | "게임" | "공연";
const WORK_TYPES: WorkType[] = ["영화", "드라마", "책", "게임", "공연"];

const cardStyle = "rounded-3xl bg-white shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

function NewWorkForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [type, setType] = useState<WorkType>("영화");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const [myKey, setMyKey] = useState<"person1" | "person2" | null>(null);
  const [myName, setMyName] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const name = localStorage.getItem("myName");
      setMyName(name);

      const { data } = await supabase.from("profileSettings").select("*").eq("id", 1).maybeSingle();
      if (data && name) {
        setMyKey(name === data.person1_name ? "person1" : name === data.person2_name ? "person2" : null);
      }

      if (editId) {
        const { data: work, error } = await supabase.from("works").select("*").eq("id", editId).single();
        if (error) {
          console.log(error.message);
          return;
        }
        setTitle(work.title);
        setType(work.type);
        setCoverUrl(work.cover_url ?? "");

        const key = name === data?.person1_name ? "person1" : "person2";
        setRating(work[`${key}_rating`] ?? 5);
        setReview(work[`${key}_review`] ?? "");
      }
    }
    init();
  }, [editId]);

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

  const saveWork = async () => {
    if (!title.trim()) return;
    if (!myKey) {
      alert("먼저 '나는 누구인가요'를 선택해주세요 (일기 페이지에서 선택할 수 있어요).");
      return;
    }

    const ratingField = `${myKey}_rating`;
    const reviewField = `${myKey}_review`;

    const payload: any = {
      title,
      type,
      cover_url: coverUrl || null,
      [ratingField]: rating,
      [reviewField]: review,
    };

    if (!editId) payload.author = myName;

    const { error } = editId
      ? await supabase.from("works").update(payload).eq("id", editId)
      : await supabase.from("works").insert(payload);

    if (error) {
      console.log("작품 저장 실패", error.message);
      return;
    }

    router.push(editId ? `/gallery/${editId}` : "/gallery");
  };

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl md:max-w-2xl lg:max-w-4xl">
        <BackHeader title={editId ? "작품 수정" : "새로운 작품 기록"} />

        <div className={`${cardStyle} mt-4 p-5`}>
          <div className="mb-4 flex items-center gap-2 font-bold text-card">
            <Bookmark className="h-5 w-5 text-primary" /> {editId ? "작품 수정" : "새로운 작품 기록"}
          </div>

          <p className="mb-1 text-xs font-semibold text-card-muted">작품 제목</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품 제목을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
          />

          <p className="mb-1 text-xs font-semibold text-card-muted">포스터 / 표지</p>
          <div className="mb-2 flex gap-2">
            <button
              onClick={() => setCoverMode("upload")}
              style={pillButtonStyle(coverMode === "upload")}
              className="flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold"
            >
              <FolderUp className="h-3.5 w-3.5" /> 파일 업로드
            </button>
            <button
              onClick={() => setCoverMode("url")}
              style={pillButtonStyle(coverMode === "url")}
              className="flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold"
            >
              <Link2 className="h-3.5 w-3.5" /> URL 입력
            </button>
          </div>

          <div className="mb-4 rounded-xl border-2 border-dashed border-border p-6 text-center">
            {coverUrl ? (
              <img src={coverUrl} className="mx-auto mb-2 h-32 rounded-lg object-cover" />
            ) : (
              <ImageIcon className="mx-auto mb-2 h-8 w-8 text-card-muted" strokeWidth={1.5} />
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
                className="w-full text-xs text-card-muted"
              />
            ) : (
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="이미지 URL 입력"
                className="w-full bg-transparent text-center text-xs text-card-muted outline-none"
              />
            )}
            {uploading && <p className="mt-2 text-xs text-card-muted">업로드 중...</p>}
          </div>

          <p className="mb-1 text-xs font-semibold text-card-muted">작품 종류</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {WORK_TYPES.map((item) => (
              <button
                key={item}
                onClick={() => setType(item)}
                style={pillButtonStyle(type === item)}
                className="rounded-full px-4 py-2 text-sm font-bold transition"
              >
                {item}
              </button>
            ))}
          </div>

          <p className="mb-1 text-xs font-semibold text-card-muted">
            내 별점 {myName ? `(${myName})` : ""} {rating.toFixed(1)}
          </p>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mb-4 w-full accent-primary"
          />

          <p className="mb-1 text-xs font-semibold text-card-muted">내 한 줄 평</p>
          <input
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="한 줄 평을 입력해 주세요"
            className="mb-4 w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-card outline-none"
          />

          <button onClick={saveWork} className={gradientButton} style={gradientStyle}>
            {editId ? "수정 저장하기" : "저장하기"}
          </button>
        </div>
      </div>
 <BottomNav />
    </main>
  );
}

export default function NewWorkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewWorkForm />
    </Suspense>
  );
}