"use client";

import { IconSend } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/api";

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface CommentsSectionProps {
  expenseId: string;
  currentUserId: string;
}

export function CommentsSection({
  expenseId,
  currentUserId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Fetch comments initially
    const loadComments = async () => {
      try {
        const data = await fetchApi<Comment[]>(
          `/comments?expenseId=${expenseId}`,
        );
        setComments(data);
      } catch (err: any) {
        console.error("Failed to load comments:", err);
      }
    };
    loadComments();

    // 2. Setup WebSocket connection
    const token = localStorage.getItem("token");
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_expense", expenseId);
    });

    socket.on("new_comment", (comment: Comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socket.emit("leave_expense", expenseId);
      socket.disconnect();
    };
  }, [expenseId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await fetchApi("/comments", {
        method: "POST",
        body: JSON.stringify({ expenseId, message: newComment.trim() }),
      });
      setNewComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[350px]">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Comments Activity
      </h4>

      <div className="flex-1 overflow-y-auto border border-border rounded-xl p-3 bg-muted/20 space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No discussion yet. Start the conversation!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${c.user.id === currentUserId ? "ml-auto flex-row-reverse" : ""}`}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={c.user.avatarUrl || undefined} />
                <AvatarFallback className="text-[10px]">
                  {c.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-xl px-3 py-2 border text-xs ${c.user.id === currentUserId ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5 opacity-80">
                  <span className="font-bold text-[10px]">{c.user.name}</span>
                  <span className="text-[9px] font-mono">
                    {new Date(c.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="leading-normal break-words">{c.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          placeholder="Ask a question or clarify splits..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
          className="text-xs border-border"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !newComment.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shrink-0"
        >
          <IconSend size={14} />
        </Button>
      </form>
    </div>
  );
}
