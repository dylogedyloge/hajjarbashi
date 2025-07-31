import { io } from "socket.io-client";

const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '${process.env.NEXT_PUBLIC_API_BASE_URL}';
baseUrl = baseUrl.replace(/^http/, 'ws');
const socket = io(baseUrl, {
  transports: ["websocket"],
  auth: { token },
});

export default socket; 