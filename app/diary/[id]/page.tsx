"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


type Diary = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};


export default function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [writer, setWriter] = useState("");
const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {

  async function loadDiary() {

    const { id } = await params;


    const { data, error } = await supabase
      .from("diaries")
      .select("*")
      .eq("id", id)
      .single();


    if (error) {
      console.log("Supabase error:", error);
      setLoading(false);
      return;
    }


    setDiary(data);
    setLoading(false);

  }


  loadDiary();

}, [params]);

  const loadEditDiary = async () => {

  if(!editParam){
    return;
  }


  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .eq("id", editParam)
    .single();


  if(error){
    console.log(error.message);
    return;
  }


  setEditId(data.id);
  setTitle(data.title);
  setContent(data.content);
  setWriter(data.author);

  window.history.replaceState(
  null,
  "",
  "/diary"
);

};

  const deleteDiary = async () => {

  const confirmDelete = confirm(
    "이 기록을 삭제할까요?"
  );

  if (!confirmDelete) {
    return;
  }


  const { error } = await supabase
    .from("diaries")
    .delete()
    .eq("id", diary?.id);


  if(error){
    console.log(error.message);
    return;
  }


  router.push("/diary");

};

  if (loading) {
    return (
      <div className="p-6">
        불러오는 중...
      </div>
    );
  }



  if (!diary) {
    return (
      <div className="p-6">
        일기를 찾을 수 없습니다.
      </div>
    );
  }



  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6">

      <div className="mx-auto max-w-md">


        <Link
          href="/diary"
          className="text-sm text-gray-500"
        >
          ← 목록으로
        </Link>



        <div
          className="
          mt-6
          rounded-xl
          bg-white
          p-6
          border
          "
        >

          <h1 className="text-2xl font-bold">
            {diary.title}
          </h1>


          <div className="mt-2 text-sm text-gray-400">
            {diary.author}
          </div>


          <div className="mt-6 whitespace-pre-wrap text-gray-700">
            {diary.content}
          </div>


          <div className="mt-6 text-xs text-gray-400">
            {
              new Date(
                diary.created_at
              ).toLocaleDateString()
            }
          </div>

          <div className="mt-8 flex gap-3">


  <Link
    href={`/diary?edit=${diary.id}`}
    className="
      flex-1
      rounded-xl
      border
      border-gray-200
      py-3
      text-center
      text-sm
      font-bold
    "
  >
    수정
  </Link>


  <button
    onClick={deleteDiary}
    className="
      flex-1
      rounded-xl
      bg-black
      py-3
      text-sm
      font-bold
      text-white
    "
  >
    삭제
  </button>


</div>


        </div>


      </div>

    </main>
  );
}