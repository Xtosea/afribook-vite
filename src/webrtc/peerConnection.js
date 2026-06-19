export const createPeerConnection = (
  onIceCandidate,
  onRemoteStream
) => {

  const pc =
    new RTCPeerConnection({
      iceServers: [
        {
          urls:
            "stun:stun.l.google.com:19302",
        },
      ],
    });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(
        event.candidate
      );
    }
  };

  pc.ontrack = (event) => {
    onRemoteStream(
      event.streams[0]
    );
  };

  return pc;
};