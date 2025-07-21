import { io } from "socket.io-client";

const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
const socket = io("wss://api.hajjardevs.ir", {
  transports: ["websocket"],
  auth: { token },
});

export default socket; 