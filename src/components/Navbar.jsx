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
import { useAuth } from "../context/AuthContext";



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
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Palette, 
  Folder,
  Search,
} from "lucide-react";



const defaultProfile =
  "https://ui-avatars.com/api/?name=User";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const settingsRef = useRef(null);
  const dropdownRef = useRef(null);


  

  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
const [showSearch, setShowSearch] = useState(false);

  

const {
  currentUser,
  token,
  isLoggedIn,
  logout,
} = useAuth();

const currentUserId = currentUser?._id;

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
  setShowSearch(false);

  logout();

  navigate("/login", {
    replace: true,
  });
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

        {/* RIGHT SIDE */}


 
 {isLoggedIn && (


  <div className="flex items-center gap-3">

    {/* ONLINE */}
    <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
      <Users size={18} />
      <span>{onlineUsers.length}</span>
    </div>

    {/* HOME */}
    <Link to="/" className="hidden md:block p-2 hover:bg-gray-100 rounded">
      <Home size={20} />
    </Link>

    {/* REELS */}
    <Link to="/reels" className="hidden md:block p-2 hover:bg-gray-100 rounded">
      <Video size={20} />
    </Link>

    {/* MESSAGES */}
    <Link to="/messages" className="hidden md:block p-2 hover:bg-gray-100 rounded">
      <MessageCircle size={20} />
    </Link>

    {/* FRIENDS */}
    <Link to="/friends" className="hidden md:block p-2 hover:bg-gray-100 rounded">
      <Users size={20} />
    </Link>

    {/* WALLET */}
    <Link to="/wallet" className="hidden md:block p-2 hover:bg-gray-100 rounded">
      <Wallet size={20} />
    </Link>

<button
  onClick={() => setMobileOpen(true)}
  className="md:hidden p-2 rounded hover:bg-gray-100"
>
  <Menu size={24} />
</button>


<img
  src={currentUser?.profilePic || defaultProfile}
  alt="Profile"
  className="w-9 h-9 rounded-full object-cover"
/>



    {/* NOTIFICATIONS */}
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
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2"
      >
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
    </div>

    )}
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
    <span>messages</span>
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

{isLoggedIn && mobileOpen && (

<div className="fixed inset-0 bg-black/40 z-50">

<div className="w-80 h-full bg-white p-4 overflow-y-auto">

  {/* PROFILE */}
  <div className="flex items-center gap-3 mb-6 pb-4 border-b">
    <img
      src={currentUser?.profilePic || defaultProfile}
      alt={currentUser?.name}
      className="w-14 h-14 rounded-full object-cover border"
    />

    <div>
      <h3 className="font-bold text-lg">
        {currentUser?.name}
      </h3>

      <p className="text-sm text-gray-500">
        🌎 Public
      </p>
    </div>
   </div>
  

  {/* HEADER */}
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-xl font-bold">
      Menu
    </h2>

    <button
      onClick={() => setMobileOpen(false)}
      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
    >
      <X size={24} />
    </button>
  </div>

  

<div className="mb-4">
  <button
    onClick={() => setShowSearch(!showSearch)}
    className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl py-3 hover:bg-blue-100"
  >
    <Search size={22} />
    <span className="font-medium">Search</span>
  </button>

  {showSearch && (
    <div className="mt-3">
      <SearchBar />
    </div>
  )}
</div>



{/* 👥 SOCIAL */}

<h2 className="flex items-center justify-center gap-2 mt-6 mb-3 text-lg font-bold uppercase">
  <Users size={40} className="text-blue-600" />
  <span>Social</span>
</h2>

<div className="grid grid-cols-2 gap-4">

{/* Put your Home, Profile, Friends, Discover, Requests, Messages, Reels here */}


  <Link
    to="/"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Home size={30} className="text-blue-500" />
    <span className="mt-2 text-sm font-medium">Home</span>
  </Link>

  <Link
    to="/profile"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <User size={30} className="text-sky-500" />
    <span className="mt-2 text-sm font-medium">Profile</span>
  </Link>

  <Link
    to="/friends"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Users size={30} className="text-green-600" />
    <span className="mt-2 text-sm font-medium">Friends</span>
  </Link>

  <Link
    to="/friends/discover"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Users size={30} className="text-teal-500" />
    <span className="mt-2 text-sm font-medium">Discover Friends</span>
  </Link>

  <Link
    to="/friend-requests"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <UserPlus size={30} className="text-purple-600" />
    <span className="mt-2 text-sm font-medium">Friends Request</span>
  </Link>

  <Link
    to="/messages"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <MessageCircle size={30} className="text-emerald-500" />
    <span className="mt-2 text-sm font-medium">Messages</span>
  </Link>

  <Link
    to="/reels"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Video size={30} className="text-red-500" />
    <span className="mt-2 text-sm font-medium">Create Reels</span>
  </Link>


</div>

{/* 🎨 CREATOR */}

<h2 className="flex items-center justify-center gap-2 mt-6 mb-3 text-lg font-bold uppercase">
  <Clapperboard size={40} className="text-pink-600" />
  <span>Content Creators</span>
</h2>

<div className="grid grid-cols-2 gap-4">

{/* Creator, Events, Ads */}

   <Link
    to="/ads"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Megaphone size={30} className="text-orange-500" />
    <span className="mt-2 text-sm font-medium">Create Ads</span>
  </Link>

  <Link
    to="/events"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <CalendarDays size={30} className="text-indigo-500" />
    <span className="mt-2 text-sm font-medium">Create Events</span>
  </Link>

  <Link
    to="/creator"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Clapperboard size={30} className="text-pink-500" />
    <span className="mt-2 text-sm font-medium">Monetization</span>
  </Link>


</div>

{/* 💼 BUSINESS */}


<h2 className="flex items-center justify-center gap-2 mt-6 mb-3 font-bold text-lg text-gray-800 uppercase">
  <BriefcaseBusiness
    size={40}
    className="text-[#B7410E]"

  />
  <span>Business</span>
</h2>

<div className="grid grid-cols-2 gap-4">

{/* Marketplace, Wallet, Leaderboard */}


<Link
    to="/marketplace"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Store size={30} className="text-violet-600" />
    <span className="mt-2 text-sm font-medium">Marketplace</span>
  </Link>

<Link
    to="/wallet"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
     <Wallet size={30} className="text-yellow-500" />
    <span className="mt-2 text-sm font-medium">Wallet</span>
  </Link>

  <Link
    to="/leaderboard"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Trophy size={30} className="text-amber-500" />
    <span className="mt-2 text-sm font-medium">Top Earners</span>
  </Link>


</div>

{/* 📁 PERSONAL */}

<h2 className="flex items-center justify-center gap-2 mt-6 mb-3 text-lg font-bold uppercase">
  <User size={40} className="text-green-600" />
  <span>Personal</span>
</h2>

<div className="grid grid-cols-2 gap-4">

{/* Saved */}

<Link
    to="/saved"
    onClick={() => setMobileOpen(false)}
    className="flex flex-col items-center justify-center rounded-xl p-4 bg-gray-50 hover:bg-gray-100"
  >
    <Bookmark size={30} className="text-cyan-600" />
    <span className="mt-2 text-sm font-medium">Saved</span>
  </Link>


</div>

<button
onClick={handleLogout}
className="w-full mt-8 bg-red-500 text-white py-3 rounded-xl font-semibold"
>
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