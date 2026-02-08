import { useEffect, useRef, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { initSocket } from "../socket";
import { requireAuth } from "../utils/requireAuth.js";

function EditorPage() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  
  const [messages, setMessages] = useState([]);

  useEffect(() => {
  if (!requireAuth(navigate)) return;
}, []);


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login first");
      navigate("/");
      return;
    }

    if (!roomId) return;

    const socket = initSocket();
    socketRef.current = socket;

    socket.emit("ROOM_JOIN", { roomId });

    socket.on("USER_ONLINE", (user) => {
      setUsers((prev) => {
        if (prev.some((u) => u.userId === user.userId)) return prev;
        return [...prev, user];
      });
    });

    socket.on("USER_OFFLINE", ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    socket.on("CHAT_MESSAGE", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("connect_error", (err) => {
      if (err.message === "TOKEN_EXPIRED") {
        toast.error("Session expired");
        navigate("/");
      } else {
        toast.error("Socket connection failed");
      }
    });

    return () => {
      socket.emit("ROOM_LEAVE", { roomId });
      socket.disconnect();
    };
  }, [roomId, navigate]);

  if (!roomId) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-4">
        <h2 className="text-sm uppercase text-neutral-400 mb-3">
          Online Users
        </h2>

        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.userId}
              className="px-3 py-2 rounded-md bg-neutral-800 text-sm"
            >
              {u.username}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Room <span className="text-blue-500">#{roomId}</span>
        </h2>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm text-neutral-400 mb-3">Chat</h3>

          <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
            {messages.map((m, i) => (
              <li key={i} className="text-sm">
                <span className="text-blue-400 font-medium">{m.username}</span>
                <span className="text-neutral-300">: {m.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default EditorPage;
