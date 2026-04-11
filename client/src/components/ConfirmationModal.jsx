import React from "react";
import { AlertTriangle, X } from "lucide-react";

function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = "danger" 
}) {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDanger ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
              <AlertTriangle size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {message}
              </p>
            </div>

            <button 
              onClick={onCancel}
              className="p-1 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-950/50 border-t border-neutral-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-lg ${
              isDanger 
                ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
