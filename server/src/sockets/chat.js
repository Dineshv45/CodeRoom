import Message from "../models/Message.js";

export default function chatSocket(io, socket) {
  socket.on("CHAT_MESSAGE", async ({ roomId, text }) => {
    const msg = await Message.create({
      roomId,
      sender: socket.user.userId,
      username: socket.user.username,
      text,
    });

    io.to(roomId).emit("CHAT_MESSAGE", {
      username: socket.user.username,
      text,
      time: msg.createdAt,
    });
  });
}
