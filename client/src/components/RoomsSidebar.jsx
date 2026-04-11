import { Plus } from "lucide-react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import RoomActionsMenu from "./RoomActionsMenu";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";

function RoomsSidebar({ rooms, onSelectRoom, onCreate, onLeaveRoom, onDeleteRoom, onManageUsers, onAddUser }) {
  const location = useLocation();
  const activeRoomId = location.pathname.startsWith("/editor/")
    ? location.pathname.split("/editor/")[1]
    : null;

  const copyInvite = async (roomId) => {
    const link = `${window.location.origin}/editor/${roomId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied");
  };

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      return jwtDecode(token).userId;
    } catch (e) {
      return null;
    }
  }, []);

  return (
    <aside className="h-full w-full bg-neutral-900 flex flex-col">
      {/* ===== Header (fixed height) ===== */}
      <div className="shrink-0 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide">
          Code<span className="text-blue-500">Room</span>
        </h2>

        <button
          onClick={onCreate}
          className="p-2 rounded hover:bg-neutral-800"
          title="Create room"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* ===== Rooms list (scrollable) ===== */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-500">
            No rooms yet
          </p>
        )}

        {rooms.map((room) => {
          const isActive = activeRoomId === room.roomId;

          return (
            <div
              key={room.roomId}
              onClick={() => onSelectRoom(room)}
              className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition
                ${isActive
                  ? "bg-neutral-800"
                  : "hover:bg-neutral-800/70"
                }`}
            >
              {/* Avatar */}
              <Avatar
                name={room.roomName}
                size="38"
                round
                className="flex-shrink-0"
              />

              {/* Room name */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm truncate ${isActive ? "font-medium" : ""
                    }`}
                >
                  {room.roomName}
                </p>
              </div>

              <div className="transition-opacity">
                <RoomActionsMenu
                  isOwner={room.owner === currentUserId}
                  onLeave={() => onLeaveRoom(room.roomId)}
                  onDelete={() => onDeleteRoom(room.roomId)}
                  onCopyInvite={() => copyInvite(room.roomId)}
                  onManageUsers={() => {
                    onSelectRoom(room);
                    onManageUsers();
                  }}
                  onAddUser={() => onAddUser(room)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default RoomsSidebar;
