"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Reminder {
  id: string;
  userId: string;
  type: "inactive" | "streak_warning" | "feature_suggestion";
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export function useReminders() {
  const { data: session } = useSession();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchReminders();
    }
  }, [session]);

  const fetchReminders = async (unreadOnly = false) => {
    try {
      const url = unreadOnly ? "/api/reminders?unreadOnly=true" : "/api/reminders";
      const res = await fetch(url);
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminderId: string) => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", reminderId }),
      });
      await fetchReminders();
    } catch (error) {
      console.error("Failed to mark reminder as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      await fetchReminders();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = reminders.filter((r) => !r.read).length;

  return {
    reminders,
    loading,
    unreadCount,
    fetchReminders,
    markAsRead,
    markAllAsRead,
  };
}

export function ReminderNotification() {
  const { reminders, unreadCount, markAsRead, markAllAsRead } = useReminders();
  const [isOpen, setIsOpen] = useState(false);

  if (unreadCount === 0) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inactive":
        return "👋";
      case "streak_warning":
        return "⚠️";
      case "feature_suggestion":
        return "💡";
      default:
        return "🔔";
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
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">通知</h3>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                全部已读
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {reminders.filter((r) => !r.read).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>暂无新通知</p>
              </div>
            ) : (
              reminders
                .filter((r) => !r.read)
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-1">
                          {reminder.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(reminder.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                          {reminder.actionUrl && (
                            <Link
                              href={reminder.actionUrl}
                              className="text-xs text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                markAsRead(reminder.id);
                                setIsOpen(false);
                              }}
                            >
                              查看详情 →
                            </Link>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => markAsRead(reminder.id)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
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
