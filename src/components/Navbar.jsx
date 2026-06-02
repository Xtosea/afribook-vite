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

import {
  connectSocket,
  safeEmit,
} from "../socket";

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
} from "lucide-react";

import InstallPWAButton from "./InstallPWAButton";



const defaultProfile =
  "https://ui-avatars.com/api/?name=User";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  // =========================
  // STATES
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUserId = localStorage.getItem("userId");

const [unreadCount, setUnreadCount] = useState(0);

const [unreadMessages, setUnreadMessages] = useState(0);


useEffect(() => {
  const fetchCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error(
        "Failed to fetch unread count:",
        err
      );
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

      const res = await fetch(
        `${API_BASE}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );
    }
  };

  fetchNotifications();
}, []);



 
  // =========================
  // LOGIN STATE
  // =========================

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  // =========================
  // SOCKET
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !currentUserId) return;

    const socket = connectSocket();

    if (!socket) return;

    // JOIN USER
    const joinUser = () => {
      console.log("✅ JOINING USER:", currentUserId);

      safeEmit("join", currentUserId);
    };

    // Already connected
    if (socket.connected) {
      joinUser();
    }

    // Wait for connection
    socket.on("connect", joinUser);

    // Notifications
    const handleNotification = (data) => {
  setNotifications((prev) => {
    return [data, ...prev].slice(0, 50);
  });

  setUnreadCount((prev) => prev + 1);
};

    // Online users
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on("new-notification", handleNotification);

    socket.on("online-users", handleOnlineUsers);

    // CLEANUP
    return () => {
      socket.off("connect", joinUser);

      socket.off(
        "new-notification",
        handleNotification
      );

      socket.off(
        "online-users",
        handleOnlineUsers
      );
    };
  }, [currentUserId]);

  // =========================
  // CLOSE DROPDOWNS
  // =========================

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Notifications dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }

      // Settings dropdown
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


useEffect(() => {
  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setUnreadMessages(data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread messages:", err);
    }
  };

  fetchUnreadMessages();
}, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.clear();

    setIsLoggedIn(false);

    // CLOSE MOBILE MENU
    setMobileMenuOpen(false);

    // CLOSE DROPDOWNS
    setShowDropdown(false);
    setShowSettings(false);

    navigate("/login");
  };

  // =========================
  // ACTIVE ROUTE
  // =========================

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
  <>
    {/* NAVBAR */}
    <nav className="bg-white shadow px-4 md:px-6 py-3 flex items-center justify-between flex-wrap sticky top-0 z-[60]">

      {/* LEFT */}
      <div className="flex flex-col justify-center">
  
  {/* LOGO (always visible) */}
  <Link
  to="/"
  className="font-extrabold text-3xl text-blue-600 leading-none"
>
  AfricSocial
</Link>

  {/* DESKTOP MENU ONLY */}
  <div className="hidden md:flex gap-6 mt-1 text-sm text-gray-700 items-center">
    
  
          <Link to="/" className={isActive("/") ? "text-blue-600 font-semibold" : "hover:text-blue-500"}>
            <Home size={18} /> Home
          </Link>

          <Link to="/reels" className={isActive("/reels") ? "text-blue-600 font-semibold" : "hover:text-blue-500"}>
            <Video size={18} /> Reels
          </Link>

          <Link to="/messages" className="relative flex items-center gap-1">
            <MessageCircle size={18} />
            Messages

            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                {unreadMessages}
              </span>
            )}
          </Link>

          <Link to="/leaderboard" className={isActive("/leaderboard") ? "text-blue-600 font-semibold" : "hover:text-blue-500"}>
            <Users size={18} /> Leaderboard
          </Link>

          <Link to="/friends" className={isActive("/friends") ? "text-blue-600 font-semibold" : "hover:text-blue-500"}>
            <Users size={18} /> Friends
          </Link>

          <Link to="/profile" className={isActive("/profile") ? "text-blue-600 font-semibold" : "hover:text-blue-500"}>
            <User size={18} /> Profile
          </Link>
        </div>
      </div>

      {/* CENTER SEARCH */}
      {isLoggedIn && (
        <div className="flex-1 mx-4 hidden md:flex">
          <SearchBar />
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-4 flex-shrink-0">

        <div className="hidden md:flex items-center gap-2 text-sm">
          <Users size={18} />
          <span>{onlineUsers.length} Online</span>
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={async () => {
              setShowDropdown(!showDropdown);

              if (!showDropdown) {
                const token = localStorage.getItem("token");

                await fetch(`${API_BASE}/api/notifications/read`, {
                  method: "PUT",
                  headers: { Authorization: `Bearer ${token}` },
                });

                setUnreadCount(0);
              }
            }}
            className="relative"
          >
            <Bell size={22} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

         {showDropdown && (
  <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-xl border z-50 overflow-hidden">

    <div className="p-3 border-b font-semibold">
      Notifications
    </div>

    {notifications.length === 0 ? (
      <div className="p-3 text-gray-500">
        No notifications
      </div>
    ) : (
      <div className="max-h-80 overflow-y-auto">

        {notifications.map((n) => {
          const previewImage =
            n.post?.thumbnail ||
            n.post?.media ||
            n.post?.images?.[0];

          return (
            <div
              key={n._id}
              onClick={() => {
                setShowDropdown(false);

                if (n.post) {
                  navigate(`/post/${n.post._id}`);
                } else if (n.sender) {
                  navigate(`/profile/${n.sender._id}`);
                }
              }}
              className={`flex gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                !n.read ? "bg-blue-50" : ""
              }`}
            >
              <img
                src={
                  n.sender?.profilePic ||
                  defaultProfile
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover border"
              />

              <div className="flex-1 min-w-0">

                <p className="text-sm">
                  <span className="font-semibold">
                    {n.sender?.name ||
                      "Someone"}
                  </span>{" "}
                  {n.text}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(
                    n.createdAt
                  ).toLocaleString()}
                </p>

                {previewImage && (
                  <img
                    src={previewImage}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover mt-2 border"
                  />
                )}
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              )}
            </div>
          );
        })}

      </div>
    )}
  </div>
)}
    
        </div>

        {/* SETTINGS */}
        <div className="relative" ref={settingsRef}>
          <button onClick={() => setShowSettings(!showSettings)}>
            <Settings size={20} />
          </button>
        </div>

        {/* MOBILE MENU */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✖" : "☰"}
        </button>

        {showSettings && (
  <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl border z-50 overflow-hidden">

    <Link
      to="/settings"
      className="block px-4 py-2 hover:bg-gray-100"
      onClick={() =>
        setShowSettings(false)
      }
    >
      Settings
    </Link>

    <Link
      to="/wallet"
      className="block px-4 py-2 hover:bg-gray-100"
      onClick={() =>
        setShowSettings(false)
      }
    >
      Wallet
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
    </nav>

    {/* MOBILE MENU */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 pt-[64px] md:hidden bg-white shadow p-4 pb-32 space-y-4 z-50 overflow-y-auto">

        <div className="flex items-center justify-between mb-3 border-b pb-3">
          <span className="font-semibold text-lg text-blue-600">Menu</span>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold px-2"
          >
            ✖
          </button>
        </div>

        <SearchBar />

        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">🏠 Home</Link>
        <Link to="/reels" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">🎬 Reels</Link>
        <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">💬 Messages</Link>
        <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">🏆 Leaderboard</Link>
        <Link to="/saved" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">🔖 Saved Posts</Link>
        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">👤 Profile</Link>
        <Link to="/friends" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">👥 Friends</Link>
        <Link to="/friend-requests" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">📩 Requests</Link>
        <Link to="/wallet" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b">💰 Wallet</Link>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg mt-4"
        >
          Logout
        </button>
      </div>
    )}

    <InstallPWAButton />
  </>
);
};

export default Navbar;