import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../api/api";

const reactions = ["👍","❤️","😂","😮","😢","😡"];

const MediaViewer = () => {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startIndex = Number(searchParams.get("index")) || 0;

  const [post, setPost] = useState(null);
  const [current, setCurrent] = useState(startIndex);
  const [commentText, setCommentText] = useState("");
  const [showReactions, setShowReactions] = useState(false);

  const videoRefs = useRef([]);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    videoRefs.current.forEach((video,i)=>{
      if(video){
        if(i === current){
          video.play().catch(()=>{})
        }else{
          video.pause()
        }
      }
    })
  },[current])

  if (!post?.media?.length) {
    return (
      <div className="p-10 text-center">
        Loading media...
      </div>
    );
  }

  const media = post.media[current];

  const handleLike = async (reaction) => {
    try{
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/posts/${post._id}/reaction`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({ type:reaction })
      });

      fetchPost();

    }catch(err){
      console.error(err)
    }
  };

  const handleComment = async () => {
    if(!commentText.trim()) return;

    try{
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/posts/${post._id}/comment`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({ text:commentText })
      });

      setCommentText("");
      fetchPost();

    }catch(err){
      console.error(err)
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-800">
        <button onClick={()=>navigate(-1)}>
          ← Back
        </button>

        <img
          src={post.user?.profilePic || "/default-avatar.png"}
          className="w-8 h-8 rounded-full object-cover"
        />

        <span>{post.user?.name}</span>
      </div>

      {/* Main Media */}
      <div className="flex justify-center items-center h-[70vh]">

        {media.type === "image" ? (
          <img
            src={media.url}
            className="max-h-[70vh] object-contain"
          />
        ) : (
          <video
            ref={el => videoRefs.current[current] = el}
            src={media.url}
            className="max-h-[70vh]"
            controls
            muted
            autoPlay
          />
        )}

      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">

        <div className="flex gap-4 items-center">

          <div
            className="relative"
            onMouseEnter={()=>setShowReactions(true)}
            onMouseLeave={()=>setShowReactions(false)}
          >

            <button onClick={()=>handleLike("👍")}>
              👍 Like
            </button>

            {showReactions && (
              <div className="absolute bottom-8 bg-gray-900 rounded-full px-2 py-1 flex gap-2">
                {reactions.map(r=>(
                  <button
                    key={r}
                    onClick={()=>handleLike(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

          </div>

          <button>
            💬 {post.comments?.length || 0}
          </button>

          <button>
            🔗 Share
          </button>

        </div>

        {/* Caption */}
        {post.content && (
          <p className="text-gray-300">
            {post.content}
          </p>
        )}

        {/* Comments */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {post.comments?.map(c=>(
            <div key={c._id} className="flex gap-2">
              <img
                src={c.user?.profilePic || "/default-avatar.png"}
                className="w-6 h-6 rounded-full"
              />

              <div>
                <span className="text-sm font-semibold">
                  {c.user?.name}
                </span>

                <p className="text-sm text-gray-300">
                  {c.text}
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* Comment box */}
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={e=>setCommentText(e.target.value)}
            placeholder="Write comment..."
            className="flex-1 bg-gray-900 rounded px-2 py-1"
          />

          <button
            onClick={handleComment}
            className="bg-blue-500 px-3 rounded"
          >
            Send
          </button>

        </div>

      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-3 overflow-x-auto">

        {post.media.map((m,i)=>(
          <div
            key={i}
            onClick={()=>setCurrent(i)}
            className={`w-20 h-20 cursor-pointer border ${
              current === i ? "border-blue-500" : "border-transparent"
            }`}
          >

            {m.type === "image" ? (
              <img
                src={m.url}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={m.url}
                className="w-full h-full object-cover"
              />
            )}

          </div>
        ))}

      </div>

    </div>
  );
};

export default MediaViewer;