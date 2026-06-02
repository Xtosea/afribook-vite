import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import SearchBar from "./SearchBar";
import { connectSocket, safeEmit } from "../socket";
import { API_BASE } from "../api/api";

import {
  Bell,
  Home,
  Video,
  MessageCircle,
  User,
  Settings,
  Users,
  Wallet,
  Menu,
  X,
} from "lucide-react";

import InstallPWAButton from "./InstallPWAButton";

const defaultProfile =
  "https://ui-avatars.com/api/?name=User";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentUserId = localStorage.getItem("userId");

  const isActive = (path) => location.pathname === path;

  // =========================
  // FETCH NOTIFICATIONS COUNT
  // =========================
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE}/api/notifications/unread-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCount();
  }, []);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, []);

  // =========================
  // LOGIN CHECK
  // =========================
  useEffect(() => {
    const check = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    check();
    window.addEventListener("storage", check);

    return () => window.removeEventListener("storage", check);
  }, []);

  // =========================
  // SOCKET
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUserId) return;

    const socket = connectSocket();
    if (!socket) return;

    const joinUser = () => {
      safeEmit("join", currentUserId);
    };

    if (socket.connected) joinUser();
    socket.on("connect", joinUser);

    socket.on("online-users", setOnlineUsers);

    socket.on("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("connect", joinUser);
      socket.off("online-users", setOnlineUsers);
    };
  }, [currentUserId]);

  // =========================
  // CLOSE DROPDOWNS
  // =========================
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }

      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-md sticky top-0 z-50">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3">

          {/* LOGO */}
          <Link
            to="/"
            className="font-extrabold text-3xl text-blue-600"
          >
            AfricSocial
          </Link>

          {/* SEARCH (desktop) */}
          {isLoggedIn && (
            <div className="hidden md:flex flex-1 mx-6">
              <SearchBar />
            </div>
          )}

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-4">

            <div className="hidden md:flex items-center gap-2 text-sm">
              <Users size={18} />
              {onlineUsers.length}
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowDropdown(!showDropdown)}>
                <Bell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border">
                  <div className="p-3 font-semibold border-b">
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-3 text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className="p-3 border-b hover:bg-gray-50"
                        >
                          <p className="text-sm">{n.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SETTINGS */}
            <div className="relative" ref={settingsRef}>
              <button onClick={() => setShowSettings(!showSettings)}>
                <Settings />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border rounded-lg">
                  <Link className="block px-4 py-2 hover:bg-gray-100" to="/settings">
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

            {/* HAMBURGER */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* ================= DESKTOP MENU (UNDER LOGO) ================= */}
        <div className="hidden md:flex justify-center gap-6 py-2 border-t text-sm text-gray-700">

          <Link to="/" className="flex items-center gap-1"><Home size={16}/> Home</Link>
          <Link to="/reels" className="flex items-center gap-1"><Video size={16}/> Reels</Link>
          <Link to="/messages" className="flex items-center gap-1"><MessageCircle size={16}/> Messages</Link>
          <Link to="/friends" className="flex items-center gap-1"><Users size={16}/> Friends</Link>
          <Link to="/leaderboard" className="flex items-center gap-1"><Users size={16}/> Leaderboard</Link>
          <Link to="/wallet" className="flex items-center gap-1"><Wallet size={16}/> Wallet</Link>
          <Link to="/profile" className="flex items-center gap-1"><User size={16}/> Profile</Link>

        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="w-72 bg-white h-full p-4">

            <button onClick={() => setMobileMenuOpen(false)}>
              <X />
            </button>

            <div className="mt-6 space-y-4">

              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/reels" onClick={() => setMobileMenuOpen(false)}>Reels</Link>
              <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link to="/friends" onClick={() => setMobileMenuOpen(false)}>Friends</Link>
              <Link to="/wallet" onClick={() => setMobileMenuOpen(false)}>Wallet</Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>Settings</Link>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded"
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}

      <InstallPWAButton />
    </>
  );
};

export default Navbar;