import { useState } from "react";
import { API_BASE } from "../api/api";

const uploadVideo = async (file) => {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch(`${API_BASE}/api/posts/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await res.json();

    // FIXED RETURN
    return data?.media?.[0]?.url || data?.media?.url || data?.post?.media?.[0]?.url;

  } catch (err) {
    console.error("Video upload error:", err);
    return null;
  }
};