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

  const [recording, setRecording] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  // ================= START RECORDING =================

  const startRecording =
    async () => {

      try {

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
                "YOUR_UPLOAD_PRESET"
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

  return (
    <button
      onClick={
        recording
          ? stopRecording
          : startRecording
      }

      disabled={
        uploading
      }

      className={`w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center text-xl transition ${
        recording
          ? "bg-red-500"
          : uploading
          ? "bg-gray-400"
          : "bg-green-500"
      }`}
    >

      {uploading
        ? "..."
        : recording
        ? "⏹"
        : "🎤"}

    </button>
  );
};

export default VoiceRecorder;