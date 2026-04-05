// src/pages/Home.jsx
import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import MediaUpload from "../components/MediaUpload";
import imageCompression from "browser-image-compression";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

// Lazy load emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));

// Skeleton post
const SkeletonPost = () => (

  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4 w-full">  
    <div className="h-64 bg-gray-300 rounded-xl w-full"></div>  
  </div>  
);  // Lazy video hook
const useLazyVideo = (videos) => {
useEffect(() => {
if (!videos || videos.length === 0) return;
const observer = new IntersectionObserver(
(entries) => {
entries.forEach((entry) => {
const video = entry.target;
if (entry.isIntersecting) {
if (!video.src) video.src = video.dataset.src;
video.play().catch(() => {});
} else {
video.pause();
}
});
},
{ threshold: 0.5 }
);
videos.forEach((v) => observer.observe(v));
return () => observer.disconnect();
}, [videos]);
};

const Home = () => {
const token = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");
const navigate = useNavigate();

useEffect(() => {
if (!token) navigate("/login");
}, [token, navigate]);

const currentUser = {
_id: currentUserId,
profilePic: localStorage.getItem("profilePic"),
name: localStorage.getItem("name"),
};

// --- States ---
const [posts, setPosts] = useState([]);
const [loadingPosts, setLoadingPosts] = useState(true);
const [stories, setStories] = useState([]);
const [newPost, setNewPost] = useState("");
const [mediaFiles, setMediaFiles] = useState([]);
const [posting, setPosting] = useState(false);
const [expanded, setExpanded] = useState(false);
const [showEmoji, setShowEmoji] = useState(false);
const [location, setLocation] = useState("");
const [feeling, setFeeling] = useState("");
const [taggedFriends, setTaggedFriends] = useState([]);

const feedRef = useRef();
const { uploadImage } = useCloudinaryUpload();
const { uploadVideo } = useR2Upload();
const [videoRefs, setVideoRefs] = useState([]);
useLazyVideo(videoRefs);

// --- Fetch posts & stories ---
useEffect(() => {
if (!token) return;
const init = async () => {
try {
// Fetch posts
const postsData = await fetchWithToken(
'${API_BASE}/api/posts?limit=20',
token
);
setPosts(postsData);

// Fetch stories  
    const res = await fetch(`${API_BASE}/api/stories?limit=20`, {  
      headers: { Authorization: `Bearer ${token}` },  
    });  
    const text = await res.text();  
    let data;  
    try {  
      data = JSON.parse(text);  
    } catch {  
      data = { stories: [] };  
    }  
    setStories(data.stories || []);  
  } catch (err) {  
    console.error("Fetching posts/stories error:", err);  
  } finally {  
    setLoadingPosts(false);  
  }  

  // --- Socket connection ---  
  connectSocket();  
  const socket = getSocket();  
  if (!socket) return;  

  // Listen for new posts/videos  
  socket.on("new-video", (post) => setPosts((prev) => [post, ...prev]));  
  // Listen for new stories  
  socket.on("new-story", (story) => setStories((prev) => [story, ...prev]));  
  // Listen for birthday notifications  
  socket.on("birthday", (data) => {  
    alert(`🎉 Today is ${data.name}'s birthday`);  
  });  
};  
init();  

// Cleanup  
return () => {  
  const socket = getSocket();  
  if (socket) {  
    socket.off("new-video");  
    socket.off("new-story");  
    socket.off("birthday");  
  }  
};

}, [token]);

// --- Create post ---
const handleSubmitPost = async (e) => {
e.preventDefault();
if (!newPost && mediaFiles.length === 0) return;
setPosting(true);

try {  
  const uploadedMedia = [];  
  for (let file of mediaFiles) {  
    let compressedFile = file;  
    const type = file.type.startsWith("image") ? "image" : "video";  

    if (type === "image") {  
      compressedFile = await imageCompression(file, {  
        maxSizeMB: 0.6,  
        maxWidthOrHeight: 1080,  
        useWebWorker: true,  
        fileType: "image/webp",  
        initialQuality: 0.8,  
      });  
    }  

    const url =  
      type === "image"  
        ? await uploadImage(compressedFile)  
        : await uploadVideo(file);  
    uploadedMedia.push({ url, type });  
  }  

  const res = await fetch(`${API_BASE}/api/posts`, {  
    method: "POST",  
    headers: {  
      Authorization: `Bearer ${token}`,  
      "Content-Type": "application/json",  
    },  
    body: JSON.stringify({  
      content: newPost,  
      media: uploadedMedia,  
      location,  
      feeling,  
      taggedFriends,  
    }),  
  });  

  const data = await res.json();  
  getSocket()?.emit("new-video", data.post);  
  setPosts((prev) => [data.post, ...prev]);  

  // Reset form  
  setNewPost("");  
  setMediaFiles([]);  
  setLocation("");  
  setFeeling("");  
  setTaggedFriends([]);  
  setExpanded(false);  
} catch (err) {  
  console.error("Post creation error:", err);  
} finally {  
  setPosting(false);  
}

};

return (
<div className="w-full min-h-screen grid grid-cols-1 gap-0">

{/* LEFT SIDEBAR */}  
  <div className="hidden md:block">  
    <SidebarLeft />  
  </div>  

  {/* MAIN FEED */}  
  <div className="col-span-1 space-y-4 w-full">  
    <StoriesBar user={currentUser} stories={stories} />  

    {/* CREATE POST */}  
    <form  
      onSubmit={handleSubmitPost}  
      className="bg-white p-4 rounded-xl shadow space-y-3 w-full"  
    >  
      <textarea  
        value={newPost}  
        onChange={(e) => setNewPost(e.target.value)}  
        onFocus={() => setExpanded(true)}  
        placeholder="What's on your mind?"  
        className="w-full border rounded-lg p-3"  
      />  
      {expanded && (  
        <>  
          <input  
            value={feeling}  
            onChange={(e) => setFeeling(e.target.value)}  
            placeholder="Feeling..."  
            className="w-full border rounded-lg p-2"  
          />  
          <input  
            value={location}  
            onChange={(e) => setLocation(e.target.value)}  
            placeholder="Location..."  
            className="w-full border rounded-lg p-2"  
          />  
          <input  
            value={taggedFriends.map((f) => f.name).join(", ")}  
            onChange={(e) =>  
              setTaggedFriends(  
                e.target.value  
                  .split(",")  
                  .map((n) => ({ name: n.trim() }))  
              )  
            }  
            placeholder="Tag friends (comma separated)"  
            className="w-full border rounded-lg p-2"  
          />  
        </>  
      )}  
    </form>  

    {/* POSTS FEED */}  
    <div ref={feedRef} className="space-y-4 w-full">  
      {loadingPosts  
        ? [<SkeletonPost key={0} />, <SkeletonPost key={1} />]  
        : posts.map((post) => (  
            <PostCard  
              key={post._id}  
              post={post}  
              currentUserId={currentUserId}  
              setVideoRefs={setVideoRefs}  
            />  
          ))}  
    </div>  
  </div>  

  {/* RIGHT SIDEBAR */}  
  <div className="hidden md:block">  
    <SidebarRight />  
  </div>  
</div>

);
};

export default Home;

