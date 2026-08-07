// lib/formatDate.ts
export function formatDiaryDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, // 오전/오후 표기
  }).format(date);
}
// 예: "2026년 8월 6일 (목) 오후 3:24"