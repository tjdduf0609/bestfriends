"use client";

import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { BackHeader } from "@/components/BackHeader";
import { Heart, Star, BookOpen, Clapperboard, Music, Plus, } from "lucide-react";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import BottomNav from "@/components/BottomNav";

const cardStyle = "rounded-3xl bg-white shadow-sm";
type RepeatType = "none" | "weekly" | "yearly";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [anniversaries, setAnniversaries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formKind, setFormKind] = useState<"anniversary" | "event">("anniversary");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formRepeat, setFormRepeat] = useState<RepeatType>("yearly");
  const [editingItem, setEditingItem] = useState<{ table: "anniversaries" | "events"; id: string } | null>(null);


  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");

  if (!dateParam) return;

  const targetDate = new Date(`${dateParam}T00:00:00`);

  if (isNaN(targetDate.getTime())) return;

  setCurrentMonth(targetDate);
  setSelectedDate(targetDate);
}, []);

  useEffect(() => {
    loadRecords();
  }, [currentMonth]);

  async function loadRecords() {
    const { data: diaries } = await supabase.from("diaries").select("*");
    const { data: works } = await supabase.from("works").select("*");
    const { data: music } = await supabase.from("music").select("*");
    const { data: anniversaryData } = await supabase.from("anniversaries").select("*");
    const { data: eventData } = await supabase.from("events").select("*");
    
    setAnniversaries(anniversaryData ?? []);
    setEvents(eventData ?? []);

    const year = currentMonth.getFullYear();



    const resolveOccurrences = (item: any): Date[] => {
      const original = new Date(item.date);

      if (item.repeat_type === "yearly") {
        return [new Date(year, original.getMonth(), original.getDate())];
      }

      if (item.repeat_type === "weekly") {
        const targetWeekday = getDay(original);
        const monthDays = eachDayOfInterval({
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth),
        });
        return monthDays.filter((d) => getDay(d) === targetWeekday && d >= original);
      }

      return [original];
    };

    const merged = [
      ...(diaries ?? []).map((item) => ({ ...item, type: "diary", occursOn: new Date(item.created_at) })),
      ...(works ?? []).map((item) => ({ ...item, type: "work", occursOn: new Date(item.created_at) })),
      ...(music ?? []).map((item) => ({ ...item, type: "music", occursOn: new Date(item.created_at) })),
      ...(anniversaryData ?? []).flatMap((item) =>
        resolveOccurrences(item).map((occursOn) => ({ ...item, type: "anniversary", occursOn }))
      ),
      ...(eventData ?? []).flatMap((item) =>
        resolveOccurrences(item).map((occursOn) => ({ ...item, type: "event", occursOn }))
      ),
    ];

    setRecords(merged);
  }

  function startEdit(table: "anniversaries" | "events", item: any) {
    setFormKind(table === "anniversaries" ? "anniversary" : "event");
    setFormTitle(item.title);
    setFormDate(item.date);
    setFormRepeat(item.repeat_type ?? "none");
    setEditingItem({ table, id: item.id });
    setShowForm(true);
  }

  function resetForm() {
    setFormTitle("");
    setFormDate("");
    setFormRepeat("yearly");
    setEditingItem(null);
    setShowForm(false);
  }

  async function saveItem() {
    if (!formTitle.trim() || !formDate) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }

    const table = formKind === "anniversary" ? "anniversaries" : "events";
    const payload = { title: formTitle, date: formDate, repeat_type: formRepeat };

    const { error } = editingItem
      ? await supabase.from(table).update(payload).eq("id", editingItem.id)
      : await supabase.from(table).insert(payload);

    if (error) {
      console.log("저장 실패", error.message);
      return;
    }

    resetForm();
    await loadRecords();
  }

  async function deleteItem(table: "anniversaries" | "events", id: string) {
    if (!confirm("삭제할까요?")) return;
    await supabase.from(table).delete().eq("id", id);
    if (editingItem?.id === id) resetForm();
    await loadRecords();
  }

  const repeatLabel = (t: RepeatType) =>
    t === "yearly" ? "매년 반복" : t === "weekly" ? "매주 반복" : "반복 안 함";

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  function hasRecord(day: Date) {
    return records.some((r) => r.type !== "anniversary" && r.type !== "event" && isSameDay(r.occursOn, day));
  }
  function anniversaryOnDay(day: Date) {
    return records.some((r) => r.type === "anniversary" && isSameDay(r.occursOn, day));
  }
  function eventOnDay(day: Date) {
    return records.some((r) => r.type === "event" && isSameDay(r.occursOn, day));
  }

  const selectedRecords = records.filter((r) => selectedDate && isSameDay(r.occursOn, selectedDate));

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <BackHeader title="달력" />

        <button
  onClick={() => (showForm ? resetForm() : setShowForm(true))}
  style={pillButtonStyle(true)}
  className="mb-3 ml-auto flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold"
>
  {showForm ? "닫기" : (<><Plus className="h-3.5 w-3.5" /> 추가</>)}
</button>

        {showForm && (
          <div className={`${cardStyle} mb-4 space-y-3 p-5`}>
            <div className="flex gap-2">
  <button
    onClick={() => setFormKind("anniversary")}
    style={pillButtonStyle(formKind === "anniversary")}
    className="flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-sm font-bold"
  >
    <Heart className="h-4 w-4" fill={formKind === "anniversary" ? "currentColor" : "none"} /> 기념일
  </button>
  <button
    onClick={() => setFormKind("event")}
    style={pillButtonStyle(formKind === "event")}
    className="flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-sm font-bold"
  >
    <Star className="h-4 w-4" fill={formKind === "event" ? "currentColor" : "none"} /> 일정
  </button>
</div>

            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={formKind === "anniversary" ? "예: 100일, 1주년" : "예: OO 생일, 데이트"}
              className="w-full rounded-xl bg-white-soft/40 p-3 text-sm text-card-muted"
            />

            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-xl bg-white-soft/40 p-3 text-sm text-card-muted"
            />

            <div className="flex gap-2">
  {(["none", "weekly", "yearly"] as RepeatType[]).map((t) => (
    <button
      key={t}
      onClick={() => setFormRepeat(t)}
      style={pillButtonStyle(formRepeat === t)}
      className="flex-1 rounded-full py-2 text-xs font-bold"
    >
      {repeatLabel(t)}
    </button>
  ))}
</div>

            <button
  onClick={saveItem}
  style={pillButtonStyle(true)}
  className="w-full rounded-xl py-3 font-bold"
>
  {editingItem ? "수정 저장하기" : "등록하기"}
</button>
          </div>
        )}

        <div className={`${cardStyle} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-card-muted">◀</button>
            <h2 className="font-bold text-card-muted">{format(currentMonth, "yyyy년 M월", { locale: ko })}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-card-muted">▶</button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="text-xs text-card-muted">{d}</div>
            ))}

            {days.map((day) => (
              <button
  key={day.toString()}
  onClick={() => setSelectedDate(day)}
  style={selectedDate && isSameDay(day, selectedDate) ? pillButtonStyle(true) : undefined}
  className="relative h-10 rounded-full text-sm text-card-muted"
>
                {format(day, "d")}
                {anniversaryOnDay(day) && (
                  <Heart className="absolute top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 text-primary" fill="currentColor" />
                )}
                {eventOnDay(day) && (
                  <Star className="absolute top-0.5 right-1 h-2 w-2 text-primary" fill="currentColor" />
                )}
                {hasRecord(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px]">●</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && selectedRecords.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedRecords.map((record) => (
              <div
                key={`${record.type}-${record.id}-${record.occursOn}`}
                className={`${cardStyle} flex items-center gap-2 p-4 text-sm text-card-muted`}
              >
                {record.type === "diary" && <><BookOpen className="h-4 w-4 text-primary" /> {record.title}</>}
                {record.type === "work" && <><Clapperboard className="h-4 w-4 text-primary" /> {record.title}</>}
                {record.type === "music" && <><Music className="h-4 w-4 text-primary" /> {record.title}</>}
                {record.type === "anniversary" && <><Heart className="h-4 w-4 text-primary" fill="currentColor" /> {record.title}</>}
                {record.type === "event" && <><Star className="h-4 w-4 text-primary" fill="currentColor" /> {record.title}</>}
              </div>
            ))}
          </div>
        )}

        <section className="mt-8">
          <h2 className="mb-3 font-bold text-card-muted">기념일</h2>
          <div className="space-y-2">
            {anniversaries.length === 0 ? (
              <p className="text-sm text-card-muted">등록된 기념일이 없어요.</p>
            ) : (
              anniversaries.map((item) => (
                <div key={item.id} className={`${cardStyle} flex items-center justify-between p-4`}>
                  <button onClick={() => startEdit("anniversaries", item)} className="flex flex-1 items-center gap-3 text-left">
                    <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                    <div>
                      <p className="text-sm font-bold text-card-muted">{item.title}</p>
                      <p className="text-xs text-card-muted">
                        {item.date} · {repeatLabel(item.repeat_type ?? "none")}
                      </p>
                    </div>
                  </button>
                  <button onClick={() => deleteItem("anniversaries", item.id)} className="text-xs text-card-muted">삭제</button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 font-bold text-card-muted">일정</h2>
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-card-muted">등록된 일정이 없어요.</p>
            ) : (
              events.map((item) => (
                <div key={item.id} className={`${cardStyle} flex items-center justify-between p-4`}>
                  <button onClick={() => startEdit("events", item)} className="flex flex-1 items-center gap-3 text-left">
                    <Star className="h-4 w-4 text-primary" fill="currentColor" />
                    <div>
                      <p className="text-sm font-bold text-card-muted">{item.title}</p>
                      <p className="text-xs text-card-muted">
                        {item.date} · {repeatLabel(item.repeat_type ?? "none")}
                      </p>
                    </div>
                  </button>
                  <button onClick={() => deleteItem("events", item.id)} className="text-xs text-card-muted">삭제</button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
<BottomNav />
    </main>
  );
}