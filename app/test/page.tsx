"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";


export default function TestPage() {


  useEffect(() => {

    const testConnection = async () => {

      const { data, error } =
        await supabase
          .from("test")
          .select("*");


      console.log("data:", data);

      console.log("error:", error);

    };


    testConnection();

  }, []);



  return (
    <main className="p-10">
      Supabase Test
    </main>
  );

}