import React, { useEffect } from "react";
import { connectSocket } from "../socket";

const Messages = () => {
useEffect(() => {
const socket = connectSocket();

if (!socket) return;  

const userId = localStorage.getItem("userId");  

// join room  
socket.emit("join", userId);  

// receive messages  
socket.on("receive-message", (message) => {  
  console.log("New message:", message);  
});  

// cleanup  
return () => {  
  socket.off("receive-message");  
};

}, []);

return <div>Messages Page</div>;
};

export default Messages;