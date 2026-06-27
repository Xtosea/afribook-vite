import { useCallback, useRef, useState } from "react";

import {
  createPeerConnection,
  addLocalTracks,
  closePeer,
} from "./rtc";

const usePeerConnection = () => {

  // ===============================
  // STATE
  // ===============================

  const [remoteStream, setRemoteStream] =
    useState(null);

  const [connectionState, setConnectionState] =
    useState("new");

  const [iceConnectionState, setIceConnectionState] =
    useState("new");

  // ===============================
  // REFS
  // ===============================

  const peerRef =
    useRef(null);

  const remoteCandidatesRef =
    useRef([]);

  // ===============================
  // CREATE PEER
  // ===============================

  const createPeer =
    useCallback((localStream) => {

      if (peerRef.current) {
        return peerRef.current;
      }

      const peer =
        createPeerConnection();

      peerRef.current =
        peer;

      if (localStream) {
        addLocalTracks(
          peer,
          localStream
        );
      }

      // ============================
      // REMOTE TRACK
      // ============================

      peer.ontrack =
        (event) => {

          if (
            event.streams &&
            event.streams.length
          ) {

            setRemoteStream(
              event.streams[0]
            );

          }

        };

      // ============================
      // CONNECTION STATE
      // ============================

      peer.onconnectionstatechange =
        () => {

          setConnectionState(
            peer.connectionState
          );

        };

      // ============================
      // ICE STATE
      // ============================

      peer.oniceconnectionstatechange =
        () => {

          setIceConnectionState(
            peer.iceConnectionState
          );

        };

      return peer;

    }, []);

  // ===============================
  // CLOSE PEER
  // ===============================

  const destroyPeer =
    useCallback(() => {

      if (!peerRef.current)
        return;

      closePeer(
        peerRef.current
      );

      peerRef.current =
        null;

      setRemoteStream(
        null
      );

      setConnectionState(
        "closed"
      );

      setIceConnectionState(
        "closed"
      );

      remoteCandidatesRef.current =
        [];

    }, []);

  // ====================================================
  // PART 2 STARTS HERE
  // createOffer()
  // createAnswer()
  // setRemoteDescription()
  // ICE handling
  // ====================================================

// ===============================
  // CREATE OFFER
  // ===============================

  const createOffer =
    useCallback(async () => {

      if (!peerRef.current)
        throw new Error(
          "Peer connection not created."
        );

      const offer =
        await peerRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

      await peerRef.current.setLocalDescription(
        offer
      );

      return offer;

    }, []);

  // ===============================
  // CREATE ANSWER
  // ===============================

  const createAnswer =
    useCallback(async () => {

      if (!peerRef.current)
        throw new Error(
          "Peer connection not created."
        );

      const answer =
        await peerRef.current.createAnswer();

      await peerRef.current.setLocalDescription(
        answer
      );

      return answer;

    }, []);

  // ===============================
  // SET REMOTE DESCRIPTION
  // ===============================

  const setRemoteDescription =
    useCallback(async (description) => {

      if (!peerRef.current)
        throw new Error(
          "Peer connection not created."
        );

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(
          description
        )
      );

      // Flush queued ICE candidates

      while (
        remoteCandidatesRef.current.length
      ) {

        const candidate =
          remoteCandidatesRef.current.shift();

        try {

          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

        } catch (err) {

          console.error(
            "ICE Candidate Error:",
            err
          );

        }

      }

    }, []);

  // ===============================
  // ADD ICE CANDIDATE
  // ===============================

  const addIceCandidate =
    useCallback(async (candidate) => {

      if (!peerRef.current)
        return;

      if (
        peerRef.current.remoteDescription &&
        peerRef.current.remoteDescription.type
      ) {

        try {

          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

        } catch (err) {

          console.error(
            "Failed to add ICE candidate:",
            err
          );

        }

      } else {

        remoteCandidatesRef.current.push(
          candidate
        );

      }

    }, []);

  // ===============================
  // GET PEER INSTANCE
  // ===============================

  const getPeer =
    useCallback(() => {

      return peerRef.current;

    }, []);




  // ===============================
  // RESET PEER
  // ===============================

  const resetPeer =
    useCallback(() => {

      destroyPeer();

      peerRef.current = null;

      remoteCandidatesRef.current = [];

      setRemoteStream(null);

      setConnectionState("new");

      setIceConnectionState("new");

    }, [destroyPeer]);

  // ===============================
  // CLEANUP
  // ===============================

  useEffect(() => {

    return () => {

      destroyPeer();

    };

  }, [destroyPeer]);

  // ===============================
  // EXPORT HOOK
  // ===============================

  return {

    // refs
    peerRef,

    // state
    remoteStream,
    connectionState,
    iceConnectionState,

    // peer methods
    createPeer,
    destroyPeer,
    resetPeer,
    getPeer,

    // SDP
    createOffer,
    createAnswer,
    setRemoteDescription,

    // ICE
    addIceCandidate,

  };

};

export default usePeerConnection;