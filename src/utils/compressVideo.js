import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export const compressVideo = async (file) => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

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