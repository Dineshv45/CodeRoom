import { io } from "socket.io-client";

export const initSocket = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token found");
  }

  return io(import.meta.env.VITE_BACKEND_URL, {
    auth: {
      token, // REQUIRED by backend
    },
    transports: ["websocket"],
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });
};