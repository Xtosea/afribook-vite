import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

import { registerSW } from "virtual:pwa-register";

import Logout from "./components/inactivity/Logout";


registerSW({
  immediate: true,
});


ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <BrowserRouter>

  <AuthProvider>

    <Logout />

    <App />

  </AuthProvider>

</BrowserRouter>
);