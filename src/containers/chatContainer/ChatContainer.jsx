"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatHomePage() {
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [threadName, setThreadName] = useState("");

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    const res = await fetch("/api/thread");
    const data = await res.json();
    if (data.success) {
      setThreads(data.threads);
    }
  };

  const createThread = async (e) => {
    e.preventDefault();
    if (!threadName.trim()) return;

    const res = await fetch("/api/thread", {
      method: "POST",
      body: JSON.stringify({ name: threadName }),
    });

    const data = await res.json();
    if (data.success) {
      setThreadName("");
      fetchThreads();
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      {/* <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">My Threads</h2>

        <form onSubmit={createThread} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New Thread Name"
            value={threadName}
            onChange={(e) => setThreadName(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {threads.map((thread) => (
            <div
              key={thread._id}
              onClick={() => router.push(`/chat/${thread._id}`)}
              className="p-4 border rounded hover:bg-gray-100 cursor-pointer"
            >
              {thread.name}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
