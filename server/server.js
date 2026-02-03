import express from "express";
import http from "http";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { Actions } from "./Actions.js";

// DB
import { connection } from "./DB/connect.js";

// Models
import Room from "./models/Room.js";
import Code from "./models/Code.js";
import Message from "./models/Message.js";

connection();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const userSocketMap = {};

const getAllConnectedUsers = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

io.on("connection", (socket) => {

  /* ================= CREATE ROOM ================= */
  socket.on(Actions.CREATE_ROOM, async ({ roomName, password, username }) => {
    const existing = await Room.findOne({ roomName });
    if (existing) {
      socket.emit(Actions.ERROR, "Room name already exists");
      return;
    }

    const roomId = uuidv4();

    await Room.create({
      roomId,
      roomName,
      createdBy: username,
      isProtected: !!password,
      passwordHash: password ? await bcrypt.hash(password, 10) : null,
    });

    await Code.create({
      roomId,
      content: "Start Building...",
    });

    userSocketMap[socket.id] = username;

    socket.join(roomId);

    socket.emit(Actions.CREATE_ROOM, { roomId });
  });

  // JOIN_CHECK validating 
  socket.on(Actions.JOIN_CHECK, async({roomName, password})=>{
    const room = await Room.findOne({ roomName });
    if (!room) {
      socket.emit(Actions.ERROR, "Room not found");
      return;
    }

    if (room.isProtected) {
      const ok = await bcrypt.compare(password || "", room.passwordHash);
      if (!ok) {
        socket.emit(Actions.ERROR, "Invalid password");
        return;
      }
    }

    const roomId = room.roomId;

    socket.emit(Actions.JOIN_CONFIRM, ({
      roomId,
    }));
  })

  /* ================= JOIN ROOM ================= */
socket.on(Actions.JOIN, async ({ roomName, username }) => {

  const room = await Room.findOne({ roomName });

  if (!room) {
    socket.emit(Actions.ERROR, "Room not found");
    return;
  }

  const roomId = room.roomId;

  userSocketMap[socket.id] = username;
  socket.join(roomId);

  const connectedUsers = getAllConnectedUsers(roomId);

  //  send to JOINING USER
  // this is for to add his/her own profile in connected users at client side
  socket.emit(Actions.JOINED, {
    connectedUsers,
    username,
  });

  //  send to OTHER USERS
  socket.to(roomId).emit(Actions.JOINED, {
    connectedUsers,
    username,
  });

  const codeDoc = await Code.findOne({ roomId });
  if (codeDoc) {
    socket.emit(Actions.SYNC_CODE, { code: codeDoc.content });
  }

 const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

socket.emit(
  Actions.CHAT_HISTORY,
  messages.map(msg => ({
    username: msg.username,
    text: msg.text,
    time: msg.createdAt, 
  }))
);

});


  /* ================= CODE ================= */
  socket.on(Actions.CODE_CHANGE, async ({ roomId, code }) => {
    await Code.findOneAndUpdate(
      { roomId },
      { content: code },
      { upsert: true }
    );
    socket.to(roomId).emit(Actions.CODE_CHANGE, { code });
  });

  /* ================= CHAT ================= */
  socket.on(Actions.CHAT_MESSAGE, async ({ roomId, text }) => {
    const username = userSocketMap[socket.id];
    if (!username) return;

    const msg = await Message.create({ roomId, username, text });

    io.to(roomId).emit(Actions.CHAT_MESSAGE, {
      username,
      text,
      time: msg.createdAt,
    });
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      socket.to(roomId).emit(Actions.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    }
    delete userSocketMap[socket.id];
  });
});


server.listen(5000, () => {
  console.log("Server running on port 5000");
});
