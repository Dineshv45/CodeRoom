import React from "react";
import { X, RotateCcw, AlertTriangle, FileUp, Trash2 } from "lucide-react";

function RevertConfirmModal({ isOpen, onClose, onConfirm, label }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-white">Revert State</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                You are about to revert the room to the state: <span className="text-blue-400 font-medium">"{label}"</span>.
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Choose how you want to handle files that were created after this snapshot.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Option 1: Full Reset */}
            <button
              onClick={() => onConfirm(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-red-500/50 hover:bg-red-500/5 transition-all group text-left"
            >
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                <Trash2 size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-red-400">Full Reset (Clean Revert)</p>
                <p className="text-[11px] text-neutral-500 line-clamp-1">Deletes all untracked files not in this snapshot.</p>
              </div>
            </button>

            {/* Option 2: Merge/Preserve */}
            <button
              onClick={() => onConfirm(false)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group text-left"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <FileUp size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-blue-400">Keep Untracked (Merge)</p>
                <p className="text-[11px] text-neutral-500 line-clamp-1">Reverts existing files but preserves new ones.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-neutral-800 bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RevertConfirmModal;
