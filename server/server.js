import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Actions } from "./Actions.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {};
const roomCodeMap = {};

const getALLConnectedUsers = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    },
  );
};

io.on("connection", (socket) => {
  socket.on(Actions.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const connectedUsers = getALLConnectedUsers(roomId);

    //notify other only
    socket.to(roomId).emit(Actions.JOINED, {
      connectedUsers,
      username,
      socketId: socket.id,
    });

    //send user list silently to self
    socket.emit(Actions.JOINED, {
      connectedUsers,
      username,
      socketId: socket.id,
    });

    if (roomCodeMap[roomId]) {
      io.to(socket.id).emit(Actions.SYNC_CODE, {
        code: roomCodeMap[roomId],
      });
    }
  });

  socket.on(Actions.CODE_CHANGE, ({ roomId, code }) => {
    if (code !== undefined) {
      roomCodeMap[roomId] = code;
      socket.to(roomId).emit(Actions.CODE_CHANGE, { code });
    }
  });

  // chat events and

  // chat event (SINGLE listener)
  socket.on(Actions.CHAT_MESSAGE, ({ roomId, username, text }) => {
    io.to(roomId).emit(Actions.CHAT_MESSAGE, {
      username,
      text,
      time: Date.now(),
    });
  });

  //Disconnect
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      socket.to(roomId).emit(Actions.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server listening on port ${PORT}`));
