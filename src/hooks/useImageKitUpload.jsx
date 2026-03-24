// src/hooks/useImageKitUpload.js

export const useImageKitUpload = () => {

  const uploadImageKit = async (file, onProgress = () => {}) => {
    try {
      // Get auth from backend
      const authRes = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/imagekit/auth`
      );

      const auth = await authRes.json();

      const formData = new FormData();

      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append("signature", auth.signature);
      formData.append("expire", auth.expire);
      formData.append("token", auth.token);
      formData.append("folder", "/profile_uploads");

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        };

        xhr.onload = () => {
          const res = JSON.parse(xhr.responseText);

          if (xhr.status === 200) {
            resolve(res.url);
          } else {
            reject(res);
          }
        };

        xhr.onerror = reject;

        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

        xhr.send(formData);
      });

    } catch (error) {
      console.error("ImageKit upload error:", error);
      throw error;
    }
  };

  return { uploadImageKit };
};