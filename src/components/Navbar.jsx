// src/components/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api/api";
import SearchBar from "./SearchBar";
import { connectSocket } from "../socket";

// Icons
import {
  Bell,
  Home,
  Video,
  MessageCircle,
  User,
  Settings,
  Users
} from "lucide-react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);
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

    // Online users
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }

      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSettings = () => setShowSettings(!showSettings);

  return (
    <>
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

        <div className="flex items-center space-x-4 md:space-x-6">
          {isLoggedIn ? (
            <>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">

                <Link to="/" className="hover:text-blue-500 flex items-center gap-1">
                  <Home size={20} /> Home
                </Link>

                <Link to="/reels" className="hover:text-blue-500 flex items-center gap-1">
                  <Video size={20} /> Reels
                </Link>

                <Link to="/messages" className="hover:text-blue-500 flex items-center gap-1">
                  <MessageCircle size={20} /> Messages
                </Link>

                <Link to="/profile" className="hover:text-blue-500 flex items-center gap-1">
                  <User size={20} /> Profile
                </Link>

              </div>

              {/* Online Users Indicator */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Users size={18} />
                <span>{onlineUsers.length} Online</span>
              </div>

              {/* Notifications */}
              <div className="relative" ref={dropdownRef}>
                <div
                  className="cursor-pointer relative p-2 rounded hover:bg-gray-100"
                  onClick={toggleDropdown}
                >
                  <Bell size={22} />

                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>

              </div>

              {/* Settings */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={toggleSettings}
                  className="p-2 rounded hover:bg-gray-100 hidden md:inline-flex"
                >
                  <Settings size={20} />
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded hover:bg-gray-100"
              >
                ☰
              </button>

            </>
          ) : null}
        </div>

      </nav>


      {/* Bottom Mobile Navigation */}
      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">

          <div className="flex justify-around items-center py-2">

            <Link to="/" className="flex flex-col items-center text-gray-600">
              <Home size={22} />
              <span className="text-xs">Home</span>
            </Link>

            <Link to="/reels" className="flex flex-col items-center text-gray-600">
              <Video size={22} />
              <span className="text-xs">Reels</span>
            </Link>

            <Link to="/messages" className="flex flex-col items-center text-gray-600">
              <MessageCircle size={22} />
              <span className="text-xs">Messages</span>
            </Link>

            <Link to="/profile" className="flex flex-col items-center text-gray-600">
              <User size={22} />
              <span className="text-xs">Profile</span>
            </Link>

          </div>

        </div>
      )}


      {/* Mobile Reels Button */}
      <Link
        to="/reels"
        className="fixed bottom-20 right-4 md:hidden bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-50"
      >
        <Video size={22} />
      </Link>

    </>
  );
};

export default Navbar;