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

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        setIncomingCall,
        showIncomingCall,
        setShowIncomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () =>
  useContext(CallContext);