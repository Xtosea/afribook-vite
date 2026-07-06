import { Buffer } from "buffer";
import process from "process";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { BrowserRouter } from "react-router-dom";

import "./index.css";

import { AuthProvider } from "./context/AuthContext";

import { registerSW } from "virtual:pwa-register";

import Logout from "./components/inactivity/Logout";
import { CallProvider } from "./context/CallProvider";


window.global = window;
window.Buffer = Buffer;
window.process = process;

registerSW({
  immediate: true,
});


ReactDOM.createRoot(
  document.getElementById("root")
).render(


  
        
  <BrowserRouter>
  <AuthProvider>
  <CallProvider>
    <Logout/>

    <App/>

  </CallProvider>
  </AuthProvider>
  </BrowserRouter>
);