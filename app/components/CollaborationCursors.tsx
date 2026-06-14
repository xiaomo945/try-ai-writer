"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/use-websocket";
import { OnlineUsersList } from "./OnlineUsersList";

interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursorPosition?: number;
}

interface CollaborationCursorsProps {
  documentId: string;
  user: CollaborationUser | null;
}

export function CollaborationCursors({ documentId, user }: CollaborationCursorsProps) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, { position: number; color: string; name: string }>>(new Map());

  const { connected, sendCursorMove } = useWebSocket({
    documentId,
    user,
    onUserJoined: (joinedUser) => {
      setUsers((prev) => {
        if (prev.find((u) => u.id === joinedUser.id)) return prev;
        return [...prev, joinedUser];
      });
    },
    onUserLeft: ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setCursors((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    },
    onRoomUsers: (roomUsers) => {
      setUsers(roomUsers.filter((u) => u.id !== user?.id));
    },
    onCursorMoved: (data) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          position: data.position,
          color: data.color,
          name: data.userName,
        });
        return next;
      });
    },
  });

  // 发送光标位置
  const handleCursorMove = (position: number) => {
    sendCursorMove(position);
  };

  return {
    connected,
    users,
    cursors,
    handleCursorMove,
    OnlineUsersComponent: <OnlineUsersList users={users} />,
  };
}
