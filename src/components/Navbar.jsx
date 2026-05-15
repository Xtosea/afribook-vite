import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import SearchBar from "./SearchBar";

import { connectSocket, safeEmit } from "../socket";

import {
  Bell,
  Home,
  Video,
  MessageCircle,
  User,
  Settings,
  Users,
} from "lucide-react";
import InstallPWAButton from "./components/InstallPWAButton";


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  // =========================
  // STATES
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUserId = localStorage.getItem("userId");

  // =========================
  // LOGIN STATE
  // =========================

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  // =========================
  // SOCKET
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !currentUserId) return;

    const socket = connectSocket();

    if (!socket) return;

    // JOIN USER
    const joinUser = () => {
      console.log("✅ JOINING USER:", currentUserId);

      safeEmit("join", currentUserId);
    };

    // Already connected
    if (socket.connected) {
      joinUser();
    }

    // Wait for connection
    socket.on("connect", joinUser);

    // Notifications
    const handleNotification = (data) => {
      setNotifications((prev) => {
        return [data, ...prev].slice(0, 50);
      });
    };

    // Online users
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on("new-notification", handleNotification);

    socket.on("online-users", handleOnlineUsers);

    // CLEANUP
    return () => {
      socket.off("connect", joinUser);

      socket.off(
        "new-notification",
        handleNotification
      );

      socket.off(
        "online-users",
        handleOnlineUsers
      );
    };
  }, [currentUserId]);

  // =========================
  // CLOSE DROPDOWNS
  // =========================

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Notifications dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }

      // Settings dropdown
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.clear();

    setIsLoggedIn(false);

    navigate("/login");
  };

  // =========================
  // ACTIVE ROUTE
  // =========================

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

      <nav className="bg-white shadow px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-50">

        {/* LOGO */}
        <Link
          to="/"
          className="font-bold text-2xl text-blue-600"
        >
          Afribook
        </Link>

        {/* SEARCH */}
        {isLoggedIn && (
          <div className="flex-1 mx-4 hidden md:flex">
            <SearchBar />
          </div>
        )}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {isLoggedIn && (
            <>
              {/* ========================= */}
              {/* DESKTOP NAV */}
              {/* ========================= */}

              <div className="hidden md:flex items-center gap-6">

                <Link
                  to="/"
                  className={`flex items-center gap-1 ${
                    isActive("/")
                      ? "text-blue-600"
                      : "hover:text-blue-500"
                  }`}
                >
                  <Home size={20} />
                  Home
                </Link>

                <Link
                  to="/reels"
                  className={`flex items-center gap-1 ${
                    isActive("/reels")
                      ? "text-blue-600"
                      : "hover:text-blue-500"
                  }`}
                >
                  <Video size={20} />
                  Reels
                </Link>

                <Link
                  to="/messages"
                  className={`flex items-center gap-1 ${
                    isActive("/messages")
                      ? "text-blue-600"
                      : "hover:text-blue-500"
                  }`}
                >
                  <MessageCircle size={20} />
                  Messages
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-1 ${
                    isActive("/profile")
                      ? "text-blue-600"
                      : "hover:text-blue-500"
                  }`}
                >
                  <User size={20} />
                  Profile
                </Link>

              </div>

              {/* ========================= */}
              {/* ONLINE USERS */}
              {/* ========================= */}

              <div className="hidden md:flex items-center gap-2 text-sm">

                <Users size={18} />

                <span>
                  {onlineUsers.length} Online
                </span>

              </div>

              {/* ========================= */}
              {/* NOTIFICATIONS */}
              {/* ========================= */}

              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  onClick={() =>
                    setShowDropdown(!showDropdown)
                  }
                  className="relative"
                >
                  <Bell size={22} />

                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-xl border z-50 overflow-hidden">

                    <div className="p-3 border-b font-semibold">
                      Notifications
                    </div>

                    {notifications.length === 0 ? (
                      <div className="p-3 text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">

                        {notifications.map((n, i) => (
                          <div
                            key={i}
                            className="p-3 border-b hover:bg-gray-100 cursor-pointer"
                          >
                            {n.text ||
                              "New Notification"}
                          </div>
                        ))}

                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* ========================= */}
              {/* SETTINGS */}
              {/* ========================= */}

              <div
                className="relative"
                ref={settingsRef}
              >
                <button
                  onClick={() =>
                    setShowSettings(!showSettings)
                  }
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl border z-50 overflow-hidden">

                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() =>
                        setShowSettings(false)
                      }
                    >
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>

              {/* ========================= */}
              {/* MOBILE MENU BUTTON */}
              {/* ========================= */}

              <button
                className="md:hidden text-2xl"
                onClick={() =>
                  setMobileMenuOpen(
                    !mobileMenuOpen
                  )
                }
              >
                {mobileMenuOpen ? "✖" : "☰"}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}

      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow p-4 space-y-4">

          <SearchBar />

          <Link
            to="/"
            className="block"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            Home
          </Link>

          <Link
            to="/reels"
            className="block"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            Reels
          </Link>

          <Link
            to="/messages"
            className="block"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            Messages
          </Link>

          <Link
            to="/profile"
            className="block"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg"
          >
            Logout
          </button>

        </div>
      )}

      {/* ========================= */}
      {/* BOTTOM MOBILE NAV */}
      {/* ========================= */}

      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">

          <div className="flex justify-around py-2">

            <Link
              to="/"
              className={`flex flex-col items-center ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <Home size={22} />
            </Link>

            <Link
              to="/reels"
              className={`flex flex-col items-center ${
                isActive("/reels")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <Video size={22} />
            </Link>

            <Link
              to="/messages"
              className={`flex flex-col items-center ${
                isActive("/messages")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <MessageCircle size={22} />
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center ${
                isActive("/profile")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <User size={22} />
            </Link>

          </div>

        </div>
      )}
    </>
  );
};

  <InstallPWAButton />


export default Navbar;