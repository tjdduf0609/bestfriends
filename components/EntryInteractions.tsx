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

type EntryType = "diary" | "work" | "music";

export function EntryInteractions({
  type,
  entryId,
  myName,
}: {
  type: EntryType;
  entryId: string;
  myName: string | null;
}) {
  const likesTable = `${type}_likes`;
  const commentsTable = `${type}_comments`;
  const idColumn = `${type}_id`;

  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const loadLikes = async () => {
    const { data, error } = await supabase.from(likesTable).select("liker_name").eq(idColumn, entryId);
    if (error) {
      console.log("좋아요 불러오기 실패", error.message);
      return;
    }
    setLikeCount(data?.length ?? 0);
    setLikedByMe(!!data?.find((l: any) => l.liker_name === myName));
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from(commentsTable)
      .select("*")
      .eq(idColumn, entryId)
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
  }, [entryId]);

  const toggleLike = async () => {
    if (!myName) {
      alert("먼저 '나는 누구인가요'를 선택해주세요.");
      return;
    }

    if (likedByMe) {
      const { error } = await supabase
        .from(likesTable)
        .delete()
        .eq(idColumn, entryId)
        .eq("liker_name", myName);
      if (error) {
        console.log("좋아요 취소 실패", error.message);
        return;
      }
    } else {
      const { error } = await supabase.from(likesTable).insert({ [idColumn]: entryId, liker_name: myName });
      if (error) {
        console.log("좋아요 실패", error.message);
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

    const { error } = await supabase
      .from(commentsTable)
      .insert({ [idColumn]: entryId, author: myName, content: newComment.trim() });

    if (error) {
      console.log("댓글 저장 실패", error.message);
      return;
    }

    setNewComment("");
    await loadComments();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from(commentsTable).delete().eq("id", id);
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
            likedByMe ? "text-primary" : "text-card-muted"
          }`}
        >
          <Heart className="h-4 w-4" fill={likedByMe ? "currentColor" : "none"} /> {likeCount}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-card-muted"
        >
          <MessageCircle className="h-4 w-4" /> {comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between rounded-lg bg-primary-soft/40 px-3 py-2">
              <div>
                <p className="text-xs font-bold text-card-muted">{c.author}</p>
                <p className="text-sm text-card">{c.content}</p>
              </div>
              {c.author === myName && (
                <button onClick={() => deleteComment(c.id)} className="text-xs text-card-muted">
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
              className="flex-1 rounded-lg bg-primary-soft/40 px-3 py-2 text-sm text-card outline-none"
            />
            <button onClick={submitComment} className="rounded-lg bg-primary px-4 py-2 text-sm text-card outline-none">
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}