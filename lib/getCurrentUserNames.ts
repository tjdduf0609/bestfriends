import { supabase } from "@/lib/supabase";

export interface UserNames {
  myName: string;
  partnerName: string;
}

export async function getCurrentUserNames(): Promise<UserNames | null> {


  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // settings 테이블에서 커플 정보 가져오기
  const { data: settings, error } = await supabase
    .from('settings')
    .select('name1, name1_email, name2, name2_email')
    .single();

  if (error || !settings) return null;

  const isName1 = settings.name1_email === user.email;

  return {
    myName: isName1 ? settings.name1 : settings.name2,
    partnerName: isName1 ? settings.name2 : settings.name1,
  };
}