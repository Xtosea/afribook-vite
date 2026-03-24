import { IKClient } from "imagekit-javascript";

export const useImageKitUpload = () => {
  const imagekit = new IKClient({
    publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT,
    authenticationEndpoint: `${process.env.REACT_APP_API_BASE}/api/imagekit/auth`, // server route that returns token
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
          resolve(result.url); // returns the uploaded file URL
        },
        (percent) => onProgress(percent)
      );
    });
  };

  return { uploadImageKit };
};