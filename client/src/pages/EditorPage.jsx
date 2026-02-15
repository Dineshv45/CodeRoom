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
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

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

  const handleRun = async () => {
    try {
      setIsRunning(true);
      setIsTerminalOpen(true);
      setOutput("Running...");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            language,
            code: editorRef.current.getCode(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setOutput("Compilation failed");
        return;
      }

      setOutput(data.output || "No Output");
    } catch (err) {
      setOutput("Error running code");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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

      {/* ===== Compile Navbar ===== */}
      {view === "code" && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-850 border-b border-neutral-800">
          {/* ===== IDE Controls Bar ===== */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-neutral-900 text-sm px-2 py-1 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-3 py-1 bg-blue-600 text-sm rounded hover:bg-blue-700"
            >
              {isRunning ? "Running..." : "Run"}
            </button>

            <button
              onClick={() => setIsTerminalOpen((prev) => !prev)}
              className="px-3 py-1 bg-neutral-700 text-sm rounded hover:bg-neutral-600"
            >
              {isTerminalOpen ? "Hide Terminal" : "Open Terminal"}
            </button>
          </div>

          {/* Right: Placeholder Fullscreen Button */}
          <button className="hidden sm:inline-block text-sm px-3 py-1 bg-neutral-800 rounded hover:bg-neutral-700 w-full sm:w-auto">
            Fullscreen
          </button>
        </div>
      )}

      {/* ===== Main area ===== */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* CODE VIEW */}
        {view === "code" && (
          <>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Editor ref={editorRef} onCodeChange={handleCodeChange} />
            </div>

            {/* Terminal (only in code view) */}
            <div
              className={`
          transition-all duration-300 ease-in-out
          ${isTerminalOpen ? "h-56 opacity-100" : "h-0 opacity-0"}
          flex flex-col bg-black border-t border-neutral-800
          overflow-hidden
        `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                <span>Terminal</span>
                <button
                  onClick={() => setIsTerminalOpen(false)}
                  className="text-red-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 text-green-400 font-mono text-sm whitespace-pre-wrap">
                {output}
              </div>
            </div>
          </>
        )}

        {/* CHAT VIEW */}
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
    </div>
  );
}

export default EditorPage;
