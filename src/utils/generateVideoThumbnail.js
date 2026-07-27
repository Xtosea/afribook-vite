// utils/generateVideoThumbnail.js
export async function generateVideoThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    video.src = URL.createObjectURL(file);
    video.muted = true;

    video.onloadeddata = () => {
      video.currentTime = 1; // Capture at 1 second
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas
        .getContext("2d")
        .drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        resolve(
          new File([blob], "thumbnail.jpg", {
            type: "image/jpeg",
          })
        );
      }, "image/jpeg", 0.9);
    };
  });
}
