"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <section className="mb-8">
          <p className="text-gray-500 text-sm">
            친친
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            서호윤 ♡ 주우성
          </h1>

          <div className="mt-5 rounded-xl bg-white p-6 border border-gray-200">
            <p className="text-gray-500">
              함께한 날
            </p>

            <p className="mt-2 text-4xl font-bold">
              D+385
            </p>
          </div>
        </section>


        {/* Menu */}
        <section className="space-y-4">

        <Link href="/diary" className="block">
          <MenuCard
            emoji="📖"
            title="교환일기"
            description="오늘의 이야기를 기록해요"
          />
        </Link>

        <Link href="/gallery" className="block">
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


        {/* Recent */}
        <section className="mt-8">

          <h2 className="mb-3 text-xl font-bold">
            최근 기록
          </h2>

          <div className="rounded-xl bg-white p-6 border border-gray-200">
            아직 기록이 없습니다.
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
     flex
     items-center
     rounded-xl
     border
     border-gray-200
     bg-white
     p-6
     transition
     hover:bg-gray-50
     active:scale-[0.98]
    ">

      <div className="
        mr-4
        text-3xl
      ">
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