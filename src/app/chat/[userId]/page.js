"use client";

import { useEffect, useState, useRef } from "react";
import { initSocket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { getCookie } from "@/lib/cookies";

export default function ChatPage() {
  const { userId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const socketRef = useRef(null);
  const myId = getCookie("userId");
  const roomId = myId && userId ? [myId, userId].sort().join("-") : null;

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = initSocket();
    const socket = socketRef.current;

    const handleConnect = () => {
      console.log("🟢 Socket connected:", socket.id);
      setConnectionStatus("connected");
      
      // Join room after connection
      socket.emit("join", { roomId }, (ack) => {
        if (ack?.error) {
          console.error("Join error:", ack.error);
          setConnectionStatus("error");
          return;
        }
        console.log("✅ Joined room:", roomId);
      });
    };

    const handleDisconnect = () => {
      console.log("🔴 Socket disconnected");
      setConnectionStatus("disconnected");
    };

    const handleMessage = (msg) => {
      console.log("📩 Received message:", msg);
      
      // Check if message is from server (has timestamp) and is ours
      const isServerMessage = !!msg.timestamp;
      const isFromMe = msg.senderId === myId;
    
      if (isFromMe && isServerMessage) {
        // Replace optimistic message with server-verified one
        setMessages(prev => prev.map(m => 
          m.text === msg.text && !m.timestamp ? { ...msg, isSender: true } : m
        ));
      } else if (!isFromMe) {
        // Add new message from others
        setMessages(prev => [...prev, { ...msg, isSender: false }]);
      }
    };
    

    const handleConnectError = (err) => {
      console.error("Connection error:", err.message);
      setConnectionStatus("error");
    };

    // Setup listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message", handleMessage);

    // Initial connection
    if (socket.disconnected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message", handleMessage);
      socket.disconnect();
    };
  }, [roomId, myId]);

  const sendMessage = () => {
    if (!input.trim() || !roomId || !myId || !socketRef.current) return;
  
    const message = { 
      text: input, 
      senderId: myId,
      // Add temporary identifier
      temp: Date.now() 
    };
    
    // Optimistic update with temporary marker
    setMessages(prev => [...prev, { ...message, isSender: true }]);
    
    // Send through socket
    socketRef.current.emit("message", { roomId, message });
    
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Connection Status Indicator */}
      <div className={`mb-4 p-2 rounded text-sm ${
        connectionStatus === "connected" ? "bg-green-100 text-green-700" :
        connectionStatus === "error" ? "bg-red-100 text-red-700" :
        "bg-yellow-100 text-yellow-700"
      }`}>
        Status: {connectionStatus}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 max-w-xs rounded-lg ${
              msg.isSender 
                ? "bg-blue-600 text-white ml-auto" 
                : "bg-gray-100 text-black mr-auto"
            }`}
          >
            <p className="text-sm">{msg.text}</p>
            {msg.timestamp && (
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={connectionStatus !== "connected"}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={sendMessage}
          disabled={!input.trim() || connectionStatus !== "connected"}
        >
          Send
        </button>
      </div>
    </div>
  );
}