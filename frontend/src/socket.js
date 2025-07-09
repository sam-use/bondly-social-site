// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socket = io("https://bondly-social-site.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  timeout: 20000,
  forceNew: true,
});
export default socket;
