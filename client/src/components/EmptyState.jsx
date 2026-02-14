import { useState } from "react";
import { Plus, Link2 } from "lucide-react";
import toast from "react-hot-toast";

function EmptyState({ onCreate, onJoin }) {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  /* ===== CREATE ROOM ===== */
  const handleCreate = () => {
    if (!roomName.trim()) {
      toast.error("Room name is required");
      return;
    }

    onCreate(roomName);
    setRoomName("");
    setShowCreateInput(false);
  };

  /* ===== JOIN ROOM ===== */
  const handleJoin = () => {
    if (!inviteLink.trim()) {
      toast.error("Invite link is required");
      return;
    }

    try {
      const roomId = inviteLink
        .trim()
        .replace(/\/$/, "") // remove trailing slash
        .split("/")
        .pop(); // get last part

      if (!roomId) {
        toast.error("Invalid invite link");
        return;
      }

      onJoin(roomId);
      setInviteLink("");
      setShowJoinInput(false);
    } catch {
      toast.error("Invalid invite link");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950">
      <div className="text-center max-w-sm px-6">
        <h2 className="text-lg font-medium mb-2">Welcome to CodeRoom</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Create a room or join using an invite link
        </p>

        <div className="flex flex-col gap-3">
          {/* ===== CREATE SECTION ===== */}
          {!showCreateInput ? (
            <button
              onClick={() => {
                setShowCreateInput(true);
                setShowJoinInput(false);
              }}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
            >
              Create Room
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="px-3 py-2 rounded bg-neutral-800 text-white"
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                Confirm Create
              </button>
            </>
          )}

          {/* ===== JOIN SECTION ===== */}
          {!showJoinInput ? (
            <button
              onClick={() => {
                setShowJoinInput(true);
                setShowCreateInput(false);
              }}
              className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
            >
              Join with Invite Link
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Paste invite link"
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                className="px-3 py-2 rounded bg-neutral-800 text-white"
              />
              <button
                onClick={handleJoin}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                Join Room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
