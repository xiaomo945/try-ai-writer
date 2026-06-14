"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface DocumentVersion {
  id: string;
  documentId: string;
  title: string;
  version: number;
  createdAt: string;
}

export function useVersionHistory(documentId: string | null) {
  const { data: session } = useSession();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    if (!documentId || !session?.user?.email) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user/versions?documentId=${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch versions");
      }
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch versions");
    } finally {
      setLoading(false);
    }
  };

  const saveVersion = async (content: string, title?: string) => {
    if (!documentId || !session?.user?.email) return null;

    try {
      const response = await fetch("/api/user/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, content, title }),
      });

      if (!response.ok) {
        throw new Error("Failed to save version");
      }

      const data = await response.json();
      setVersions((prev) => [data.version, ...prev]);
      return data.version;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save version");
      return null;
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!session?.user?.email) return null;

    try {
      const response = await fetch(`/api/user/versions/${versionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch version content");
      }
      const data = await response.json();
      return data.content;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore version");
      return null;
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchVersions();
    }
  }, [documentId, session?.user?.email]);

  return {
    versions,
    loading,
    error,
    saveVersion,
    restoreVersion,
    refetch: fetchVersions,
  };
}
