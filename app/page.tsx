"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import TodayMessageCard from "@/components/TodayMessageCard";
import ProfileImage from "@/components/ProfileImage";


const todayMessage = {
  text: "오늘 하루도 고생했어.\n네가 있어서 다행이야.",
  author: "bestfriends"
};


function calculateDDay(startDate: string) {

  const start = new Date(startDate);
  const today = new Date();

  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const diff =
    today.getTime() - start.getTime();

  return Math.floor(
    diff / (1000*60*60*24)
  );
}


export default function Home() {

  const [profile, setProfile] = useState<any>(null);

  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [coupleName, setCoupleName] = useState("");
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [days, setDays] = useState(0);


  useEffect(() => {
    loadSettings();
    loadData();
  }, []);



  async function loadSettings(){

    const { data, error } = await supabase
      .from("profileSettings")
      .select("*")
      .eq("id",1)
      .single();


    if(error){
      console.log(error);
      return;
    }


    setProfile(data);

    if(data){
      setPerson1(data.person1_name ?? "");
      setPerson2(data.person2_name ?? "");

      if(data.start_date){
        setDays(
          calculateDDay(data.start_date)
        );
      }
    }

  }



  async function loadData(){

    // 기존 최근 기록 불러오는 코드가 있으면 여기에 유지

  }



  return (
    <main className="min-h-screen bg-gradient-to-b
from-pink-50
to-white p-6">

      <div className="mx-auto max-w-lg">


        <section className="mb-10">

          <p className="text-center text-sm tracking-widest text-gray-400 uppercase">
            Our Story
          </p>


          <h1 className="mt-2 text-center text-3xl font-bold">
            우리의 기록장
          </h1>



          <div
            className="
            mt-8
            rounded-3xl
            bg-white
            border
            border-gray-100
            shadow-sm
            p-8
            "
          >


            <div className="flex items-center justify-center gap-6">


              <div className="text-center">


                <ProfileImage
                  person="person1"
                  imageUrl={
                    profile?.person1_image
                  }
                />


                <p className="mt-3 font-semibold">
                  {person1}
                </p>


              </div>



              <div className="text-4xl text-pink-400 animate-pulse">
                ♡
              </div>



              <div className="text-center">


                <ProfileImage
                  person="person2"
                  imageUrl={
                    profile?.person2_image
                  }
                />


                <p className="mt-3 font-semibold">
                  {person2}
                </p>


              </div>


            </div>



            <div className="mt-8 text-center">


              <p className="text-sm text-gray-400">
                함께한 시간
              </p>



              <div className="mt-2 text-5xl font-bold">

                D+{days}

              </div>



              <p className="mt-3 text-gray-500">
                처음 만난 날부터 오늘까지
              </p>


            </div>


          </div>


        </section>




        <section className="space-y-5">


        <Link href="/diary" className="block">
          <MenuCard
            emoji="📖"
            title="교환일기"
            description="오늘의 이야기를 기록해요"
          />
        </Link>



        <Link href="/works" className="block">
          <MenuCard
            emoji="🎬"
            title="함께 본 작품"
            description="영화와 책을 기록해요"
          />
        </Link>



        <Link href="/music" className="block">
          <MenuCard
            emoji="🎵"
            title="함께 들은 음악"
            description="우리의 플레이리스트"
          />
        </Link>



        <Link href="/calendar" className="block">
          <MenuCard
            emoji="📅"
            title="달력"
            description="추억을 한눈에 봐요"
          />
        </Link>


        </section>




<section className="mt-8">

<h2 className="mb-4 text-xl font-bold">
최근 추억
</h2>


<div className="space-y-3">


{
recentRecords.length === 0 ? (

<div
className="
rounded-2xl
border
border-gray-100
bg-white
p-6
text-center
text-gray-400
shadow-sm
"
>
아직 기록이 없습니다.
</div>


) : (


recentRecords.map((record)=>(


<div
key={`${record.recordType}-${record.id}`}
className="
rounded-3xl
border
border-gray-100
bg-white
p-6
shadow-[0_4px_20px_rgba(0,0,0,0.04)]
"
>


<div className="flex justify-between">


<h3 className="font-bold">

{
record.recordType === "diary"
?
`📖 ${record.title}`
:
`🎬 ${record.title}`
}

</h3>



<span className="text-xs text-gray-400">

{
new Date(
record.created_at
)
.toLocaleDateString()
}

</span>


</div>



{
record.recordType === "diary" ? (

<p className="mt-2 text-sm text-gray-500">

👤 {record.author}

</p>


) : (


<p className="mt-2 text-sm text-gray-500">

{record.type}

&nbsp;

{"⭐".repeat(record.rating)}

</p>


)

}



</div>


))

)

}


</div>

</section>


      </div>


    <BottomNav />

    </main>
  );

}




function MenuCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;

}) {

  return (
    <div className="
group
flex
items-center
rounded-3xl
border
border-gray-100
bg-white
p-6
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:shadow-lg
active:scale-[0.98]
">


      <div
className="
mr-5
flex
h-16
w-16
items-center
justify-center
rounded-2xl
bg-pink-50
text-4xl
transition
group-hover:scale-110
"
>
        {emoji}
      </div>


      <div>

        <h3 className="font-bold text-lg">
          {title}
        </h3>


        <p className="text-sm text-gray-500">
          {description}
        </p>

      </div>


    </div>
  );
}