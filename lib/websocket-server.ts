import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursorPosition?: number;
}

export interface RoomData {
  documentId: string;
  user: CollaborationUser;
}

export interface EditOperation {
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

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]!;
}

export function initWebSocketServer(httpServer: HTTPServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // 加入文档协作房间
    socket.on("join-room", (data: RoomData) => {
      const room = `doc:${data.documentId}`;
      socket.join(room);
      socket.data = { ...data, color: getRandomColor() };

      // 通知房间内其他用户
      socket.to(room).emit("user-joined", {
        user: { ...data.user, color: socket.data.color },
      });

      // 发送房间内当前用户列表
      const sockets = io!.of("/").adapter.rooms.get(room);
      const users: CollaborationUser[] = [];
      if (sockets) {
        sockets.forEach((socketId) => {
          const s = io!.of("/").sockets.get(socketId);
          if (s?.data?.user) {
            users.push({ ...s.data.user, color: s.data.color });
          }
        });
      }
      socket.emit("room-users", users);
    });

    // 光标位置同步
    socket.on("cursor-move", (data: { documentId: string; position: number }) => {
      const room = `doc:${data.documentId}`;
      socket.to(room).emit("cursor-moved", {
        userId: socket.data.user?.id,
        userName: socket.data.user?.name,
        color: socket.data.color,
        position: data.position,
      });
    });

    // 编辑操作广播
    socket.on("edit-operation", (data: EditOperation) => {
      const room = `doc:${data.documentId}`;
      socket.to(room).emit("edit-applied", {
        ...data,
        userId: socket.data.user?.id,
      });
    });

    // 内容同步
    socket.on("content-sync", (data: { documentId: string; content: string }) => {
      const room = `doc:${data.documentId}`;
      socket.to(room).emit("content-updated", {
        userId: socket.data.user?.id,
        content: data.content,
      });
    });

    // 离开房间
    socket.on("leave-room", (data: { documentId: string }) => {
      const room = `doc:${data.documentId}`;
      socket.leave(room);
      socket.to(room).emit("user-left", {
        userId: socket.data.user?.id,
      });
    });

    // 断开连接
    socket.on("disconnect", () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
      if (socket.data?.user) {
        // 通知所有房间
        socket.rooms.forEach((room) => {
          if (room.startsWith("doc:")) {
            socket.to(room).emit("user-left", {
              userId: socket.data.user?.id,
            });
          }
        });
      }
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
