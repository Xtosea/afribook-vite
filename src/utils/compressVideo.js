import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

const compressVideo = async (file) => {

  try {

    // LOAD FFMPEG
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }

    // CLEAR OLD FILES
    try {
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");
    } catch {}

    // WRITE INPUT FILE
    await ffmpeg.writeFile(
      "input.mp4",
      await fetchFile(file)
    );

    // COMPRESS + FORCE 9:16 VERTICAL
    await ffmpeg.exec([
      "-i",
      "input.mp4",

      // FORCE REEL SIZE
      "-vf",
      "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280",

      // SMOOTH FPS
      "-r",
      "30",

      // VIDEO QUALITY
      "-b:v",
      "1M",

      // FAST MOBILE PROCESSING
      "-preset",
      "ultrafast",

      // OUTPUT
      "output.mp4",
    ]);

    // READ OUTPUT FILE
    const data = await ffmpeg.readFile(
      "output.mp4"
    );

    // RETURN NEW FILE
    return new File(
      [data],
      "compressed.mp4",
      {
        type: "video/mp4",
      }
    );

  } catch (err) {

    console.error(
      "Video compression error:",
      err
    );

    throw err;
  }
};

export default compressVideo;