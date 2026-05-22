// components/VoiceRecorder.jsx

import React, {
  useRef,
  useState,
  useEffect,
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

  const analyserRef =
    useRef(null);

  const animationRef =
    useRef(null);

  const audioContextRef =
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

  const [waveHeights, setWaveHeights] =
    useState([
      8, 14, 10, 18, 12, 16, 9,
    ]);

  // ================= WAVEFORM =================

  const startWaveform =
    (stream) => {

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

      const updateWave =
        () => {

          analyser.getByteFrequencyData(
            dataArray
          );

          const bars =
            Array.from(
              {
                length: 12,
              },
              (_, i) => {

                const value =
                  dataArray[i];

                return Math.max(
                  6,
                  value / 8
                );
              }
            );

          setWaveHeights(
            bars
          );

          animationRef.current =
            requestAnimationFrame(
              updateWave
            );
        };

      updateWave();
    };

  // ================= STOP WAVEFORM =================

  const stopWaveform =
    () => {

      cancelAnimationFrame(
        animationRef.current
      );

      audioContextRef.current?.close();

      setWaveHeights([
        8, 14, 10, 18, 12, 16, 9,
      ]);
    };

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

        startWaveform(
          stream
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

            if (e.data.size > 0) {

              chunksRef.current.push(
                e.data
              );
            }
          };

        mediaRecorder.onstop =
          async () => {

            stopWaveform();

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

  // ================= CLEANUP =================

  useEffect(() => {

    return () => {

      stopWaveform();

      streamRef.current
        ?.getTracks()
        .forEach(
          (
            track
          ) =>
            track.stop()
        );
    };
  }, []);

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

      {/* LIVE WAVEFORM */}
      {recording && (
        <div className="flex items-end gap-[3px] mt-3 h-10">

          {waveHeights.map(
            (
              height,
              index
            ) => (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-75 ${
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
      )}

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