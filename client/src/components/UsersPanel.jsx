import { useState } from "react";

function UsersPanel({ onlineUsers = [], allMembers = [] }) {
  const [view, setView] = useState("online");

  const onlineIds = new Set(onlineUsers.map(u => u.userId));

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setView("online")}
          className={`flex-1 py-2 ${
            view === "online" ? "bg-neutral-800" : ""
          }`}
        >
          Online ({onlineUsers.length})
        </button>

        <button
          onClick={() => setView("all")}
          className={`flex-1 py-2 ${
            view === "all" ? "bg-neutral-800" : ""
          }`}
        >
          All Members ({allMembers.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(view === "online" ? onlineUsers : allMembers).map((user) => {
          const isOnline = onlineIds.has(user.userId);

          return (
            <div
              key={user.userId}
              className="flex items-center justify-between px-3 py-2 bg-neutral-800 rounded text-sm"
            >
              <span>{user.username}</span>

              {view === "all" && isOnline && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default UsersPanel;
