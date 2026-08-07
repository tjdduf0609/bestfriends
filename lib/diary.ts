import { supabase } from "@/lib/supabase";
export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  author: string;
  image_url: string | null;
  created_at: string;
  unlocked?: boolean; // 잠금 여부는 클라이언트에서 계산해서 채워넣음
}

export async function getDiaryEntriesWithLockStatus(
  myName: string,
  partnerName: string
): Promise<{ myEntries: DiaryEntry[]; partnerEntries: DiaryEntry[] }> {

  // 내가 쓴 개수
  const { count: myCount } = await supabase
    .from('diary')
    .select('*', { count: 'exact', head: true })
    .eq('author', myName);

  // 상대방 일기를 오래된 순으로 전부 가져와서 순번을 매김
  const { data: partnerData, error } = await supabase
    .from('diary')
    .select('*')
    .eq('author', partnerName)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const partnerEntries: DiaryEntry[] = (partnerData ?? []).map((entry, index) => ({
    ...entry,
    // index는 0부터 시작하니 +1 해서 몇 번째 글인지 계산
    unlocked: (myCount ?? 0) >= index + 1,
  }));

  // 내 일기는 항상 전부 보임
  const { data: myData } = await supabase
    .from('diary')
    .select('*')
    .eq('author', myName)
    .order('created_at', { ascending: false });

  const myEntries: DiaryEntry[] = (myData ?? []).map((entry) => ({
    ...entry,
    unlocked: true,
  }));

  return { myEntries, partnerEntries };
}