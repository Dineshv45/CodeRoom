import { io } from "socket.io-client";

export const initSocket = () => {
  return io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket"],
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });
};