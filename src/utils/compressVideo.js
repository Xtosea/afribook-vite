import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

const compressVideo = async (file) => {

  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  // Clear old files
  try {
    await ffmpeg.deleteFile("input.mp4");
    await ffmpeg.deleteFile("output.mp4");
  } catch {}

  await ffmpeg.writeFile(
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
    "ultrafast",
    "output.mp4",
  ]);

  const data = await ffmpeg.readFile(
    "output.mp4"
  );

  return new File(
    [data],
    "compressed.mp4",
    {
      type: "video/mp4",
    }
  );
};

export default compressVideo;
