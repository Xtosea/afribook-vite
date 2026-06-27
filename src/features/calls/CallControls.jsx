import React from "react";

const CallControls = ({
  microphoneEnabled,
  cameraEnabled = true,
  video = false,
  speakerEnabled = true,

  onToggleMicrophone,
  onToggleCamera,
  onToggleSpeaker,
  onEndCall,
}) => {

  return (

    <div className="flex justify-center items-center gap-4 mt-8">

      {/* Speaker */}

      <button
        onClick={onToggleSpeaker}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
          speakerEnabled
            ? "bg-blue-600"
            : "bg-gray-700"
        }`}
      >
        {speakerEnabled ? "🔊" : "🔈"}
      </button>

      {/* Microphone */}

      <button
        onClick={onToggleMicrophone}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
          microphoneEnabled
            ? "bg-gray-700"
            : "bg-yellow-600"
        }`}
      >
        {microphoneEnabled ? "🎤" : "🔇"}
      </button>

      {/* Camera */}

      {video && (

        <button
          onClick={onToggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
            cameraEnabled
              ? "bg-gray-700"
              : "bg-yellow-600"
          }`}
        >
          {cameraEnabled ? "📷" : "🚫"}
        </button>

      )}

      {/* End Call */}

      <button
        onClick={onEndCall}
        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-2xl transition"
      >
        📞
      </button>

    </div>

  );

};

export default CallControls;