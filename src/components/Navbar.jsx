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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Socket connection
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="bg-white shadow px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* LOGO */}
      <Link to="/" className="font-bold text-2xl text-blue-600">
        Afribook
      </Link>

      {/* DESKTOP SEARCH */}
      {isLoggedIn && (
        <div className="flex-1 mx-4 hidden md:flex">
          <SearchBar />
        </div>
      )}

      {/* MENU */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {isLoggedIn ? (
          <>
            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="hover:text-blue-500 font-medium">
                Home
              </Link>
              <Link to="/profile" className="hover:text-blue-500 font-medium">
                Profile
              </Link>
              <Link to="/reels" className="hover:text-blue-500 font-medium">
                Reels
              </Link>
              <Link to="/messages" className="hover:text-blue-500 font-medium">
                Messages
              </Link>
            </div>

            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="cursor-pointer relative p-2 rounded hover:bg-gray-100"
                onClick={toggleDropdown}
              >
                <span className="text-2xl">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                  <div className="p-2 font-bold border-b">Notifications</div>
                  {notifications.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">No new notifications</p>
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
                            <span className="font-semibold">{n.sender?.name || "Someone"}</span>{" "}
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
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded hidden md:block"
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded hover:bg-gray-100"
            >
              <span className="text-2xl">{mobileMenuOpen ? "✖" : "☰"}</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-500 font-medium">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-500 font-medium">
              Register
            </Link>
          </>
        )}
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden p-4 space-y-3">
          <SearchBar />
          <Link to="/" onClick={toggleMobileMenu} className="block hover:text-blue-500">
            Home
          </Link>
          <Link to="/profile" onClick={toggleMobileMenu} className="block hover:text-blue-500">
            Profile
          </Link>
          <Link to="/reels" onClick={toggleMobileMenu} className="block hover:text-blue-500">
            Reels
          </Link>
          <Link to="/messages" onClick={toggleMobileMenu} className="block hover:text-blue-500">
            Messages
          </Link>
          <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;