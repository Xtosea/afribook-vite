import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat"
import WelcomeOnboarding from "./pages/WelcomeOnboarding";
import AddFriends from "./pages/AddFriends";
import SyncContacts from "./pages/SyncContacts";
import EditProfile from "./pages/EditProfile";
import MediaViewer from "./pages/MediaViewer";



function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] p-4">
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
    

          {/* Protected routes (WebSocket-enabled pages) */}
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
<Chat/>
</ProtectedRoute>
}
/>
          
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;