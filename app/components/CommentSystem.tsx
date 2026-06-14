"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Check, Trash2, Loader2 } from "lucide-react";

interface CommentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  position: number;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

interface CommentSystemProps {
  documentId: string;
  currentUserId?: string;
}

export function CommentSystem({ documentId, currentUserId }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadComments();
  }, [documentId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?documentId=${documentId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          content: newComment.trim(),
          position: 0,
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolved = async (commentId: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      if (res.ok) {
        const updated = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updated : c))
        );
      }
    } catch (error) {
      console.error("Failed to toggle comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      const res = await fetch(`/api/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const filteredComments = comments.filter((c) =>
    showResolved ? true : !c.resolved
  );

  const resolvedCount = comments.filter((c) => c.resolved).length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            评论 ({comments.length})
          </h3>
        </div>
        {resolvedCount > 0 && (
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center"
          >
            {showResolved ? "隐藏已解决" : `显示已解决 (${resolvedCount})`}
          </button>
        )}
      </div>

      {/* 评论列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无评论</p>
            <p className="text-sm">在下方添加第一条评论</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-2xl border ${
                comment.resolved
                  ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: "#059669" }}
                >
                  {comment.user.name?.charAt(0)?.toUpperCase() || comment.user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {comment.user.name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {comment.resolved && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        已解决
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              {currentUserId === comment.userId && (
                <div className="flex items-center gap-2 mt-2 ml-11">
                  <button
                    onClick={() => handleToggleResolved(comment.id)}
                    className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 min-h-[44px]"
                  >
                    <Check className="w-3 h-3" />
                    {comment.resolved ? "重新打开" : "标记解决"}
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs px-2 py-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1 min-h-[44px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="添加评论..."
            className="flex-1 min-h-[60px] p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            className="self-end px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          按 Ctrl+Enter 发送
        </p>
      </div>
    </div>
  );
}
