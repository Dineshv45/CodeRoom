import { useEffect, useRef, useState, useMemo } from "react";
import {
  useParams,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { initSocket } from "../socket";
import { requireAuth } from "../utils/requireAuth";
import { Layout } from "lucide-react";

import Editor from "../components/Editor";
import Chat from "../components/Chat";
import TabSystem from "../components/TabSystem";
import MobileTopBar from "../components/mobileTopBar";
import RoomActionsMenu from "../components/RoomActionsMenu";
import InviteModal from "../components/InviteModal";
import { useOutletContext } from "react-router-dom";

function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const socketRef = useRef(null);
  const editorRef = useRef(null);

  const { setOnlineUsers, setAllMembers, setSidebarOpen, setActivePanel, openConfirmModal , joinRoom} = useOutletContext();
  const roomName = location.state?.roomName || "Room";
  const [roomOwner, setRoomOwner] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [view, setView] = useState(localStorage.getItem("VIEW") || "code");
  const [unreadChat, setUnreadChat] = useState(false);
  const [unreadCode, setUnreadCode] = useState(false);

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Multi-file state
  const [allFiles, setAllFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  const viewRef = useRef(view);

  const myInfo = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return { username: null, userId: null };
    try {
      const decoded = jwtDecode(token);
      return { username: decoded.username, userId: decoded.userId };
    } catch (e) {
      return { username: null, userId: null };
    }
  }, []);

  const myUsername = myInfo.username;
  const myUserId = myInfo.userId;

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  /* ---------- auth guard ---------- */
  useEffect(() => {
    if (!requireAuth(navigate)) return;
  }, []);

  const fetchWorkspace = async (currentFiles) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/workspace`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setRoomOwner(data.owner);
        // 1. Shared Tabs (from Room.files)
        if (currentFiles && currentFiles.length > 0) {
          setOpenFiles(currentFiles);

          // 2. Personal Focus (from Workspace.activeFile)
          if (data.activeFile) {
            const active = currentFiles.find(f => f._id === data.activeFile._id);
            if (active) setActiveFile(active);
            else setActiveFile(data.openFiles[0]);
          } else {
            setActiveFile(data.openFiles[0]);
          }
        } else {
          // If room has no files yet, open nothing
          setOpenFiles([]);
          setActiveFile(null);
        }
      }
    } catch (err) {
      console.error("Workspace fetch error:", err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/files`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAllFiles(data);
        fetchWorkspace(data);
      }
    } catch {
      toast.error("Failed to fetch files");
    }
  };

  /* ---------- socket lifecycle ---------- */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login first");
      localStorage.clear();
      navigate("/login");
      return;
    }

    if (!roomId) return;

    // 1. Core Socket.io
    const socket = initSocket({ token });
    socketRef.current = socket;

    // 2. Initial Load
    fetchFiles();

    // 3. Socket Event Listeners
    socket.emit("ROOM_JOIN", { roomId });
    socket.emit("CHAT_SYNC", { roomId });

    socket.on("CHAT_HISTORY", (history) => {
      setMessages(history);
    });

    socket.on("ROOM_USERS", (users) => {
      setOnlineUsers(users);
    });

    socket.on("ROOM_MEMBERS", (members) => {
      setAllMembers(members);
    });

    socket.on("ROOM_ERROR", (msg) => {
      toast.error(msg);
    });

    socket.on("CHAT_MESSAGE", (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (viewRef.current !== "chat") {
        setUnreadChat(true);
      }
    });

    socket.on("FILE_CREATED", (newFile) => {
      setAllFiles((prev) => {
        const isAlreadyThere = prev.some(f => f._id === newFile._id);
        return isAlreadyThere ? prev : [...prev, newFile];
      });
      // Also automatically open the new file in tabs for all users
      setOpenFiles((prev) => {
        const isAlreadyOpen = prev.some(f => f._id === newFile._id);
        return isAlreadyOpen ? prev : [...prev, newFile];
      });
    });

    socket.on("FILE_DELETED", (fileId) => {
      setAllFiles((prev) => prev.filter((f) => f._id !== fileId));
      setOpenFiles((prev) => {
        const updated = prev.filter((f) => f._id !== fileId);
        // Switch active tab if the deleted file was active
        setActiveFile((current) => {
          if (current?._id === fileId) {
            return updated.length > 0 ? updated[updated.length - 1] : null;
          }
          return current;
        });
        return updated;
      });
    });

    socket.on("ROOM_REFRESH", ({ message }) => {
      toast.success(message || "Room state updated");
      fetchFiles();
    });

    socket.on("MEMBER_LEFT", ({ username, userId }) => {
      toast.success(`${username} has left the room`);
      setAllMembers(prev => prev.filter(m => m.userId !== userId));
    });

    socket.on("MEMBER_REMOVED", ({ username, userId }) => {
      if (userId === myUserId) {
        toast.error("You have been removed from the room");
        navigate("/");
      } else {
        toast.info(`${username} was removed from the room`);
        setAllMembers(prev => prev.filter(m => m.userId !== userId));
      }
    });

    socket.on("ROOM_DELETED", ({ roomName }) => {
      toast.error(`Room "${roomName}" has been deleted by the owner`);
      navigate("/");
    });

    socket.on("connect_error", (err) => {
      toast.error(`Session Expired ${err}`);
      localStorage.clear();
      navigate("/login");
    });

    return () => {
      socket.emit("ROOM_LEAVE", { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  /* ---------- Workspace Sync (DB) ---------- */
  useEffect(() => {
    // Only sync the active file focus to the user's private workspace
    if (!activeFile) return;

    const syncTimeout = setTimeout(async () => {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/workspace`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            activeFileId: activeFile._id
          }),
        });
      } catch (err) {
        console.error("Workspace sync error:", err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(syncTimeout);
  }, [activeFile, roomId]);

  if (!roomId) return <Navigate to="/" />;

  const handleTabCreate = async (fileName) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          fileName,
          fileType: "file",
        }),
      });

      const newFile = await res.json();
      if (res.ok) {
        // We no longer update allFiles/openFiles here manually.
        // We wait for the FILE_CREATED socket event from the server.
        setActiveFile(newFile);
        toast.success("File created successfully");
      } else {
        toast.error(newFile.message || "Error creating file");
      }
    } catch (err) {
      console.error("Error creating file:", err);
      toast.error("Error creating file");
    }
  };

  const handleTabSelect = (file) => {
    if (!openFiles.find(f => f._id === file._id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFile(file);
  };

  const handleTabClose = async (fileId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (res.ok) {
        // We no longer update allFiles/openFiles here manually.
        // We wait for the FILE_DELETED socket event from the server.
        toast.success("File deleted successfully");
      } else {
        toast.error("Failed to delete file");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Error deleting file");
    }
  };

  const handleRun = async () => {
    if (!activeFile) {
      toast.error("Select a file to run");
      return;
    }
    try {
      setIsRunning(true);
      setIsTerminalOpen(true);
      setOutput("Running " + activeFile.fileName + "...");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            language: activeFile.fileName.split('.').pop(),
            code: editorRef.current.getCode(),
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setOutput("Error: " + (data.error || "Compilation failed"));
        return;
      }
      setOutput(data.output || "No Output");
    } catch (err) {
      setOutput("Error running code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleLeaveRoom = () => {
    openConfirmModal({
      title: "Leave Room",
      message: "Are you sure you want to leave this room? You will need an invite to join back.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}/leave`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
          if (res.ok) {
            toast.success("Left room");
            navigate("/");
          } else {
            const data = await res.json();
            toast.error(data.message || "Failed to leave room");
          }
        } catch (err) {
          toast.error("Error leaving room");
        }
      }
    });
  };

  const handleDeleteRoom = () => {
    openConfirmModal({
      title: "Delete Room",
      message: "DANGER: This will permanently delete the room and all its files for everyone. This cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
          if (res.ok) {
            toast.success("Room deleted");
            navigate("/");
          } else {
            toast.error("Failed to delete room");
          }
        } catch (err) {
          toast.error("Error deleting room");
        }
      }
    });
  };

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/editor/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const handleManageUsers = () => {
    setActivePanel("users");
    // On mobile, also open the sidebar
    if (window.innerWidth < 768) {
      setSidebarOpen(true);
    }
    toast.success("Switched to Users panel");
  };

  const handleAddUser = () => {
    setIsInviteModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* ===== Mobile Top Bar (Mobile Only) ===== */}
      <MobileTopBar
        view={view}
        setView={setView}
        roomName={roomName}
        setSidebarOpen={setSidebarOpen}
        onRun={handleRun}
        onLeave={() => navigate("/")}
        isRunning={isRunning}
      />

      {/* ===== Top bar (Desktop Only) ===== */}
      <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden z-40 relative"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h2 className="text-sm font-medium">{roomName}</h2>
          <RoomActionsMenu
            isOwner={roomOwner === myUserId}
            onLeave={handleLeaveRoom}
            onDelete={handleDeleteRoom}
            onCopyInvite={handleCopyInvite}
            onManageUsers={handleManageUsers}
            onAddUser={handleAddUser}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setView("code");
              setUnreadCode(false);
              localStorage.setItem("VIEW", "code");
            }}
            className={`relative px-3 py-1 text-sm rounded ${view === "code"
              ? "bg-blue-600"
              : "bg-neutral-800 hover:bg-neutral-700"
              }`}
          >
            Code
            {unreadCode && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setView("chat");
              setUnreadChat(false);
            }}
            className={`relative px-3 py-1 text-sm rounded ${view === "chat"
              ? "bg-blue-600"
              : "bg-neutral-800 hover:bg-neutral-700"
              }`}
          >
            Chat
            {unreadChat && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1 bg-green-600 text-sm rounded hover:bg-green-700 flex items-center gap-2"
          >
            {isRunning ? "..." : "Run"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
          >
            Leave
          </button>
        </div>
      </div>

      {/* ===== Main area ===== */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-[92px] md:pt-0">
        {view === "code" && (
          <>
            <TabSystem
              openFiles={openFiles}
              activeFileId={activeFile?._id}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              onTabCreate={handleTabCreate}
            />

            <div className="flex-1 min-h-0 overflow-hidden relative">
              {activeFile ? (
                <Editor
                  ref={editorRef}
                  fileId={activeFile._id}
                  fileName={activeFile.fileName}
                  username={myUsername}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
                  <Layout size={48} className="opacity-20" />
                  <p>Click the + button to create a new file</p>
                </div>
              )}
            </div>

            <div
              className={`
          transition-all duration-300 ease-in-out
          ${isTerminalOpen ? "h-56 opacity-100" : "h-0 opacity-0"}
          flex flex-col bg-black border-t border-neutral-800
          overflow-hidden
        `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-sm text-neutral-400">
                <span>Terminal Output</span>
                <button
                  onClick={() => setIsTerminalOpen(false)}
                  className="text-red-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 text-green-400 font-mono text-xs whitespace-pre-wrap">
                {output}
              </div>
            </div>
          </>
        )}

        {view === "chat" && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <Chat
              socketRef={socketRef}
              roomId={roomId}
              messages={messages}
              setMessages={setMessages}
              myUserName={myUsername}
            />
          </div>
        )}
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomId={roomId}
        roomName={roomName}
      />
    </div>
  );
}

export default EditorPage;
