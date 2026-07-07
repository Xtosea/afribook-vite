import { useEffect } from "react";

import {
  connectSocket,
} from "../../socket";

import {
  useCall,
} from "../../context/CallProvider";

const IncomingCallListener = () => {

  const {
    setIncomingCall,
    setShowIncomingCall,
  } = useCall();

  useEffect(() => {

    const socket = connectSocket();

    if (!socket) return;

    const handleIncomingCall = (data) => {

      console.log(
        "📞 Global incoming call:",
        data
      );

      setIncomingCall(data);

      setShowIncomingCall(true);
    };

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

  }, [
    setIncomingCall,
    setShowIncomingCall,
  ]);

  return null;
};

export default IncomingCallListener;