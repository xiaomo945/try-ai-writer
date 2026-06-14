"use client";

import { useState } from "react";
import { History, RotateCcw, X, Loader2, AlertTriangle } from "lucide-react";
import { useVersionHistory, type DocumentVersion } from "@/lib/use-version-history";

interface VersionHistoryPanelProps {
  documentId: string | null;
  onRestore: (content: string) => void;
  onClose: () => void;
}

export function VersionHistoryPanel({ documentId, onRestore, onClose }: VersionHistoryPanelProps) {
  const { versions, loading, error, restoreVersion, refetch } = useVersionHistory(documentId);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId);
    try {
      const content = await restoreVersion(versionId);
      if (content !== null) {
        onRestore(content);
        onClose();
      }
    } finally {
      setRestoringId(null);
      setConfirmRestore(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">版本历史</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">暂无版本历史</p>
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">保存文档后将自动创建版本</p>
            </div>
          )}

          {!loading && !error && versions.length > 0 && (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {version.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        版本 {version.version} · {formatDate(version.createdAt)}
                      </p>
                    </div>
                    {confirmRestore === version.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(version.id)}
                          disabled={restoringId === version.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-all min-h-[32px] disabled:opacity-50"
                        >
                          {restoringId === version.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          确认恢复
                        </button>
                        <button
                          onClick={() => setConfirmRestore(null)}
                          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors min-h-[32px]"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRestore(version.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-emerald-600/20 text-gray-600 dark:text-slate-300 hover:text-emerald-400 text-xs rounded-lg transition-all min-h-[32px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        恢复
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10">
          <button
            onClick={refetch}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300 text-sm rounded-lg transition-all min-h-[44px]"
          >
            刷新列表
          </button>
        </div>
      </div>
    </div>
  );
}
