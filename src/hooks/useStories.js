import { useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE;

export const useStoryUpload = () => {

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const uploadStory = async (input) => {
  try {
    setLoading(true);

    let file;
    let caption = "";
    let music = null;

    // =========================
    // CASE 1: FormData (NEW STORY CREATOR)
    // =========================
    if (input instanceof FormData) {
      file = input.get("media");
      caption = input.get("text") || "";
      music = input.get("music") || null;
    } else {
      // =========================
      // CASE 2: OLD SINGLE FILE
      // =========================
      file = input;
    }

    if (!file) throw new Error("No file provided");

    // =========================
    // GET SIGNED URL
    // =========================
    const signedRes = await fetch(
      `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
    );

    const signedData = await signedRes.json();

    if (!signedData.uploadUrl || !signedData.fileUrl) {
      throw new Error("Invalid signed URL response");
    }

    // =========================
    // UPLOAD TO R2
    // =========================
    await axios.put(signedData.uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (event) => {
        const percent = Math.round(
          (event.loaded * 100) / event.total
        );
        setProgress(percent);
      },
    });

    // =========================
    // SAVE STORY TO DATABASE
    // =========================
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        media: [
          {
            url: signedData.fileUrl,
            type: file.type.startsWith("video")
              ? "video"
              : "image",
          },
        ],

        caption,
        music: music ? "attached" : null,
      }),
    });

    const story = await res.json();

    if (!res.ok) {
      throw new Error(story.error || "Failed to create story");
    }

    console.log("Uploaded story:", story);

    return story;
  } catch (err) {
    console.error("Story upload error:", err);
    throw err;
  } finally {
    setLoading(false);
    setProgress(0);
  }
};