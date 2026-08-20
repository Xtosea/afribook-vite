import { useState } from "react";



export const useImageKitUpload = () => {
  const uploadImageKit = async (
    file,
    onProgress = () => {}
  ) => {
    try {
      if (!file) {
        throw new Error("No file selected");
      }

      // ================= GET IMAGEKIT AUTH =================

      const authRes = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/imagekit/auth`
      );

      const auth = await authRes.json();

      if (!authRes.ok) {
        throw new Error(
          auth.error ||
          "Failed to authenticate with ImageKit"
        );
      }

      if (
        !auth.signature ||
        !auth.token ||
        !auth.expire
      ) {
        throw new Error(
          "Invalid ImageKit authentication response"
        );
      }

      // ================= FORM DATA =================

      const formData = new FormData();

      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append(
        "publicKey",
        import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY
      );
      formData.append(
        "signature",
        auth.signature
      );
      formData.append(
        "expire",
        auth.expire
      );
      formData.append(
        "token",
        auth.token
      );
      formData.append(
        "folder",
        "/profile_uploads"
      );

      // ================= UPLOAD =================

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round(
              (event.loaded * 100) /
              event.total
            );

            onProgress(percent);
          }
        };

        xhr.onload = () => {
          let res;

          try {
            res = JSON.parse(
              xhr.responseText
            );
          } catch {
            reject(
              new Error(
                "Invalid response from ImageKit"
              )
            );
            return;
          }

          if (
            xhr.status >= 200 &&
            xhr.status < 300 &&
            res.url
          ) {
            console.log(
              "IMAGEKIT UPLOAD SUCCESS:",
              res.url
            );

            resolve(res.url);
            return;
          }

          console.error(
            "IMAGEKIT UPLOAD FAILED:",
            res
          );

          reject(
            new Error(
              res.message ||
              res.error ||
              "ImageKit upload failed"
            )
          );
        };

        xhr.onerror = () => {
          reject(
            new Error(
              "Network error while uploading to ImageKit"
            )
          );
        };

        xhr.open(
          "POST",
          "https://upload.imagekit.io/api/v1/files/upload"
        );

        xhr.send(formData);
      });

    } catch (error) {
      console.error(
        "ImageKit upload error:",
        error
      );

      throw error;
    }
  };

  return {
    uploadImageKit,
  };
};