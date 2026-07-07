import { useNavigate } from "react-router-dom";

import {
  useCall,
} from "../../context/CallProvider.jsx";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const IncomingCallModal = () => {

  const navigate = useNavigate();

  const {
  incomingCall,
  showIncomingCall,
  setShowIncomingCall,
  setIncomingCall,

  pendingCall,
  setPendingCall,
} = useCall();

  if (!showIncomingCall || !incomingCall) {
    return null;
  }

  const decline = () => {
    setShowIncomingCall(false);
    setIncomingCall(null);
  };

  const answer = () => {

  setPendingCall(incomingCall);

  setShowIncomingCall(false);

  setIncomingCall(null);

  navigate("/messages/" + incomingCall.from);

};
  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">

      <div className="bg-white rounded-3xl p-8 w-[340px] text-center shadow-2xl">

        <img
          src={
            incomingCall.profilePic ||
            defaultProfile
          }
          className="w-28 h-28 rounded-full mx-auto object-cover"
          alt=""
        />

        <h2 className="text-2xl font-bold mt-4">
          Incoming Call
        </h2>

        <p className="text-gray-600 mt-2">
          {incomingCall.name || "Unknown User"}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          {incomingCall.callType === "video"
            ? "Video Call"
            : "Voice Call"}
        </p>

        <div className="flex justify-center gap-6 mt-8">

          <button
            onClick={decline}
            className="bg-red-500 text-white w-16 h-16 rounded-full text-2xl"
          >
            ✕
          </button>

          <button
            onClick={answer}
            className="bg-green-500 text-white w-16 h-16 rounded-full text-2xl"
          >
            📞
          </button>

        </div>

      </div>

    </div>
  );
};

export default IncomingCallModal;