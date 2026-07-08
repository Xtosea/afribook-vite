import {
  createContext,
  useContext,
  useState,
} from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [currentUser, setCurrentUser] =
    useState(
      JSON.parse(
        localStorage.getItem("user") || "null"
      )
    );

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
    localStorage.setItem("userId", user._id);

    setToken(token);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.clear();

    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isLoggedIn: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};