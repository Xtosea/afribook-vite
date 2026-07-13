// src/pages/PostView.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { API_BASE } from "../api/api";
import PostCard from "../components/PostCard";

const PostView = () => {

  const { id } = useParams();

  
const [post, setPost] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

  useEffect(() => {
  const fetchPost = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${id}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log(data);

      setPost(data);

    } catch (err) {

      console.error(err);
      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  fetchPost();

}, [id]);


  
  const rawImage = post?.media?.[0]?.url;

const image = rawImage
  ? rawImage.startsWith("http")
    ? rawImage
    : `https://africsocial.globelynks.com${rawImage}`
  : "https://africsocial.globelynks.com/social-preview.png";

  const title =
  post?.content?.substring(0, 60) ||
  `${post?.user?.name || "Someone"} shared a post`;

const description =
  post?.content?.substring(0, 160) ||
  "Check this post on AfricSocial";

const url =
  `https://africsocial.globelynks.com/post/${post?._id || ""}`;


if (loading) {
  return <div className="p-4">Loading...</div>;
}

if (error) {
  return (
    <div className="p-4 text-red-500">
      Error: {error}
    </div>
  );
}

if (!post) {
  return (
    <div className="p-4">
      Post not found.
    </div>
  );
}


  return (
    <>
      <Helmet>

        {/* Basic SEO */}
        <title>{title}</title>

        <meta
          name="description"
          content={description}
        />

        {/* Open Graph */}
        <meta property="og:title" content={title} />

        <meta
          property="og:description"
          content={description}
        />

        <meta property="og:image" content={image} />

        <meta property="og:url" content={url} />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content="Africbook"
        />

        {/* Twitter */}
        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={title}
        />

        <meta
          name="twitter:description"
          content={description}
        />

        <meta
          name="twitter:image"
          content={image}
        />

      </Helmet>

      <div className="max-w-2xl mx-auto p-3">

        <PostCard post={post} />

      </div>
    </>
  );
};

export default PostView;