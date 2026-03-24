// src/hooks/useImageKitUpload.js
import { IKClient } from "imagekit-javascript";

export const useImageKitUpload = () => {
  const imagekit = new IKClient({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL, // <-- must match your .env
    authenticationEndpoint: `${import.meta.env.VITE_API_BASE}/api/imagekit/auth`,
  });

  const uploadImageKit = (file, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file,
          fileName: file.name,
          folder: "/profile_uploads",
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.url);
        },
        (percent) => onProgress(percent)
      );
    });
  };

  return { uploadImageKit };
};