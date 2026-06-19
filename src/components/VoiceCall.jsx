// components/VoiceCall.jsx

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

const VoiceCall = ({
  selectedUser,
  onClose,
  defaultProfile,
}) => {
  const [muted, setMuted] =
    useState(false);

  const [speaker, setSpeaker] =
    useState(true);

  const localStreamRef =
    useRef(null);

  useEffect(() => {
    const startCall =
      async () => {
        try {
          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: true,
              }
            );

          localStreamRef.current =
            stream;

          console.log(
            "Voice call started",
            stream
          );
        } catch (err) {
          console.log(err);

          alert(
            "Microphone permission denied"
          );

          onClose();
        }
      };

    startCall();

    return () => {
      if (
        localStreamRef.current
      ) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, [onClose]);

  const toggleMute = () => {
    const newMuted =
      !muted;

    setMuted(newMuted);

    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((track) => {
          track.enabled =
            !newMuted;
        });
    }
  };

  const endCall = () => {
    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">

      <div className="bg-gray-900 text-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">

        <img
          src={
            selectedUser?.profilePic ||
            defaultProfile
          }
          alt=""
          className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white"
        />

        <h2 className="text-2xl font-bold mt-5">
          {selectedUser?.name}
        </h2>

        <p className="text-gray-300 mt-2 animate-pulse">
          Voice Call Active...
        </p>

        {/* CONTROLS */}
        <div className="flex justify-center gap-5 mt-10">

          {/* SPEAKER */}
          <button
            onClick={() =>
              setSpeaker(
                !speaker
              )
            }
            className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center transition ${
              speaker
                ? "bg-blue-500"
                : "bg-gray-700"
            }`}
          >
            {speaker
              ? "🔊"
              : "🔈"}
          </button>

          {/* MUTE */}
          <button
            onClick={
              toggleMute
            }
            className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center transition ${
              muted
                ? "bg-red-500"
                : "bg-gray-700"
            }`}
          >
            {muted
              ? "🔇"
              : "🎤"}
          </button>

          {/* END */}
          <button
            onClick={
              endCall
            }
            className="bg-red-600 hover:bg-red-700 w-14 h-14 rounded-full text-2xl flex items-center justify-center transition"
          >
            ❌
          </button>

        </div>
      </div>
    </div>
  );
};

export default VoiceCall;