// app/api/socket/route.js
import { Server } from "socket.io";
import { NextResponse } from "next/server";

let io;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🟢 Initializing new Socket.io server...");
    io = new Server(res.socket.server, {
      path: "/api/socket/io", // important: avoid clash
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("✅ New client connected:", socket.id);

      // Join chat room between two users
      socket.on("join", ({ roomId }) => {
        socket.join(roomId);
        console.log(`🧵 Joined room: ${roomId}`);
      });

      // Handle incoming messages
      socket.on("message", ({ roomId, message }) => {
        socket.to(roomId).emit("message", message); // broadcast to room
      });

      socket.on("disconnect", () => {
        console.log("🔴 Disconnected:", socket.id);
      });
    });
  }

  res.end();
}
