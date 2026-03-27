import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";
import ReelUpload from "../components/reels/ReelUpload";

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();

      const vids = data.flatMap((post) =>
        post.media
          ?.filter((m) => m.type === "video")
          .map((m) => ({
            ...m,
            postId: post._id,
            user: post.user,
            likes: post.likes?.length || 0
          })) || []
      );

      setVideos(vids);

      // initialize likes
      const initialLikes = {};
      vids.forEach(v => {
        initialLikes[v.postId] = v.likes;
      });

      setLikes(initialLikes);

    } catch (err) {
      console.error(err);
    }
  };

  /* Like video */
  const likeVideo = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/api/posts/like/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setLikes((prev) => ({
        ...prev,
        [id]: data.likes
      }));

    } catch (err) {
      console.error(err);
    }
  };

  /* Auto play */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          entry.isIntersecting ? video.play() : video.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videos]);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {videos.map((video, i) => (
        <div key={i} className="h-screen snap-start relative">

          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={video.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
          />

          <ReelUpload />

          {/* Double tap to like */}
          <div
            className="absolute inset-0"
            onDoubleClick={() => likeVideo(video.postId)}
          >

            {/* User */}
            <div className="absolute bottom-20 left-4 text-white">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(`/profile/${video.user._id}`)}
              >
                <img
                  src={video.user.profilePic}
                  className="w-10 h-10 rounded-full"
                />

                <span>{video.user.name}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute right-4 bottom-20 text-white flex flex-col gap-4">

              <button
                onClick={() => likeVideo(video.postId)}
                className="text-2xl"
              >
                ❤️
                <div className="text-sm">
                  {likes[video.postId] || 0}
                </div>
              </button>

              <button className="text-2xl">💬</button>
              <button className="text-2xl">🔗</button>

            </div>

          </div>

        </div>
      ))}

    </div>
  );
};

export default Reels;