import { useState } from "react";
import axios from "axios";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleFilesChange = (e) => {
    setMediaFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("content", content);

    mediaFiles.forEach((file) => {
      formData.append("media", file); // ✅ VERY IMPORTANT NAME
    });

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://afribook-backend.onrender.com/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // ❌ DO NOT manually set Content-Type
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
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input type="file" multiple onChange={handleFilesChange} />

      <button type="submit">Post</button>
    </form>
  );
}