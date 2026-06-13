// utils/compressStoryMedia.js
import { compressImage } from "./compressImage";
import { compressVideo } from "./compressVideo";
import { normalizeAudio } from "./normalizeAudio";

export const compressStoryMedia = async (file) => {
  try {
    // IMAGE
    if (file.type.startsWith("image/")) {
      return await compressImage(file, 0.7);
    }

    // VIDEO
    if (file.type.startsWith("video/")) {
      if (file.size > 10 * 1024 * 1024) {
        return await compressVideo(file);
      }
      return file;
    }

    // AUDIO
    if (file.type.startsWith("audio/")) {
      return await normalizeAudio(file);
    }

    return file;
  } catch (err) {
    console.error("Compression error:", err);
    return file;
  }
};
