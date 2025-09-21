// src/config/socket.js
import { io } from "socket.io-client";

let socketInstance = null;

export const initiateSocketConnection = (projectId) => {
  socketInstance = io(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  if (!socketInstance) return;
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) return;
  socketInstance.emit(eventName, data);
};
