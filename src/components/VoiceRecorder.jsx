import React, { useRef, useState } from "react";

const VoiceRecorder = ({ onSend }) => {
  const [recording, setRecording] =
    useState(false);

  const mediaRecorderRef = useRef(null);

  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const mediaRecorder =
      new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      chunksRef.current = [];

      const formData = new FormData();

      formData.append("file", blob);

      formData.append(
        "upload_preset",
        "YOUR_UPLOAD_PRESET"
      );

      const cloudName = "YOUR_CLOUD_NAME";

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      onSend(data.secure_url);
    };

    mediaRecorder.start();

    setRecording(true);
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
      className={`px-5 py-3 rounded-full text-white font-bold ${
        recording
          ? "bg-red-500"
          : "bg-purple-500"
      }`}
    >
      {recording ? "Stop" : "Voice"}
    </button>
  );
};

export default VoiceRecorder;