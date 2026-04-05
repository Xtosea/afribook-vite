import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../api/api";
import SearchBar from "./SearchBar";
import { connectSocket } from "../socket";

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
  const location = useLocation();

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  /* Socket */
  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectSocket();

    socket.emit("join", currentUserId);

    socket.on("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  /* Close dropdowns */
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

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white shadow px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-50">

        {/* Logo */}
        <Link to="/" className="font-bold text-2xl text-blue-600">
          Afribook
        </Link>

        {/* Search */}
        {isLoggedIn && (
          <div className="flex-1 mx-4 hidden md:flex">
            <SearchBar />
          </div>
        )}

        <div className="flex items-center space-x-4">

          {isLoggedIn && (
            <>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-6">

                <Link to="/" className={`flex items-center gap-1 ${isActive("/") ? "text-blue-600" : "hover:text-blue-500"}`}>
                  <Home size={20}/> Home
                </Link>

                <Link to="/reels" className={`flex items-center gap-1 ${isActive("/reels") ? "text-blue-600" : "hover:text-blue-500"}`}>
                  <Video size={20}/> Reels
                </Link>

                <Link to="/messages" className={`flex items-center gap-1 ${isActive("/messages") ? "text-blue-600" : "hover:text-blue-500"}`}>
                  <MessageCircle size={20}/> Messages
                </Link>

                <Link to="/profile" className={`flex items-center gap-1 ${isActive("/profile") ? "text-blue-600" : "hover:text-blue-500"}`}>
                  <User size={20}/> Profile
                </Link>

              </div>

              {/* Online Users */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Users size={18}/>
                {onlineUsers.length} Online
              </div>

              {/* Notifications */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative"
                >
                  <Bell size={22}/>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow rounded-lg border z-50">

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
                            {n.text || "New Notification"}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Settings */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings size={20}/>
                </button>

                {showSettings && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded border">

                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={()=>setShowSettings(false)}
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

              {/* Hamburger */}
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? "✖" : "☰"}
              </button>

            </>
          )}

        </div>

      </nav>


      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow p-4 space-y-3">

          <SearchBar />

          <Link to="/" onClick={()=>setMobileMenuOpen(false)}>Home</Link>
          <Link to="/reels" onClick={()=>setMobileMenuOpen(false)}>Reels</Link>
          <Link to="/messages" onClick={()=>setMobileMenuOpen(false)}>Messages</Link>
          <Link to="/profile" onClick={()=>setMobileMenuOpen(false)}>Profile</Link>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-1 rounded"
          >
            Logout
          </button>

        </div>
      )}


      {/* Bottom Mobile Nav */}
      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
          <div className="flex justify-around py-2">

            <Link to="/" className={`flex flex-col items-center ${isActive("/") ? "text-blue-600" : "text-gray-500"}`}>
              <Home size={22}/>
            </Link>

            <Link to="/reels" className={`flex flex-col items-center ${isActive("/reels") ? "text-blue-600" : "text-gray-500"}`}>
              <Video size={22}/>
            </Link>

            <Link to="/messages" className={`flex flex-col items-center ${isActive("/messages") ? "text-blue-600" : "text-gray-500"}`}>
              <MessageCircle size={22}/>
            </Link>

            <Link to="/profile" className={`flex flex-col items-center ${isActive("/profile") ? "text-blue-600" : "text-gray-500"}`}>
              <User size={22}/>
            </Link>

          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;