export default function TodayMessageCard() {
  return (
    <div className="rounded-3xl bg-surface p-6 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💬</span>
        <h2 className="font-bold text-lg text-text">오늘의 한마디</h2>
      </div>

      <p className="whitespace-pre-line text-text leading-relaxed">
        서호윤 바보
        {"\n"}
        서호윤 똥 먹어
      </p>

      <div className="mt-4 text-right text-sm text-text-muted">from. bestfriends</div>
    </div>
  );
}