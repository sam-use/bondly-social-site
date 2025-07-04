// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socket = io("https://your-backend.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});
export default socket;
