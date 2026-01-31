import { useState } from "react";
import codeEditorIcon from "../assets/code-editor-icon.png"
import { v4 as uniqueId } from "uuid";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = ((e) => {
    const id = uniqueId();
    setRoomId(id);
    toast.success('Created new room')
  });

  const joinRoom = () =>{
    if(!roomId || !username){
      toast.error('Room ID & username is required');
      return;
    }

    //redirect
    navigate(`/editor/${roomId}`, 
      {
        state:{
          username,
        },
      }
    )
  }

  const handleInputEnter = (e) => {
    if(e.code === 'Enter'){
      joinRoom();
    }
  }
  return (
<>
  <div className="w-screen h-screen flex items-center justify-center bg-neutral-950 px-4">
    
    <div className="w-full max-w-lg flex flex-col items-center">
      
      {/* Logo + Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={codeEditorIcon}
            alt="Code Editor"
            className="w-14 h-14"
          />
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Code<span className="text-blue-500">Room</span>
          </h1>
        </div>

        <p className="text-sm text-neutral-400 text-center">
          Real-time collaborative code editor
        </p>
      </div>

      {/* Form */}
      <div className="w-full space-y-4">
        
        <input
          type="text"
          placeholder="ROOM ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyUp={handleInputEnter}
          className="w-full px-4 py-3 rounded-md bg-neutral-800 text-white placeholder-neutral-400 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <input
          type="text"
          placeholder="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={handleInputEnter}
          className="w-full px-4 py-3 rounded-md bg-neutral-800 text-white placeholder-neutral-400 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          onClick={joinRoom}
          className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
        >
          Join Room
        </button>

        <p className="text-sm text-neutral-400 text-center">
          Don’t have an invite?{" "}
          <button
            onClick={createNewRoom}
            className="text-blue-500 hover:text-blue-400 font-medium underline-offset-4 hover:underline transition"
          >
            Create Room
          </button>
        </p>
      </div>

    </div>
  </div>
</>

  )
}

export default Home