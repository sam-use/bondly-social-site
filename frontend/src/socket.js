// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socketURL = import.meta.env.MODE === "development" 
  ? "http://localhost:3000" 
  : "https://bondly-social-site.onrender.com";

const socket = io(socketURL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  timeout: 20000,
  forceNew: true,
});

export default socket;
