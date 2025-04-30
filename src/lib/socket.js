// lib/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("https://web-socket-53zp.onrender.com/", {
      withCredentials: true,
      transports: ["websocket"]
    });
  }
  return socket;
};

export const getSocket = () => socket;