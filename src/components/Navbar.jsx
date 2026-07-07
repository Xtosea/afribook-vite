import React, {
  useEffect,
  useState,
  useRef,
} from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import SearchBar from "./SearchBar";

import { API_BASE } from "../api/api";
  
import InstallPWAButton from "./InstallPWAButton";

import { connectSocket, safeEmit } from
 "../socket";
import  Notifications from "../pages/Notifications";



import {
  Bell,
  Home,
  Video,
  MessageCircle,
  Users,
  Wallet,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bookmark,
  UserPlus,
  Trophy,
  CalendarDays,
  Store,
  Megaphone,
  Clapperboard,
} from "lucide-react";



const defaultProfile =
  "https://ui-avatars.com/api/?name=User";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const settingsRef = useRef(null);
  const dropdownRef = useRef(null);


  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUserId = localStorage.getItem("userId");

  const isActive = (path) => location.pathname === path;


  // ================= SOCKET =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUserId) return;

    const socket = connectSocket();
    if (!socket) return;

    const joinUser = () => safeEmit("join", currentUserId);

    if (socket.connected) joinUser();
    socket.on("connect", joinUser);

    socket.on("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    });

    socket.on("online-users", setOnlineUsers);

    return () => {
      socket.off("connect", joinUser);
      socket.off("new-notification");
      socket.off("online-users");
    };
  }, [currentUserId]);

  // ================= FETCH =================
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const [nRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const nData = await nRes.json();
        const cData = await cRes.json();


        setNotifications(Array.isArray(nData) ? nData : []);
        setUnreadCount(cData.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // ================= OUTSIDE CLICK =================
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }

      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
  setMobileOpen(false);
  setShowSettings(false);

  localStorage.clear();
  navigate("/login", { replace: true });
};

  // ================= UI =================
  return (
    <>
      <nav className="bg-white shadow sticky top-0 z-50 px-4 py-2 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          AfricSocial
        </Link>

        {/* SEARCH */}
        <div className="hidden md:flex flex-1 mx-6">
          <SearchBar />
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-3">

          {/* ONLINE */}
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
            <Users size={18} />
            <span>{onlineUsers.length}</span>
          </div>

          {/* HOME ICON */}
          <Link to="/" className="hidden md:block p-2 hover:bg-gray-100 rounded">
            <Home size={20} />
          </Link>

          <Link to="/reels" className="hidden md:block p-2 hover:bg-gray-100 rounded">
            <Video size={20} />
          </Link>

          <Link to="/messages" className="hidden md:block p-2 hover:bg-gray-100 rounded">
            <MessageCircle size={20} />
          </Link>

          <Link to="/friends" className="hidden md:block p-2 hover:bg-gray-100 rounded">
            <Users size={20} />
          </Link>

          <Link to="/wallet" className="hidden md:block p-2 hover:bg-gray-100 rounded">
            <Wallet size={20} />
          </Link>

          <button
  onClick={() => navigate("/notifications")}
  className="relative p-2"
>
  <Bell size={25} />

  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
      {unreadCount}
    </span>
  )}
</button>

          {/* SETTINGS */}
          <div ref={settingsRef} className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2">
              <Settings size={20} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-40 bg-white border shadow rounded-lg">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

            {/* MOBILE MENU */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
        </div>
      </nav>

     
{/* MOBILE QUICK MENU */}

{isLoggedIn && (
  <div className="md:hidden bg-white border-b shadow-sm sticky top-2">

    <div className="grid grid-cols-6 gap-2 p-2">

  <Link to="/" className="flex flex-col items-center text-xs">
    <Home size={20} />
    <span>Home</span>
  </Link>

  <Link to="/reels" className="flex flex-col items-center text-xs">
    <Video size={20} />
    <span>Reels</span>
  </Link>

  <Link to="/messages" className="flex flex-col items-center text-xs">
    <MessageCircle size={20} />
    <span>Chats</span>
  </Link>

  <Link to="/profile" className="flex flex-col items-center text-xs">
    <User size={20} />
    <span>Profile</span>
  </Link>

  <Link to="/leaderboard" className="flex flex-col items-center text-xs">
    <Trophy size={20} />
    <span>Top</span>
  </Link>

  
      <Link
        to="/wallet"
        className={`flex flex-col items-center text-xs ${
          isActive("/wallet") ? "text-blue-600" : ""
        }`}
      >
        <Wallet size={20} />
        <span>Wallet</span>
      </Link>
</div>
</div>
)}
      {/* ================= MOBILE DRAWER ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="w-72 h-full bg-white p-4">

            

           <h3 className="font-semibold text-gray-500 uppercase text-xs mb-3">
  👥 Social
</h3>

<div className="grid grid-cols-2 gap-4 mb-6">

  <Link ...>
    <Home size={32} />
    <span className="mt-2 text-sm font-medium">
      Home
    </span>
  </Link>

  <Link ...>
    <User size={32} />
    <span className="mt-2 text-sm font-medium">
      Profile
    </span>
  </Link>

  <Link ...>
    <Users size={32} />
    <span className="mt-2 text-sm font-medium">
      Friends
    </span>
  </Link>

  <Link ...>
    <Users size={32} />
    <span className="mt-2 text-sm font-medium">
      Discover
    </span>
  </Link>

</div>

          </div>
        </div>
      )}

      <InstallPWAButton />
    </>
  );
};

export default Navbar;