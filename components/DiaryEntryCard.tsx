// components/DiaryEntryCard.tsx
import { DiaryEntry } from "@/lib/diary";
import { formatDiaryDate } from "@/lib/formatDate";

export function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card">{entry.title}</h3>
      <p className="mb-2 text-xs text-card-muted">{formatDiaryDate(entry.created_at)}</p>
      {entry.image_url && (
        <img src={entry.image_url} alt="" className="mb-2 rounded-xl" />
      )}
      <p className="whitespace-pre-wrap text-sm text-card">{entry.content}</p>
    </div>
  );
}