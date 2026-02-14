import Message from "../models/Message.js";

export default function chatSocket(io, socket) {
  socket.on("CHAT_MESSAGE", async ({ roomId, text }) => {
    try {
      const newMessage = await Message.create({
        roomId,
        sender: socket.user.userId,     // from JWT
        username: socket.user.username, // from JWT
        text,
      });

      io.to(roomId).emit("CHAT_MESSAGE", {
        _id: newMessage._id,
        roomId,
        text: newMessage.text,
        userName: newMessage.username,
        userId: newMessage.sender,
        time: newMessage.createdAt, // from timestamps
      });

    } catch (err) {
      console.error("Chat error:", err);
    }
  });

socket.on("CHAT_SYNC", async ({ roomId }) => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 }) // oldest first
      .limit(100); // optional limit

    socket.emit(
      "CHAT_HISTORY",
      messages.map((msg) => ({
        _id: msg._id,
        roomId: msg.roomId,
        text: msg.text,
        userName: msg.username,
        userId: msg.sender,
        time: msg.createdAt,
      }))
    );
  } catch (err) {
    console.error("History error:", err);
  }
});

}


