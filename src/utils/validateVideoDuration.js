import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export const compressVideo = async (file) => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  await ffmpeg.writeFile(const validateVideoDuration = (
  file,
  maxSeconds = 60
) => {
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
    "input.mp4",
    await fetchFile(file)
  );

  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vf",
    "scale=720:-1",
    "-r",
    "30",
    "-b:v",
    "1M",
    "-preset",
    "fast",
    "output.mp4",
  ]);

  const data = await ffmpeg.readFile("output.mp4");

  return new File(
    [data.buffer],
    "compressed.mp4",
    {
      type: "video/mp4",
    }
  );
};