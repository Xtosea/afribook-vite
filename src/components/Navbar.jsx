// src/components/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api/api";
import SearchBar from "./SearchBar";
import { connectSocket } from "../socket";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");

  /* =================== CHECK LOGIN =================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  /* =================== SOCKET CONNECTION =================== */
  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("join", currentUserId);

    socket.on("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  /* =================== CLOSE DROPDOWN =================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =================== LOGOUT =================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center relative">

      {/* Logo */}
      <Link to="/" className="font-bold text-xl">
        Afribook
      </Link>

      {/* Search Bar */}
      {isLoggedIn && (
        <div className="w-1/3">
          <SearchBar />
        </div>
      )}

      {/* Right side */}
      <div className="space-x-4 flex items-center">
        {isLoggedIn ? (
          <>
            <Link to="/" className="hover:underline">
              Home
            </Link>

            <Link to="/profile" className="hover:underline">
              Profile
            </Link>

            <Link to="/reels" className="hover:underline">
              Reels
            </Link>

            <Link to="/messages" className="hover:underline">
              Messages
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="cursor-pointer relative"
                onClick={toggleDropdown}
              >
                <span className="text-2xl">🔔</span>

                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">

                  <div className="p-2 font-bold border-b">
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">
                      No new notifications
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((n, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border-b hover:bg-gray-100 cursor-pointer"
                        >
                          <img
                            src={
                              n.sender?.profilePic ||
                              `${API_BASE}/uploads/profiles/default-profile.png`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />

                          <div className="text-sm">
                            <span className="font-semibold">
                              {n.sender?.name || "Someone"}
                            </span>{" "}
                            {n.text || "New notification"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="w-full text-center text-blue-500 p-2 hover:bg-gray-100"
                    >
                      Clear All
                    </button>
                  )}

                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;