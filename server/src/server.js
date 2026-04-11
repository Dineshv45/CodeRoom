import "dotenv/config";

import http from "http";
import { Server } from "socket.io";
import app, { allowedOrigins } from "./app.js";
import initSockets from "./sockets/index.js";


const server = http.createServer(app);

const PORT = process.env.PORT;
const io = new Server(server, {
  cors: { origin: allowedOrigins },
});

// Attach io to app for access in controllers
app.set("io", io);


initSockets(io, app);


server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
