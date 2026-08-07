"use client";

import { DiaryInteractions } from "@/components/DiaryInteractions";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageHeader, Card } from "@/components";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

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

  // ▼ 추가: "나는 누구인지" 로컬 저장
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
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log("설정 불러오기 실패");
      console.log(error.message);
      return;
    }

    if (data) {
      setPerson1(data.person1);
      setPerson2(data.person2);

      if (!writer) {
        setWriter(data.person1);
      }
    }
  };

  const loadDiaries = async () => {
    const { data, error } = await supabase
      .from("diaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("조회 실패");
      console.log(error.message);
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
    const confirmDelete = confirm("이 기록을 삭제할까요?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("diaries").delete().eq("id", id);

    if (error) {
      console.log("삭제 실패");
      console.log(error.message);
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
      console.log("저장 실패");
      console.log(error.message);
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

  // ▼ 추가: 개수 기반 잠금 계산
  // myName이 작성한 개수만큼만 상대방 글이 "오래된 순"으로 열림
  const diariesWithLock = (() => {
    if (!myName) return diaries.map((d) => ({ ...d, unlocked: true })); // 아직 선택 전이면 임시로 다 보여줌

    const myCount = diaries.filter((d) => d.author === myName).length;

    const partnerAscending = diaries
      .filter((d) => d.author !== myName)
      .slice()
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    const orderMap = new Map<string, number>();
    partnerAscending.forEach((d, i) => orderMap.set(d.id, i + 1));

    return diaries.map((d) => {
      if (d.author === myName) return { ...d, unlocked: true };
      const order = orderMap.get(d.id) ?? Infinity;
      return { ...d, unlocked: myCount >= order };
    });
  })();

  // ▼ 추가: 오전/오후 포함 날짜 포맷
  const formatDiaryDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader
          emoji="📖"
          title="교환 일기"
          description="오늘 하루의 이야기를 남겨 보세요."
        />

        {/* ▼ 추가: 나는 누구인지 선택 (한 번만 하면 로컬에 저장됨) */}
        {person1 && person2 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold">나는 누구인가요?</p>
            <div className="flex gap-3">
              {[person1, person2].map((name) => (
                <button
                  key={name}
                  onClick={() => selectMyName(name)}
                  className={`rounded-full border px-5 py-2 text-sm font-bold transition ${
                    myName === name
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 제목 */}
        <div className="mt-8 rounded-xl bg-white p-5 border border-gray-200">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg outline-none"
            placeholder="제목"
          />
        </div>

        {/* 내용 */}
        <div className="mt-4 rounded-xl bg-white p-5 border border-gray-200">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-60 w-full resize-none outline-none"
            placeholder="오늘 있었던 일을 적어 보세요."
          />
        </div>

        {/* 작성 */}
        <button
          onClick={saveDiary}
          className="mt-6 w-full rounded-xl bg-black py-5 font-bold text-white"
        >
          {editId ? "기록 수정하기" : "기록 저장하기"}
        </button>

        {/* 지난 기록 */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">지난 기록</h2>

          {diariesWithLock.length === 0 ? (
            <Card>
              <p className="text-gray-500">아직 작성된 교환일기가 없어요.</p>
              <p className="mt-2 text-sm text-gray-400">
                첫 번째 이야기를 남겨보세요 ✨
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {diariesWithLock.map((diary) =>
                !diary.unlocked ? (
                  // ▼ 추가: 잠긴 카드
                  <div
                    key={diary.id}
                    className="rounded-xl border border-gray-200 bg-gray-100 p-5 text-center"
                  >
                    <p className="text-sm text-gray-400">
                      🔒 아직 잠겨있어요. 일기를 먼저 써보세요!
                    </p>
                  </div>
                ) : (
                  <div
                    key={diary.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 transition hover:bg-gray-50"
                  >
                    <Link href={`/diary/${diary.id}`}>
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold">📖 {diary.title}</h3>
                        <span className="text-xs text-gray-400">
                          {formatDiaryDate(diary.created_at)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-medium text-gray-600">
                        👤 {diary.author}
                      </p>

                      <p className="mt-4 line-clamp-2 text-sm text-gray-500">
                        {diary.content}
                      </p>

                      
                    </Link>

                    <DiaryInteractions diaryId={diary.id} myName={myName} />

                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        onClick={() => editDiary(diary)}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteDiary(diary.id)}
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white"
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