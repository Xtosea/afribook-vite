// Multiple Media Layout (Professional Facebook Style)
return (
  <div className="grid gap-2">
    
    {/* First Media Large */}
    <div
      className="w-full max-h-[520px] overflow-hidden rounded-xl cursor-pointer"
      onClick={() => setModalIndex(0)}
    >
      {post.media[0].type === "image" ? (
        <img
          src={post.media[0].url}
          className="w-full h-full object-cover"
          alt=""
        />
      ) : (
        <video
          data-src={post.media[0].url}
          ref={(el) => (videoRefs.current[0] = el)}
          className="w-full h-full object-cover"
          muted
        />
      )}
    </div>

    {/* Remaining Media */}
    {post.media.length > 1 && (
      <div
        className={`
          grid gap-2
          ${post.media.length === 2 ? "grid-cols-1" : "grid-cols-2"}
        `}
      >
        {post.media.slice(1).map((m, i) => (
          <div
            key={i + 1}
            className="relative h-[200px] md:h-[240px] overflow-hidden rounded-xl cursor-pointer"
            onClick={() => setModalIndex(i + 1)}
          >
            {m.type === "image" ? (
              <img
                src={m.url}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <video
                data-src={m.url}
                ref={(el) => (videoRefs.current[i + 1] = el)}
                className="w-full h-full object-cover"
                muted
              />
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);