import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import VerifySuccess from "./pages/VerifySuccess";
import VerifyFailed from "./pages/VerifyFailed";
import CreatePost from "./pages/CreatePost";
import Reels from "./pages/Reels";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import WelcomeOnboarding from "./pages/WelcomeOnboarding";
import SyncContacts from "./pages/SyncContacts";
import EditProfile from "./pages/EditProfile";
import MediaViewer from "./pages/MediaViewer";
import PostView from "./pages/PostView";
import AddFriends from "./pages/onboarding/AddFriends";
import FriendRequests from "./pages/friends/FriendRequests";
import FriendsList from "./pages/friends/FriendsList";
import FriendSuggestions from "./pages/friends/FriendSuggestions";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import PostPage from "./pages/PostPage";
import SavedPosts from "./pages/SavedPosts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyEmailSent from "./pages/VerifyEmailSent";

function App() {
  console.log("API:", import.meta.env.VITE_API_BASE);

  return (
    <HelmetProvider>
      <Router>
        <Navbar />

        <div className="min-h-[calc(100vh-80px)] w-full">
          <Routes>

            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/verify-success" element={<VerifySuccess />} />
            <Route path="/verify-failed" element={<VerifyFailed />} />
            <Route path="/welcome" element={<WelcomeOnboarding />} />
            <Route path="/media/:postId" element={<MediaViewer />} />
            <Route path="/post/:id" element={<PostView />} />

            {/* PROTECTED */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />

            <Route path="/add-friends" element={<ProtectedRoute><AddFriends /></ProtectedRoute>} />
            <Route path="/sync-contacts" element={<ProtectedRoute><SyncContacts /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/friend-requests" element={<ProtectedRoute><FriendRequests /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><FriendsList /></ProtectedRoute>} />
            <Route path="/friend-suggestions" element={<ProtectedRoute><FriendSuggestions /></ProtectedRoute>} />

            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/post/:id" element={<PostPage />} />

            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPosts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verify-email-sent"
              element={
                <ProtectedRoute>
                  <Verify Your Email/>
                </ProtectedRoute>
              }
            />


          </Routes>
        </div>

        {/* Toast MUST be inside Router but OUTSIDE Routes */}
        <ToastContainer position="bottom-center" />

      </Router>
    </HelmetProvider>
  );
}

export default App;