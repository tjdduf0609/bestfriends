"use client";

import { BackHeader } from "@/components/BackHeader";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Clapperboard, Plus, Star, Heart, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";

interface Work {
  id: string;
  title: string;
  type: string;
  rating: number;
  review: string;
  cover_url: string | null;
  created_at: string;
}

function StarRating({ value }: { value: number }) {
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
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

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

    const { data: likes } = await supabase.from("work_likes").select("work_id");
    const { data: comments } = await supabase.from("work_comments").select("work_id");

    const likeMap: Record<string, number> = {};
    (likes ?? []).forEach((l: any) => {
      likeMap[l.work_id] = (likeMap[l.work_id] ?? 0) + 1;
    });
    setLikeCounts(likeMap);

    const commentMap: Record<string, number> = {};
    (comments ?? []).forEach((c: any) => {
      commentMap[c.work_id] = (commentMap[c.work_id] ?? 0) + 1;
    });
    setCommentCounts(commentMap);
  };

  useEffect(() => {
    loadWorks();
  }, []);

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="시네마" />
        <p className="mb-4 text-sm text-text-muted">함께 본 작품</p>

        <button
          onClick={() => router.push("/gallery/new")}
          style={pillButtonStyle(true)}
          className="flex w-full items-center justify-center gap-1 rounded-xl py-3 text-sm font-bold"
        >
          <Plus className="h-4 w-4" /> 작품 추가
        </button>

        <section className="mt-8">
          {works.length === 0 ? (
            <EmptyState
              icon={Clapperboard}
              title="아직 기록이 없어요"
              description="함께 본 작품을 기록해 보세요."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {works.map((work) => (
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
                    <div className="mt-1">
                      <StarRating value={Number(work.rating)} />
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