"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { initSocket } from "@/lib/socket";

let socket;

export default function ChatPage() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket = initSocket();

    // Join room (between two user ids)
    const roomId = generateRoomId(userId);
    socket.emit("join", { roomId });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchMessages = async () => {
    const res = await fetch(`/api/message/${userId}`);
    const data = await res.json();
    if (data.success) {
      setMessages(data.messages);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify({ receiverId: userId, text: input }),
    });

    const data = await res.json();
    if (data.success) {
      const roomId = generateRoomId(userId);
      socket.emit("message", {
        roomId,
        message: { ...data.message, isSender: true },
      });
      setMessages((prev) => [...prev, { ...data.message, isSender: true }]);
      setInput("");
    }
  };

  const generateRoomId = (otherUserId) => {
    const me = typeof window !== "undefined" && localStorage.getItem("my_id");
    return [me, otherUserId].sort().join("-");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div key={msg._id} className={`p-2 rounded max-w-xs ${msg.isSender ? "bg-blue-500 text-white ml-auto" : "bg-gray-300 text-black"}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex mt-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-l px-4 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}
