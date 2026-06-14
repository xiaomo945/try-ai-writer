"use client";

import { useDataMigration } from "@/lib/migration";

export function DataMigration() {
  const status = useDataMigration();

  if (status.isMigrating) {
    return (
      <div className="fixed top-4 right-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-lg z-50 max-w-xs">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          正在同步数据到云端...
        </p>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 shadow-lg z-50 max-w-xs">
        <p className="text-sm text-red-700 dark:text-red-300">
          数据同步失败：{status.error}
        </p>
      </div>
    );
  }

  return null;
}
