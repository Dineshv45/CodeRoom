import { useEffect, useRef, useState } from "react";
import codeEditorIcon from "../assets/code-editor-icon.png";
import { useNavigate } from "react-router-dom";
import { initSocket } from "../socket";
import { Actions } from "../../../server/Actions";
import toast from "react-hot-toast";

function Home() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});


  const roomNameRef = useRef("");
const passwordRef = useRef("");
const usernameRef = useRef("");


/// userID generation

const getOrCreateUserId = ()=>{
  let userId = localStorage.getItem("userId");

  if(!userId){
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
  }

  return userId;
}

//  /* ---------- validation ---------- */
  const validate = () => {
    const newErrors = {};

    if (!roomName.trim()) newErrors.roomName = "Room name is required";

    if (!userName.trim()) newErrors.userName = "Username is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- create room ---------- */
const createNewRoom = () => {
  if (!validate()) return;

  socketRef.current.emit(Actions.CREATE_ROOM, {
    userId: getOrCreateUserId(),
    roomName,
    password,
    userName,
  });

};


  /* ---------- join room ---------- */
  const joinRoom = () => {
    if (!validate()) return;


    socketRef.current.emit(Actions.JOIN_CHECK, {
      userId: getOrCreateUserId(),
      roomName,
      password,
      userName,
    });
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") joinRoom();
  };



useEffect(() => {
  roomNameRef.current = roomName;
  passwordRef.current = password;
  usernameRef.current = userName;
}, [roomName, password, userName]);

useEffect(() => {
  const init = async () => {
    socketRef.current = await initSocket();

    socketRef.current.on(Actions.CREATE_ROOM, ({ roomId, userId }) => {
       toast.success("Room Created");
      navigate(`/editor/${roomId}`, {
        state: {
          roomName: roomNameRef.current,
          password: passwordRef.current,
          userName: usernameRef.current,
          userId,
        },
      });
    });

    socketRef.current.on(Actions.JOIN_CONFIRM, ({ roomId }) => {
      navigate(`/editor/${roomId}`, {
        state: {
          roomName: roomNameRef.current,
          password: passwordRef.current,
          userName: usernameRef.current,
          userId:  localStorage.getItem("userId"),
        },
      });
    });

    socketRef.current.on(Actions.ERROR, msg => {
      setErrors({ server: msg });
    });
  };

  init();
  return () => socketRef.current?.disconnect();
}, []);


  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src={codeEditorIcon} className="w-14 h-14" />
            <h1 className="text-3xl font-bold text-white">
              Code<span className="text-blue-500">Room</span>
            </h1>
          </div>
          <p className="text-sm text-neutral-400">
            Real-time collaborative code editor
          </p>
        </div>

        {/* Form */}
        <div className="w-full space-y-4">
          {/* Room name */}
          <div>
            <input
              type="text"
              placeholder="ROOM NAME"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyUp={handleInputEnter}
              className="w-full px-4 py-3 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:ring-2 focus:ring-blue-600"
            />
            {errors.roomName && (
              <p className="text-sm text-red-400 mt-1">{errors.roomName}</p>
            )}
          </div>

          {/* Password */}
          <input
            type="password"
            placeholder="PASSWORD (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-neutral-800 text-white border border-neutral-700"
          />

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="USERNAME"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyUp={handleInputEnter}
              className="w-full px-4 py-3 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:ring-2 focus:ring-blue-600"
            />
            {errors.userName && (
              <p className="text-sm text-red-400 mt-1">{errors.userName}</p>
            )}
          </div>

          {/* Server error */}
          {errors.server && (
            <p className="text-sm text-red-400 text-center">{errors.server}</p>
          )}

          <button
            onClick={joinRoom}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Join Room
          </button>

          <p className="text-sm text-neutral-400 text-center">
            Don’t have an invite?{" "}
            <button
              onClick={createNewRoom}
              className="text-blue-500 hover:underline"
            >
              Create Room
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
