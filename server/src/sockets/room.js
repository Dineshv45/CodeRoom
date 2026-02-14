import Room from "../models/Room.js";

const onlineUsers = new Map();
// socket.id → { userId, username, roomId }

export default function roomSocket(io, socket) {
  /* ================= JOIN ROOM ================= */
  socket.on("ROOM_JOIN", async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId });

      if (!room) {
        return socket.emit("ROOM_ERROR", "Room Not Found!");
      }

      const isMember = room.members.some(
        (member) => member.toString() === socket.user.userId,
      );

      if (!isMember) {
        return socket.emit("ROOM_ERROR", "Not authorized for this room");
      }

      // Join socket room
      socket.join(roomId);

      // Store in memory
      onlineUsers.set(socket.id, {
        userId: socket.user.userId,
        username: socket.user.username,
        roomId,
      });

      /* -------- Send Current Online Users -------- */
      const usersInRoom = Array.from(onlineUsers.values()).filter(
        (u) => u.roomId === roomId,
      );

      io.to(roomId).emit("ROOM_USERS", usersInRoom);

      /* -------- Send All Room Members (DB) -------- */
      const populatedRoom = await Room.findOne({ roomId }).populate(
        "members",
        "username _id",
      );

      const allMembers = populatedRoom.members.map((member) => ({
        userId: member._id.toString(),
        username: member.username,
      }));

      socket.emit("ROOM_MEMBERS", allMembers);

      /* -------- Notify Others -------- */
      socket.to(roomId).emit("USER_ONLINE", {
        userId: socket.user.userId,
        username: socket.user.username,
      });
    } catch (err) {
      console.error("ROOM_JOIN error:", err);
      socket.emit("ROOM_ERROR", "Failed to join room");
    }
  });

  /* ================= LEAVE ROOM ================= */
  socket.on("ROOM_LEAVE", ({ roomId }) => {
    socket.leave(roomId);

    const user = onlineUsers.get(socket.id);

    if (user) {
      onlineUsers.delete(socket.id);

      socket.to(roomId).emit("USER_OFFLINE", {
        userId: user.userId,
      });
    }
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);

    if (user) {
      onlineUsers.delete(socket.id);

      const usersInRoom = Array.from(onlineUsers.values()).filter(
        (u) => u.roomId === user.roomId,
      );

      io.to(user.roomId).emit("ROOM_USERS", usersInRoom);
    }
  });
}
