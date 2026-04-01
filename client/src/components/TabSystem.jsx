import React, { useState } from "react";
import { X, File as FileIcon, Plus, Check } from "lucide-react";

function TabSystem({ openFiles, activeFileId, onTabSelect, onTabClose, onTabCreate }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreate = () => {
    if (newFileName.trim()) {
      onTabCreate(newFileName.trim());
      setNewFileName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center bg-neutral-900 border-b border-neutral-800 h-10 px-2 overflow-hidden">
      <div className="flex flex-1 overflow-x-auto no-scrollbar scrollbar-hide gap-1 pr-4">
        {openFiles.map((file) => (
          <div
            key={file._id}
            onClick={() => onTabSelect(file)}
            className={`flex items-center gap-2 px-3 py-1.5 h-8 min-w-[120px] max-w-[200px] rounded-t text-sm border-t-2 transition-all cursor-pointer select-none group ${
              activeFileId === file._id
                ? "bg-neutral-850 text-white border-blue-500 font-medium"
                : "bg-neutral-900 text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-neutral-200"
            }`}
          >
            <FileIcon size={14} className="flex-shrink-0" />
            <span className="truncate flex-1">{file.fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(file._id);
              }}
              className={`p-0.5 rounded-sm hover:bg-neutral-700 transition-colors ${
                activeFileId === file._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {isCreating && (
          <div className="flex items-center gap-1 px-3 py-1.5 h-8 bg-neutral-850 border-t-2 border-blue-500 rounded-t min-w-[150px]">
            <FileIcon size={14} className="text-neutral-400" />
            <input
              autoFocus
              className="bg-transparent text-sm w-full outline-none text-white border-none focus:ring-0 p-0"
              placeholder="filename.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsCreating(false);
              }}
            />
            <button onClick={handleCreate} className="text-blue-400 hover:text-blue-300">
              <Check size={14} />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsCreating(true)}
        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        title="New Tab"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

export default TabSystem;
