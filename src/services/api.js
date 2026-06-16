import axios from "axios";

const API = axios.create({
  baseURL: "https://realtime-chat-backend.onrender.com",
});

export default API;