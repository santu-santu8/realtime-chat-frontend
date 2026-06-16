import { io } from "socket.io-client";

const socket = io(
  "https://realtime-chat-backend.onrender.com",
  {
    autoConnect: true,
  }
);

export default socket;