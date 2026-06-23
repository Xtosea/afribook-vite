import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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

import SuggestedFriends from "./components/friends/SuggestedFriends";
import ReelsHorizontal from "./components/reels/ReelsHorizontal";

import Notifications from "./pages/Notifications";

import StoryMusicUploader from "./components/stories/StoryMusicUploader";
import AdminWithdrawals
from "./pages/admin/AdminWithdrawals";
import AdminDashboard
from "./pages/admin/AdminDashboard";
import AdminVerifications
from "./pages/admin/AdminVerifications";
import AdminCreators from "./pages/admin/AdminCreators";
import AdminAdvertisers from "./pages/admin/AdminAdvertisers";
import AdminCampaigns
from "./pages/admin/AdminCampaigns";
import AdminFraud
from "./pages/admin/AdminFraud";
import AdminRevenue
from "./pages/admin/AdminRevenue";
import AdminEarnings
from "./pages/admin/AdminEarnings";
import CreatorDashboard
from "./pages/creator/CreatorDashboard";

import CreatorEarnings
from "./pages/creator/CreatorEarnings";

import ApplyMonetization
from "./pages/creator/ApplyMonetization";

import AdvertiserDashboard
from "./pages/ads/AdvertiserDashboard";

import ApplyAdvertiser
from "./pages/ads/ApplyAdvertiser";

import CreateCampaign
from "./pages/ads/CreateCampaign";

import MyCampaigns
from "./pages/ads/MyCampaigns";

import PostComposer
from "./components/PostComposer";

import DiscoverFriends from "./pages/DiscoverFriends";

import FriendCarousel from "./components/friends/FriendCarousel";








function App() {
  console.log("API:", import.meta.env.VITE_API_BASE);


useEffect(() => {
  const preventDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Block drag everywhere
  window.addEventListener("dragenter", preventDrag);
  window.addEventListener("dragover", preventDrag);

  // Block file opening on drop
  window.addEventListener("drop", preventDrop);

  return () => {
    window.removeEventListener("dragenter", preventDrag);
    window.removeEventListener("dragover", preventDrag);
    window.removeEventListener("drop", preventDrop);
  };
}, []);


  return (
    <HelmetProvider>
      <Routes>
        <Navbar />


        <div className="min-h-[calc(100vh-80px)] w-full">
          <Routes>

            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />


            <Route
  path="/verify-email"
  element={<VerifyEmail />}
/>

<Route
  path="/verify-email/:token"
  element={<VerifyEmail />}
/>


            <Route path="/verify-success" element={<VerifySuccess />} />
            <Route path="/verify-failed" element={<VerifyFailed />} />
            <Route path="/welcome" element={<WelcomeOnboarding />} />
            <Route path="/media/:postId" element={<MediaViewer />} />
            <Route path="/post/:id" element={<PostView />} />


<Route path="/verify-email-sent" element={<VerifyEmailSent />} />


<Route
  path="/admin/story-music"
  element={<StoryMusicUploader />}
/>

 <Route
    path="/admin/withdrawals"
    element={<AdminWithdrawals />}
  />


 
 <Route
    path="/admindashboard"
    element={<AdminDashboard />}
  />

<Route
  path="/admin/verifications"
  element={<AdminVerifications />}
/>

<Route
  path="/admin/creators"
  element={<AdminCreators />}
/>

<Route
  path="/admin/advertisers"
  element={<AdminAdvertisers />}
/>

<Route
  path="/admin/campaigns"
  element={<AdminCampaigns />}
/>

<Route
  path="/admin/fraud"
  element={<AdminFraud />}
/>


<Route path="/admin/earnings" element={<AdminEarnings />} />
<Route path="/admin/revenue" element={<AdminRevenue />} />
<Route
  path="/creator"
  element={<CreatorDashboard />}
/>

<Route
  path="/creator/earnings"
  element={<CreatorEarnings />}
/>

<Route
  path="/creator/apply"
  element={<ApplyMonetization />}
/>

<Route
  path="/ads"
  element={<AdvertiserDashboard />}
/>

<Route
  path="/ads/apply"
  element={<ApplyAdvertiser />}
/>

<Route
  path="/ads/create"
  element={<CreateCampaign />}
/>

<Route
  path="/ads/campaigns"
  element={<MyCampaigns />}
/>

<Route
  path="/create-post"
  element={
    <PostComposer
      
    />}
  
/>




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


<Route
  path="/friends/discover"
  element={
    <ProtectedRoute>
      <DiscoverFriends />
    </ProtectedRoute>
  }
/>

<Route
  path="/friends/explore"
  element={
    <ProtectedRoute>
      <FriendCarousel />
    </ProtectedRoute>
  }
/>


           <Route
  path="/suggested-friends"
  element={
    <ProtectedRoute>
      <SuggestedFriends />
    </ProtectedRoute>
  }
/>


<Route
  path="/reelshorizontal"
  element={
    <ProtectedRoute>
      <ReelsHorizontal />
    </ProtectedRoute>
  }
/>



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
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications/>
                </ProtectedRoute>
              }
            />

           


          </Routes>
        </div>

        {/* Toast MUST be inside Router but OUTSIDE Routes */}
        <ToastContainer position="bottom-center" />

      </Routes>
    </HelmetProvider>
  );
}

export default App;