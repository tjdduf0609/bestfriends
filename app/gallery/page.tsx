"use client";

import { BackHeader } from "@/components/BackHeader";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import BottomNav from "@/components/BottomNav";
import { Clapperboard, Plus, Star, Heart, MessageCircle, Search } from "lucide-react";

const cardStyle = "rounded-3xl bg-white shadow-sm";

interface Work {
  id: string;
  title: string;
  type: string;
  author: string | null;
  person1_rating: number | null;
  person2_rating: number | null;
  cover_url: string | null;
  created_at: string;
}

function averageOf(work: Work) {
  const ratings = [work.person1_rating, work.person2_rating].filter((r): r is number => r !== null);
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + Number(r), 0) / ratings.length;
}

function MiniStars({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[10px] text-card-muted">평가 전</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className="h-3 w-3 text-primary" fill={value >= n - 0.5 ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const loadWorks = async () => {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("작품 조회 실패", error.message);
      return;
    }
    setWorks(data ?? []);

    const { data: settingsData } = await supabase.from("profileSettings").select("*").eq("id", 1).maybeSingle();
    setSettings(settingsData);

    const { data: likes } = await supabase.from("work_likes").select("work_id");
    const { data: comments } = await supabase.from("work_comments").select("work_id");

    const likeMap: Record<string, number> = {};
    (likes ?? []).forEach((l: any) => (likeMap[l.work_id] = (likeMap[l.work_id] ?? 0) + 1));
    setLikeCounts(likeMap);

    const commentMap: Record<string, number> = {};
    (comments ?? []).forEach((c: any) => (commentMap[c.work_id] = (commentMap[c.work_id] ?? 0) + 1));
    setCommentCounts(commentMap);
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const avgFor = (key: "person1_rating" | "person2_rating") => {
    const rated = works.filter((w) => w[key] !== null);
    if (rated.length === 0) return null;
    return rated.reduce((sum, w) => sum + Number(w[key]), 0) / rated.length;
  };

  const person1Avg = avgFor("person1_rating");
  const person2Avg = avgFor("person2_rating");

  const filteredWorks = works.filter((w) =>
  w.title.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl md:max-w-2xl lg:max-w-4xl">
        <BackHeader title="시네마" />
        <p className="mb-3 text-sm text-text-muted">함께 본 영화와 드라마를 모아요.</p>

        {works.length > 0 && (
          <div className="mb-4 flex gap-2">
            <div className={`${cardStyle} flex-1 p-3 text-center`}>
              <p className="text-xs text-card-muted">{settings?.person1_name} 평균</p>
              <p className="mt-1 text-lg font-bold text-card">
                {person1Avg !== null ? person1Avg.toFixed(1) : "-"}
              </p>
            </div>
            <div className={`${cardStyle} flex-1 p-3 text-center`}>
              <p className="text-xs text-card-muted">{settings?.person2_name} 평균</p>
              <p className="mt-1 text-lg font-bold text-card">
                {person2Avg !== null ? person2Avg.toFixed(1) : "-"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/gallery/new")}
          style={pillButtonStyle(true)}
          className="flex w-full items-center justify-center gap-1 rounded-xl py-3 text-sm font-bold"
        >
          <Plus className="h-4 w-4" /> 작품 추가
        </button>

        <div className="relative mt-4">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-card-muted" />
  <input
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="작품 제목 검색"
    className="w-full rounded-full bg-primary-soft/40 py-2.5 pl-9 pr-4 text-sm text-text outline-none"
  />
</div>

<section className="mt-4">
          
          {filteredWorks.length === 0 ? (
  <EmptyState
    icon={Clapperboard}
    title={searchQuery ? "검색 결과가 없어요" : "아직 기록이 없어요"}
    description={searchQuery ? "다른 제목으로 검색해보세요." : "함께 본 작품을 기록해 보세요."}
  />
) : (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
    {filteredWorks.map((work) => (
      // ... 기존 카드 내용 그대로
                <div
                  key={work.id}
                  onClick={() => router.push(`/gallery/${work.id}`)}
                  className={`${cardStyle} cursor-pointer overflow-hidden`}
                >
                  <div className="aspect-[2/3] w-full bg-primary-soft">
                    {work.cover_url ? (
                      <img src={work.cover_url} alt={work.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Clapperboard className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate font-bold text-sm text-card">{work.title}</h3>
                    <p className="text-xs text-card-muted">{work.type}</p>
                    {work.author && <p className="text-[10px] text-card-muted">{work.author} 등록</p>}
                    <div className="mt-1">
                      <MiniStars value={averageOf(work)} />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-card-muted">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" /> {likeCounts[work.id] ?? 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" /> {commentCounts[work.id] ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
 <BottomNav />
    </main>
  );
}