// components/DiaryEntryCard.tsx
import { DiaryEntry } from "@/lib/diary";
import { formatDiaryDate } from "@/lib/formatDate";
import { Lock } from "lucide-react";

export function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  if (!entry.unlocked) {
    return (
      <div className="rounded-2xl bg-primary-soft p-6 flex flex-col items-center justify-center text-center gap-2">
        <Lock className="w-6 h-6 text-primary" />
        <p className="text-sm text-text-muted">
          아직 잠겨있어요. 일기를 먼저 써보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-text">{entry.title}</h3>
      <p className="text-xs text-text-muted mb-2">{formatDiaryDate(entry.created_at)}</p>
      {entry.image_url && (
        <img src={entry.image_url} alt="" className="rounded-xl mb-2" />
      )}
      <p className="whitespace-pre-wrap text-sm text-text">{entry.content}</p>
    </div>
  );
}