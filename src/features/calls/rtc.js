// src/features/calls/rtc.js

// =====================================
// AfriBook WebRTC Utilities
// =====================================

// Public STUN server.
// Later we'll add TURN servers here.
export const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

// =====================================
// Create Peer Connection
// =====================================
export const createPeerConnection = () => {
  const peer = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
  });

  return peer;
};

// =====================================
// Add Local Tracks
// =====================================
export const addLocalTracks = (
  peer,
  stream
) => {
  if (!peer || !stream) return;

  stream
    .getTracks()
    .forEach((track) => {
      peer.addTrack(track, stream);
    });
};

// =====================================
// Get User Media
// =====================================
export const getLocalStream = async ({
  video = false,
  audio = true,
} = {}) => {
  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });

    return stream;
  } catch (err) {
    console.error(
      "Failed to get media:",
      err
    );

    throw err;
  }
};

// =====================================
// Stop Stream
// =====================================
export const stopStream = (
  stream
) => {
  if (!stream) return;

  stream
    .getTracks()
    .forEach((track) =>
      track.stop()
    );
};

// =====================================
// Close Peer
// =====================================
export const closePeer = (
  peer
) => {
  if (!peer) return;

  peer.ontrack = null;
  peer.onicecandidate = null;
  peer.onconnectionstatechange =
    null;
  peer.oniceconnectionstatechange =
    null;

  peer.close();
};

// =====================================
// Toggle Microphone
// =====================================
export const toggleMicrophone = (
  stream,
  enabled
) => {
  if (!stream) return;

  stream
    .getAudioTracks()
    .forEach((track) => {
      track.enabled = enabled;
    });
};

// =====================================
// Toggle Camera
// =====================================
export const toggleCamera = (
  stream,
  enabled
) => {
  if (!stream) return;

  stream
    .getVideoTracks()
    .forEach((track) => {
      track.enabled = enabled;
    });
};

// =====================================
// Replace Track
// (Used when switching cameras)
// =====================================
export const replaceTrack = async (
  peer,
  oldTrack,
  newTrack
) => {
  if (!peer) return;

  const sender =
    peer
      .getSenders()
      .find(
        (sender) =>
          sender.track === oldTrack
      );

  if (sender) {
    await sender.replaceTrack(
      newTrack
    );
  }
};

// =====================================
// Get Connection State
// =====================================
export const getConnectionState =
  (peer) => {
    if (!peer)
      return "disconnected";

    return (
      peer.connectionState ||
      "new"
    );
  };

// =====================================
// Is Browser Supported
// =====================================
export const isWebRTCSupported =
  () => {
    return !!(
      window.RTCPeerConnection &&
      navigator.mediaDevices &&
      navigator.mediaDevices
        .getUserMedia
    );
  };

// =====================================
// Default Call Timeout
// =====================================
export const CALL_TIMEOUT =
  30000;

// =====================================
// ICE Gathering Timeout
// =====================================
export const ICE_TIMEOUT =
  10000;

// =====================================
// Default Audio Constraints
// =====================================
export const AUDIO_CONSTRAINTS =
  {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

// =====================================
// Default Video Constraints
// =====================================
export const VIDEO_CONSTRAINTS =
  {
    width: {
      ideal: 1280,
    },
    height: {
      ideal: 720,
    },
    facingMode: "user",
  };