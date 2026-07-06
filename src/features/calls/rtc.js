// src/features/calls/rtc.js

// =====================================
// ICE SERVERS
// =====================================

// STUN servers help peers discover their
// public IP addresses.
//
// TURN servers will be added later for
// production reliability.
export const ICE_SERVERS = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
    ],
  },
];

// =====================================
// PEER CONNECTION CONFIG
// =====================================

export const RTC_CONFIGURATION = {
  iceServers: ICE_SERVERS,

  iceCandidatePoolSize: 10,
};

// =====================================
// CREATE PEER CONNECTION
// =====================================

export const createPeerConnection = () => {
  return new RTCPeerConnection(
    RTC_CONFIGURATION
  );
};

// =====================================
// ADD LOCAL TRACKS
// =====================================

export const addLocalTracks = (
  peer,
  stream
) => {
  if (!peer || !stream) return;

  stream.getTracks().forEach((track) => {
    peer.addTrack(track, stream);
  });
};

// =====================================
// CLOSE PEER CONNECTION
// =====================================

export const closePeerConnection = (
  peer
) => {
  if (!peer) return;

  try {
    peer.ontrack = null;

    peer.onicecandidate = null;

    peer.onconnectionstatechange =
      null;

    peer.oniceconnectionstatechange =
      null;

    peer.getSenders().forEach(
      (sender) => {
        try {
          peer.removeTrack(sender);
        } catch {}
      }
    );

    peer.close();
  } catch (err) {
    console.error(
      "Failed to close peer:",
      err
    );
  }
};