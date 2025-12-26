import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "https://mentormateback-end.onrender.com", {
  withCredentials: true,
});

export default socket;
