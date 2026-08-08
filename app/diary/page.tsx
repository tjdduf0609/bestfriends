"use client";

import { DiaryInteractions } from "@/components/DiaryInteractions";
import { BackHeader } from "@/components/BackHeader";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Heart, Pencil, BookOpen, User, Lock, NotebookText } from "lucide-react";

const cardStyle = "rounded-3xl bg-surface shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

function DiaryContent() {
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  const [writer, setWriter] = useState("");
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [diaries, setDiaries] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("myName");
    if (saved) setMyName(saved);
  }, []);

  const selectMyName = (name: string) => {
    localStorage.setItem("myName", name);
    setMyName(name);
  };

  const loadSettings = async () => {
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
      if (!writer) setWriter(data.person1_name);
    }
  };

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
  };

  const editDiary = (diary: any) => {
    setEditId(diary.id);
    setTitle(diary.title);
    setContent(diary.content);
    setWriter(diary.author);
  };

  const loadEditDiary = async () => {
    if (!editParam) return;

    const { data, error } = await supabase
      .from("diaries")
      .select("*")
      .eq("id", editParam)
      .single();

    if (error) {
      console.log(error.message);
      return;
    }

    setEditId(data.id);
    setTitle(data.title);
    setContent(data.content);
    setWriter(data.author);
  };

  const deleteDiary = async (id: string) => {
    if (!confirm("이 기록을 삭제할까요?")) return;

    const { error } = await supabase.from("diaries").delete().eq("id", id);

    if (error) {
      console.log("삭제 실패", error.message);
      return;
    }

    await loadDiaries();
  };

  const saveDiary = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    let error;

    if (editId) {
      const result = await supabase
        .from("diaries")
        .update({ title, content, author: writer })
        .eq("id", editId);
      error = result.error;
    } else {
      const result = await supabase
        .from("diaries")
        .insert({ title, content, author: writer });
      error = result.error;
    }

    if (error) {
      console.log("저장 실패", error.message);
      return;
    }

    await loadDiaries();
    setTitle("");
    setContent("");
    setEditId(null);
  };

  useEffect(() => {
    loadSettings();
    loadDiaries();
    loadEditDiary();
  }, [editParam]);

  const diariesWithLock = (() => {
    if (!myName) return diaries.map((d) => ({ ...d, unlocked: true }));

    const myCount = diaries.filter((d) => d.author === myName).length;

    const partnerAscending = diaries
      .filter((d) => d.author !== myName)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const orderMap = new Map<string, number>();
    partnerAscending.forEach((d, i) => orderMap.set(d.id, i + 1));

    return diaries.map((d) => {
      if (d.author === myName) return { ...d, unlocked: true };
      const order = orderMap.get(d.id) ?? Infinity;
      return { ...d, unlocked: myCount >= order };
    });
  })();

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

        <div className={`${cardStyle} mt-4 flex items-center gap-3 bg-primary-soft p-4`}>
<Heart className="h-6 w-6 shrink-0 text-primary" fill="currentColor" />
          <p className="text-sm text-text">
            상대방이 오늘의 일기를 작성해야
            <br />내 일기를 볼 수 있어요
          </p>
        </div>

        {person1 && person2 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-text">나는 누구인가요?</p>
            <div className="flex gap-2">
              {[person1, person2].map((name) => (
                <button
                  key={name}
                  onClick={() => selectMyName(name)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    myName === name ? "bg-primary text-white" : "bg-primary-soft text-text"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mb-2 mt-6 flex items-center gap-1 font-bold text-text">
          오늘의 일기 쓰기 <Pencil className="h-4 w-4" />
        </p>

        <div className={`${cardStyle} p-5`}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-base text-text outline-none"
            placeholder="제목을 입력해 주세요"
          />
        </div>

        <div className={`${cardStyle} mt-3 p-5`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-40 w-full resize-none bg-transparent text-sm text-text outline-none"
            placeholder="오늘 있었던 일을 자유롭게 적어보세요"
          />
        </div>

        <button onClick={saveDiary} className={`${gradientButton} mt-4`} style={gradientStyle}>
          {editId ? "기록 수정하기" : "저장하기"}
        </button>

        <section className="mt-10">
          <h2 className="mb-3 font-bold text-text">지난 일기</h2>

          {diariesWithLock.length === 0 ? (
            <div className={`${cardStyle} flex flex-col items-center gap-3 p-10 text-center`}>
              <NotebookText className="h-10 w-10 text-primary" strokeWidth={1.5} />
              <p className="text-sm text-text-muted">
                상대방이 일기를 작성하면
                <br />
                이곳에서 함께 볼 수 있어요
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {diariesWithLock.map((diary) =>
                !diary.unlocked ? (
                  <div key={diary.id} className={`${cardStyle} flex items-center justify-center gap-2 bg-primary-soft p-5`}>
                    <Lock className="h-4 w-4 text-text-muted" />
                    <p className="text-sm text-text-muted">아직 잠겨있어요</p>
                  </div>
                ) : (
                  <div
                    key={diary.id}
                    className={`${cardStyle} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <Link href={`/diary/${diary.id}`}>
                      <div className="flex items-start justify-between">
                        <h3 className="flex items-center gap-1 text-base font-bold text-text">
                          <BookOpen className="h-4 w-4 text-primary" /> {diary.title}
                        </h3>
                        <span className="text-xs text-text-muted">
                          {formatDiaryDate(diary.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-text-muted">
                        <User className="h-3.5 w-3.5" /> {diary.author}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm text-text-muted">{diary.content}</p>
                    </Link>

                    <DiaryInteractions diaryId={diary.id} myName={myName} />

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => editDiary(diary)}
                        className="rounded-lg bg-primary-soft px-3 py-1.5 text-xs text-text"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteDiary(diary.id)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs text-white"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DiaryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiaryContent />
    </Suspense>
  );
}