// src/components/PostCard.jsx
import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

const PostCard = ({ post, currentUserId }) => {
const navigate = useNavigate();
const videoRefs = useRef([]);
const [fullscreen, setFullscreen] = useState(null);

const media = post.media || [];
const isMulti = media.length > 1;

// Social states
const [likes, setLikes] = useState(post.likes || []);
const [comments, setComments] = useState(post.comments || []);
const [shares, setShares] = useState(post.shares || 0);
const [commentText, setCommentText] = useState("");
const [showComments, setShowComments] = useState(false);

const likedByUser = likes.includes(currentUserId);

// =========================
// Like
// =========================
const handleLike = async () => {
try {
const res = await fetchWithToken(
${API_BASE}/api/posts/${post._id}/like,
localStorage.getItem("token"),
{ method: "POST" }
);
setLikes(res.likes);
} catch (err) {
console.error("Like error:", err);
}
};

// =========================
// Comment
// =========================
const handleComment = async () => {
if (!commentText.trim()) return;

try {  
  const res = await fetchWithToken(  
    `${API_BASE}/api/posts/${post._id}/comment`,  
    localStorage.getItem("token"),  
    {  
      method: "POST",  
      body: JSON.stringify({ text: commentText }),  
      headers: { "Content-Type": "application/json" },  
    }  
  );  

  setComments(res.comments);  
  setCommentText("");  
} catch (err) {  
  console.error("Comment error:", err);  
}

};

// =========================
// Share
// =========================
const handleShare = async (platform) => {
try {
const url = ${window.location.origin}/post/${post._id};

let shareUrl = "";  

  switch (platform) {  
    case "facebook":  
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;  
      break;  

    case "twitter":  
      shareUrl = `https://twitter.com/intent/tweet?url=${url}`;  
      break;  

    case "whatsapp":  
      shareUrl = `https://api.whatsapp.com/send?text=${url}`;  
      break;  

    case "telegram":  
      shareUrl = `https://t.me/share/url?url=${url}`;  
      break;  

    case "copy":  
      navigator.clipboard.writeText(url);  
      alert("Link copied");  
      break;  

    default:  
      return;  
  }  

  if (shareUrl) window.open(shareUrl, "_blank");  

  const res = await fetchWithToken(  
    `${API_BASE}/api/posts/${post._id}/share`,  
    localStorage.getItem("token"),  
    { method: "POST" }  
  );  

  setShares(res.shares);  
} catch (err) {  
  console.error("Share error:", err);  
}

};

// =========================
// Navigate profile
// =========================
const goToProfile = useCallback(() => {
navigate(/profile/${post.user?._id});
}, [navigate, post.user]);

return (
<div className="bg-white rounded-xl shadow p-3 space-y-3">

{/* HEADER */}  
  <div className="flex items-center gap-3">  
    <img  
      src={  
        post.user?.profilePic ||  
        `https://ui-avatars.com/api/?name=${post.user?.name}`  
      }  
      className="w-12 h-12 rounded-full cursor-pointer"  
      onClick={goToProfile}  
    />  

    <div>  
      <p  
        className="font-semibold cursor-pointer"  
        onClick={goToProfile}  
      >  
        {post.user?.name}  
      </p>  

      <p className="text-xs text-gray-500">  
        {new Date(post.createdAt).toLocaleString()}  
      </p>  
    </div>  
  </div>  

  {/* TEXT */}  
  {post.text && (  
    <p className="text-gray-800 whitespace-pre-wrap">  
      {post.text}  
    </p>  
  )}  

  {/* MEDIA */}  
  {!isMulti &&  
    media.map((m, i) => {  
      const isVideo = m.type === "video";  

      return isVideo ? (  
        <video  
          key={i}  
          ref={(el) => (videoRefs.current[i] = el)}  
          src={m.url}  
          controls  
          muted  
          className="w-full rounded-xl"  
          onClick={() => setFullscreen({ media: m })}  
        />  
      ) : (  
        <img  
          key={i}  
          src={m.url}  
          className="w-full rounded-xl cursor-pointer"  
          onClick={() => setFullscreen({ media: m })}  
        />  
      );  
    })}  

  {/* MULTI MEDIA */}  
  {isMulti && (  
    <div className="grid grid-cols-2 gap-2">  
      {media.map((m, i) => {  
        const isVideo = m.type === "video";  

        return isVideo ? (  
          <video  
            key={i}  
            src={m.url}  
            className="w-full h-48 object-cover rounded-xl"  
            muted  
            onClick={() => setFullscreen({ media, index: i })}  
          />  
        ) : (  
          <img  
            key={i}  
            src={m.url}  
            className="w-full h-48 object-cover rounded-xl"  
            onClick={() => setFullscreen({ media, index: i })}  
          />  
        );  
      })}  
    </div>  
  )}  

  {/* FULLSCREEN */}  
  {fullscreen && (  
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">  
      <button  
        className="absolute top-4 right-4 text-white text-3xl"  
        onClick={() => setFullscreen(null)}  
      >  
        ×  
      </button>  

      {fullscreen.media?.type === "video" ? (  
        <video  
          src={fullscreen.media.url}  
          controls  
          autoPlay  
          className="max-h-full"  
        />  
      ) : (  
        <img  
          src={fullscreen.media.url}  
          className="max-h-full"  
        />  
      )}  
    </div>  
  )}  

  {/* ACTIONS */}  
  <div className="flex justify-between text-sm pt-2 border-t">  

    {/* LIKE */}  
    <button  
      onClick={handleLike}  
      className={`${  
        likedByUser ? "text-blue-600 font-semibold" : ""  
      }`}  
    >  
      👍 {likes.length}  
    </button>  

    {/* COMMENT */}  
    <button  
      onClick={() => setShowComments(!showComments)}  
    >  
      💬 {comments.length}  
    </button>  

    {/* SHARE */}  
    <div className="flex gap-2">  

      <button onClick={() => handleShare("facebook")}>  
        Facebook  
      </button>  

      <button onClick={() => handleShare("twitter")}>  
        Twitter  
      </button>  

      <button onClick={() => handleShare("whatsapp")}>  
        WhatsApp  
      </button>  

      <button onClick={() => handleShare("telegram")}>  
        Telegram  
      </button>  

      <button onClick={() => handleShare("copy")}>  
        Copy  
      </button>  

      <span>({shares})</span>  

    </div>  
  </div>  

  {/* COMMENTS */}  
  {showComments && (  
    <div className="space-y-2">  

      {comments.map((c, i) => (  
        <div key={i} className="text-sm bg-gray-100 p-2 rounded">  
          <b>{c.user?.name}</b> {c.text}  
        </div>  
      ))}  

      <input  
        value={commentText}  
        onChange={(e) =>  
          setCommentText(e.target.value)  
        }  
        placeholder="Write comment..."  
        className="w-full border rounded-lg p-2"  
        onKeyDown={(e) =>  
          e.key === "Enter" && handleComment()  
        }  
      />  

    </div>  
  )}  

</div>

);
};

export default React.memo(PostCard);

