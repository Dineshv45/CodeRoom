function Chat({ messages, chatInput, setChatInput, onSend, myUsername }) {

  
  function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

  return (
    <>
      <div className="h-full flex flex-col bg-neutral-950">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-900">
          {messages.map((msg, idx) => {
            const isMe = msg.username === myUsername;

            return (
              <div
                key={idx}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm flex flex-col
              ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-neutral-800 text-neutral-200 rounded-bl-none"
              }
            `}
                >
                  {/* Username (only for others) */}
                  {!isMe && (
                    <span className="text-xs text-blue-400 mb-1">
                      {msg.username}
                    </span>
                  )}

                  {/* Message */}
                  <span className="break-words">{msg.text}</span>

                  {/* Time */}
                  <span
                    className={`text-[10px] mt-1 self-end ${
                      isMe ? "text-blue-200" : "text-neutral-400"
                    }`}
                  >
                    {formatTime(msg.time)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-neutral-800 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-neutral-800 text-sm outline-none rounded"
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />

          <button
            onClick={onSend}
            className="px-4 py-2 bg-blue-600 text-sm rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
