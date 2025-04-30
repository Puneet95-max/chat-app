"use client";

import { useEffect, useState, useRef } from "react";
import { initSocket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { getCookie } from "@/lib/cookies";

export default function ChatPage() {
  const { userId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const myId = getCookie("userId");
  const roomId = myId && userId ? [myId, userId].sort().join("-") : null;

  useEffect(() => {
    if (!roomId) return;

    // Initialize socket
    socketRef.current = initSocket();
    const socket = socketRef.current;

    // Connection handler
    const handleConnect = () => {
      console.log("🟢 Socket connected:", socket.id);
      socket.emit("join", { roomId });
    };

    // Message handler
    const handleMessage = (message) => {
      const isSender = message.senderId === myId;
      setMessages((prev) => [...prev, { ...message, isSender }]);
    };

    // Join room and setup listeners
    socket.emit("join", { roomId });
    socket.on("connect", handleConnect);
    socket.on("message", handleMessage);

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("message", handleMessage);
      socket.disconnect();
    };
  }, [roomId, myId, userId]);

  const sendMessage = () => {
    if (!input.trim() || !roomId || !myId || !socketRef.current) return;

    const message = { text: input, senderId: myId };
    
    // Send through socket
    socketRef.current.emit("message", { roomId, message });
    
    // Optimistic update
    setMessages((prev) => [...prev, { ...message, isSender: true }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 max-w-xs rounded ${
              msg.isSender ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex mt-4">
        <input
          className="flex-1 border px-4 py-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}


// "use client";

// import { useEffect, useState, useRef } from "react";
// import { initSocket } from "@/lib/socket";
// import { useParams } from "next/navigation";
// import { getCookie } from "@/lib/cookies";

// export default function ChatPage() {
//   const { userId } = useParams();
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const socketRef = useRef(null);
//   const myId = getCookie("userId");
//   const roomId = myId && userId ? [myId, userId].sort().join("-") : null;

//   // Load chat history
//   useEffect(() => {
//     const loadMessages = async () => {
//       try {
//         const res = await fetch(`/api/messages/${userId}`);
//         if (!res.ok) throw new Error("Failed to load messages");
        
//         const { messages } = await res.json();
//         setMessages(messages);
//       } catch (error) {
//         console.error("Error loading messages:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (myId && userId) loadMessages();
//   }, [myId, userId]);

//   // Socket connection and real-time messages
//   useEffect(() => {
//     if (!roomId) return;

//     socketRef.current = initSocket();
//     const socket = socketRef.current;

//     const handleMessage = (message) => {
//       setMessages(prev => [...prev, {
//         text: message.text,
//         isSender: message.senderId === myId
//       }]);
//     };

//     socket.emit("join", { roomId });
//     socket.on("message", handleMessage);

//     return () => {
//       socket.off("message", handleMessage);
//       socket.disconnect();
//     };
//   }, [roomId, myId]);

//   const sendMessage = async () => {
//     if (!input.trim() || !roomId || !myId) return;

//     try {
//       // Save message to database
//       const res = await fetch("/api/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           receiverId: userId,
//           text: input
//         })
//       });

//       if (!res.ok) throw new Error("Failed to save message");

//       // Send via socket
//       const message = { text: input, senderId: myId };
//       socketRef.current.emit("message", { roomId, message });

//       // Optimistic update
//       setMessages(prev => [...prev, { ...message, isSender: true }]);
//       setInput("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//       alert("Failed to send message");
//     }
//   };

//   if (!myId) {
//     return <div className="p-4 text-red-500">Please login to chat</div>;
//   }

//   if (isLoading) {
//     return <div className="p-4 text-gray-500">Loading messages...</div>;
//   }

//   return (
//     <div className="flex flex-col h-screen p-4">
//       <div className="flex-1 overflow-y-auto space-y-2 mb-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`p-3 max-w-xs rounded-lg ${
//               msg.isSender 
//                 ? "bg-blue-600 text-white ml-auto" 
//                 : "bg-gray-100 text-black mr-auto"
//             }`}
//           >
//             <p className="text-sm">{msg.text}</p>
//           </div>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         <input
//           className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your message..."
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//           onClick={sendMessage}
//           disabled={!input.trim()}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }