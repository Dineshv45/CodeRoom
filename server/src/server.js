import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app, { allowedOrigins } from "./app.js";
import initSockets from "./sockets/index.js";


const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const io = new Server(server, {
  cors: { origin: allowedOrigins },
});


initSockets(io);


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
