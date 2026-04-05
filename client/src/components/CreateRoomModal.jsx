import { X } from "lucide-react";
import { useState } from "react";

function CreateRoomModal({ onClose, onCreate }) {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onCreate(roomName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <h2 className="text-lg font-semibold text-white">Create New Room</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Room Name
          </label>
          <input
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-neutral-500 mb-6"
            placeholder="e.g. Project Alpha, Team Sync"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roomName.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal;
