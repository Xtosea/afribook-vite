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
      <nav className="bg-white shadow sticky top-0 z-50">

  {/* TOP ROW */}
  <div className="px-4 py-3 flex items-center justify-between">

    {/* LOGO */}
    <Link
      to="/"
      className="font-extrabold text-3xl text-blue-600"
    >
      AfricSocial
    </Link>

    {/* SEARCH */}
    <div className="hidden md:block flex-1 max-w-xl mx-6">
      <SearchBar />
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-4">

      {/* NOTIFICATION */}
      <button
        onClick={() =>
          setShowNotifications(!showNotifications)
        }
        className="relative"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-2
              -right-2
              bg-red-500
              text-white
              text-xs
              rounded-full
              px-1
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* SETTINGS */}
      <button
        onClick={() =>
          setShowSettings(!showSettings)
        }
      >
        <Settings size={22} />
      </button>

      {/* MOBILE MENU */}
      <button
        className="md:hidden"
        onClick={() =>
          setMobileOpen(!mobileOpen)
        }
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

    </div>

  </div>
</nav>


  {/* DESKTOP MENU ROW */}
  <nav className="bg-white shadow sticky top-0 z-50">

  {/* TOP ROW */}
  <div className="px-4 py-3 flex items-center justify-between">

    {/* LOGO */}
    <Link
      to="/"
      className="font-extrabold text-3xl text-blue-600"
    >
      AfricSocial
    </Link>

    {/* SEARCH */}
    <div className="hidden md:block flex-1 max-w-xl mx-6">
      <SearchBar />
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-4">

      {/* NOTIFICATION */}
      <button
        onClick={() =>
          setShowNotifications(!showNotifications)
        }
        className="relative"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-2
              -right-2
              bg-red-500
              text-white
              text-xs
              rounded-full
              px-1
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* SETTINGS */}
      <button
        onClick={() =>
          setShowSettings(!showSettings)
        }
      >
        <Settings size={22} />
      </button>

      {/* MOBILE MENU */}
      <button
        className="md:hidden"
        onClick={() =>
          setMobileOpen(!mobileOpen)
        }
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

    </div>

  </div>

  {/* DESKTOP MENU ROW */}
  <div className="hidden md:flex items-center gap-6 px-6 py-2 border-t text-sm">

    <Link
      to="/"
      className={`flex items-center gap-1 ${
        isActive("/")
          ? "text-blue-600 font-semibold"
          : ""
      }`}
    >
      <Home size={18} />
      Home
    </Link>

    <Link
      to="/reels"
      className={`flex items-center gap-1 ${
        isActive("/reels")
          ? "text-blue-600 font-semibold"
          : ""
      }`}
    >
      <Video size={18} />
      Reels
    </Link>

    <Link
      to="/messages"
      className={`flex items-center gap-1 ${
        isActive("/messages")
          ? "text-blue-600 font-semibold"
          : ""
      }`}
    >
      <MessageCircle size={18} />
      Messages
    </Link>

    <Link
      to="/friends"
      className={`flex items-center gap-1 ${
        isActive("/friends")
          ? "text-blue-600 font-semibold"
          : ""
      }`}
    >
      <Users size={18} />
      Friends
    </Link>

    <Link
      to="/leaderboard"
      className={`flex items-center gap-1 ${
        isActive("/leaderboard")
          ? "text-blue-600 font-semibold"
          : ""
      }`}
    >
      <Users size={18} />
      Leaderboard
    </Link>

    <Link
      to="/wallet"
      className={`flex items-center gap-1 ${
        isActive("/wallet")
          ? "text-blue-600 font-semibold"
          : ""
      }`}
    >
      <Wallet size={18} />
      Wallet
    </Link>

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

export default Navbar;