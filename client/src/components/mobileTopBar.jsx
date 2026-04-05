import { Menu, Play, LogOut } from "lucide-react";

function MobileTopBar({ view, setView, roomName, setSidebarOpen, onRun, onLeave, isRunning }) {
  return (
    <div className="fixed top-0 left-0 z-50 md:hidden flex flex-col w-full bg-neutral-900 border-b border-neutral-800 shadow-lg">
      {/* Top Row: Menu, Room Name, and Actions */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium truncate max-w-[100px]">
            {roomName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {view === "code" && (
            <button
              onClick={onRun}
              disabled={isRunning}
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Run Code"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </button>
          )}
          <button
            onClick={onLeave}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Leave Room"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Row: View Toggles */}
      <div className="flex px-4 pb-2">
        <div className="flex w-full bg-neutral-800 p-1 rounded">
          <button
            onClick={() => setView("code")}
            className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded transition-all duration-200 ${view === "code"
                ? "bg-neutral-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
              }`}
          >
            Code
          </button>
          <button
            onClick={() => setView("chat")}
            className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded transition-all duration-200 ${view === "chat"
                ? "bg-neutral-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
              }`}
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileTopBar;
