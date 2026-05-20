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

  const [recording, setRecording] =
    useState(false);

  const startRecording =
    async () => {

      try {

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        const mediaRecorder =
          new MediaRecorder(
            stream
          );

        mediaRecorderRef.current =
          mediaRecorder;

        chunksRef.current = [];

        mediaRecorder.ondataavailable =
          (e) => {
            chunksRef.current.push(
              e.data
            );
          };

        mediaRecorder.onstop =
          async () => {

            const blob =
              new Blob(
                chunksRef.current,
                {
                  type: "audio/webm",
                }
              );

            const file =
              new File(
                [blob],
                "voice.webm",
                {
                  type: "audio/webm",
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
              "YOUR_CLOUD_NAME";

            const res =
              await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                {
                  method: "POST",
                  body: formData,
                }
              );

            const data =
              await res.json();

            onSend(
              data.secure_url
            );
          };

        mediaRecorder.start();

        setRecording(true);

      } catch (err) {

        console.log(err);
      }
    };

  const stopRecording = () => {

    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  return (
    <button
      onClick={
        recording
          ? stopRecording
          : startRecording
      }
      className={`w-12 h-12 rounded-full text-white shadow-lg ${
        recording
          ? "bg-red-500"
          : "bg-green-500"
      }`}
    >
      {recording
        ? "⏹"
        : "🎤"}
    </button>
  );
};

export default VoiceRecorder;