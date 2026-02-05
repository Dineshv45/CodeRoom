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

// {userId, userName}
const userSocketMap = {
};

const getAllConnectedUsers = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      const user = userSocketMap[socketId];
      return {
        socketId,
        userId: user?.userId,
        userName: user?.userName,
      };
    },
  );
};

io.on("connection", (socket) => {
  /* ================= CREATE ROOM ================= */
  socket.on(
    Actions.CREATE_ROOM,
    async ({ userId, roomName, password, userName }) => {

      const existing = await Room.findOne({ roomName });

  
      if (existing) {
        socket.emit(Actions.ERROR, "Room name already exists");
        return;
      }

      const roomId = uuidv4();

      await Room.create({
        roomId,
        roomName,
        createdBy: { userId, userName },
        isProtected: !!password,
        passwordHash: password ? await bcrypt.hash(password, 10) : null,
      });

      await Code.create({
        roomId,
        content: "Start Building...",
      });

      userSocketMap[socket.id] = {
        userId,
        userName,
      };

      socket.join(roomId);
      console.log(`Joined in Room ${roomId} ${roomName} `)

      socket.emit(Actions.CREATE_ROOM, { roomId, userId });
    },
  );

  // JOIN_CHECK validating
  socket.on(
    Actions.JOIN_CHECK,
    async ({ userId, roomName, password, userName }) => {
      const room = await Room.findOne({ roomName });
      if (!room) {
        socket.emit(Actions.ERROR, "Room not found");
        return;
      }

      const roomId = room.roomId; 
      const users = getAllConnectedUsers(roomId);

     const userNameTaken = users.some(
  (u) => u.userName === userName && u.userId !== userId
);



      if (userNameTaken) {
        socket.emit(
          Actions.ERROR,
          "Username already taken in this room. Please choose another.",
        );
        return;
      }

       if (room.isProtected) {
      const ok = await bcrypt.compare(password || "", room.passwordHash);
      if (!ok) {
        socket.emit(Actions.ERROR, "Invalid password");
        return;
      }
    }


      socket.emit(Actions.JOIN_CONFIRM, {
        roomId,
      });
    },
  );

  /* ================= JOIN ROOM ================= */
  socket.on(Actions.JOIN, async ({ roomName, userName, userId }) => {
    const room = await Room.findOne({ roomName });

    if (!room) {
      socket.emit(Actions.ERROR, "Room not found");
      return;
    }

    const roomId = room.roomId;
    userSocketMap[socket.id] = {
      userId,
      userName,
    };
    socket.join(roomId);

    const connectedUsers = getAllConnectedUsers(roomId);

    //  send to JOINING USER
    // this is for to add his/her own profile in connected users at client side
    socket.emit(Actions.JOINED, {
      connectedUsers,
      userName,
    });

    //  send to OTHER USERS
    socket.to(roomId).emit(Actions.JOINED, {
      connectedUsers,
      userName,
      userId
    });

    const codeDoc = await Code.findOne({ roomId });
    if (codeDoc) {
      socket.emit(Actions.SYNC_CODE, { code: codeDoc.content });
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    socket.emit(
      Actions.CHAT_HISTORY,
      messages.map((msg) => ({
        userName: msg.userName,
        text: msg.text,
        time: msg.createdAt,
      })),
    );
  });

  /* ================= CODE ================= */
  socket.on(Actions.CODE_CHANGE, async ({ roomId, code }) => {
    await Code.findOneAndUpdate(
      { roomId },
      { content: code },
      { upsert: true },
    );
    socket.to(roomId).emit(Actions.CODE_CHANGE, { code });
  });

  /* ================= CHAT ================= */
  socket.on(Actions.CHAT_MESSAGE, async ({ roomId, text }) => {

    const user = userSocketMap[socket.id];

    const userName = user.userName;
    
    if (!userName) return;

    const msg = await Message.create({ roomId, userName, text });

    io.to(roomId).emit(Actions.CHAT_MESSAGE, {
      userName,
      text,
      time: msg.createdAt,
    });
  });

  socket.on(Actions.LEAVE, ({roomId, userName, userId})=>{
  
  if (userName) return;

  socket.leave(roomId);

  socket.to(roomId).emit(Actions.DISCONNECTED, {
    socketId: socket.id,
    userName, 
    userId,
  });

  delete userSocketMap[socket.id];
  })

  /* ================= DISCONNECT ================= */
  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      socket.to(roomId).emit(Actions.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });
    }
    delete userSocketMap[socket.id];
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
