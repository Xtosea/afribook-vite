// components/VoiceRecorder.jsx

import React, {
  useRef,
  useState,
} from "react";

const VoiceRecorder = ({
  onSend,
}) => {

  const mediaRecorderRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const streamRef =
    useRef(null);

  const startX =
    useRef(0);

  const [recording, setRecording] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  // ================= START RECORDING =================

  const startRecording =
    async () => {

      try {

        setIsCancelling(false);

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        streamRef.current =
          stream;

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

            // CANCEL RECORDING
            if (isCancelling) {

              chunksRef.current = [];

              setIsCancelling(false);

              streamRef.current
                ?.getTracks()
                .forEach(
                  (
                    track
                  ) =>
                    track.stop()
                );

              return;
            }

            try {

              setUploading(
                true
              );

              const blob =
                new Blob(
                  chunksRef.current,
                  {
                    type:
                      "audio/webm",
                  }
                );

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

              if (
                data.secure_url
              ) {

                onSend(
                  data.secure_url
                );

              } else {

                console.log(
                  data
                );

                alert(
                  "Upload failed"
                );
              }

            } catch (err) {

              console.log(err);

              alert(
                "Voice upload failed"
              );

            } finally {

              setUploading(
                false
              );

              // STOP MICROPHONE
              streamRef.current
                ?.getTracks()
                .forEach(
                  (
                    track
                  ) =>
                    track.stop()
                );
            }
          };

        mediaRecorder.start();

        setRecording(true);

      } catch (err) {

        console.log(err);

        alert(
          "Microphone permission denied"
        );
      }
    };

  // ================= STOP RECORDING =================

  const stopRecording =
    () => {

      mediaRecorderRef.current?.stop();

      setRecording(false);
    };

  // ================= TOUCH START =================

  const handleTouchStart =
    async (e) => {

      startX.current =
        e.touches[0].clientX;

      await startRecording();
    };

  // ================= SWIPE CANCEL =================

  const handleTouchMove =
    (e) => {

      const currentX =
        e.touches[0].clientX;

      const diff =
        startX.current -
        currentX;

      // SWIPE LEFT
      if (diff > 80) {

        setIsCancelling(
          true
        );

      } else {

        setIsCancelling(
          false
        );
      }
    };

  return (
    <div className="flex flex-col items-center">

      {/* RECORD BUTTON */}
      <button
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          stopRecording
        }

        onMouseDown={
          startRecording
        }
        onMouseUp={
          stopRecording
        }

        disabled={uploading}

        className={`w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center text-xl transition-all duration-300 ${
          recording
            ? isCancelling
              ? "bg-red-700 scale-125"
              : "bg-red-500 animate-pulse scale-110"
            : uploading
            ? "bg-gray-400"
            : "bg-green-500"
        }`}
      >
        {uploading
          ? "..."
          : recording
          ? "⏺"
          : "🎤"}
      </button>

      {/* RECORDING TEXT */}
      {recording && (
        <div
          className={`text-xs mt-2 font-medium transition ${
            isCancelling
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {isCancelling
            ? "❌ Release to cancel"
            : "⬅ Swipe left to cancel"}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;