"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Modal,
} from "@/components";


export default function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const [diary, setDiary] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editTitle, setEditTitle] = useState("");

  const [editContent, setEditContent] = useState("");

  


  useEffect(() => {

    const loadDiary = async () => {

      const { id } = await params;


      const savedDiaries =
        localStorage.getItem("diaries");


      if (!savedDiaries) return;


      const diaries = JSON.parse(savedDiaries);


      const foundDiary = diaries.find(
        (item: any) =>
          item.id.toString() === id
      );


      if (!foundDiary) return;


      setDiary(foundDiary);

      setEditTitle(foundDiary.title);

      setEditContent(foundDiary.content);

    };


    loadDiary();

  }, [params]);




  // 수정 저장

  const updateDiary = () => {

    const savedDiaries =
      localStorage.getItem("diaries");


    if (!savedDiaries) return;


    const diaries = JSON.parse(savedDiaries);


    const updatedDiaries = diaries.map(
      (item: any) => {

        if (item.id === diary.id) {

          return {
            ...item,
            title: editTitle,
            content: editContent,
          };

        }


        return item;

      }
    );


    localStorage.setItem(
      "diaries",
      JSON.stringify(updatedDiaries)
    );


    setDiary({
      ...diary,
      title: editTitle,
      content: editContent,
    });


    setIsEditing(false);

  };




  // 삭제

  const deleteDiary = () => {

    const savedDiaries =
      localStorage.getItem("diaries");


    if (!savedDiaries) return;


    const diaries = JSON.parse(savedDiaries);


    const updatedDiaries =
      diaries.filter(
        (item: any) =>
          item.id !== diary.id
      );


    localStorage.setItem(
      "diaries",
      JSON.stringify(updatedDiaries)
    );


    window.location.href = "/diary";

  };
  
  // 로딩

if (!diary) {

  return (

    <main className="min-h-screen bg-[#F7F8FA] p-6">

      <div className="mx-auto max-w-md">

        <p className="text-gray-500">
          기록을 불러오는 중...
        </p>

      </div>


    </main>

  );
}





  return (

    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">


      <div className="mx-auto max-w-md">


        <Link
          href="/diary"
          className="text-sm text-gray-500"
        >
          ← 교환일기로 돌아가기
        </Link>



        <section
          className="
            mt-6
            rounded-xl
            border
            border-gray-200
            bg-white
            p-6
          "
        >


          {isEditing ? (

            <div>


              <input
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  p-4
                  text-lg
                  outline-none
                "
              />



              <textarea
                value={editContent}
                onChange={(e) =>
                  setEditContent(e.target.value)
                }
                className="
                  mt-4
                  h-60
                  w-full
                  resize-none
                  rounded-xl
                  border
                  p-4
                  outline-none
                "
              />



              <button
                onClick={updateDiary}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  bg-black
                  py-4
                  font-bold
                  text-white
                "
              >
                수정 완료
              </button>


            </div>


          ) : (


            <>

              <h1 className="text-2xl font-bold">
                📖 {diary.title}
              </h1>



              <div className="mt-4 text-sm text-gray-500">

                <p>
                  👤 {diary.writer}
                </p>


                <p>
                  📅 {diary.date}
                </p>

              </div>



              <p
                className="
                  mt-8
                  whitespace-pre-wrap
                  text-gray-700
                "
              >
                {diary.content}
              </p>



              <div className="mt-8 flex gap-3">


                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    py-3
                    font-bold
                  "
                >
                  수정하기
                </button>



             <button
                onClick={() => setShowDeleteModal(true)}
                className="
                  flex-1
                 rounded-xl
                 bg-black
                 py-3
                 font-bold
                  text-white
               "
             >
               삭제하기
              </button>

              </div>


            </>


          )}


        </section>

        <Modal
          open={showDeleteModal}
          title="일기를 삭제할까요?"
          description="삭제한 기록은 다시 복구할 수 없어요."
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteDiary}
        />

      </div>


    </main>

  );

}