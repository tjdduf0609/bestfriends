"use client";

import { useEffect, useState } from "react";
import {
  PageHeader,
  Input,
  Textarea,
  Button,
  Card,
  EmptyState,
} from "@/components";

import { supabase } from "@/lib/supabase";


export default function MusicPage() {

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [musicList, setMusicList] = useState<any[]>([]);

  const [editId, setEditId] = useState<number | null>(null);



  useEffect(() => {

    loadMusic();

  }, []);



  async function loadMusic(){

    const { data, error } = await supabase
      .from("music")
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );


    if(error){

      console.log(error);

      return;

    }


    setMusicList(data ?? []);

  }



  async function saveMusic(){


    if(!title.trim()) return;



    if(editId){

      await supabase
        .from("music")
        .update({

          title,
          artist,
          rating,
          review,

        })
        .eq(
          "id",
          editId
        );


    }else{


      await supabase
        .from("music")
        .insert({

          title,
          artist,
          rating,
          review,

        });


    }



    resetForm();

    loadMusic();

  }



  function resetForm(){

    setTitle("");
    setArtist("");
    setRating(5);
    setReview("");
    setEditId(null);

  }



  function editMusic(item:any){

    setTitle(item.title);
    setArtist(item.artist);
    setRating(item.rating);
    setReview(item.review);

    setEditId(item.id);

  }



  async function deleteMusic(id:number){


    await supabase
      .from("music")
      .delete()
      .eq(
        "id",
        id
      );


    loadMusic();

  }




  return (

    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">

      <div className="mx-auto max-w-md">


        <PageHeader

          emoji="🎵"

          title="함께 들은 음악"

          description="우리의 플레이리스트를 기록해요"

        />



        {/* 작성 카드 */}

        <div className="
          mt-8
          rounded-2xl
          border
          border-gray-100
          bg-white
          p-6
          shadow-sm
          space-y-5
        ">


          <div>

            <p className="mb-2 font-semibold">
              노래 제목
            </p>

            <Input

              value={title}

              onChange={(e)=>setTitle(e.target.value)}

              placeholder="노래 제목"

            />

          </div>




          <div>

            <p className="mb-2 font-semibold">
              가수
            </p>


            <Input

              value={artist}

              onChange={(e)=>setArtist(e.target.value)}

              placeholder="가수 이름"

            />

          </div>




          <div>

            <p className="mb-2 font-semibold">
              별점
            </p>


            <div className="flex gap-1">

              {[1,2,3,4,5].map((star)=>(

                <button

                  key={star}

                  onClick={()=>setRating(star)}

                  className="text-3xl"

                >

                  {star <= rating ? "⭐":"☆"}

                </button>

              ))}

            </div>

          </div>




          <div>

            <p className="mb-2 font-semibold">
              한줄평
            </p>


            <Textarea

              value={review}

              onChange={(e)=>setReview(e.target.value)}

              placeholder="이 노래는 어떤 추억인가요?"

            />

          </div>




          <Button onClick={saveMusic}>

            {editId ? "수정하기" : "기록 저장하기"}

          </Button>



        </div>






        {/* 목록 */}

        <section className="mt-10">


          <h2 className="mb-4 text-xl font-bold">

            지난 음악

          </h2>



          {
            musicList.length === 0 ? (


              <EmptyState

                emoji="🎵"

                title="아직 음악이 없어요"

                description="함께 들은 음악을 기록해 보세요."

              />


            ) : (


              <div className="space-y-4">


              {
                musicList.map((music)=>(


                  <Card key={music.id}>


                    <div className="flex justify-between">


                      <div>


                        <h3 className="font-bold text-lg">

                          🎵 {music.title}

                        </h3>


                        <p className="text-sm text-gray-500">

                          {music.artist}

                        </p>


                      </div>


                      <div>

                        <button

                          onClick={()=>editMusic(music)}

                          className="mr-3 text-sm text-blue-500"

                        >
                          수정
                        </button>


                        <button

                          onClick={()=>deleteMusic(music.id)}

                          className="text-sm text-red-500"

                        >
                          삭제
                        </button>


                      </div>


                    </div>




                    <p className="mt-3">

                      {"⭐".repeat(music.rating)}

                    </p>



                    <p className="mt-3 text-gray-600">

                      {music.review}

                    </p>



                    <p className="mt-4 text-xs text-gray-400">

                      {
                        new Date(
                          music.created_at
                        ).toLocaleDateString()
                      }

                    </p>


                  </Card>


                ))
              }


              </div>

            )
          }



        </section>



      </div>


    </main>

  );

}