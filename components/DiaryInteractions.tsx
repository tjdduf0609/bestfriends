"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export function DiaryInteractions({
  diaryId,
  myName,
}: {
  diaryId: string;
  myName: string | null;
}) {
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const loadLikes = async () => {
    const { data, error } = await supabase
      .from("diary_likes")
      .select("liker_name")
      .eq("diary_id", diaryId);

    if (error) {
      console.log("하트 불러오기 실패", error.message);
      return;
    }

    setLikeCount(data?.length ?? 0);
    setLikedByMe(!!data?.find((l) => l.liker_name === myName));
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("diary_comments")
      .select("*")
      .eq("diary_id", diaryId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("댓글 불러오기 실패", error.message);
      return;
    }

    setComments(data ?? []);
  };

  useEffect(() => {
    loadLikes();
    loadComments();
  }, [diaryId]);

  const toggleLike = async () => {
    if (!myName) {
      alert("먼저 '나는 누구인가요'를 선택해주세요.");
      return;
    }

    if (likedByMe) {
      const { error } = await supabase
        .from("diary_likes")
        .delete()
        .eq("diary_id", diaryId)
        .eq("liker_name", myName);

      if (error) {
        console.log("하트 취소 실패", error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("diary_likes")
        .insert({ diary_id: diaryId, liker_name: myName });

      if (error) {
        console.log("하트 실패", error.message);
        return;
      }
    }

    await loadLikes();
  };

  const submitComment = async () => {
    if (!myName) {
      alert("먼저 '나는 누구인가요'를 선택해주세요.");
      return;
    }
    if (!newComment.trim()) return;

    const { error } = await supabase.from("diary_comments").insert({
      diary_id: diaryId,
      author: myName,
      content: newComment.trim(),
    });

    if (error) {
      console.log("댓글 저장 실패", error.message);
      return;
    }

    setNewComment("");
    await loadComments();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("diary_comments").delete().eq("id", id);
    if (error) {
      console.log("댓글 삭제 실패", error.message);
      return;
    }
    await loadComments();
  };

  return (
    <div className="mt-4 border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 text-sm font-medium transition ${
            likedByMe ? "text-primary" : "text-text-muted"
          }`}
        >
          <Heart className="h-4 w-4" fill={likedByMe ? "currentColor" : "none"} /> {likeCount}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-text-muted"
        >
          <MessageCircle className="h-4 w-4" /> {comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between rounded-lg bg-primary-soft/40 px-3 py-2"
            >
              <div>
                <p className="text-xs font-bold text-text-muted">{c.author}</p>
                <p className="text-sm text-text">{c.content}</p>
              </div>
              {c.author === myName && (
                <button onClick={() => deleteComment(c.id)} className="text-xs text-text-muted">
                  삭제
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="댓글을 남겨보세요"
              className="flex-1 rounded-lg bg-primary-soft/40 px-3 py-2 text-sm text-text outline-none"
            />
            <button
              onClick={submitComment}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}