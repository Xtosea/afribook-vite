// frontend/hooks/useImageKitUpload.js
import ImageKit from "imagekit-javascript";

export const useImageKitUpload = () => {
  const imagekit = new ImageKit({
    publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT,
    authenticationEndpoint: `${process.env.REACT_APP_API_BASE}/api/imagekit/auth`,
  });

  const uploadImageKit = (file, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file,
          fileName: file.name,
          folder: "/profile_uploads",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.url); // returns the uploaded image URL
        },
        (percent) => onProgress(percent)
      );
    });
  };

  return { uploadImageKit };
};