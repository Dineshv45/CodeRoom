import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import codeEditorIcon from "../assets/code-editor-icon.png";
import User from "../components/User";
import { LogOut } from "lucide-react"
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import { Actions } from "../../../server/Actions";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";


function EditorPage() {

  const editorRef = useRef(null);
  const location = useLocation(null);
  //location = { pathname: "/editor/roomId,state: { username: "rahul"}} from Home.jsx

  const reactNavigator = useNavigate(null);
  const { roomId } = useParams();


  const [users, setUsers] = useState([]);

  const codeRef = useRef("");

  const handleErrors = (e) => {
    //console.error("Socket error:", e);
    toast.error("Connection lost");
    leaveRoom(false);
  };


  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    }
    catch (err) {
      toast.error("Failed to Room ID")
      console.log("Copy failed :", err);
    }
  };

  const leaveRoom = (showToast = false) => {
    if (!socketRef.current)
      return;

    socketRef.current.emit(Actions.LEAVE, {
      roomId,
      username: location.state?.username,
    });

    socketRef.current.disconnect();

    if (showToast) {
      toast.success("You Left the room");
    }

    reactNavigator('/');
  }

  const handleLeaveRoom = () => {
    leaveRoom(true);
  }


  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current)
      return;

    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      socketRef.current.emit(Actions.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //listening for joined event
      socketRef.current.on(Actions.JOINED,
        ({ connectedUsers, username }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} has joined room`);
          }
          setUsers(connectedUsers)
        })

        
      socketRef.current.on(Actions.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          codeRef.current = code;
          editorRef.current?.updateCode(code);
        }
      });

      //listening for code sync from server

      socketRef.current.on(Actions.SYNC_CODE, ({ code }) => {
        if (code !== null) {
          codeRef.current = code;
          // Small timeout ensures the Editor component is fully mounted/ready
          setTimeout(() => {
            editorRef.current?.updateCode(code);
          }, 100);
        }
      });
      // socketRef.current.on(Actions.SYNC_CODE,({code})=>{
      //   if(code !== undefined && code !== null) {
      //     codeRef.current = code;
      //     editorRef.current?.updateCode(code);
      //   }
      // })


      //Listening for disconnected
      socketRef.current.on(Actions.DISCONNECTED,
        ({ socketId, username }) => {
          toast.success(`${username} has left room`);
          setUsers((prev) => {
            return prev.filter(user => user.socketId !== socketId)
          })
        });


    }

    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.off(Actions.JOINED);
        socketRef.current.off(Actions.DISCONNECTED);
        socketRef.current.off(Actions.CODE_CHANGE);
        socketRef.current.off(Actions.SYNC_CODE);
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

    };
  }, [])

  useEffect(() => {
    console.log("EditorPage mounted");
    return () => console.log("EditorPage unmounted");
  }, []);



  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!location.state) {
    return <Navigate to='/' />
  }

  return (
    <div className="w-screen h-screen flex bg-neutral-950 text-white overflow-hidden">

      {/* Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
      fixed md:static z-50
      h-full w-64
      bg-neutral-900 border-r border-neutral-800
      flex flex-col
      transform transition-transform duration-300
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
    `}
      >

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img className="w-8 h-8" src={codeEditorIcon} alt="Code Editor Icon" />
            <h1 className="text-lg font-semibold">
              Code<span className="text-blue-500">Room</span>
            </h1>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Connected Users */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <h3 className="text-xs uppercase tracking-wider text-neutral-400 mb-3">
            Connected
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => (
              <User key={user.socketId} username={user.username} />
            ))}
          </div>
        </div>

        {/* Bottom Actions (Pinned) */}
        <div className="mt-auto px-4 py-3 border-t border-neutral-800 bg-neutral-900">
          <div className="flex flex-col gap-2">

            <button
              onClick={handleCopyRoomId}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition text-sm"
            >
              Copy Room ID
            </button>

            <button
              onClick={handleLeaveRoom}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600/10 text-red-400 hover:bg-red-600/20 transition text-sm"
            >
              Leave
              <LogOut size={16} />
            </button>

          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        {/* mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 border-b border-neutral-950">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700"
          >
            <Menu size={20} />

          </button>

          <h2 className="text-sm font-medium text-neutral-300">
            Editor
          </h2>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            ref={editorRef}
            initialCode={codeRef.current || ""}
            onCodeChange={(code) => {
              codeRef.current = code;

              socketRef.current?.emit(Actions.CODE_CHANGE, {
                roomId,
                code,
              });
            }}
          />
        </div>
      </main>

    </div>

  );
}

export default EditorPage;
