"use client";

import { Send } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useSocket } from "@/lib/socket";

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  userId: string;
  user: { id: string; name: string };
}

export function CommentsSection({
  expenseId,
  currentUserId,
}: {
  expenseId: string;
  currentUserId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { socket, connected } = useSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const data = await api.getComments(expenseId);
        setComments(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchComments();
  }, [expenseId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_expense", expenseId);
    const handleNewComment = (comment: Comment) => {
      setComments((prev) =>
        prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
      );
    };
    socket.on("new_comment", handleNewComment);
    return () => {
      socket.emit("leave_expense", expenseId);
      socket.off("new_comment", handleNewComment);
    };
  }, [socket, expenseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when comments state changes
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = newComment.trim();
    if (!msg || loading) return;
    setLoading(true);
    try {
      await api.createComment({ expenseId, message: msg });
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <div className="flex flex-col h-[400px] border border-border bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between text-xs font-semibold">
        <span>Live Conversation</span>
        <span
          className={
            connected
              ? "text-emerald-500 font-medium"
              : "text-amber-500 font-medium"
          }
        >
          ● {connected ? "Connected" : "Reconnecting"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground pt-10">
            No comments yet. Start the discussion!
          </div>
        ) : (
          comments.map((comment) => {
            const isSelf = comment.userId === currentUserId;
            return (
              <div
                key={comment.id}
                className={`flex items-start gap-2.5 ${isSelf ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-7 w-7 bg-secondary border border-border">
                  <AvatarFallback className="text-[10px] font-bold">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-lg p-2.5 text-sm ${isSelf ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                >
                  {!isSelf && (
                    <div className="text-[10px] font-bold text-muted-foreground mb-0.5">
                      {comment.user.name}
                    </div>
                  )}
                  <p className="leading-normal break-words">
                    {comment.message}
                  </p>
                  <span className="text-[9px] opacity-70 block mt-1 text-right">
                    {new Date(comment.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-border bg-card flex gap-2"
      >
        <Input
          placeholder="Say something..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-background border-border text-sm flex-1 focus:ring-ring"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
