// lib/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ["websocket"]
    });
  }
  return socket;
};

export const getSocket = () => socket;