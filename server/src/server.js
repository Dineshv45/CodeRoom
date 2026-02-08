import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import initSockets from "./sockets/index.js";


const server = http.createServer(app);


const io = new Server(server, {
  cors: { origin: process.env.FRONT_END_URL },
});


initSockets(io);


server.listen(5000, () => {
  console.log("Server running on port 5000");
});
