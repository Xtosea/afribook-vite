import {
  createContext,
  useContext,
  useState,
} from "react";

const CallContext = createContext();

export const CallProvider = ({
  children,
}) => {

  const [incomingCall, setIncomingCall] =
    useState(null);

  const [showIncomingCall, setShowIncomingCall] =
    useState(false);

const [pendingCall, setPendingCall] =
  useState(null);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        setIncomingCall,
        showIncomingCall,
        setShowIncomingCall,
        pendingCall,
        setPendingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () =>
  useContext(CallContext);