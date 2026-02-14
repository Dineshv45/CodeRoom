function MobileTopBar({ view, setView }) {
  return (
    <div className="md:hidden flex justify-between items-center px-4 py-2 border-b border-neutral-800">
      <div className="flex gap-2">
        <button
          onClick={() => setView("code")}
          className={`px-3 py-1 rounded ${
            view === "code" ? "bg-blue-600" : "bg-neutral-800"
          }`}
        >
          Code
        </button>

        <button
          onClick={() => setView("chat")}
          className={`px-3 py-1 rounded ${
            view === "chat" ? "bg-blue-600" : "bg-neutral-800"
          }`}
        >
          Chat
        </button>
      </div>
    </div>
  );
}

export default MobileTopBar;
