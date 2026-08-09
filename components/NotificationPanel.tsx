"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookOpen, Clapperboard, Music, Heart, Star, X } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "diary" | "work" | "music";
  title: string;
  author?: string;
  created_at: string;
}

interface UpcomingItem {
  id: string;
  title: string;
  type: "anniversary" | "event";
  daysLeft: number;
}

const cardStyle = "rounded-3xl bg-white shadow-sm";

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data: diaries } = await supabase
      .from("diaries")
      .select("id, title, author, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: works } = await supabase
      .from("works")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: music } = await supabase
      .from("music")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const merged: ActivityItem[] = [
      ...(diaries ?? []).map((d: any) => ({ id: d.id, type: "diary" as const, title: d.title, author: d.author, created_at: d.created_at })),
      ...(works ?? []).map((w: any) => ({ id: w.id, type: "work" as const, title: w.title, created_at: w.created_at })),
      ...(music ?? []).map((m: any) => ({ id: m.id, type: "music" as const, title: m.title, created_at: m.created_at })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);

    setActivity(merged);

    const { data: anniversaries } = await supabase.from("anniversaries").select("*");
    const { data: events } = await supabase.from("events").select("*");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resolveNext = (item: any, type: "anniversary" | "event"): UpcomingItem | null => {
      const original = new Date(item.date);
      let occursOn = original;

      if (item.repeat_type === "yearly") {
        occursOn = new Date(today.getFullYear(), original.getMonth(), original.getDate());
        if (occursOn < today) {
          occursOn = new Date(today.getFullYear() + 1, original.getMonth(), original.getDate());
        }
      } else if (item.repeat_type === "weekly") {
        occursOn = new Date(today);
        while (occursOn.getDay() !== original.getDay() || occursOn < today) {
          occursOn.setDate(occursOn.getDate() + 1);
        }
      } else if (occursOn < today) {
        return null;
      }

      const daysLeft = Math.ceil((occursOn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { id: item.id, title: item.title, type, daysLeft };
    };

    const upcomingMerged = [
      ...(anniversaries ?? []).map((a: any) => resolveNext(a, "anniversary")),
      ...(events ?? []).map((e: any) => resolveNext(e, "event")),
    ]
      .filter((x): x is UpcomingItem => x !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    setUpcoming(upcomingMerged);
    setLoading(false);
  }

  const goTo = (item: ActivityItem) => {
    const path = item.type === "diary" ? "diary" : item.type === "work" ? "gallery" : "music";
    router.push(`/${path}/${item.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <div
        className={`${cardStyle} absolute left-4 right-4 top-16 mx-auto max-w-md md:max-w-2xl lg:max-w-4xl md:max-w-2xl lg:max-w-4xl p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-card">알림</h2>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-card-muted" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-card-muted">불러오는 중...</p>
        ) : (
          <>
            <p className="mb-2 text-xs font-bold text-card-muted">다가오는 기념일 · 일정</p>
            {upcoming.length === 0 ? (
              <p className="mb-4 text-xs text-card-muted">다가오는 일정이 없어요.</p>
            ) : (
              <div className="mb-4 space-y-1.5">
                {upcoming.map((u) => (
                  <div key={`${u.type}-${u.id}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-card">
                      {u.type === "anniversary" ? (
                        <Heart className="h-3.5 w-3.5 text-primary" fill="currentColor" />
                      ) : (
                        <Star className="h-3.5 w-3.5 text-primary" fill="currentColor" />
                      )}
                      {u.title}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {u.daysLeft === 0 ? "오늘" : `D-${u.daysLeft}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="mb-2 text-xs font-bold text-card-muted">최근 추가된 기록</p>
            {activity.length === 0 ? (
              <p className="text-xs text-card-muted">아직 기록이 없어요.</p>
            ) : (
              <div className="space-y-1.5">
                {activity.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => goTo(item)}
                    className="flex w-full items-center gap-2 text-left text-sm text-card"
                  >
                    {item.type === "diary" && <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    {item.type === "work" && <Clapperboard className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    {item.type === "music" && <Music className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    <span className="truncate">{item.title}</span>
                    {item.author && <span className="ml-auto shrink-0 text-xs text-card-muted">{item.author}</span>}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}