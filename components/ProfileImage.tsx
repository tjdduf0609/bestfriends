"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";


interface Props {
  person: "person1" | "person2";
  imageUrl: string | null;
}


export default function ProfileImage({
  person,
  imageUrl,
}: Props) {

  const [preview, setPreview] = useState(imageUrl);
  const [loading, setLoading] = useState(false);


  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0];

    if (!file) return;


    setLoading(true);


    // 저장 경로
    const filePath =
      `${person}/${Date.now()}-${file.name}`;


    // Storage 업로드
    const {
      error: uploadError
    } = await supabase.storage
      .from("profiles")
      .upload(
        filePath,
        file,
        {
          upsert: true
        }
      );


    if(uploadError){
      console.error(uploadError);
      setLoading(false);
      return;
    }



    // 이미지 URL 생성
    const {
      data
    } = supabase.storage
      .from("profiles")
      .getPublicUrl(filePath);


    const url =
      data.publicUrl;



    // settings 업데이트
    const {
      error:updateError
    } = await supabase
      .from("profileSettings")
      .update({
        [`${person}_image`]: url
      })
      .eq(
        "id",
        1
      );



    if(updateError){
      console.error(updateError);
      setLoading(false);
      return;
    }



    // 즉시 화면 변경
    setPreview(url);

    setLoading(false);

  }



  return (
    <label className="cursor-pointer">

      <img
        src={
          preview ??
          "/default-profile.png"
        }
        className="
          w-24
          h-24
          rounded-full
          object-cover
        "
      />


      <input
        type="file"
        accept="image/*"
        hidden
        onChange={handleUpload}
      />


      {
        loading &&
        <span>
          업로드 중...
        </span>
      }

    </label>
  );
}