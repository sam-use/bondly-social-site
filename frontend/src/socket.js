// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socket = io("https://instagram-clone-backend-nqcw.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});
export default socket;
