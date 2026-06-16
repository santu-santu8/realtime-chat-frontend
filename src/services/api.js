import axios from "axios";

const API = axios.create({
  baseURL:
    "https://realtime-chat-backend-5kgp.onrender.com/api",
});

export default API;