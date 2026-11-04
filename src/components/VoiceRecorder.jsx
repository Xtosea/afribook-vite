import React, { useRef, useState, useEffect } from "react";

const VoiceRecorder = ({ onSend }) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!recording) return;

    const timer = setInterval(() => {
      setRecordingTime((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [recording]);

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl("");
    setPreviewBlob(null);
    setRecordingTime(0);
  };

  const startRecording = async () => {
    if (recording || uploading || mediaRecorderRef.current) return;

    clearPreview();
    chunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        chunksRef.current = [];

        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);

          previewUrlRef.current = url;
          setPreviewBlob(blob);
          setPreviewUrl(url);
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event.error);
        alert("An error occurred while recording.");
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;

      alert("Unable to access the microphone. Please check microphone permission.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") return;

    setRecording(false);
    recorder.stop();
  };

  const deleteRecording = () => {
    if (recording) {
      stopRecording();
    }

    clearPreview();
    chunksRef.current = [];
  };

  const sendRecording = async () => {
    if (!previewBlob || uploading) return;

    try {
      setUploading(true);

      const file = new File(
        [previewBlob],
        "voice-note.webm",
        { type: previewBlob.type || "audio/webm" }
      );

      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", "joblink_unsigned");

      const cloudName = "dycqfqqlc";

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Cloudinary upload failed"
        );
      }

      if (!data.secure_url) {
        throw new Error("Cloudinary did not return an audio URL.");
      }

      await onSend(data.secure_url);

      clearPreview();
    } catch (err) {
      console.error("VOICE UPLOAD ERROR:", err);
      alert(err.message || "Unable to send voice note.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">

      {!previewBlob && (
        <>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            aria-label={recording ? "Stop recording" : "Start recording"}
            className={`w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center text-xl transition-all ${
              recording
                ? "bg-red-500 animate-pulse"
                : "bg-green-500"
            }`}
          >
            {recording ? "⏹" : "🎤"}
          </button>

          <div className="text-xs font-medium text-gray-600">
            {recording
              ? `Recording ${formatTime(recordingTime)} · Tap to stop`
              : "Voice Note"}
          </div>

          {recording && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording in progress
            </div>
          )}
        </>
      )}

      {previewBlob && previewUrl && (
        <div className="w-full max-w-xs rounded-2xl bg-gray-100 p-3">

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Voice note preview
            </span>

            <span className="text-xs text-gray-500">
              {formatTime(recordingTime)}
            </span>
          </div>

          <audio
            controls
            preload="metadata"
            src={previewUrl}
            className="w-full h-10"
          />

          <div className="flex items-center gap-2 mt-3">

            <button
              type="button"
              onClick={sendRecording}
              disabled={uploading}
              className="flex-1 rounded-full bg-green-600 text-white py-2 text-sm font-semibold disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "➤ Send"}
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              disabled={uploading}
              className="flex-1 rounded-full bg-red-100 text-red-600 py-2 text-sm font-semibold disabled:opacity-50"
            >
              🗑 Delete
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default VoiceRecorder;