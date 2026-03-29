// src/components/PostCard.jsx
import React, { useEffect, useRef } from "react";

const PostCard = ({ post, setVideoRefs }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && post.media[0]?.type === "video") {
      setVideoRefs((prev) => [...prev, videoRef.current]);
    }
  }, [post, setVideoRefs]);

  const isPortrait =
    post.media[0]?.width && post.media[0]?.height
      ? post.media[0].height > post.media[0].width
      : false;

  const containerClass = isPortrait
    ? "bg-white shadow rounded-xl w-full p-4" // Full width + portrait padding
    : "bg-white shadow rounded-xl w-full p-2"; // Less padding for landscape

  return (
    <div className={containerClass}>
      {post.media[0]?.type === "image" && (
        <img
          src={post.media[0].url}
          className={`w-full ${
            isPortrait ? "h-[600px] object-cover" : "h-[400px] object-cover"
          } rounded-xl`}
        />
      )}
      {post.media[0]?.type === "video" && (
        <video
          ref={videoRef}
          data-src={post.media[0].url}
          className={`w-full ${
            isPortrait ? "h-[600px] object-cover" : "h-[400px] object-cover"
          } rounded-xl`}
          controls
        />
      )}
      {post.content && <p className="mt-2">{post.content}</p>}
    </div>
  );
};

export default PostCard;