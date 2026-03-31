import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
import AddFriends from "./pages/AddFriends";
import SyncContacts from "./pages/SyncContacts";
import EditProfile from "./pages/EditProfile";
import MediaViewer from "./pages/MediaViewer";
import PostView from "./pages/PostView";

function App() {
  console.log("API:", import.meta.env.VITE_API_BASE);

  return (
    <HelmetProvider>
      <Router>
        <Navbar />

        {/* Removed p-4 padding to allow full-width posts */}
        <div className="min-h-[calc(100vh-80px)] w-full">
          <Routes>

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/verify-success" element={<VerifySuccess />} />
            <Route path="/verify-failed" element={<VerifyFailed />} />
            <Route path="/welcome" element={<WelcomeOnboarding />} />
            <Route path="/media/:postId" element={<MediaViewer />} />
            <Route path="/add-friends" element={<AddFriends />} />
            <Route path="/sync-contacts" element={<SyncContacts />} />
            <Route path="/edit-profile" element={<EditProfile />} />
<Route path="/post/:id" element={<PostView />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reels"
              element={
                <ProtectedRoute>
                  <Reels />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>

        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;