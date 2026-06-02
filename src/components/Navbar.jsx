


import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Video,
  MessageCircle,
  Users,
  Wallet,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import SearchBar from "./SearchBar";
import { API_BASE } from "../api/api";

const navItem =
  "flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    };

    fetchNotifications();
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-50">

        {/* LOGO */}
        <Link to="/" className="font-extrabold text-2xl text-blue-600">
          AfricSocial
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={`${navItem} ${isActive("/") && "text-blue-600 font-semibold"}`}>
            <Home size={18} /> Home
          </Link>

          <Link to="/reels" className={`${navItem} ${isActive("/reels") && "text-blue-600 font-semibold"}`}>
            <Video size={18} /> Reels
          </Link>

          <Link to="/messages" className={`${navItem} ${isActive("/messages") && "text-blue-600 font-semibold"}`}>
            <MessageCircle size={18} /> Messages
          </Link>

          <Link to="/friends" className={`${navItem} ${isActive("/friends") && "text-blue-600 font-semibold"}`}>
            <Users size={18} /> Friends
          </Link>

          <Link to="/wallet" className={`${navItem} ${isActive("/wallet") && "text-blue-600 font-semibold"}`}>
            <Wallet size={18} /> Wallet
          </Link>

          <SearchBar />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)}>
              <Bell />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border shadow rounded-lg z-50">
                <div className="p-3 border-b font-semibold">Notifications</div>
                {notifications.map((n) => (
                  <div key={n._id} className="p-3 text-sm border-b">
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SETTINGS */}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)}>
              <Settings />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-40 bg-white border shadow rounded-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>

        </div>
      </nav>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4 space-y-3 md:hidden">

          <SearchBar />

          <Link to="/" onClick={() => setMobileOpen(false)} className={navItem}>
            <Home size={18} /> Home
          </Link>

          <Link to="/reels" onClick={() => setMobileOpen(false)} className={navItem}>
            <Video size={18} /> Reels
          </Link>

          <Link to="/messages" onClick={() => setMobileOpen(false)} className={navItem}>
            <MessageCircle size={18} /> Messages
          </Link>

          <Link to="/friends" onClick={() => setMobileOpen(false)} className={navItem}>
            <Users size={18} /> Friends
          </Link>

          <Link to="/wallet" onClick={() => setMobileOpen(false)} className={navItem}>
            <Wallet size={18} /> Wallet
          </Link>

          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 rounded-lg">
            Logout
          </button>

        </div>
      )}
    </>
  );
};

