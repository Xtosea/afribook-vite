import React, {
useEffect,
useState,
useRef,
} from "react";

import Peer from "simple-peer";

const VoiceCall = ({
currentUser,
selectedUser,
socket,
onClose,
defaultProfile,
}) => {
const [muted, setMuted] =
useState(false);

const [speaker, setSpeaker] =
useState(true);

const [receivingCall, setReceivingCall] =
useState(false);

const [caller, setCaller] =
useState(null);

const [callerSignal, setCallerSignal] =
useState(null);

const [callAccepted, setCallAccepted] =
useState(false);
const [micReady, setMicReady] = useState(false);


const localStreamRef =
useRef(null);

const remoteAudioRef =
useRef(null);

const connectionRef =
useRef(null);

const ringtoneRef = useRef(null);
const callingRef = useRef(null);



// =========================
// GET MICROPHONE
// =========================

useEffect(() => {
const getMic = async () => {
try {
const stream =
await navigator.mediaDevices.getUserMedia({
audio: true,
video: false,
});


localStreamRef.current = stream;
setMicReady(true);

    localStreamRef.current =
      stream;
  } catch (err) {
    console.error(err);

    alert(
      "Microphone permission denied"
    );

    onClose();
  }
};

getMic();

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

  connectionRef.current?.destroy();
};

}, [onClose]);


const handleIncomingCall = ({ from, signal }) => {
console.log("📥 INCOMING CALL", from);

  setReceivingCall(true);
  setCaller(from);
  setCallerSignal(signal);

  if (ringtoneRef.current) {
    ringtoneRef.current
      .play()
      .catch((err) =>
        console.log("Ringtone blocked:", err)
      );
  }
};

// =========================
// INCOMING CALL
// =========================

useEffect(() => {
ringtoneRef.current
  ?.play()
  .then(() => {
    console.log("Ringtone playing");
  })
  .catch((err) => {
    console.error(
      "Ringtone blocked:",
      err
    );
  });
  

socket.on(
  "incoming-call",
  handleIncomingCall
);

return () => {
  socket.off(
    "incoming-call",
    handleIncomingCall
  );
};

}, [socket]);

// =========================
// CALL ACCEPTED
// =========================

useEffect(() => {

const handleAccepted = (signal) => {
console.log("✅ CALL ACCEPTED");


setCallAccepted(true);


// STOP CALLING TONE HERE
if (callingRef.current) {
  callingRef.current.pause();
  callingRef.current.currentTime = 0;
}


if (
connectionRef.current
) {
connectionRef.current.signal(
signal
);
}

};


socket.on(
"call-accepted",
handleAccepted
);


return () => {
socket.off(
"call-accepted",
handleAccepted
);
};


}, [socket]);
// =========================
// CALL ENDED
// =========================

useEffect(() => {
const handleEnded = () => {
connectionRef.current?.destroy();

ringtoneRef.current?.pause();
callingRef.current?.pause();

ringtoneRef.current.currentTime = 0;
callingRef.current.currentTime = 0;

  if (
    localStreamRef.current
  ) {
    localStreamRef.current
      .getTracks()
      .forEach((track) =>
        track.stop());
  }

  onClose();
};

socket.on(
  "call-ended",
  handleEnded
);

return () => {
  socket.off(
    "call-ended",
    handleEnded
  );
};

}, [socket, onClose]);

// =========================
// START CALL
// =========================

const callUser = () => {
if (
!localStreamRef.current
)
return;

if (callingRef.current) {
  callingRef.current
    .play()
    .catch(err =>
      console.log(
        "Calling sound blocked:",
        err
      )
    );
}

console.log("===== START CALL =====");
console.log("selectedUser:", selectedUser);
console.log("currentUser:", currentUser);
console.log("socket connected:", socket?.connected);
console.log("stream:", localStreamRef.current);
console.log("Peer:", Peer);

const peer =
  new Peer({
    initiator: true,
    trickle: false,
    stream:
      localStreamRef.current,

    config: {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
          ],
        },
      ],
    },
  });
console.log("Creating Peer...");
console.log("Peer created successfully");






peer.on("signal", (signal) => {

  console.log("📤 OFFER SENT", signal);

  socket.emit("call-user", {
    to: selectedUser._id,
    from: currentUser._id,
    signal,
    callType: "voice",
  });

});

peer.on(
  "stream",
  (remoteStream) => {

console.log("🎧 REMOTE AUDIO RECEIVED");

    if (
      remoteAudioRef.current
    ) {
      remoteAudioRef.current.srcObject =
        remoteStream;
    }
  }
);

connectionRef.current =
  peer;

};

// =========================
// ANSWER CALL
// =========================

const answerCall = () => {
if (
!localStreamRef.current
)
return;

ringtoneRef.current?.pause();
ringtoneRef.current.currentTime = 0;

setCallAccepted(true);

const peer =
  new Peer({
    initiator: false,
    trickle: false,
    stream:
      localStreamRef.current,

    config: {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
          ],
        },
      ],
    },
  });

peer.on(
  "signal",
  (signal) => {

console.log("📤 ANSWER SENT", signal);


    socket.emit(
      "answer-call",
      {
        signal,
        to: caller,
      }
    );
  }
);

peer.on(
  "stream",
  (remoteStream) => {
    if (
      remoteAudioRef.current
    ) {
      remoteAudioRef.current.srcObject =
        remoteStream;
    }
  }
);

peer.signal(
  callerSignal
);

connectionRef.current =
  peer;

};

// =========================
// END CALL
// =========================

const endCall = () => {
socket.emit(
"end-call",
{
to:
selectedUser._id,
}
);


ringtoneRef.current?.pause();
callingRef.current?.pause();

ringtoneRef.current.currentTime = 0;
callingRef.current.currentTime = 0;

connectionRef.current?.destroy();

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

// =========================
// MUTE
// =========================

const toggleMute = () => {
const next =
!muted;

setMuted(next);

localStreamRef.current
  ?.getAudioTracks()
  .forEach((track) => {
    track.enabled =
      !next;
  });

};

// =========================
// SPEAKER
// =========================

useEffect(() => {
if (
remoteAudioRef.current
) {
remoteAudioRef.current.muted =
!speaker;
}
}, [speaker]);


useEffect(() => {
  if (
    selectedUser &&
    micReady &&
    !receivingCall &&
    !callAccepted
  ) {
    callUser();
  }
}, [
  selectedUser,
  micReady,
  receivingCall,
  callAccepted,
]);



return (
<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">

  <div className="bg-gray-900 text-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">

    <audio
      ref={remoteAudioRef}
      autoPlay
    />

      <audio
  ref={ringtoneRef}
  src="/sounds/ringtone.mp3"
  loop
/>

<audio
  ref={callingRef}
  src="/sounds/calling.mp3"
  loop
/>

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

    <p className="text-gray-300 mt-2">
      {callAccepted
        ? "Connected"
        : "Calling..."}
    </p>

    {receivingCall &&
      !callAccepted && (
        <button
          onClick={
            answerCall
          }
          className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl mt-5"
        >
          Answer Call
        </button>
      )}

    <div className="flex justify-center gap-5 mt-10">

      <button
        onClick={() =>
          setSpeaker(
            !speaker
          )
        }
        className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center ${
          speaker
            ? "bg-blue-500"
            : "bg-gray-700"
        }`}
      >
        {speaker
          ? "🔊"
          : "🔈"}
      </button>

   

      <button
        onClick={
          toggleMute
        }
        className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center ${
          muted
            ? "bg-red-500"
            : "bg-gray-700"
        }`}
      >
        {muted
          ? "🔇"
          : "🎤"}
      </button>

      <button
        onClick={
          endCall
        }
        className="bg-red-600 hover:bg-red-700 w-14 h-14 rounded-full text-2xl flex items-center justify-center"
      >
        ❌
      </button>

    </div>

    {!receivingCall && (
      <button
        onClick={
          callUser
        }
        className="hidden"
      />
    )}
  </div>
</div>

);
};

export default VoiceCall;
