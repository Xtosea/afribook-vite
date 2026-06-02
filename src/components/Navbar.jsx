import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import SearchBar from "./SearchBar";
import InstallPWAButton from "./InstallPWAButton";

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
  LogOut,
  Menu,
  X,
} from "lucide-react";

const defaultProfile =
  "https://ui-avatars.com/api/?name=User";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  // =========================
  // STATE
  // =========================
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUserId = localStorage.getItem("userId");

  // =========================
  // ACTIVE ROUTE
  // =========================
  const isActive = (path) => location.pathname === path;

  // =========================
  // LOGIN CHECK
  // =========================
  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("token"));
    check();

    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [notifRes, countRes] = await Promise.all([
          fetch(`${API_BASE}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const notifData = await notifRes.json();
        const countData = await countRes.json();

        setNotifications(Array.isArray(notifData) ? notifData : []);
        setUnreadCount(countData.count || 0);
      } catch (err) {
        console.error("Notification fetch error:", err);
      }
    };

    fetchData();
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

    const handleNotification = (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNotification);
    socket.on("online-users", setOnlineUsers);

    return () => {
      socket.off("connect", joinUser);
      socket.off("new-notification", handleNotification);
      socket.off("online-users", setOnlineUsers);
    };
  }, [currentUserId]);

  // =========================
  // CLOSE OUTSIDE
  // =========================
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // =========================
  // NAV LINKS (REUSABLE)
  // =========================
  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/reels", label: "Reels", icon: Video },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/leaderboard", label: "Leaderboard", icon: Users },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-50">
        <div className="flex justify-between items-start">

          {/* ================= LEFT (LOGO + DESKTOP MENU) ================= */}
          <div className="flex flex-col">
            <Link
              to="/"
              className="font-extrabold text-3xl text-blue-600"
            >
              AfricSocial
            </Link>

            {/* Desktop menu UNDER logo */}
            {isLoggedIn && (
              <div className="hidden md:flex gap-5 mt-2 text-sm text-gray-700">
                {navLinks.slice(0, 6).map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1 ${
                      isActive(to)
                        ? "text-blue-600 font-semibold"
                        : "hover:text-blue-500"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ================= CENTER SEARCH ================= */}
          {isLoggedIn && (
            <div className="flex-1 mx-6 hidden md:flex">
              <SearchBar />
            </div>
          )}

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-4">

            {/* Online users */}
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
              <Users size={16} />
              <span>{onlineUsers.length}</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border z-50">
                  <div className="p-3 border-b font-semibold">
                    Notifications
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-3 text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                        >
                          <p className="text-sm">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative" ref={settingsRef}>
              <button onClick={() => setShowSettings(!showSettings)}>
                <Settings size={20} />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl border z-50">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4 overflow-y-auto md:hidden">
          <SearchBar />

          <div className="mt-4 space-y-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 border-b"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      <InstallPWAButton />
    </>
  );
};

export default Navbar;