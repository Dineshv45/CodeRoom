import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function JoinRoomModal({ onClose, onJoin }) {
  const [invite, setInvite] = useState("");

  const handleJoin = () => {
    if (!invite.trim()) {
      toast.error("Invite link or Room ID required");
      return;
    }

    let roomId = invite.trim();

    // Handle full invite link
    if (invite.includes("/editor/")) {
      roomId = invite.split("/editor/")[1];
    }

    if (!roomId) {
      toast.error("Invalid invite link");
      return;
    }

    onJoin(roomId);
    onClose();
  };

  

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-md bg-neutral-900 rounded-lg border border-neutral-800 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Join Room</h2>
          <button onClick={onClose}>
            <X className="text-neutral-400 hover:text-white" />
          </button>
        </div>

        {/* Input */}
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 mb-4"
          placeholder="Paste invite link or Room ID"
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinRoomModal;
