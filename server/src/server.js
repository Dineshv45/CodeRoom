import "dotenv/config";

import http from "http";
import { Server } from "socket.io";
import app, { allowedOrigins } from "./app.js";
import initSockets from "./sockets/index.js";
import { connection } from "./config/connect.js";

const server = http.createServer(app);



const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connection();

    const io = new Server(server, {
      cors: { origin: allowedOrigins },
    });

    app.set("io", io);

    initSockets(io, app);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
  catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
