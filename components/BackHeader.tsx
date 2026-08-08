"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center py-2">
      <button onClick={() => router.back()} className="text-text">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-center text-lg font-bold text-text">{title}</h1>
      <div className="w-5" />
    </div>
  );
}