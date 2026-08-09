"use client";

import { BackHeader } from "@/components/BackHeader";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Pencil } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

function NewDiaryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [myName, setMyName] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("");

  useEffect(() => {
    setMyName(localStorage.getItem("myName"));
    loadSettings();
    if (editId) loadDiary();
  }, [editId]);

  const selectMyName = (name: string) => {
    localStorage.setItem("myName", name);
    setMyName(name);
  };

  async function loadSettings() {
    const { data, error } = await supabase
      .from("profileSettings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.log("설정 불러오기 실패", error.message);
      return;
    }
    if (data) {
      setPerson1(data.person1_name);
      setPerson2(data.person2_name);
    }
  }

  async function loadDiary() {
    const { data, error } = await supabase.from("diaries").select("*").eq("id", editId).single();
    if (error) {
      console.log(error.message);
      return;
    }
    setTitle(data.title);
    setContent(data.content);
    setEditAuthor(data.author);
  }

  const saveDiary = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (!editId && !myName) {
      alert("먼저 '나는 누구인가요'를 선택해주세요.");
      return;
    }

    const author = editId ? editAuthor : myName;
    const payload = { title, content, author };

    const { error } = editId
      ? await supabase.from("diaries").update(payload).eq("id", editId)
      : await supabase.from("diaries").insert(payload);

    if (error) {
      console.log("저장 실패", error.message);
      return;
    }

    router.push(editId ? `/diary/${editId}` : "/diary");
  };

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title={editId ? "일기 수정" : "오늘의 일기"} />

        {!editId && person1 && person2 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-text">나는 누구인가요?</p>
            <div className="flex gap-2">
              {[person1, person2].map((name) => (
                <button
                  key={name}
                  onClick={() => selectMyName(name)}
                  style={pillButtonStyle(myName === name)}
                  className="rounded-full px-4 py-2 text-xs font-bold transition"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mb-2 mt-6 flex items-center gap-1 font-bold text-text">
          {editId ? "일기 수정하기" : "오늘의 일기 쓰기"} <Pencil className="h-4 w-4" />
        </p>

        <div className={`${cardStyle} p-5`}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-base text-card outline-none"
            placeholder="제목을 입력해 주세요"
          />
        </div>

        <div className={`${cardStyle} mt-3 p-5`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-40 w-full resize-none bg-transparent text-sm text-card outline-none"
            placeholder="오늘 있었던 일을 자유롭게 적어보세요"
          />
        </div>

        <button onClick={saveDiary} className={`${gradientButton} mt-4`} style={gradientStyle}>
          {editId ? "수정 저장하기" : "저장하기"}
        </button>
      </div>
 <BottomNav />
    </main>
  );
}

export default function NewDiaryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewDiaryForm />
    </Suspense>
  );
}