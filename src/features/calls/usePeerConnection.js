import {
  useRef,
  useState,
  useCallback,
} from "react";

import {
  createPeerConnection,
  addLocalTracks,
  closePeerConnection,
} from "./rtc";

const usePeerConnection = () => {

  // ===============================
  // REFS
  // ===============================

  const peerRef = useRef(null);

  // ===============================
  // STATE
  // ===============================

  const [remoteStream, setRemoteStream] =
    useState(null);

  const [connectionState, setConnectionState] =
    useState("new");

  const [
    iceConnectionState,
    setIceConnectionState,
  ] = useState("new");

  // ===============================
  // CREATE PEER
  // ===============================

  const createPeer = useCallback(
    (localStream) => {

      if (peerRef.current) {
        return peerRef.current;
      }

      const peer =
        createPeerConnection();

      peerRef.current = peer;

      // -------------------------------
      // Add local media
      // -------------------------------

      if (localStream) {
        addLocalTracks(
          peer,
          localStream
        );
      }

      // -------------------------------
      // Remote stream
      // -------------------------------

      const incomingStream =
        new MediaStream();

      setRemoteStream(
        incomingStream
      );

      peer.ontrack = (event) => {

        event.streams[0]
          .getTracks()
          .forEach((track) => {

            incomingStream.addTrack(
              track
            );

          });

      };

      // -------------------------------
      // Connection state
      // -------------------------------

      peer.onconnectionstatechange =
        () => {

          setConnectionState(
            peer.connectionState
          );

        };

      // -------------------------------
      // ICE state
      // -------------------------------

      peer.oniceconnectionstatechange =
        () => {

          setIceConnectionState(
            peer.iceConnectionState
          );

        };

      return peer;

    },
    []
  );

  // ===============================
  // CREATE OFFER
  // ===============================

  const createOffer =
    useCallback(async () => {

      const peer =
        peerRef.current;

      if (!peer) {
        throw new Error(
          "Peer not created."
        );
      }

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      return offer;

    }, []);

  // ===============================
  // CREATE ANSWER
  // ===============================

  const createAnswer =
    useCallback(async () => {

      const peer =
        peerRef.current;

      if (!peer) {
        throw new Error(
          "Peer not created."
        );
      }

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      return answer;

    }, []);

  // ===============================
  // SET REMOTE DESCRIPTION
  // ===============================

  const setRemoteDescription =
    useCallback(
      async (description) => {

        const peer =
          peerRef.current;

        if (!peer) {
          return;
        }

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            description
          )
        );

      },
      []
    );

  // ===============================
  // ADD ICE CANDIDATE
  // ===============================

  const addIceCandidate =
    useCallback(
      async (candidate) => {

        const peer =
          peerRef.current;

        if (
          !peer ||
          !candidate
        ) {
          return;
        }

        try {

          await peer.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

        } catch (err) {

          console.error(
            "ICE candidate error:",
            err
          );

        }

      },
      []
    );

  // ===============================
  // DESTROY PEER
  // ===============================

  const destroyPeer =
    useCallback(() => {

      if (
        peerRef.current
      ) {

        closePeerConnection(
          peerRef.current
        );

        peerRef.current =
          null;

      }

      setRemoteStream(
        null
      );

      setConnectionState(
        "new"
      );

      setIceConnectionState(
        "new"
      );

    }, []);

  // ===============================
  // RETURN
  // ===============================

  return {

    peerRef,

    remoteStream,

    connectionState,

    iceConnectionState,

    createPeer,

    createOffer,

    createAnswer,

    setRemoteDescription,

    addIceCandidate,

    destroyPeer,

  };

};

export default usePeerConnection;