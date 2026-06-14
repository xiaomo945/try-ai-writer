"use client";

import { useState, useEffect } from "react";
import { UserPlus, Edit, Trash2, Shield, Loader2, X } from "lucide-react";

interface Participant {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
}

interface PermissionManagerProps {
  documentId: string;
  currentUserId: string;
  ownerEmail: string;
}

export function PermissionManager({
  documentId,
  currentUserId,
  ownerEmail,
}: PermissionManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("EDITOR");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, [documentId]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collaboration/permissions?documentId=${documentId}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
      }
    } catch (error) {
      console.error("Failed to load participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newEmail.trim()) return;

    setAdding(true);
    try {
      const res = await fetch("/api/collaboration/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          email: newEmail.trim(),
          role: newRole,
        }),
      });

      if (res.ok) {
        await loadParticipants();
        setNewEmail("");
        setNewRole("EDITOR");
        setShowAddModal(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add participant");
      }
    } catch (error) {
      console.error("Failed to add participant:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateRole = async (participantId: string, role: string) => {
    try {
      const res = await fetch("/api/collaboration/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          participantId,
          role,
        }),
      });

      if (res.ok) {
        await loadParticipants();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm("确定要移除这位协作者吗？")) return;

    try {
      const res = await fetch(
        `/api/collaboration/permissions?documentId=${documentId}&participantId=${participantId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        await loadParticipants();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to remove participant");
      }
    } catch (error) {
      console.error("Failed to remove participant:", error);
    }
  };

  const isOwner = participants.find((p) => p.userId === currentUserId)?.role === "OWNER";

  const getRoleBadge = (role: string) => {
    const badges = {
      OWNER: { label: "所有者", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
      EDITOR: { label: "编辑者", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      VIEWER: { label: "查看者", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
    };
    const badge = badges[role as keyof typeof badges] || badges.VIEWER;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">协作权限</h3>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            添加协作者
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: "#059669" }}
                >
                  {participant.name?.charAt(0)?.toUpperCase() || participant.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {participant.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">{participant.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && participant.userId !== currentUserId ? (
                  <select
                    value={participant.role}
                    onChange={(e) => handleUpdateRole(participant.id, e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EDITOR">编辑者</option>
                    <option value="VIEWER">查看者</option>
                  </select>
                ) : (
                  getRoleBadge(participant.role)
                )}

                {isOwner && participant.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加协作者模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">添加协作者</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  角色
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="EDITOR">编辑者 - 可以编辑文档</option>
                  <option value="VIEWER">查看者 - 只能查看文档</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                >
                  取消
                </button>
                <button
                  onClick={handleAddParticipant}
                  disabled={!newEmail.trim() || adding}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "添加"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
