// Example: CreatePost.jsx
import { useState } from "react";
import axios from "axios";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleFilesChange = (e) => {
    setMediaFiles([...e.target.files]); // multiple files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);

    // Append each file to 'media' key (matches backend)
    mediaFiles.forEach((file) => {
      formData.append("media", file);
    });

    try {
      const token = localStorage.getItem("token"); // your JWT
      const res = await axios.post(
        "https://afribook-backend.onrender.com/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Post created:", res.data);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="file" multiple onChange={handleFilesChange} />
      <button type="submit">Post</button>
    </form>
  );
}