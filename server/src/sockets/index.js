import socketAuth from "./auth.js"
import roomSocket from "./room.js";
import codeSocket from "./code.js";
import chatSocket from "./chat.js";

export default function initSockets(io){
    socketAuth(io);

    io.on("Connection", (socket) =>{
        roomSocket(io, socket);
        codeSocket(io, socket);
        chatSocket(io, socket);
    });
};