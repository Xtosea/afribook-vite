// VoiceCall.jsx
// Native WebRTC replacement skeleton for AfriBook.
// NOTE: This is a complete starting implementation using RTCPeerConnection.
// It matches your existing Socket.IO events:
// call-user, answer-call, ice-candidate, end-call.

import React, { useEffect, useRef, useState } from "react";

export default function VoiceCall({
  currentUser,
  selectedUser,
  socket,
  onClose,
  defaultProfile,
}) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  const localStream = useRef(null);
  const remoteAudio = useRef(null);
  const pc = useRef(null);
  const pendingOffer = useRef(null);
  const remoteId = useRef(null);

  async function createPeer() {
    if (pc.current) return pc.current;
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.current.getTracks().forEach(t => peer.addTrack(t, localStream.current));

    peer.ontrack = e => {
      if (remoteAudio.current) remoteAudio.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = e => {
      if (e.candidate && remoteId.current) {
        socket.emit("ice-candidate", {
          to: remoteId.current,
          from: currentUser._id,
          candidate: e.candidate,
        });
      }
    };

    pc.current = peer;
    return peer;
  }

  useEffect(() => {
    (async () => {
      localStream.current = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    })();

    socket.on("incoming-call", ({from,signal})=>{
      remoteId.current = from;
      pendingOffer.current = signal;
      setReceivingCall(true);
    });

    socket.on("call-accepted", async answer=>{
      const peer = pc.current;
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    });

    socket.on("ice-candidate", async ({candidate})=>{
      if (pc.current && candidate) {
        try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
    });

    socket.on("call-ended", ()=>{
      pc.current?.close();
      pc.current=null;
      onClose();
    });

    return ()=> {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
      pc.current?.close();
      localStream.current?.getTracks().forEach(t=>t.stop());
    };
  }, []);

  async function callUser() {
    remoteId.current = selectedUser._id;
    const peer = await createPeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("call-user", {
      to:selectedUser._id,
      from:currentUser._id,
      signal:offer,
      callType:"voice"
    });
  }

  async function answerCall() {
    const peer = await createPeer();
    await peer.setRemoteDescription(new RTCSessionDescription(pendingOffer.current));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer-call",{
      to:remoteId.current,
      signal:answer
    });
    setReceivingCall(false);
    setCallAccepted(true);
  }

  function endCall(){
    socket.emit("end-call",{to:remoteId.current||selectedUser?._id});
    pc.current?.close();
    pc.current=null;
    onClose();
  }

  function toggleMute(){
    const next=!muted;
    setMuted(next);
    localStream.current?.getAudioTracks().forEach(t=>t.enabled=!next);
  }

  useEffect(()=>{
    if(remoteAudio.current) remoteAudio.current.muted=!speaker;
  },[speaker]);

  useEffect(()=>{
    if(selectedUser && !receivingCall && !callAccepted && localStream.current){
      callUser();
    }
  },[selectedUser]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <audio ref={remoteAudio} autoPlay />
      <div className="bg-gray-900 rounded-2xl p-6 text-white text-center w-80">
        <img src={selectedUser?.profilePic||defaultProfile} className="w-24 h-24 rounded-full mx-auto"/>
        <h2 className="mt-4 text-xl">{selectedUser?.name}</h2>
        <p>{callAccepted?"Connected":receivingCall?"Incoming call":"Calling..."}</p>
        {receivingCall && <button onClick={answerCall}>Answer</button>}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={()=>setSpeaker(s=>!s)}>{speaker?"🔊":"🔈"}</button>
          <button onClick={toggleMute}>{muted?"🔇":"🎤"}</button>
          <button onClick={endCall}>❌</button>
        </div>
      </div>
    </div>
  );
}
