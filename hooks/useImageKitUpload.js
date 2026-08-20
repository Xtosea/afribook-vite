import { useState } from "react";

export function useImageKitUpload() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);

  const uploadImageKit = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/imagekit/auth`
      );

      const auth = await res.json();

      if (!res.ok) {
        throw new Error(
          auth.error || "ImageKit authentication failed"
        );
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "publicKey",
        import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY
      );
      formData.append("signature", auth.signature);
      formData.append("token", auth.token);
      formData.append("expire", auth.expire);

      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await uploadRes.json();

      if (!uploadRes.ok || !data.url) {
        throw new Error(
          data.message || "ImageKit upload failed"
        );
      }

      setUrl(data.url);

      return data.url;

    } catch (err) {
      console.error("IMAGEKIT UPLOAD ERROR:", err);

      setError(err.message);

      throw err;

    } finally {
      setLoading(false);
    }
  };

  return {
    uploadImageKit,
    uploadImage: uploadImageKit,
    loading,
    url,
    error,
  };
}