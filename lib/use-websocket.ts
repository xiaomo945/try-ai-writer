"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursorPosition?: number;
}

interface EditOperation {
  documentId: string;
  userId: string;
  operation: {
    type: "insert" | "delete" | "replace";
    position: number;
    content?: string;
    length?: number;
  };
  timestamp: number;
}

interface UseWebSocketOptions {
  documentId: string;
  user: CollaborationUser | null;
  onUserJoined?: (user: CollaborationUser) => void;
  onUserLeft?: (data: { userId: string }) => void;
  onRoomUsers?: (users: CollaborationUser[]) => void;
  onCursorMoved?: (data: { userId: string; userName: string; color: string; position: number }) => void;
  onEditApplied?: (data: EditOperation & { userId: string }) => void;
  onContentUpdated?: (data: { userId: string; content: string }) => void;
}

interface UseWebSocketReturn {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendCursorMove: (position: number) => void;
  sendEditOperation: (operation: EditOperation["operation"]) => void;
  sendContentSync: (content: string) => void;
}

export function useWebSocket({
  documentId,
  user,
  onUserJoined,
  onUserLeft,
  onRoomUsers,
  onCursorMoved,
  onEditApplied,
  onContentUpdated,
}: UseWebSocketOptions): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;

    const socket = io(socketUrl, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnection: false, // 手动管理重连
    });

    socket.on("connect", () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;

      // 加入文档房间
      socket.emit("join-room", {
        documentId,
        user,
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      attemptReconnect();
    });

    socket.on("connect_error", () => {
      setConnected(false);
      attemptReconnect();
    });

    // 监听事件
    socket.on("user-joined", (data: { user: CollaborationUser }) => {
      onUserJoined?.(data.user);
    });

    socket.on("user-left", (data: { userId: string }) => {
      onUserLeft?.(data);
    });

    socket.on("room-users", (users: CollaborationUser[]) => {
      onRoomUsers?.(users);
    });

    socket.on("cursor-moved", (data: { userId: string; userName: string; color: string; position: number }) => {
      onCursorMoved?.(data);
    });

    socket.on("edit-applied", (data: EditOperation & { userId: string }) => {
      onEditApplied?.(data);
    });

    socket.on("content-updated", (data: { userId: string; content: string }) => {
      onContentUpdated?.(data);
    });

    socketRef.current = socket;
  }, [documentId, user, onUserJoined, onUserLeft, onRoomUsers, onCursorMoved, onEditApplied, onContentUpdated]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) return;

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit("leave-room", { documentId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
  }, [documentId]);

  const sendCursorMove = useCallback((position: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("cursor-move", { documentId, position });
    }
  }, [documentId]);

  const sendEditOperation = useCallback((operation: EditOperation["operation"]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("edit-operation", {
        documentId,
        userId: user?.id || "",
        operation,
        timestamp: Date.now(),
      });
    }
  }, [documentId, user]);

  const sendContentSync = useCallback((content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("content-sync", { documentId, content });
    }
  }, [documentId]);

  // 当user和documentId变化时自动连接
  useEffect(() => {
    if (user && documentId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [user, documentId]);

  return {
    connected,
    connect,
    disconnect,
    sendCursorMove,
    sendEditOperation,
    sendContentSync,
  };
}
