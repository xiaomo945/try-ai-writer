"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, TrendingUp } from "lucide-react";

interface ReminderSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  time: string;
  message: string;
}

export function ReturnReminder() {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    frequency: "daily",
    time: "09:00",
    message: "Time to write! Your AI assistant is ready.",
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem("reminder_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const saveSettings = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    localStorage.setItem("reminder_settings", JSON.stringify(newSettings));
    
    if (newSettings.enabled) {
      scheduleReminder(newSettings);
    }
  };

  const scheduleReminder = (reminderSettings: ReminderSettings) => {
    // In a real app, this would use a backend service or service worker
    // For now, we'll use setTimeout for demo purposes
    const [hours = 9, minutes = 0] = reminderSettings.time.split(":").map(Number);
    const now = new Date();
    const nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);
    
    if (nextReminder <= now) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }
    
    const delay = nextReminder.getTime() - now.getTime();
    
    setTimeout(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Try AI Writer", {
          body: reminderSettings.message,
          icon: "/favicon.ico",
        });
      }
      
      // Reschedule for next day
      if (reminderSettings.enabled) {
        scheduleReminder(reminderSettings);
      }
    }, delay);
  };

  const toggleReminder = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    saveSettings(newSettings);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            Return Reminders
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Get notified to maintain your writing habit
          </p>
        </div>
        <Bell className="w-8 h-8 text-emerald-600" />
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            Enable Reminders
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {settings.enabled ? "Reminders are active" : "Reminders are paused"}
          </p>
        </div>
        <button
          onClick={toggleReminder}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Settings */}
      {settings.enabled && (
        <div className="space-y-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span>Customize Reminder</span>
            <Clock className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Frequency
                </label>
                <select
                  value={settings.frequency}
                  onChange={(e) =>
                    saveSettings({
                      ...settings,
                      frequency: e.target.value as "daily" | "weekly" | "custom",
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) =>
                    saveSettings({ ...settings, time: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <input
                  type="text"
                  value={settings.message}
                  onChange={(e) =>
                    saveSettings({ ...settings, message: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Next Reminder Info */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Next Reminder
              </p>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Tomorrow at {settings.time}
            </p>
          </div>
        </div>
      )}

      {/* Benefits */}
      {!settings.enabled && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Why enable reminders?
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Build a consistent writing habit</li>
            <li>• Never miss your daily writing session</li>
            <li>• Improve your writing skills faster</li>
          </ul>
        </div>
      )}
    </div>
  );
}
