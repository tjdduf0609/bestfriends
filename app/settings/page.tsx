"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BackHeader } from "@/components/BackHeader";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";


const cardStyle = "rounded-3xl bg-white shadow-sm";
const gradientButton =
  "w-full rounded-xl py-4 font-bold text-white transition active:scale-[0.98]";
const gradientStyle = {
  background:
    "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
};

function NumberBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
      {n}
    </span>
  );
}

function WhoAmISelector({ name1, name2 }: { name1: string; name2: string }) {
  const [selected, setSelected] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("myName") : null
  );

  const handleSelect = (name: string) => {
    localStorage.setItem("myName", name);
    setSelected(name);
  };

  return (
    <div className="mt-4 flex gap-2">
      {[name1, name2].map((name, index) => (
        <button
          key={`${name}-${index}`}
          onClick={() => handleSelect(name)}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            selected === name ? "bg-primary text-white" : "bg-primary-soft text-text"
          }`}
        >
          나는 {name}이에요
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [coupleName, setCoupleName] = useState("");
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [startDate, setStartDate] = useState("");
  const [person1Image, setPerson1Image] = useState("");
  const [person2Image, setPerson2Image] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase
      .from("profileSettings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return;

    setCoupleName(data.couple_name ?? "");
    setPerson1(data.person1_name ?? "");
    setPerson2(data.person2_name ?? "");
    setStartDate(data.start_date ?? "");
    setPerson1Image(data.person1_image ?? "");
    setPerson2Image(data.person2_image ?? "");
  }

  async function uploadImage(file: File, target: "person1" | "person2") {
    const fileName = `${target}-${Date.now()}`;
    const { error } = await supabase.storage.from("profiles").upload(fileName, file);
    if (error) {
      alert("업로드 실패");
      return;
    }
    const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);
    if (target === "person1") setPerson1Image(data.publicUrl);
    else setPerson2Image(data.publicUrl);
  }

  async function saveSettings() {
    const { error } = await supabase.from("profileSettings").upsert({
      id: 1,
      couple_name: coupleName,
      person1_name: person1,
      person2_name: person2,
      start_date: startDate,
      person1_image: person1Image,
      person2_image: person2Image,
    });

    if (error) {
      alert("저장 실패");
      return;
    }
    alert("저장되었습니다.");
  }

  const daysSinceStart = startDate
    ? Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(startDate).setHours(0, 0, 0, 0)) / 86400000)
    : null;

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md space-y-4">
        <BackHeader title="설정" />

        <div className={`${cardStyle} flex items-center gap-3 p-5`}>
          <NumberBadge n={1} />
          <p className="w-24 shrink-0 text-sm font-bold text-text">커플 이름 설정</p>
          <input
            value={coupleName}
            onChange={(e) => setCoupleName(e.target.value)}
            className="flex-1 rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />
        </div>

        <div className={`${cardStyle} p-5`}>
          <div className="mb-3 flex items-center gap-3">
            <NumberBadge n={2} />
            <p className="text-sm font-bold text-text">첫 번째 사람 설정</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="mb-1 text-xs text-text-muted">이름</p>
              <input
                value={person1}
                onChange={(e) => setPerson1(e.target.value)}
                className="w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
              />
            </div>
            <div className="text-center">
              <p className="mb-1 text-xs text-text-muted">프로필 사진</p>
              <label className="block h-14 w-14 cursor-pointer overflow-hidden rounded-full bg-primary-soft">
                {person1Image ? (
                  <img src={person1Image} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">🙂</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, "person1");
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-5`}>
          <div className="mb-3 flex items-center gap-3">
            <NumberBadge n={3} />
            <p className="text-sm font-bold text-text">두 번째 사람 설정</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="mb-1 text-xs text-text-muted">이름</p>
              <input
                value={person2}
                onChange={(e) => setPerson2(e.target.value)}
                className="w-full rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
              />
            </div>
            <div className="text-center">
              <p className="mb-1 text-xs text-text-muted">프로필 사진</p>
              <label className="block h-14 w-14 cursor-pointer overflow-hidden rounded-full bg-primary-soft">
                {person2Image ? (
                  <img src={person2Image} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">🙂</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, "person2");
                  }}
                />
              </label>
            </div>
          </div>

          {person1 && person2 && <WhoAmISelector name1={person1} name2={person2} />}
        </div>

        <div className={`${cardStyle} flex items-center gap-3 p-5`}>
          <NumberBadge n={4} />
          <p className="w-24 shrink-0 text-sm font-bold text-text">함께한 시간 설정</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 rounded-xl bg-primary-soft/40 p-3 text-sm text-text outline-none"
          />
          {daysSinceStart !== null && (
            <span className="whitespace-nowrap text-xs font-bold text-primary">
              D+{daysSinceStart}
            </span>
          )}
        </div>

        <div className={`${cardStyle} p-5`}>
          <div className="mb-3 flex items-center gap-3">
            <NumberBadge n={5} />
            <p className="text-sm font-bold text-text">테마 색상 설정</p>
          </div>
          <ThemeSwitcher />
        </div>

        <button onClick={saveSettings} className={gradientButton} style={gradientStyle}>
          저장하기
        </button>
      </div>
    </main>
  );
}