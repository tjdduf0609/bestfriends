"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, Input, Button } from "@/components";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const cardStyle = "rounded-3xl bg-surface shadow-sm";

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
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
    // ▼ 수정: person1/person2 → person1_name/person2_name
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

    if (target === "person1") {
      setPerson1Image(data.publicUrl);
    } else {
      setPerson2Image(data.publicUrl);
    }
  }

  async function saveSettings() {
    const { error } = await supabase.from("profileSettings").upsert({
      id: 1,
      couple_name: coupleName,
      // ▼ 수정: person1/person2 → person1_name/person2_name
      person1_name: person1,
      person2_name: person2,
      start_date: startDate,
      person1_image: person1Image,
      person2_image: person2Image,
    });

    if (error) {
      console.log(error);
      alert("저장 실패");
      return;
    }

    alert("저장되었습니다.");
  }

  return (
    <main className="min-h-screen bg-bg p-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader emoji="⚙️" title="설정" description="앱 정보를 변경합니다." />

        <div className={`${cardStyle} mt-8 space-y-6 p-6`}>
          <div>
            <p className="mb-2 font-semibold text-text">커플 이름</p>
            <Input value={coupleName} onChange={(e) => setCoupleName(e.target.value)} />
          </div>

          <div>
            <p className="mb-2 font-semibold text-text">첫 번째 이름</p>
            <Input value={person1} onChange={(e) => setPerson1(e.target.value)} />

            <input
              type="file"
              accept="image/*"
              className="mt-3 text-sm text-text-muted"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "person1");
              }}
            />

            {person1Image && (
              <img
                src={person1Image}
                className="mt-3 h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>

          <div>
            <p className="mb-2 font-semibold text-text">두 번째 이름</p>
            <Input value={person2} onChange={(e) => setPerson2(e.target.value)} />

            <input
              type="file"
              accept="image/*"
              className="mt-3 text-sm text-text-muted"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "person2");
              }}
            />

            {person2Image && (
              <img
                src={person2Image}
                className="mt-3 h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>

          {person1 && person2 && <WhoAmISelector name1={person1} name2={person2} />}

          <div>
            <p className="mb-2 font-semibold text-text">시작 날짜</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl bg-primary-soft p-4 text-sm text-text outline-none"
            />
          </div>

          <Button onClick={saveSettings}>저장하기</Button>
        </div>

        {/* ▼ 버그 수정: ThemeSwitcher를 return 안쪽으로 이동 */}
        <div className="mt-4">
          <ThemeSwitcher />
        </div>
      </div>
    </main>
  );
}