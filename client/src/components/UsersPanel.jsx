import { useState } from "react";
import Avatar from "react-avatar";
import { Users, Circle, UserMinus } from "lucide-react";
import { getAvatarColor } from "./User";

function UsersPanel({ onlineUsers = [], allMembers = [], isOwner, currentUserId, onRemoveUser }) {
  const [view, setView] = useState("online");

  const onlineIds = new Set(onlineUsers.map((u) => u.userId));

  return (
    <div className="h-full flex flex-col bg-neutral-900/50">
      {/* Tabs */}
      <div className="flex p-1 bg-neutral-950/50 rounded-lg m-3 gap-1">
        <button
          onClick={() => setView("online")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
            view === "online"
              ? "bg-neutral-800 text-blue-400 shadow-sm shadow-blue-500/10"
              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
          }`}
        >
          <Circle
            size={8}
            fill="currentColor"
            className={view === "online" ? "text-green-500" : "text-neutral-600"}
          />
          Online ({onlineUsers.length})
        </button>

        <button
          onClick={() => setView("all")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
            view === "all"
              ? "bg-neutral-800 text-blue-400 shadow-sm shadow-blue-500/10"
              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
          }`}
        >
          <Users size={14} />
          All ({allMembers.length})
        </button>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
        {(view === "online" ? onlineUsers : allMembers).length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-600">
            <Users size={32} className="opacity-20 mb-2" />
            <p className="text-xs">No users found</p>
          </div>
        )}

        {(view === "online" ? onlineUsers : allMembers).map((user) => {
          const isOnline = onlineIds.has(user.userId);

          return (
            <div
              key={user.userId}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/50 transition-all duration-200 cursor-default"
            >
              <div className="relative">
                <Avatar
                  name={user.username}
                  size="32"
                  round="8px"
                  className="shadow-md"
                  textSizeRatio={2.5}
                  color={getAvatarColor(user.username)}
                />
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-neutral-900 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-200 truncate group-hover:text-blue-400 transition-colors">
                  {user.username}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  {isOnline ? "Active Now" : "Offline"}
                </p>
              </div>

              {isOwner && user.userId !== currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveUser(user.userId);
                  }}
                  className="flex items-center justify-center p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Remove from room"
                >
                  <UserMinus size={14} />
                </button>
              )}

              {!isOnline && !isOwner && (
                <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full group-hover:bg-neutral-500 transition-colors" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UsersPanel;
