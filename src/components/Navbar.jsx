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
      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

      <nav className="bg-white shadow px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-50">

        {/* LOGO */}
        <Link
          to="/"
          className="font-bold text-2xl text-blue-600"
        >
          AfricSocial
        </Link>

        {/* SEARCH */}
        {isLoggedIn && (
          <div className="flex-1 mx-4 hidden md:flex">
            <SearchBar />
          </div>
        )}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {isLoggedIn && (
            <>
            {/* ========================= */}
{/* DESKTOP NAV */}
{/* ========================= */}

<div className="hidden md:flex items-center gap-5">

  <Link
    to="/"
    className={`flex items-center gap-1 ${
      isActive("/")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <Home size={20} />
    Home
  </Link>

  <Link
    to="/reels"
    className={`flex items-center gap-1 ${
      isActive("/reels")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <Video size={20} />
    Reels
  </Link>

  <Link
    to="/leaderboard"
    className={`flex items-center gap-1 ${
      isActive("/leaderboard")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <Users size={20} />
    Leaderboard
  </Link>

  <Link
    to="/messages"
    className={`flex items-center gap-1 ${
      isActive("/messages")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <MessageCircle size={20} />
    Messages
  </Link>

  <Link
    to="/saved"
    className={`flex items-center gap-1 ${
      isActive("/saved")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    🔖 Saved
  </Link>

  <Link
    to="/profile"
    className={`flex items-center gap-1 ${
      isActive("/profile")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <User size={20} />
    Profile
  </Link>

  <Link
    to="/friends"
    className={`flex items-center gap-1 ${
      isActive("/friends")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <Users size={20} />
    Friends
  </Link>

  <Link
    to="/friend-requests"
    className={`flex items-center gap-1 ${
      isActive("/friend-requests")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <Users size={20} />
    Requests
  </Link>

  <Link
    to="/wallet"
    className={`flex items-center gap-1 ${
      isActive("/wallet")
        ? "text-blue-600"
        : "hover:text-blue-500"
    }`}
  >
    <Wallet size={20} />
    Wallet
  </Link>

</div>
              {/* ========================= */}
              {/* ONLINE USERS */}
              {/* ========================= */}

              <div className="hidden md:flex items-center gap-2 text-sm">

                <Users size={18} />

                <span>
                  {onlineUsers.length} Online
                </span>

              </div>

              {/* ========================= */}
              {/* NOTIFICATIONS */}
              {/* ========================= */}

              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
  onClick={async () => {
    setShowDropdown(!showDropdown);

    if (!showDropdown) {
      const token =
        localStorage.getItem("token");

      try {
        await fetch(
          `${API_BASE}/api/notifications/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
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
        src={n.sender?.profilePic || defaultProfile}
        alt=""
        className="w-12 h-12 rounded-full object-cover border"
      />

      <div className="flex-1 min-w-0">

        {n.senders?.length > 1 && (
          <div className="flex -space-x-2 mb-2">
            {n.senders.slice(0, 3).map((user) => (
              <img
                key={user._id}
                src={user.profilePic || defaultProfile}
                alt=""
                className="w-6 h-6 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        )}

        <p className="text-sm">
          {n.count > 1 ? (
            <>
              <span className="font-semibold">
                {n.sender?.name || "Someone"}
              </span>{" "}
              and {n.count - 1} others {n.text}
            </>
          ) : (
            <>
              <span className="font-semibold">
                {n.sender?.name || "Someone"}
              </span>{" "}
              {n.text}
            </>
          )}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {new Date(n.createdAt).toLocaleString()}
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


{/* 
========================= */}
              {/* SETTINGS */}
              {/* ========================= */}

              <div
                className="relative"
                ref={settingsRef}
              >
                <button
                  onClick={() =>
                    setShowSettings(!showSettings)
                  }
                >
                  <Settings size={20} />
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

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>

              {/* ========================= */}
              {/* MOBILE MENU BUTTON */}
              {/* ========================= */}

              <button
                className="md:hidden text-2xl"
                onClick={() =>
                  setMobileMenuOpen(
                    !mobileMenuOpen
                  )
                }
              >
                {mobileMenuOpen ? "✖" : "☰"}
              </button>
            </>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
  <div
  className="
    fixed inset-0
    pt-[64px]
    md:hidden
    bg-white
    shadow
    p-4
    pb-32
    space-y-4
    z-50
    overflow-y-auto"
>

    <SearchBar />

    <Link
      to="/"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      🏠 Home
    </Link>

    <Link
      to="/reels"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      🎬 Reels
    </Link>

    <Link
      to="/messages"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      💬 Messages
    </Link>

    <Link
      to="/leaderboard"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      🏆 Leaderboard
    </Link>

    <Link
      to="/saved"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      🔖 Saved Posts
    </Link>

    <Link
      to="/profile"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      👤 Profile
    </Link>

    <Link
      to="/friends"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      👥 Friends
    </Link>

    <Link
      to="/friend-requests"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      📩 Requests
    </Link>

    <Link
      to="/wallet"
      className="block py-2 border-b"
      onClick={() => setMobileMenuOpen(false)}
    >
      💰 Wallet
    </Link>

    <button
      onClick={handleLogout}
      className="w-full bg-red-500 text-white py-3 rounded-lg mt-4"
    >
      Logout
    </button>

  </div>
)}

      {/* ========================= */}
      {/* BOTTOM MOBILE NAV */}
      {/* ========================= */}

      {isLoggedIn && !mobileMenuOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">

          <div className="flex justify-around py-2">

            <Link
              to="/"
              className={`flex flex-col items-center text-xs ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <Home size={22} />
              <span>Home</span>
            </Link>

            <Link
              to="/reels"
              className={`flex flex-col items-center text-xs ${
                isActive("/reels")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <Video size={22} />
              <span>Reels</span>
            </Link>

            <Link
              to="/messages"
              className={`flex flex-col items-center text-xs ${
                isActive("/messages")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <MessageCircle size={22} />
              <span>Messages</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center text-xs ${
                isActive("/profile")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <User size={22} />
              <span>Profile</span>
            </Link>

          </div>

        </div>
      )}

  <InstallPWAButton />



    </>
  );
};

export default Navbar;