import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token] = useState(localStorage.getItem("token"));
  const [currentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  return (
    <AuthContext.Provider value={{ token, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};