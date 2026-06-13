"use client";

import { Send } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
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
  const { user } = useAuth();

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
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) {
          return prev;
        }
        // Match and replace any matching temporary comment from this user
        const tempIndex = prev.findIndex(
          (c) =>
            c.id.startsWith("temp-") &&
            c.message === comment.message &&
            c.userId === comment.userId,
        );
        if (tempIndex !== -1) {
          const next = [...prev];
          next[tempIndex] = comment;
          return next;
        }
        return [...prev, comment];
      });
    };

    socket.on("new_comment", handleNewComment);
    return () => {
      socket.emit("leave_expense", expenseId);
      socket.off("new_comment", handleNewComment);
    };
  }, [socket, expenseId]);

  // Scroll to bottom whenever comments list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = newComment.trim();
    if (!msg) return;

    // Optimistic Update: clear input instantly and add temporary comment
    setNewComment("");

    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      message: msg,
      createdAt: new Date().toISOString(),
      userId: currentUserId,
      user: { id: currentUserId, name: user?.name || "You" },
    };

    setComments((prev) => [...prev, tempComment]);

    try {
      await api.createComment({ expenseId, message: msg });
    } catch (err) {
      console.error("Failed to send comment:", err);
      // Remove the optimistic comment if the request failed
      setComments((prev) => prev.filter((c) => c.id !== tempId));
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
    <div className="flex flex-col h-[550px] border border-border/80 bg-card rounded-[24px] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">
          Live Conversation
        </span>
        <span
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            connected
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          {connected ? "Connected" : "Reconnecting"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/10">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="relative mb-5 flex items-center justify-center">
              {/* Pink bubble illustration */}
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 text-primary animate-pulse text-xs">
                ✦
              </span>
              <span className="absolute -bottom-1 -left-1 text-primary/50 text-xs">
                ✦
              </span>
            </div>
            <h4 className="font-bold text-sm text-foreground">
              No comments yet
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Start the discussion!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isSelf = comment.userId === currentUserId;
            return (
              <div
                key={comment.id}
                className={`flex items-start gap-2.5 ${isSelf ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 bg-secondary border border-border/80 shrink-0">
                  <AvatarFallback className="text-[10px] font-bold">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-[18px] px-3.5 py-2.5 text-sm shadow-sm ${
                    isSelf
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card text-foreground rounded-tl-none border border-border/60"
                  }`}
                >
                  {!isSelf && (
                    <div className="text-[10px] font-bold text-primary mb-0.5">
                      {comment.user.name}
                    </div>
                  )}
                  <p className="leading-relaxed break-words font-medium text-xs">
                    {comment.message}
                  </p>
                  <span
                    className={`text-[9px] opacity-70 block mt-1 text-right ${isSelf ? "text-primary-foreground/90" : "text-muted-foreground"}`}
                  >
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
        className="p-4 border-t border-border bg-card flex gap-2.5 items-center"
      >
        <Input
          placeholder="Say something..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-muted/40 border-border/80 text-sm flex-1 focus:ring-ring rounded-full px-4 h-10"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-10 w-10 shrink-0 flex items-center justify-center shadow-sm"
        >
          <Send className="h-4.5 w-4.5" />
        </Button>
      </form>
    </div>
  );
}
