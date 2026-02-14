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
import { Plus } from "lucide-react";

import Editor from "../components/Editor";
import Chat from "../components/Chat";
import { useOutletContext } from "react-router-dom";

function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const socketRef = useRef(null);
  const editorRef = useRef(null);

  const { setOnlineUsers, setAllMembers, setSidebarOpen } = useOutletContext();
  const roomName = location.state?.roomName || "Room";

  const [messages, setMessages] = useState([]);

  const [view, setView] = useState("code");
  const [unreadChat, setUnreadChat] = useState(false);
  const [unreadCode, setUnreadCode] = useState(false);

  const viewRef = useRef(view);

  const myUsername = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    return jwtDecode(token)?.username;
  }, []);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  /* ---------- auth guard ---------- */
  useEffect(() => {
    if (!requireAuth(navigate)) return;
  }, []);

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

    const socket = initSocket({ token }); // (JWT later for socket auth)
    socketRef.current = socket;

    socket.emit("ROOM_JOIN", { roomId });

    socket.emit("CODE_SYNC", { roomId });

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

    socket.on("CODE_CHANGE", ({ code }) => {
      editorRef.current?.updateCode(code);

      if (viewRef.current !== "code") {
        setUnreadCode(true);
      }
    });

    socket.on("CHAT_MESSAGE", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (viewRef.current !== "chat") {
        setUnreadChat(true);
      }
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

  if (!roomId) return <Navigate to="/" />;

  const handleCodeChange = (code) => {
    socketRef.current?.emit("CODE_CHANGE", {
      roomId,
      code,
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* ===== Top bar ===== */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden z-40 relative"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h2 className="text-sm font-medium">{roomName}</h2>
        </div>

        {/* Center Toggle (Desktop + Mobile) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setView("code");
              setUnreadCode(false);
            }}
            className={`relative px-3 py-1 text-sm rounded ${
              view === "code"
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
            className={`relative px-3 py-1 text-sm rounded ${
              view === "chat"
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

        {/* Right side */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* ===== Main area ===== */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 h-full overflow-hidden relative">
          {/* Editor */}
          <div className={view === "code" ? "h-full w-full" : "hidden"}>
            <Editor ref={editorRef} onCodeChange={handleCodeChange} />
          </div>

          {/* Chat */}
          <div className={view === "chat" ? "h-full" : "hidden"}>
            <Chat
              socketRef={socketRef}
              roomId={roomId}
              messages={messages}
              setMessages={setMessages}
              myUserName={myUsername}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditorPage;
