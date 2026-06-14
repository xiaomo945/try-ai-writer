"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface MigrationStatus {
  isMigrating: boolean;
  migrated: boolean;
  error: string | null;
}

export function useDataMigration() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<MigrationStatus>({
    isMigrating: false,
    migrated: false,
    error: null,
  });

  useEffect(() => {
    if (!session?.user?.email) return;

    const userEmail = session.user.email;

    const checkAndMigrate = async () => {
      // 检查是否已经迁移过
      const migratedKey = `migrated_to_db_${userEmail}`;
      if (localStorage.getItem(migratedKey)) {
        setStatus({ isMigrating: false, migrated: true, error: null });
        return;
      }

      setStatus({ isMigrating: true, migrated: false, error: null });

      try {
        // 迁移历史记录
        const historyData = localStorage.getItem("writing_history");
        if (historyData) {
          const history = JSON.parse(historyData);
          if (Array.isArray(history) && history.length > 0) {
            for (const record of history) {
              await fetch("/api/user/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: record.title || "Untitled",
                  mode: record.mode || "default",
                  result: record.result || "",
                }),
              });
            }
          }
        }

        // 迁移记忆银行
        const memoryData = localStorage.getItem("memory_bank");
        if (memoryData) {
          const memories = JSON.parse(memoryData);
          if (Array.isArray(memories) && memories.length > 0) {
            for (const memory of memories) {
              await fetch("/api/user/memories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  content: memory.content || "",
                  type: memory.type || "idea",
                }),
              });
            }
          }
        }

        // 迁移品牌声音
        const brandVoiceData = localStorage.getItem("brand_voice_profile");
        if (brandVoiceData) {
          const profile = JSON.parse(brandVoiceData);
          if (profile && Object.keys(profile).length > 0) {
            await fetch("/api/user/brand-voice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profile),
            });
          }
        }

        // 标记为已迁移
        localStorage.setItem(migratedKey, "true");
        
        // 清理旧的localStorage数据（可选，保留一段时间后再删除）
        // localStorage.removeItem("writing_history");
        // localStorage.removeItem("memory_bank");
        // localStorage.removeItem("brand_voice_profile");

        setStatus({ isMigrating: false, migrated: true, error: null });
      } catch (error) {
        console.error("Migration failed:", error);
        setStatus({
          isMigrating: false,
          migrated: false,
          error: error instanceof Error ? error.message : "Migration failed",
        });
      }
    };

    checkAndMigrate();
  }, [session?.user?.email]);

  return status;
}
