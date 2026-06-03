import { useState } from "react";
import axios from "axios";

import { API_BASE } from "../../api/api";

export default function StoryMusicUploader() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audio, setAudio] = useState(null);

  const uploadMusic = async () => {
    try {
      if (!audio) return;

      const token =
        localStorage.getItem("token");

      // get signed url
      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${audio.type}`
      );

      const signedData =
        await signedRes.json();

      await axios.put(
        signedData.uploadUrl,
        audio,
        {
          headers: {
            "Content-Type": audio.type,
          },
        }
      );

      // save to database
      await fetch(
        `${API_BASE}/api/story-music-admin`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title,
            artist,
            audioUrl:
              signedData.fileUrl,
          }),
        }
      );

      alert("Music uploaded");

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded">
      <input
        placeholder="Song title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        placeholder="Artist"
        value={artist}
        onChange={(e) =>
          setArtist(e.target.value)
        }
      />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setAudio(e.target.files[0])
        }
      />

      <button onClick={uploadMusic}>
        Upload Music
      </button>
    </div>
  );
}