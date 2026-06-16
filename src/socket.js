import { io } from "socket.io-client";

const socket = io(
  "https://realtime-chat-backend-5kgp.onrender.com",
  {
    autoConnect: true,
  }
);

export default socket;