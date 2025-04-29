"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatLayout({ children }) {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (data.users) {
      setUsers(data.users);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => router.push(`/chat/${user._id}`)}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Screen */}
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
