// src/components/CreatePost.jsx
import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { API_BASE, fetchWithToken } from "../api/api";
import { useDebounce } from "use-debounce";
import dynamic from "next/dynamic";

// Lazy load EmojiPicker to reduce bundle size
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// Max media files
const MAX_FILES = 5;

const CreatePost = ({ currentUser, onPostCreated }) => {
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [friends, setFriends] = useState([]); // all friends fetched from API
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [friendQuery, setFriendQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [feeling, setFeeling] = useState("");

  const fileInputRef = useRef();

  const token = localStorage.getItem("token");

  // ======================
  // Fetch friends for tagging
  // ======================
  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) return;
      try {
        const res = await fetchWithToken(`${API_BASE}/api/users/friends`, token);
        if (res?.friends) setFriends(res.friends);
      } catch (err) {
        console.error("Fetch friends error:", err);
      }
    };
    fetchFriends();
  }, [token]);

  // ======================
  // Handle media files
  // ======================
  const handleFiles = (files) => {
    if (!files) return;
    let newFiles = Array.from(files);
    let combined = [...mediaFiles, ...newFiles];
    if (combined.length > MAX_FILES) {
      alert(`Max ${MAX_FILES} files allowed`);
      combined = combined.slice(0, MAX_FILES);
    }
    setMediaFiles(combined);
  };

  const removeFile = (i) => setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));

  // ======================
  // Location suggestions
  // ======================
  const [debouncedLocation] = useDebounce(location, 300);

  useEffect(() => {
    if (!debouncedLocation) return setLocationSuggestions([]);
    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${debouncedLocation}&format=json&addressdetails=1&limit=5`
        );
        const data = await res.json();
        setLocationSuggestions(data || []);
      } catch (err) {
        console.error("Location fetch error:", err);
      }
    };
    fetchLocations();
  }, [debouncedLocation]);

  // ======================
  // Friend suggestions
  // ======================
  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(friendQuery.toLowerCase()) &&
      !taggedFriends.some((tf) => tf._id === f._id)
  );

  // ======================
  // Emoji picker
  // ======================
  const addEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // ======================
  // Submit post
  // ======================
  const handlePost = async () => {
    if (!text && mediaFiles.length === 0) return alert("Add text or media first");
    const formData = new FormData();
    formData.append("text", text);
    formData.append("location", location);
    formData.append("feeling", feeling);
    formData.append("taggedFriends", JSON.stringify(taggedFriends.map((f) => f._id)));

    mediaFiles.forEach((file) => formData.append("media", file));

    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.post) {
        onPostCreated(data.post);
        setText("");
        setMediaFiles([]);
        setLocation("");
        setTaggedFriends([]);
        setFeeling("");
        setFriendQuery("");
        setUploadProgress([]);
      }
    } catch (err) {
      console.error("Post upload error:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      {/* User header */}
      <div className="flex items-center gap-3">
        <img
          src={currentUser.profilePic || `https://ui-avatars.com/api/?name=${currentUser.name}`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 border rounded-xl p-2 resize-none"
        />
      </div>

      {/* Media upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current.click()}
          className="cursor-pointer border-2 border-dashed p-3 rounded-xl text-center"
        >
          <FiUpload className="mx-auto text-2xl mb-1" />
          <p className="text-sm text-gray-500">Click or drag media here</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {mediaFiles.map((file, i) => (
            <div key={i} className="relative w-24 h-24">
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full text-xs"
              >
                ✕
              </button>
              {file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} className="w-24 h-24 object-cover rounded" alt="" />
              ) : (
                <video src={URL.createObjectURL(file)} className="w-24 h-24 object-cover rounded" muted />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="relative">
        <input
          placeholder="Add location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-xl p-2 w-full"
        />
        {locationSuggestions.length > 0 && (
          <div className="absolute bg-white border mt-1 rounded shadow w-full z-20 max-h-40 overflow-y-auto">
            {locationSuggestions.map((loc) => (
              <div
                key={loc.place_id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setLocation(loc.display_name);
                  setLocationSuggestions([]);
                }}
              >
                {loc.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag friends */}
      <div className="relative">
        <input
          placeholder="Tag friends"
          value={friendQuery}
          onChange={(e) => setFriendQuery(e.target.value)}
          className="border rounded-xl p-2 w-full"
        />
        {filteredFriends.length > 0 && (
          <div className="absolute bg-white border mt-1 rounded shadow w-full z-20 max-h-40 overflow-y-auto">
            {filteredFriends.map((f) => (
              <div
                key={f._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setTaggedFriends((prev) => [...prev, f]);
                  setFriendQuery("");
                }}
              >
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display tagged friends */}
      {taggedFriends.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {taggedFriends.map((f) => (
            <span key={f._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
              {f.name} <FiX className="cursor-pointer" onClick={() => setTaggedFriends((prev) => prev.filter((tf) => tf._id !== f._id))} />
            </span>
          ))}
        </div>
      )}

      {/* Feeling / Emoji */}
      <div className="flex gap-2 items-center">
        <input
          placeholder="Add feeling"
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          className="border rounded-xl p-2 flex-1"
        />
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 bg-gray-200 rounded-xl">😊</button>
      </div>
      {showEmojiPicker && (
        <div className="absolute z-50 mt-2">
          <EmojiPicker onEmojiClick={addEmoji} />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => {
            setText("");
            setMediaFiles([]);
            setLocation("");
            setTaggedFriends([]);
            setFeeling("");
          }}
          className="px-4 py-2 rounded-xl border"
        >
          Cancel
        </button>
        <button
          onClick={handlePost}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;