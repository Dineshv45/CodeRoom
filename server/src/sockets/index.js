import socketAuth from "./auth.js"
import roomSocket from "./room.js";
import initYjsPersistence from "./code.js";
import chatSocket from "./chat.js";
import { YSocketIO } from "y-socket.io/dist/server";

export default function initSockets(io, app){
    socketAuth(io);
    // Initialize YSocketIO
    const ysocketio = new YSocketIO(io);
    app.set("ysocketio", ysocketio);

    // Setup Yjs document persistence (binary updates to MongoDB)
    initYjsPersistence(ysocketio);

    // Start YSocketIO
    ysocketio.initialize();

    io.on("connection", (socket) =>{
        roomSocket(io, socket);
        // codeSocket is now replaced by YSocketIO provider and persistence hooks
        chatSocket(io, socket);
    });
};