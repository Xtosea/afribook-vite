import { useParams } from "react-router-dom";
import { useState } from "react";

const MediaViewer = ({ post }) => {
  const { index } = useParams();
  const [current, setCurrent] = useState(Number(index) || 0);

  if (!post?.media?.length) return null;

  const media = post.media[current];

  return (
    <div className="min-h-screen bg-black text-white">
      
      <div className="max-w-5xl mx-auto p-4">

        {media.type === "image" ? (
          <img
            src={media.url}
            className="w-full max-h-[90vh] object-contain"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="w-full max-h-[90vh]"
          />
        )}

        {/* Scrollable Thumbnails */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {post.media.map((m, i) => (
            <div
              key={i}
              className="w-24 h-24 cursor-pointer"
              onClick={() => setCurrent(i)}
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
    </div>
  );
};

export default MediaViewer;