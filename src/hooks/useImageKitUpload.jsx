// src/hooks/useImageKitUpload.js
import ImageKit from "imagekit-javascript";

export const useImageKitUpload = () => {
  const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL,
    authenticationEndpoint: `${import.meta.env.VITE_API_BASE}/api/imagekit/auth`,
  });

  const uploadImageKit = (file, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      imagekit.upload(
        { file, fileName: file.name, folder: "/profile_uploads" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.url); // returns the uploaded file URL
        },
        (percent) => onProgress(percent) // progress callback
      );
    });
  };

  return { uploadImageKit };
};