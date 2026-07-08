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

  localStorage.setItem(
    "userId",
    user._id
  );

  localStorage.setItem(
    "name",
    user.name || ""
  );

  localStorage.setItem(
    "profilePic",
    user.profilePic || ""
  );

  localStorage.setItem(
    "verified",
    user.verified || false
  );

  localStorage.setItem(
    "verificationBadge",
    user.verificationBadge || ""
  );

  setToken(token);
  setCurrentUser(user);
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