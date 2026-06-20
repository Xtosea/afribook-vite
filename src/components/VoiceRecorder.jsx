import React, {
useRef,
useState,
useEffect,
} from "react";

const VoiceRecorder = ({ onSend }) => {
const mediaRecorderRef = useRef(null);
const chunksRef = useRef([]);
const streamRef = useRef(null);
const analyserRef = useRef(null);
const animationRef = useRef(null);
const audioContextRef = useRef(null);

const startX = useRef(0);

const isRecordingRef = useRef(false);
const isCancellingRef = useRef(false);

const [recording, setRecording] =
useState(false);

const [uploading, setUploading] =
useState(false);

const [isCancelling, setIsCancelling] =
useState(false);

const [waveHeights, setWaveHeights] =
useState([
8, 14, 10, 18, 12, 16, 9,
]);

const isTouchDevice =
typeof window !== "undefined" &&
"ontouchstart" in window;

const stopWaveform = () => {
cancelAnimationFrame(
animationRef.current
);

if (audioContextRef.current) {
  audioContextRef.current.close();
  audioContextRef.current = null;
}

setWaveHeights([
  8, 14, 10, 18, 12, 16, 9,
]);

};

const startWaveform = (stream) => {
const audioContext =
new AudioContext();

audioContextRef.current =
  audioContext;

const analyser =
  audioContext.createAnalyser();

analyser.fftSize = 64;

const source =
  audioContext.createMediaStreamSource(
    stream
  );

source.connect(analyser);

analyserRef.current =
  analyser;

const dataArray =
  new Uint8Array(
    analyser.frequencyBinCount
  );

const updateWave = () => {
  analyser.getByteFrequencyData(
    dataArray
  );

  const bars = Array.from(
    { length: 12 },
    (_, i) =>
      Math.max(
        6,
        dataArray[i] / 8
      )
  );

  setWaveHeights(bars);

  animationRef.current =
    requestAnimationFrame(
      updateWave
    );
};

updateWave();

};

const startRecording =
async () => {
if (
isRecordingRef.current ||
uploading
)
return;

  try {
    isRecordingRef.current = true;

    setRecording(true);

    setIsCancelling(false);

    isCancellingRef.current =
      false;

    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
        }
      );

    streamRef.current =
      stream;

    startWaveform(stream);

    const mediaRecorder =
      new MediaRecorder(
        stream
      );

    mediaRecorderRef.current =
      mediaRecorder;

    chunksRef.current = [];

    mediaRecorder.ondataavailable =
      (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(
            e.data
          );
        }
      };

    mediaRecorder.onstop =
      async () => {
        stopWaveform();

        if (
          isCancellingRef.current
        ) {
          chunksRef.current = [];

          streamRef.current
            ?.getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        try {
          setUploading(true);

          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  "audio/webm",
              }
            );

          if (
            blob.size === 0
          ) {
            throw new Error(
              "Empty recording"
            );
          }

          const file =
            new File(
              [blob],
              "voice-note.webm",
              {
                type:
                  "audio/webm",
              }
            );

          const formData =
            new FormData();

          formData.append(
            "file",
            file
          );

          formData.append(
            "upload_preset",
            "joblink_unsigned"
          );

          const cloudName =
            "dycqfqqlc";

          const res =
            await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
              {
                method:
                  "POST",
                body:
                  formData,
              }
            );

          const data =
            await res.json();

          console.log(
            "Cloudinary Response:",
            data
          );

          if (!res.ok) {
            throw new Error(
              data?.error
                ?.message ||
                "Cloudinary upload failed"
            );
          }

          onSend(
            data.secure_url
          );
        } catch (err) {
          console.error(
            "VOICE UPLOAD ERROR:",
            err
          );

          alert(
            err.message
          );
        } finally {
          setUploading(
            false
          );

          streamRef.current
            ?.getTracks()
            .forEach((track) =>
              track.stop()
            );
        }
      };

    mediaRecorder.start();
  } catch (err) {
    console.error(err);

    isRecordingRef.current =
      false;

    setRecording(false);

    alert(
      "Microphone permission denied"
    );
  }
};

const stopRecording = () => {
if (
!isRecordingRef.current
)
return;

isRecordingRef.current =
  false;

setRecording(false);

mediaRecorderRef.current?.stop();

};

const handleTouchStart =
async (e) => {
startX.current =
e.touches[0].clientX;

  await startRecording();
};

const handleTouchMove = (
e
) => {
const currentX =
e.touches[0].clientX;

const diff =
  startX.current -
  currentX;

if (diff > 80) {
  setIsCancelling(true);

  isCancellingRef.current =
    true;
} else {
  setIsCancelling(false);

  isCancellingRef.current =
    false;
}

};

useEffect(() => {
return () => {
stopWaveform();

  streamRef.current
    ?.getTracks()
    .forEach((track) =>
      track.stop()
    );
};

}, []);

return (
<div className="flex flex-col items-center">
<button
onTouchStart={
isTouchDevice
? handleTouchStart
: undefined
}
onTouchMove={
isTouchDevice
? handleTouchMove
: undefined
}
onTouchEnd={
isTouchDevice
? stopRecording
: undefined
}
onMouseDown={
!isTouchDevice
? startRecording
: undefined
}
onMouseUp={
!isTouchDevice
? stopRecording
: undefined
}
disabled={uploading}
className={"w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center text-xl transition-all duration-300 ${ recording ? isCancelling ? "bg-red-700 scale-125" : "bg-red-500 animate-pulse scale-110" : uploading ? "bg-gray-400" : "bg-green-500" }"}
>
{uploading
? "..."
: recording
? "⏺"
: "🎤"}
</button>

  {recording && (
    <>
      <div className="flex items-end gap-[3px] mt-3 h-10">
        {waveHeights.map(
          (
            height,
            index
          ) => (
            <div
              key={index}
              className={`w-1 rounded-full ${
                isCancelling
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                height: `${height}px`,
              }}
            />
          )
        )}
      </div>

      <div
        className={`text-xs mt-2 ${
          isCancelling
            ? "text-red-500"
            : "text-gray-500"
        }`}
      >
        {isCancelling
          ? "❌ Release to cancel"
          : "⬅ Swipe left to cancel"}
      </div>
    </>
  )}
</div>

);
};

export default VoiceRecorder;