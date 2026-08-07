"use client";

import {
  Button,
  Card,
  Input,
  Textarea,
  PageHeader,
  EmptyState,
} from "@/components";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const workTypes = [
  "영화",
  "드라마",
  "책",
  "게임",
  "공연",
] as const;

type WorkType = typeof workTypes[number];

type Work = {
  id: string;
  title: string;
  type: string;
  rating: number;
  review: string;
  created_at: string;
};



export default function GalleryPage() {

  const [title, setTitle] = useState("");
 const [type, setType] = useState<string>("영화");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [works, setWorks] = useState<Work[]>([]);
  const [editId, setEditId] = useState<string | null>(null);



  const loadWorks = async () => {

    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", {
        ascending: false,
      });


    if(error){
      console.log("조회 실패");
      console.log(error);
      return;
    }


    setWorks(data ?? []);

  };



  const saveWork = async () => {


    if(!title.trim()){
      alert("작품 제목을 입력해주세요.");
      return;
    }



    let error;



    if(editId){

      const result = await supabase
        .from("works")
        .update({
          title,
          type,
          rating,
          review,
        })
        .eq("id", editId);


      error = result.error;


    } else {


      const result = await supabase
        .from("works")
        .insert({
          title,
          type,
          rating,
          review,
        });


      error = result.error;

    }



    if(error){

      console.log("저장 실패");
      console.log(error);
      return;

    }



    await loadWorks();


    setTitle("");
    setType("영화");
    setRating(5);
    setReview("");
    setEditId(null);

  };





  const editWork = (work:Work)=>{

    setEditId(work.id);
    setTitle(work.title);
    setType(work.type);
    setRating(work.rating);
    setReview(work.review);

    window.scrollTo({
      top:0,
      behavior:"smooth"
    });

  };




  const deleteWork = async(id:string)=>{


    const confirmDelete =
      confirm("이 기록을 삭제할까요?");


    if(!confirmDelete){
      return;
    }



    const { error } = await supabase
      .from("works")
      .delete()
      .eq("id", id);



    if(error){

      console.log("삭제 실패");
      console.log(error);
      return;

    }



    await loadWorks();

  };




  useEffect(()=>{

    loadWorks();

  },[]);




  return (

    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">

      <div className="mx-auto max-w-md">


        <PageHeader
          emoji="🎬"
          title="함께 본 작품"
          description="영화와 책, 우리의 기록"
        />



        {/* 작성 영역 */}

        <div
          className="
          mt-8
          rounded-xl
          border
          border-gray-200
          bg-white
          p-5
          "
        >


          <Input

            value={title}

            onChange={(e)=>
              setTitle(e.target.value)
            }

            placeholder="작품 제목"

          />




          <div className="mt-6">

            <p className="mb-3 text-sm font-bold">
              작품 종류
            </p>


            <div className="flex flex-wrap gap-2">


              {
  workTypes.map(item => (


                  <button

                    key={item}

                    onClick={()=>
                      setType(item)
                    }

                    className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm

                    ${
                      type===item
                      ?
                      "bg-black text-white"
                      :
                      "bg-white"
                    }
                    `}

                  >

                    {item}

                  </button>


                ))
              }


            </div>


          </div>





          <div className="mt-6">


            <p className="mb-3 text-sm font-bold">
              별점
            </p>


            <div className="flex gap-1">


              {
                [1,2,3,4,5].map(star=>(

                  <button

                    key={star}

                    onClick={()=>
                      setRating(star)
                    }

                    className="text-3xl"

                  >

                    {
                      star <= rating
                      ?
                      "⭐"
                      :
                      "☆"
                    }

                  </button>

                ))
              }


            </div>


          </div>




          <div className="mt-6">


            <p className="mb-3 text-sm font-bold">
              한줄평
            </p>


            <Textarea

              value={review}

              onChange={(e)=>
                setReview(e.target.value)
              }

              placeholder="감상을 기록해보세요."

            />


          </div>




          <Button
            onClick={saveWork}
          >

            {
              editId
              ?
              "수정 완료"
              :
              "기록 저장하기"
            }

          </Button>



        </div>





        {/* 기록 목록 */}


        <section className="mt-10">


          <h2 className="mb-4 text-xl font-bold">
            지난 기록
          </h2>



          {
            works.length===0
            ?

            <EmptyState

              emoji="🎬"

              title="아직 기록이 없어요"

              description="함께 본 작품을 기록해 보세요."

            />


            :


            <div className="space-y-4">


            {
              works.map(work=>(


                <Card key={work.id}>


                  <div className="flex justify-between">


                    <h3 className="text-lg font-bold">

                      🎬 {work.title}

                    </h3>


                    <span className="text-sm text-gray-400">

                      {work.type}

                    </span>


                  </div>




                  <p className="mt-3">

                    {"⭐".repeat(work.rating)}

                  </p>



                  <p className="mt-3 text-sm text-gray-600">

                    {work.review}

                  </p>



                  <p className="mt-4 text-xs text-gray-400">

                    {
                      new Date(
                        work.created_at
                      ).toLocaleDateString()
                    }

                  </p>



                  <div className="mt-5 flex gap-3">


                    <button

                      onClick={()=>
                        editWork(work)
                      }

                      className="
                      rounded-lg
                      border
                      px-4
                      py-2
                      text-sm
                      "

                    >

                      수정

                    </button>



                    <button

                      onClick={()=>
                        deleteWork(work.id)
                      }

                      className="
                      rounded-lg
                      border
                      px-4
                      py-2
                      text-sm
                      "

                    >

                      삭제

                    </button>


                  </div>



                </Card>


              ))
            }


            </div>

          }



        </section>



      </div>


    </main>

  );

}