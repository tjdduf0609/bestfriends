"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
export default function DiaryPage() {
  const [writer, setWriter] = useState("주우성");  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [diaries, setDiaries] = useState<any[]>([]);

const saveDiary = () => {

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }


  const newDiary = {
    id: Date.now(),
    writer,
    title,
    content,
    date: new Date().toLocaleDateString("ko-KR"),
  };


  const updatedDiaries = [
      newDiary,
      ...diaries,
  ];

setDiaries(updatedDiaries);

localStorage.setItem(
  "diaries",
  JSON.stringify(updatedDiaries)
);


  setTitle("");
  setContent("");

};

   useEffect(() => {

      const savedDiaries = localStorage.getItem("diaries");

       if (savedDiaries) {
       setDiaries(JSON.parse(savedDiaries));
       }

}, []);

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">

      <div className="mx-auto max-w-md">

        <h1 className="text-3xl font-bold">
          📖 교환 일기
        </h1>


        <p className="mt-2 text-gray-500">
          오늘 하루의 이야기를 남겨 보세요.
        </p>

{/* 작성자 선택 */}

<div className="mt-6">

  <p className="mb-3 text-sm font-bold">
    작성자
  </p>


  <div className="flex gap-3">

    <button
      onClick={() => setWriter("주우성")}
      className={`
        rounded-full
        border
        px-5
        py-2
        text-sm
        font-bold
        transition

        ${
          writer === "주우성"
            ? "bg-black text-white"
            : "bg-white text-black"
        }
      `}
    >
      주우성
    </button>


    <button
      onClick={() => setWriter("서호윤")}
      className={`
        rounded-full
        border
        px-5
        py-2
        text-sm
        font-bold
        transition

        ${
          writer === "서호윤"
            ? "bg-black text-white"
            : "bg-white text-black"
        }
      `}
    >
      서호윤
    </button>

  </div>

</div>

        {/* 제목 */}

        <div className="mt-8 rounded-xl bg-white p-5 border border-gray-200">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
            w-full
            text-lg
            outline-none
         "
         placeholder="제목"
          />

        </div>


        {/* 내용 */}

        <div className="
          mt-4
          rounded-xl
          bg-white
          p-5
          border border-gray-200
        ">

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="
            h-60
            w-full
            resize-none
            outline-none
         "
            placeholder="오늘 있었던 일을 적어 보세요."
          />

        </div>


        {/* 작성 */}

        <button
          onClick={saveDiary} 
          className="
          mt-6
          w-full
          rounded-xl
          bg-black
          py-5
          font-bold
          text-white
          "
        >

          기록 저장하기

        </button>

{/* 지난 기록 */}

<section className="mt-10">

  <h2 className="mb-4 text-xl font-bold">
    지난 기록
  </h2>


  {diaries.length === 0 ? (

    <div
      className="
        rounded-xl
        border
        border-gray-200
        bg-white
        p-6
        text-center
      "
    >
      <p className="text-gray-500">
        아직 작성된 교환일기가 없어요.
      </p>

      <p className="mt-2 text-sm text-gray-400">
        첫 번째 이야기를 남겨보세요 ✨
      </p>

    </div>

  ) : (

    <div className="space-y-4">

      {diaries.map((diary) => (

    <Link
      href={`/diary/${diary.id}`}
      key={diary.id}
    >
        <div
          key={diary.id}
          className="
            rounded-xl
            border
            border-gray-200
            bg-white
            p-5
            transition
            hover:bg-gray-50
          "
        >

          <div className="flex items-start justify-between">

            <h3 className="text-lg font-bold">
              📖 {diary.title}
            </h3>


            <span className="text-xs text-gray-400">
              {diary.date}
            </span>

          </div>


          <p className="mt-3 text-sm font-medium text-gray-600">
            👤 {diary.writer}
          </p>


          <p className="
            mt-4
            line-clamp-2
            text-sm
            text-gray-500
          ">
            {diary.content}
          </p>


        </div>
      </Link>
      ))}

    </div>

  )}

</section>

      </div>

    </main>
  );
}