{/* MEDIA */}
{post.media?.length > 0 && (
  <div className="space-y-2">
    {/* Big first image/video */}
    <div className="w-full max-h-[500px]">
      {post.media[0].type === "image" ? (
        <img
          src={post.media[0].url}
          className="w-full h-[400px] object-cover rounded-lg cursor-pointer"
          alt=""
          onClick={() => setModalIndex(0)}
        />
      ) : (
        <video
          src={post.media[0].url}
          className="w-full h-[400px] object-cover rounded-lg"
          controls
          muted
          preload="metadata"
          onClick={() => setModalIndex(0)}
        />
      )}
    </div>

    {/* Small images/videos below */}
    {post.media.length > 1 && (
      <div className="flex gap-2 overflow-x-auto">
        {post.media.slice(1).map((m, i) => (
          <div key={i} className="flex-shrink-0 w-24 h-24 cursor-pointer" onClick={() => setModalIndex(i + 1)}>
            {m.type === "image" ? (
              <img src={m.url} className="w-full h-full object-cover rounded-lg" alt="" />
            ) : (
              <video src={m.url} className="w-full h-full object-cover rounded-lg" muted preload="metadata" />
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}