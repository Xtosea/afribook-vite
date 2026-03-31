// src/pages/PostView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { API_BASE } from "../api/api";
import PostCard from "../components/PostCard";

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!post) return <div className="p-4">Loading...</div>;

  const image =
    post?.media?.[0]?.url ||
    "https://africbook.globelynks.com/logo.png";

  const title =
    post?.text?.substring(0, 60) ||
    `${post.user?.name} shared a post`;

  const description =
    post?.text?.substring(0, 160) ||
    "Check this post on Africbook";

  const url = `https://africbook.globelynks.com/post/${post._id}`;

  return (
    <>
      <Helmet>

        {/* Basic */}
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* OpenGraph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Africbook" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

      </Helmet>

      <div className="max-w-2xl mx-auto p-3">
        <PostCard post={post} />
      </div>
    </>
  );
};

export default PostView;