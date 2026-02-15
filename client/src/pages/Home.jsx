import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { requireAuth } from "../utils/requireAuth";
import RoomsSidebar from "../components/RoomsSidebar";
import UsersPanel from "../components/UsersPanel";
import EmptyState from "../components/EmptyState";
import { Users, User, Settings, X, Home as HomeIcon } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rooms, setRooms] = useState([]);
  const [activePanel, setActivePanel] = useState("rooms");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("accessToken");
  const isEditorOpen = location.pathname.startsWith("/editor/");

  const joinRoom = async (roomId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        toast.error("Room not found or unauthorized");
        return;
      }

      const room = await res.json();

      await fetchRooms(); // refresh sidebar

      navigate(`/editor/${room.roomId}`, {
        state: { roomName: room.roomName },
      });
    } catch {
      toast.error("Failed to join room");
    }
  };

  const createRoom = async (roomName) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomName }),
      });

      if (!res.ok) {
        toast.error("Failed to create room");
        return;
      }

      const room = await res.json();
      await fetchRooms();

      navigate(`/editor/${room.roomId}`);
    } catch {
      toast.error("Error creating room");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Please login again");
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!requireAuth(navigate)) return;
    fetchRooms();
  }, []);

  return (
<div className="h-screen flex bg-neutral-950 text-white relative overflow-hidden">
      {/* ===== Sidebar ===== */}
      <div
        className={`
    fixed top-0 left-0 h-full w-72 bg-neutral-900 z-50
    transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:relative md:z-auto
  `}
      >
        <div className="flex h-full">
          {/* Icon Bar */}
          <div className="w-14 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-4">
            <div className="flex flex-col items-center gap-6 flex-1">
              <div className="flex flex-col items-center gap-6 flex-1">
                <button
                  onClick={() => setActivePanel("rooms")}
                  className={`p-2 rounded ${
                    activePanel === "rooms"
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800"
                  }`}
                >
                  <HomeIcon size={20} />
                </button>

                <button
                  onClick={() => setActivePanel("users")}
                  className={`p-2 rounded ${
                    activePanel === "users"
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800"
                  }`}
                >
                  <Users size={20} />
                </button>
              </div>

              <button
                onClick={() => setActivePanel("profile")}
                className="p-2 rounded hover:bg-neutral-800"
              >
                <User size={20} />
              </button>
            </div>

            <div className="mb-4">
              <button className="p-2 rounded hover:bg-neutral-800">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Rooms Panel */}
          <div className="flex-1 flex flex-col border-r border-neutral-800">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <h2 className="text-sm font-medium">Rooms</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activePanel === "rooms" && (
                <RoomsSidebar
                  rooms={rooms}
                  onSelectRoom={(room) => {
                    navigate(`/editor/${room.roomId}`, {
                      state: { roomName: room.roomName },
                    });
                    setSidebarOpen(false);
                  }}
                />
              )}

              {activePanel === "users" && (
                <UsersPanel onlineUsers={onlineUsers} allMembers={allMembers} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Overlay (Mobile Only) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header when NOT in editor */}
        {!isEditorOpen && (
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
            <button onClick={() => setSidebarOpen(true)} className="text-white">
              ☰
            </button>

         <h2> <span className="text-sm font-medium ">Code</span>
           <span className="text-sm font-medium text-blue-600 ">Room</span></h2>
          </div>
        )}

        {isEditorOpen ? (
          <Outlet context={{ setOnlineUsers, setAllMembers, setSidebarOpen }} />
        ) : (
          <EmptyState onCreate={createRoom} onJoin={joinRoom} />
        )}
      </div>
    </div>
  );
}

export default Home;
