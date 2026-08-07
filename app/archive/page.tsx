"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, Card, EmptyState, Button } from "@/components";

interface ArchiveItem {
  id: string;
  title: string | null;
  media_type: "image" | "video";
  file_url: string;
  uploader: string | null;
  created_at: string;
}

const BUCKET_NAME = "profiles"; // ▼ 실제 bucket 이름과 다르면 여기만 바꾸세요

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [myName, setMyName] = useState<string | null>(null);

  useEffect(() => {
    setMyName(localStorage.getItem("myName"));
    loadItems();
  }, []);

  async function loadItems() {
    const { data, error } = await supabase
      .from("archive_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("아카이브 조회 실패", error.message);
      return;
    }

    setItems(data ?? []);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) {
      console.log("업로드 실패", uploadError.message);
      alert("업로드에 실패했어요. bucket 이름이나 용량 제한을 확인해주세요.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("archive_items").insert({
      title: title || null,
      media_type: isVideo ? "video" : "image",
      file_url: publicUrlData.publicUrl,
      uploader: myName,
    });

    if (insertError) {
      console.log("저장 실패", insertError.message);
    }

    setTitle("");
    setUploading(false);
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
    await loadItems();
  }

  async function deleteItem(item: ArchiveItem) {
    const confirmDelete = confirm("이 기록을 삭제할까요?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("archive_items").delete().eq("id", item.id);
    if (error) {
      console.log("삭제 실패", error.message);
      return;
    }

    await loadItems();
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader
          emoji="🖼️"
          title="아카이브"
          description="사진과 영상을 모아둬요"
        />

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (선택)"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none"
          />

          <label className="block">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="w-full text-sm"
            />
          </label>

          {uploading && (
            <p className="text-sm text-gray-400">업로드 중이에요...</p>
          )}
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold">모아둔 기록</h2>

          {items.length === 0 ? (
            <EmptyState
              emoji="🖼️"
              title="아직 아카이브가 비어있어요"
              description="함께 찍은 사진이나 영상을 올려보세요."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="aspect-square w-full bg-gray-100">
                    {item.media_type === "video" ? (
                      <video
                        src={item.file_url}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={item.file_url}
                        alt={item.title ?? ""}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-2">
                    {item.title && (
                      <p className="truncate text-xs font-bold">{item.title}</p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        {item.uploader ?? ""}
                      </span>
                      <button
                        onClick={() => deleteItem(item)}
                        className="text-[10px] text-gray-300"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}