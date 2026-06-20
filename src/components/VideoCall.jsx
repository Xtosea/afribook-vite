import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Peer from "simple-peer";
import { connectSocket } from "../socket";


const VideoCall = ({
  currentUser,
  selectedUser,
  onClose,
}) => {


  const socket = useRef(
    connectSocket()
  ).current;


  const [stream, setStream] =
    useState(null);

  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [caller, setCaller] =
    useState(null);

  const [callAccepted, setCallAccepted] =
    useState(false);


  const [micOn, setMicOn] =
    useState(true);

  const [cameraOn, setCameraOn] =
    useState(true);


  const myVideo =
    useRef(null);

  const userVideo =
    useRef(null);

  const connectionRef =
    useRef(null);



  // ================= MEDIA =================

  useEffect(() => {

    let media;


    const startMedia = async () => {

      try {

        media =
          await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true,
          });


        setStream(media);


        if(myVideo.current){
          myVideo.current.srcObject =
            media;
        }


      } catch(err){

        console.log(
          "Media error",
          err
        );

      }

    };


    startMedia();


    return () => {

      media?.getTracks()
      .forEach(track =>
        track.stop()
      );

    };


  },[]);



  // ================= SOCKET =================


  useEffect(() => {


    const incomingCall =
    (data)=>{

      if(
        data.callType !== "video"
      ) return;


      setReceivingCall(true);

      setCallerSignal(
        data.signal
      );

      setCaller(
        data.from
      );

    };



    const accepted =
    (signal)=>{

      setCallAccepted(true);


      connectionRef.current
      ?.signal(signal);

    };



    const ended = ()=>{

      cleanupCall();

    };



    socket.on(
      "incoming-call",
      incomingCall
    );


    socket.on(
      "call-accepted",
      accepted
    );


    socket.on(
      "call-ended",
      ended
    );



    return ()=>{

      socket.off(
        "incoming-call",
        incomingCall
      );


      socket.off(
        "call-accepted",
        accepted
      );


      socket.off(
        "call-ended",
        ended
      );

    };


  },[socket]);




  // ================= CLEANUP =================


  const cleanupCall = ()=>{


    connectionRef.current
    ?.destroy();


    connectionRef.current = null;



    stream?.getTracks()
    .forEach(track =>
      track.stop()
    );


    if(myVideo.current)
      myVideo.current.srcObject=null;


    if(userVideo.current)
      userVideo.current.srcObject=null;



    setCallAccepted(false);
    setReceivingCall(false);


    onClose();

  };





  // ================= CREATE PEER =================


  const createPeer = (
    initiator
  )=>{


    const peer =
    new Peer({

      initiator,

      trickle:false,

      stream,


      config:{
        iceServers:[
          {
            urls:[
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
            ]
          }
        ]
      }

    });



    peer.on(
      "error",
      err=>{
        console.log(
          "Peer error",
          err
        );
      }
    );


    peer.on(
      "close",
      ()=>{
        console.log(
          "Peer closed"
        );
      }
    );



    peer.on(
      "stream",
      remoteStream=>{

        if(userVideo.current){

          userVideo.current.srcObject =
            remoteStream;

        }

      }
    );



    return peer;

  };





  // ================= START CALL =================


  const callUser = ()=>{


    if(!stream)return;



    const peer =
      createPeer(true);



    peer.on(
      "signal",
      signal=>{


        socket.emit(
          "call-user",
          {

            to:selectedUser._id,

            from:currentUser,

            signal,

            callType:"video"

          }
        );


      }
    );



    connectionRef.current =
      peer;


  };






  // ================= ANSWER =================


  const answerCall = ()=>{


    if(!stream)return;



    setCallAccepted(true);



    const peer =
      createPeer(false);



    peer.on(
      "signal",
      signal=>{


        socket.emit(
          "answer-call",
          {

            signal,

            to:
            caller?._id

          }
        );


      }
    );



    peer.signal(
      callerSignal
    );


    connectionRef.current =
      peer;


  };






  // ================= END =================


  const endCall = ()=>{


    socket.emit(
      "end-call",
      {
        to:selectedUser._id
      }
    );


    cleanupCall();

  };






  const toggleMic = ()=>{


    stream?.getAudioTracks()
    .forEach(track=>{

      track.enabled =
      !track.enabled;

    });


    setMicOn(
      !micOn
    );

  };





  const toggleCamera = ()=>{


    stream?.getVideoTracks()
    .forEach(track=>{

      track.enabled =
      !track.enabled;

    });


    setCameraOn(
      !cameraOn
    );

  };





  return (

<div className="fixed inset-0 bg-black z-50 flex flex-col">


<div className="flex-1 relative">


<video
ref={userVideo}
autoPlay
playsInline
className="w-full h-full object-cover"
/>



<video
ref={myVideo}
autoPlay
muted
playsInline
className="absolute bottom-5 right-5 w-32 h-44 rounded-xl border"
/>



<div className="absolute top-5 left-5 text-white">

<h2 className="text-2xl font-bold">
{selectedUser?.name}
</h2>


<p>

{
callAccepted
?
"Connected"
:
receivingCall
?
"Incoming call"
:
"Calling..."
}

</p>


</div>


</div>





<div className="bg-black/80 p-5 flex justify-center gap-5">


{
receivingCall &&
!callAccepted &&

<button
onClick={answerCall}
className="bg-green-600 px-5 py-3 rounded-xl"
>
Answer
</button>
}




{
!receivingCall &&
!callAccepted &&

<button
onClick={callUser}
className="bg-blue-600 px-5 py-3 rounded-xl"
>
Call
</button>
}





<button
onClick={toggleMic}
className="w-16 h-16 rounded-full bg-gray-700"
>

{
micOn?"🎤":"🔇"
}

</button>




<button
onClick={toggleCamera}
className="w-16 h-16 rounded-full bg-gray-700"
>

{
cameraOn?"📹":"🚫"
}

</button>




<button
onClick={endCall}
className="w-16 h-16 rounded-full bg-red-600"
>

📞

</button>



</div>


</div>

  );

};


export default VideoCall;