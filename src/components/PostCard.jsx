import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const PostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  setVideoRefs
}) => {
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [fullscreen, setFullscreen] = useState(null);

  const videoRefs = useRef([]);

  useEffect(() => {
    if (setVideoRefs) {
      setVideoRefs(prev => [
        ...prev,
        ...videoRefs.current.filter(Boolean)
      ]);
    }
  }, [setVideoRefs]);


/* ================= MEDIA RENDER ================= */

const renderMedia = () => {
  if (!post.media?.length) return null;

  // MULTI MEDIA GRID
  if (post.media.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {post.media.map((m, i) => renderSingleMedia(m, i, true))}
      </div>
    );
  }

  return renderSingleMedia(post.media[0], 0);
};


/* ================= SINGLE MEDIA ================= */

const renderSingleMedia = (m, i, isGrid = false) => {

  const isPortrait = m.height > m.width;
  const isVideo = m.type === "video";
  const isImage = m.type === "image";


/* ================= PORTRAIT IMAGE ================= */

if (isPortrait && isImage) {
  return (
    <div
      key={i}
      className={`
      ${isGrid ? "h-[350px]" : "h-[650px]"}
      w-[80%] mx-auto
      rounded-xl overflow-hidden shadow
      cursor-pointer
      `}
      onClick={() => setFullscreen({ media: m })}
    >
      <img
        src={m.url}
        className="w-full h-full object-contain bg-black"
        alt=""
      />
    </div>
  );
}


/* ================= PORTRAIT VIDEO ================= */

if (isPortrait && isVideo) {
  return (
    <div
      key={i}
      className={`
      ${isGrid ? "h-[350px]" : "h-[700px]"}
      w-[75%] mx-auto
      rounded-xl overflow-hidden shadow
      cursor-pointer
      `}
      onClick={() => setFullscreen({ media: m })}
    >
      <video
        ref={el => (videoRefs.current[i] = el)}
        src={m.url}
        className="w-full h-full object-contain bg-black"
        muted
        controls
      />
    </div>
  );
}


/* ================= LANDSCAPE IMAGE ================= */

if (!isPortrait && isImage) {
  return (
    <div
      key={i}
      className={`
      ${isGrid ? "h-[220px]" : "h-[400px]"}
      w-full
      rounded-xl overflow-hidden shadow
      cursor-pointer
      `}
      onClick={() => setFullscreen({ media: m })}
    >
      <img
        src={m.url}
        className="w-full h-full object-cover"
        alt=""
      />
    </div>
  );
}


/* ================= LANDSCAPE VIDEO ================= */

if (!isPortrait && isVideo) {
  return (
    <div
      key={i}
      className={`
      ${isGrid ? "h-[240px]" : "h-[450px]"}
      w-full
      rounded-xl overflow-hidden shadow
      cursor-pointer
      `}
      onClick={() => setFullscreen({ media: m })}
    >
      <video
        ref={el => (videoRefs.current[i] = el)}
        src={m.url}
        className="w-full h-full object-cover"
        muted
        controls
      />
    </div>
  );
}

};


/* ================= FULLSCREEN VIEWER ================= */

const FullscreenViewer = () => {
  if (!fullscreen) return null;

  const m = fullscreen.media;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={() => setFullscreen(null)}
    >

      {m.type === "image" ? (
        <img
          src={m.url}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <video
          src={m.url}
          className="max-h-full max-w-full"
          controls
          autoPlay
        />
      )}

    </div>
  );
};


/* ================= POST CARD ================= */

return (
  <>

  <div className="bg-white rounded-xl shadow space-y-3 w-full p-4">


{/* HEADER */}

<div className="flex gap-3 items-center">

<img
src={post.user?.profilePic}
className="w-10 h-10 rounded-full object-cover"
/>

<div>

<p className="font-semibold">
{post.user?.name}
</p>

<p className="text-xs text-gray-500">
{new Date(post.createdAt).toLocaleString()}
</p>

</div>

</div>


{/* CONTENT */}

{post.content && (
<p className="text-sm">
{post.content}
</p>
)}


{/* MEDIA */}

{renderMedia()}


{/* ACTIONS */}

<div className="flex justify-between pt-2 border-t">

<button onClick={() => onLike(post._id)}>
👍 Like
</button>

<button onClick={() => setShowComments(!showComments)}>
💬 Comment
</button>

<button onClick={() => onShare(post)}>
🔗 Share
</button>

</div>


{/* COMMENTS */}

{showComments && (

<div className="space-y-2">

<input
value={commentText}
onChange={e => setCommentText(e.target.value)}
className="w-full border rounded p-2"
placeholder="Write comment"
/>

<button
onClick={() => {

onComment(post._id, commentText);
setCommentText("");

}}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
Send
</button>

</div>

)}


</div>


<FullscreenViewer />


</>
);

};

export default PostCard;