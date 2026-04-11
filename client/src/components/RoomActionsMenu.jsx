import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, UserMinus, Trash2, Copy, Users, Plus } from "lucide-react";

function RoomActionsMenu({ isOwner, onLeave, onDelete, onManageUsers, onCopyInvite, onAddUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-[100] py-1 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onCopyInvite();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors border-b border-neutral-800/50"
          >
            <Copy size={14} className="text-blue-400" />
            Copy Invitation
          </button>

          {isOwner ? (
            <>
              <button
                onClick={() => {
                  onAddUser();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors border-b border-neutral-800/50"
              >
                <Plus size={14} className="text-green-400" />
                Add User
              </button>
              <button
                onClick={() => {
                  onManageUsers();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <Users size={14} className="text-green-400" />
                Manage Users
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
                Delete Room
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onLeave();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <UserMinus size={14} />
              Leave Room
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomActionsMenu;
