// src/hooks/useImageKitUpload.js
import { IKClient } from "imagekit-javascript";

export const useImageKitUpload = () => {
  // Replace with your actual ImageKit public key, URL endpoint, and auth endpoint
  const imagekit = new IKClient({
    publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT,
    authenticationEndpoint: `${process.env.REACT_APP_API_BASE}/api/imagekit/auth`, 
  });

  /**
   * Uploads a file to ImageKit and reports progress
   * @param {File} file - The file to upload
   * @param {string} token - JWT token for auth
   * @param {function} onProgress - Callback to receive upload percentage (0-100)
   * @returns {Promise<string>} - The uploaded file URL
   */
  const uploadImageKit = (file, token, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file,
          fileName: file.name,
          folder: "/profile_uploads",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.url); // Return the uploaded file URL
        },
        (percent) => {
          onProgress(percent); // Call callback with upload percentage
        }
      );
    });
  };

  return { uploadImageKit };
};