import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { requireAuth } from "../utils/requireAuth";
import RoomsSidebar from "../components/RoomsSidebar";
import UsersPanel from "../components/UsersPanel";
import EmptyState from "../components/EmptyState";
import { Users, User, Settings, X, Home as HomeIcon, LogOut } from "lucide-react";
import CreateRoomModal from "../components/CreateRoomModal";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rooms, setRooms] = useState([]);
  const [activePanel, setActivePanel] = useState("rooms");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const createRoom = async (name) => {
    // If no name is provided (e.g. from Sidebar or EmptyState), show the modal
    if (!name || typeof name !== "string") {
      setShowCreateModal(true);
      return;
    }

    setCreatingRoom(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomName: name.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create room");
        return;
      }

      const room = await res.json();
      toast.success("Room created successfully!");
      
      await fetchRooms();
      navigate(`/editor/${room.roomId}`, {
        state: { roomName: room.roomName },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error creating room");
    } finally {
      setCreatingRoom(false);
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

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
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
                  className={`p-2 rounded ${activePanel === "rooms"
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800"
                    }`}
                >
                  <HomeIcon size={20} />
                </button>

                <button
                  onClick={() => setActivePanel("users")}
                  className={`p-2 rounded ${activePanel === "users"
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800"
                    }`}
                >
                  <Users size={20} />
                </button>
              </div>

            </div>

            <div className="mb-4 flex flex-col items-center gap-2 relative">
              {showLogout && (
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-neutral-800 border border-neutral-700 rounded shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 text-red-400 transition-colors whitespace-nowrap text-sm"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowLogout(!showLogout)}
                className={`p-2 rounded hover:bg-neutral-800 transition-all duration-300 ${showLogout ? "bg-neutral-800 text-blue-400 shadow-lg shadow-blue-500/20" : ""}`}
              >
                <Settings 
                  size={20} 
                  className={`transition-transform duration-500 ${showLogout ? "rotate-180" : "rotate-0"}`}
                />
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
                  onCreate={createRoom}
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
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createRoom}
        />
      )}
    </div>
  );
}

export default Home;
