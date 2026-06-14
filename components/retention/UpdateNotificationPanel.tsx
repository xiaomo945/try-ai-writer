"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UpdateNotification {
  id: string;
  title: string;
  description: string;
  type: "feature" | "improvement" | "bugfix" | "announcement";
  version?: string;
  imageUrl?: string;
  actionUrl?: string;
  publishedAt: string;
  isActive: boolean;
  status: {
    id: string;
    userId: string;
    notificationId: string;
    read: boolean;
    dismissed: boolean;
    readAt: string | null;
    dismissedAt: string | null;
  } | null;
}

export function useUpdateNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async (unreadOnly = false) => {
    try {
      const url = unreadOnly
        ? "/api/update-notifications?unreadOnly=true"
        : "/api/update-notifications";
      const res = await fetch(url);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/update-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const dismiss = async (notificationId: string) => {
    try {
      await fetch("/api/update-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss", notificationId }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.status?.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    dismiss,
  };
}

export function UpdateNotificationPanel() {
  const { notifications, loading, unreadCount, markAsRead, dismiss } =
    useUpdateNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return "✨";
      case "improvement":
        return "⚡";
      case "bugfix":
        return "🔧";
      case "announcement":
        return "📢";
      default:
        return "🔔";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-purple-100 text-purple-700";
      case "improvement":
        return "bg-blue-100 text-blue-700";
      case "bugfix":
        return "bg-orange-100 text-orange-700";
      case "announcement":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative">
      {/* Bell icon with badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">功能更新</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">加载中...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>暂无更新通知</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.status?.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        {notification.version && (
                          <span className="text-xs text-gray-500">
                            v{notification.version}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type === "feature" && "新功能"}
                          {notification.type === "improvement" && "改进"}
                          {notification.type === "bugfix" && "修复"}
                          {notification.type === "announcement" && "公告"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.publishedAt).toLocaleDateString(
                            "zh-CN"
                          )}
                        </span>
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-xs text-blue-600 hover:text-blue-700 ml-auto"
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                          >
                            查看详情 →
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notification.status?.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        title="标记为已读"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
