"use client";

import {
  Button,
  Card,
  Input,
  Textarea,
  PageHeader,
  EmptyState,
 } from "@/components";
import { Work } from "@/types/work";
import { useEffect, useState } from "react";

import {
  getStorage,
  setStorage,
} from "@/lib/storage";

export default function GalleryPage() {

   const [type, setType] = useState("영화");
   const [rating, setRating] = useState(5);
   const [review, setReview] = useState("");
   const [title, setTitle] = useState("");
   const [works, setWorks] = useState<Work[]>([]);
   const saveWork = () => {

  if (!title.trim()) return;

  const newWork: Work = {

    id: Date.now(),

    title,

    type,

    rating,

    review,

    date: new Date().toLocaleDateString(),

  };

  const updatedWorks = [
    newWork,
    ...works,
  ];

  setWorks(updatedWorks);

  setStorage(
  "works",
  updatedWorks
);

  setTitle("");
  setReview("");
  setRating(5);
  setType("영화");

};

useEffect(() => {

  const savedWorks =
  getStorage("works");

  setWorks(savedWorks);

}, []);   
   
  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">
      <div className="mx-auto max-w-md">

        <PageHeader
         emoji="🎬"
         title="함께 본 작품"
         description="영화와 책을 기록해요"
/>

        <p className="mt-2 text-gray-500">
          함께 본 영화, 드라마, 책을 기록해 보세요.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">

          <Input
           value={title}
           onChange={(e)=>setTitle(e.target.value)}
           placeholder="작품 제목"
          />

        </div>

<div className="mt-5">

  <p className="mb-3 font-semibold">
    작품 종류
  </p>

  <div className="flex flex-wrap gap-2">

    {[
      "영화",
      "드라마",
      "책",
      "게임",
      "공연",
    ].map((item) => (

      <button
        key={item}
        onClick={() => setType(item)}
        className={`
          rounded-full
          px-4
          py-2
          border
          transition

          ${
            type === item
              ? "bg-black text-white"
              : "bg-white"
          }
        `}
      >

        {item}

      </button>

    ))}

    <div className="mt-6">

  <p className="mb-3 font-semibold">
    별점
  </p>

  <div className="flex gap-1">

    {[1,2,3,4,5].map((star)=>(

      <button
        key={star}
        onClick={() => setRating(star)}
        className="text-3xl"
      >

        {star <= rating ? "⭐" : "☆"}

      </button>

    ))}

    

  </div>

<div className="mt-6">

  <p className="mb-3 font-semibold">
    한줄평
  </p>

  <Textarea
  value={review}
  onChange={(e)=>setReview(e.target.value)}
  placeholder="오늘 어땠나요?"
/>

</div>

<Button
  onClick={saveWork}
>
  기록 저장하기
</Button>

<div className="mt-10 space-y-4">

  <h2 className="text-xl font-bold">

    지난 기록

  </h2>

{works.length === 0 ? (

  <EmptyState
    emoji="🎬"
    title="아직 기록이 없어요"
    description="함께 본 작품을 기록해 보세요."
  />

) : (

  works.map((work)=>(

    <Card key={work.id}>

      <div className="flex justify-between">

        <h3 className="font-bold">

          {work.title}

        </h3>

        <span>

          {work.type}

        </span>

      </div>

      <p className="mt-2">

        {"⭐".repeat(work.rating)}

      </p>

      <p className="mt-2 text-gray-600">

        {work.review}

      </p>

      <p className="mt-4 text-sm text-gray-400">

        {work.date}

      </p>

    </Card>

  ))
  )}

</div>

</div>

  </div>

</div>

      </div>
    </main>
  );
}