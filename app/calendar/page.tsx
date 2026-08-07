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
} from "date-fns";

import { ko } from "date-fns/locale";

import { supabase } from "@/lib/supabase";

import { PageHeader, Card, Input, Button } from "@/components";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ▼ 추가: 등록 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [formKind, setFormKind] = useState<"anniversary" | "event">("anniversary");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formRepeat, setFormRepeat] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [currentMonth]);

  async function loadRecords() {
    const { data: diaries } = await supabase.from("diaries").select("*");
    const { data: works } = await supabase.from("works").select("*");
    const { data: music } = await supabase.from("music").select("*");
    const { data: anniversaries } = await supabase.from("anniversaries").select("*");
    const { data: events } = await supabase.from("events").select("*");

    const year = currentMonth.getFullYear();

    // ▼ 추가: 반복 기념일/일정을 "이번에 보고 있는 달의 연도" 기준으로 날짜 재계산
    const resolveOccurrence = (item: any) => {
      const original = new Date(item.date);
      if (item.repeat_yearly) {
        return new Date(year, original.getMonth(), original.getDate());
      }
      return original;
    };

    const merged = [
      ...(diaries ?? []).map((item) => ({
        ...item,
        type: "diary",
        occursOn: new Date(item.created_at),
      })),

      ...(works ?? []).map((item) => ({
        ...item,
        type: "work",
        occursOn: new Date(item.created_at),
      })),

      ...(music ?? []).map((item) => ({
        ...item,
        type: "music",
        occursOn: new Date(item.created_at),
      })),

      ...(anniversaries ?? []).map((item) => ({
        ...item,
        type: "anniversary",
        occursOn: resolveOccurrence(item),
      })),

      ...(events ?? []).map((item) => ({
        ...item,
        type: "event",
        occursOn: resolveOccurrence(item),
      })),
    ];

    setRecords(merged);
  }

  async function saveNewItem() {
    if (!formTitle.trim() || !formDate) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }

    const table = formKind === "anniversary" ? "anniversaries" : "events";

    const { error } = await supabase.from(table).insert({
      title: formTitle,
      date: formDate,
      repeat_yearly: formRepeat,
    });

    if (error) {
      console.log("저장 실패", error.message);
      return;
    }

    setFormTitle("");
    setFormDate("");
    setFormRepeat(true);
    setShowForm(false);
    await loadRecords();
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  function hasRecord(day: Date) {
    return records.some((record) => isSameDay(record.occursOn, day));
  }

  // ▼ 추가: 기념일/일정 여부만 따로 체크 (점 색깔 다르게 표시하려고)
  function hasAnniversaryOrEvent(day: Date) {
    return records.some(
      (record) =>
        (record.type === "anniversary" || record.type === "event") &&
        isSameDay(record.occursOn, day)
    );
  }

  const selectedRecords = records.filter(
    (record) => selectedDate && isSameDay(record.occursOn, selectedDate)
  );

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader emoji="📅" title="달력" description="우리의 기록을 한눈에 봐요" />

        <div className="mt-8 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>◀</button>
            <h2 className="font-bold text-lg">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>▶</button>
          </div>

          <div className="grid grid-cols-7 text-center gap-2">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="text-xs text-gray-400">
                {day}
              </div>
            ))}

            {days.map((day) => (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`h-10 rounded-full text-sm relative ${
                  selectedDate && isSameDay(day, selectedDate)
                    ? "bg-pink-400 text-white"
                    : ""
                }`}
              >
                {format(day, "d")}

                {/* ▼ 추가: 기념일/일정은 다른 색 점으로 구분 */}
                {hasAnniversaryOrEvent(day) && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-pink-500">
                    ★
                  </span>
                )}

                {hasRecord(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px]">
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ▼ 추가: 기념일/일정 등록 토글 버튼 */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm font-bold text-gray-500"
        >
          {showForm ? "닫기" : "+ 기념일 · 일정 등록하기"}
        </button>

        {showForm && (
          <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFormKind("anniversary")}
                className={`flex-1 rounded-full py-2 text-sm font-bold border ${
                  formKind === "anniversary" ? "bg-black text-white" : "bg-white"
                }`}
              >
                💖 기념일
              </button>
              <button
                onClick={() => setFormKind("event")}
                className={`flex-1 rounded-full py-2 text-sm font-bold border ${
                  formKind === "event" ? "bg-black text-white" : "bg-white"
                }`}
              >
                🗓️ 일정
              </button>
            </div>

            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={formKind === "anniversary" ? "예: 100일, 1주년" : "예: OO 생일"}
            />

            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm"
            />

            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={formRepeat}
                onChange={(e) => setFormRepeat(e.target.checked)}
              />
              매년 반복
            </label>

            <Button onClick={saveNewItem}>등록하기</Button>
          </div>
        )}

        {selectedDate && (
          <section className="mt-8">
            <h2 className="mb-4 font-bold text-xl">
              {format(selectedDate, "M월 d일 기록")}
            </h2>

            {selectedRecords.length === 0 ? (
              <Card>기록이 없습니다.</Card>
            ) : (
              <div className="space-y-3">
                {selectedRecords.map((record) => (
                  <Card key={`${record.type}-${record.id}`}>
                    {record.type === "diary" && <>📖 {record.title}</>}
                    {record.type === "work" && <>🎬 {record.title}</>}
                    {record.type === "music" && <>🎵 {record.title}</>}
                    {record.type === "anniversary" && <>💖 {record.title}</>}
                    {record.type === "event" && <>🎂 {record.title}</>}
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}