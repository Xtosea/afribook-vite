const validateVideoDuration = (file, maxSeconds = 60) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);

      if (video.duration > maxSeconds) {
        reject(
          `Video exceeds ${maxSeconds} seconds`
        );
      } else {
        resolve(video.duration);
      }
    };

    video.onerror = () => {
      reject("Invalid video file");
    };

    video.src = URL.createObjectURL(file);
  });
};

export default validateVideoDuration;