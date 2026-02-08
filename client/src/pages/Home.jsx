import { useEffect, useRef, useState } from "react";
import codeEditorIcon from "../assets/code-editor-icon.png";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {requireAuth} from "../utils/requireAuth.js";

function Home() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!requireAuth(navigate)) return;

  fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setRooms(Array.isArray(data) ? data : []))
    .catch(() => toast.error("Failed to load rooms"));

  }, [token]);

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Room name required");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/rooms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomName }),
      }
    );

    if(!res.ok){
      if(res.status === 401){
        toast.error("Session Expired, Please Login again");
        navigate('/');
        return;
      }
      toast.error("Failed to create room");
      return;
    };

    const room = await res.json();
    navigate(`/editor/${room.roomId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src={codeEditorIcon} className="w-10 h-10" />
          <h1 className="text-2xl font-semibold">
            Code<span className="text-blue-500">Room</span>
          </h1>
        </div>

        {/* Rooms list */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
          <h2 className="text-sm text-neutral-400 mb-3">Your Rooms</h2>

          {rooms.length === 0 && (
            <p className="text-neutral-500 text-sm">No rooms yet</p>
          )}

          <ul className="space-y-2">
            {rooms.map((room) => (
              <li
                key={room.roomId}
                onClick={() => navigate(`/editor/${room.roomId}`)}
                className="px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition"
              >
                {room.roomName}
              </li>
            ))}
          </ul>
        </div>

        {/* Create room */}
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-600"
            placeholder="New room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <button
            onClick={createRoom}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
