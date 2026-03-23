export const socket = io("https://afribook-backend.onrender.com", { // no trailing slash
  transports: ["polling", "websocket"],
  auth: { token },
});