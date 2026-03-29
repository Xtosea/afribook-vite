// src/components/PostCard.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const [fullscreen, setFullscreen] = useState(null);

  const media = post.media || [];
  const isMulti = media.length > 1;

  return (
    <div className="bg-white rounded-xl shadow space-y-3 p-2 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={post.user?.profilePicture || "/default-avatar.png"}
          alt={post.user?.name || "User"}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{post.user?.name}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Text Content */}
      {post.text && (
        <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
      )}

      {/* SINGLE MEDIA */}
      {!isMulti &&
        media.map((m, i) => {
          const isVideo = m.type === "video" || m.url?.endsWith(".mp4");
          const isPortrait = m.height > m.width;

          /* PORTRAIT IMAGE */
          if (isPortrait && !isVideo) {
            return (
              <div
                key={i}
                className="w-full max-w-[500px] mx-auto rounded-xl overflow-hidden shadow cursor-pointer"
                onClick={() => setFullscreen({ media: m })}
              >
                <img
                  src={m.url}
                  alt=""
                  className="w-full max-h-[200px] object-contain block"
                />
              </div>
            );
          }

          /* PORTRAIT VIDEO */
          if (isPortrait && isVideo) {
            return (
              <div
                key={i}
                className="w-full max-w-[500px] mx-auto rounded-xl overflow-hidden shadow cursor-pointer"
                onClick={() => setFullscreen({ media: m })}
              >
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={m.url}
                  className="w-full aspect-[3/4] object-cover"
                  muted
                  controls
                />
              </div>
            );
          }

          /* LANDSCAPE IMAGE */
          if (!isPortrait && !isVideo) {
            return (
              <div
                key={i}
                className="w-full rounded-xl overflow-hidden shadow cursor-pointer"
                onClick={() => setFullscreen({ media: m })}
              >
                <img
                  src={m.url}
                  alt=""
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
            );
          }

          /* LANDSCAPE VIDEO */
          if (!isPortrait && isVideo) {
            return (
              <div
                key={i}
                className="w-full rounded-xl overflow-hidden shadow cursor-pointer"
                onClick={() => setFullscreen({ media: m })}
              >
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={m.url}
                  className="w-full aspect-[16/9] object-cover"
                  muted
                  controls
                />
              </div>
            );
          }
        })}

      {/* MULTI-MEDIA GRID */}
      {isMulti && (
        <div className="grid grid-cols-2 gap-2">
          {media.map((m, i) => {
            const isVideo = m.type === "video" || m.url?.endsWith(".mp4");
            const isPortrait = m.height > m.width;

            return (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden cursor-pointer ${
                  isPortrait ? "col-span-2" : "col-span-1"
                }`}
                onClick={() => setFullscreen({ media, index: i })}
              >
                {isVideo ? (
                  <video
                    src={m.url}
                    className={`w-full ${
                      isPortrait ? "aspect-[1/4]" : "aspect-[16/9]"
                    } object-cover`}
                    muted
                  />
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    className={`w-full ${
                      isPortrait ? "max-h-[200px] object-contain" : "aspect-[16/9] object-cover"
                    } block`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN VIEWER */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setFullscreen(null)}
          >
            ×
          </button>

          {fullscreen.media?.type === "video" ? (
            <video
              src={fullscreen.media.url}
              className="max-h-full max-w-full"
              controls
              autoPlay
            />
          ) : (
            <img
              src={fullscreen.media.url}
              alt=""
              className="max-h-full max-w-full"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between text-sm text-gray-600 pt-2">
        <button>Like</button>
        <button>Comment</button>
        <button>Share</button>
      </div>
    </div>
  );
};

export default PostCard;