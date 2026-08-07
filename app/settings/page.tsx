"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PageHeader,
  Input,
  Button,
} from "@/components";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

<ThemeSwitcher />

function WhoAmISelector({
  name1,
  name2,
}: {
  name1: string;
  name2: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("myName")
      : null
  );

  const handleSelect = (name: string) => {
    localStorage.setItem("myName", name);
    setSelected(name);
  };

  return (
    <div className="flex gap-2 mt-4">
      {[name1, name2].map((name, index) => (
        <button
          key={`${name}-${index}`}
          onClick={() => handleSelect(name)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selected === name
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600"
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
    setPerson1(data.person1 ?? "");
    setPerson2(data.person2 ?? "");
    setStartDate(data.start_date ?? "");

    setPerson1Image(data.person1_image ?? "");
    setPerson2Image(data.person2_image ?? "");
  }

  async function uploadImage(
    file: File,
    target: "person1" | "person2"
  ) {
    const fileName = `${target}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("profiles")
      .upload(fileName, file);

    if (error) {
      alert("업로드 실패");
      return;
    }

    const { data } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);

    if (target === "person1") {
      setPerson1Image(data.publicUrl);
    } else {
      setPerson2Image(data.publicUrl);
    }
  }

  async function saveSettings() {
    const { error } = await supabase
      .from("profileSettings")
      .upsert({
        id: 1,
        couple_name: coupleName,
        person1,
        person2,
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
    <main className="min-h-screen bg-[#F7F8FA] p-6">
      <div className="mx-auto max-w-md">

        <PageHeader
          emoji="⚙️"
          title="설정"
          description="앱 정보를 변경합니다."
        />

        <div
          className="
          mt-8
          rounded-2xl
          border
          border-gray-100
          bg-white
          p-6
          shadow-sm
          space-y-6
        "
        >
          <div>
            <p className="mb-2 font-semibold">
              커플 이름
            </p>

            <Input
              value={coupleName}
              onChange={(e) =>
                setCoupleName(e.target.value)
              }
            />
          </div>

          <div>
            <p className="mb-2 font-semibold">
              첫 번째 이름
            </p>

            <Input
              value={person1}
              onChange={(e) =>
                setPerson1(e.target.value)
              }
            />

            <input
              type="file"
              accept="image/*"
              className="mt-3"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (file) {
                  uploadImage(file, "person1");
                }
              }}
            />

            {person1Image && (
              <img
                src={person1Image}
                className="mt-3 h-20 w-20 rounded-full object-cover border"
              />
            )}
          </div>

          <div>
            <p className="mb-2 font-semibold">
              두 번째 이름
            </p>

            <Input
              value={person2}
              onChange={(e) =>
                setPerson2(e.target.value)
              }
            />

            <input
              type="file"
              accept="image/*"
              className="mt-3"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (file) {
                  uploadImage(file, "person2");
                }
              }}
            />

            {person2Image && (
              <img
                src={person2Image}
                className="mt-3 h-20 w-20 rounded-full object-cover border"
              />
            )}
          </div>

          {person1 && person2 && (
  <WhoAmISelector
    name1={person1}
    name2={person2}
  />
)}

          <div>
            <p className="mb-2 font-semibold">
              시작 날짜
            </p>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              p-4
              text-sm
              outline-none
              focus:border-black
            "
            />
          </div>

          <Button onClick={saveSettings}>
            저장하기
          </Button>
        </div>
      </div>
    </main>
  );
}