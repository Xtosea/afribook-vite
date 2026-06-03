import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../api/api";

export default function StoryMusicUploader() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadMusic = async () => {
    try {
      if (!audio) {
        alert("Select an audio file");
        return;
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      // Get signed URL
      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${audio.type}`
      );

      const signedData = await signedRes.json();

      await axios.put(
        signedData.uploadUrl,
        audio,
        {
          headers: {
            "Content-Type": audio.type,
          },
        }
      );

      // Save music record
      const res = await fetch(
        `${API_BASE}/api/story-music-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            artist,
            audioUrl: signedData.fileUrl,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      alert("Music uploaded");

      setTitle("");
      setArtist("");
      setAudio(null);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">
        Upload Story Music
      </h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="border p-2 w-full mb-3"
      />

      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) =>
          setArtist(e.target.value)
        }
        className="border p-2 w-full mb-3"
      />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setAudio(e.target.files[0])
        }
        className="mb-3"
      />

      <button
        onClick={uploadMusic}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}