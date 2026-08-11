// src/pages/PKBattle.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  connectSocket,
  getSocket,
  joinPK,
  leavePK,
  startPKLive,
  getPKState,
} from "../socket.js";

import { API_BASE, fetchWithToken } from "../api/api.js";

import { useParams, useNavigate } from "react-router-dom";


export default function PKBattle() {

  const { battleId } = useParams();
  const navigate = useNavigate();


  // ==========================================
  // STATE
  // ==========================================

  const [battle, setBattle] =
    useState(null);

  const [roomState, setRoomState] =
    useState(null);

  const [connected, setConnected] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const [finishing, setFinishing] =
    useState(false);


  // ==========================================
  // CURRENT USER
  // ==========================================

  const getCurrentUserId = useCallback(() => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        return null;
      }

      const payload =
        JSON.parse(
          atob(
            token
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

      return (
        payload?.id ||
        payload?._id ||
        payload?.userId ||
        null
      );

    } catch {

      return null;
    }

  }, []);


  const currentUserId =
    getCurrentUserId();


  // ==========================================
  // LOAD REAL PK
  // ==========================================

  const loadBattle = useCallback(
  async () => {
    if (!battleId) {
      setError("PK battle ID is missing");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view this PK battle.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      console.log("🥊 Loading PK battle:", {
        battleId,
        url: `${API_BASE}/api/pk/${battleId}`,
      });

      const data = await fetchWithToken(
        `${API_BASE}/api/pk/${battleId}`,
        token
      );

      console.log("🥊 PK battle response:", data);

      if (!data?.success || !data?.battle) {
        throw new Error(
          data?.message || "PK battle not found"
        );
      }

      setBattle(data.battle);

    } catch (error) {
      console.error("Load PK error:", error);

      setError(
        error?.message || "Failed to load PK"
      );

    } finally {
      setLoading(false);
    }
  },
  [battleId]
);

  useEffect(() => {

    loadBattle();

  }, [loadBattle]);


  // ==========================================
  // DETERMINE HOST
  // ==========================================

  const isHostA = useMemo(() => {

    if (!battle || !currentUserId) {
      return false;
    }

    return (
      battle.hostA?._id?.toString() ===
        currentUserId.toString() ||
      battle.hostA?.toString() ===
        currentUserId.toString()
    );

  }, [
    battle,
    currentUserId,
  ]);


  const isHostB = useMemo(() => {

    if (!battle || !currentUserId) {
      return false;
    }

    return (
      battle.hostB?._id?.toString() ===
        currentUserId.toString() ||
      battle.hostB?.toString() ===
        currentUserId.toString()
    );

  }, [
    battle,
    currentUserId,
  ]);


  const isHost =
    isHostA || isHostB;


  // ==========================================
  // HOST INFORMATION
  // ==========================================

  const hostA =
    battle?.hostA;

  const hostB =
    battle?.hostB;


  const hostAName =
    hostA?.name ||
    hostA?.username ||
    "Host A";


  const hostBName =
    hostB?.name ||
    hostB?.username ||
    "Host B";


  const hostAImage =
    hostA?.profilePic ||
    "/profile/default-profile.png";


  const hostBImage =
    hostB?.profilePic ||
    "/profile/default-profile.png";


  // ==========================================
  // SOCKET
  // ==========================================

  useEffect(() => {

  if (!battleId) {
    return;
  }

  const socket = connectSocket();

  if (!socket) {
    setError("Socket could not connect");
    return;
  }


  // ==========================================
  // SOCKET CONNECTED
  // ==========================================

  const handleConnect = () => {

    console.log(
      "🥊 PK Socket connected"
    );

    setConnected(true);

    // Automatically join this real PK
    joinPK(battleId);
  };


  // ==========================================
  // SOCKET DISCONNECTED
  // ==========================================

  const handleDisconnect = () => {

    console.log(
      "🔴 PK Socket disconnected"
    );

    setConnected(false);
  };


  // ==========================================
  // ROOM STATE
  // ==========================================

  const handleRoomState = (state) => {

    console.log(
      "🥊 PK room state:",
      state
    );

    setRoomState(state);

  };


  // ==========================================
  // PK STARTED
  // ==========================================

  const handleStarted = (state) => {

    console.log(
      "🚀 PK started:",
      state
    );

    setRoomState((previous) => ({
      ...(previous || {}),
      ...(state || {}),
      started: true,
    }));

    // Refresh MongoDB battle information
    loadBattle();

  };


  // ==========================================
  // SCORE UPDATED
  // ==========================================

  const handleScoreUpdate = (data) => {

    console.log(
      "🥊 PK score:",
      data
    );

    setRoomState((previous) => ({
      ...(previous || {}),

      hostAScore:
        data?.hostAScore ??
        previous?.hostAScore ??
        0,

      hostBScore:
        data?.hostBScore ??
        previous?.hostBScore ??
        0,
    }));

  };


  // ==========================================
  // PK FINISHED
  // ==========================================

  const handleFinished = (data) => {

    console.log(
      "🏆 PK finished:",
      data
    );

    setBattle((previous) => ({
      ...(previous || {}),

      status: "completed",

      endedAt:
        data?.endedAt ??
        new Date().toISOString(),

      hostAScore:
        data?.hostAScore ??
        previous?.hostAScore ??
        0,

      hostBScore:
        data?.hostBScore ??
        previous?.hostBScore ??
        0,

      winner:
        data?.winner ??
        null,
    }));


    setRoomState((previous) => ({
      ...(previous || {}),

      started: false,

      hostAScore:
        data?.hostAScore ??
        previous?.hostAScore ??
        0,

      hostBScore:
        data?.hostBScore ??
        previous?.hostBScore ??
        0,
    }));


    setSecondsLeft(0);

    setFinishing(false);

  };


  // ==========================================
  // SOCKET ERROR
  // ==========================================

  const handleError = (data) => {

    console.error(
      "❌ PK error:",
      data
    );

    setError(
      data?.message ||
      "PK error"
    );

    setFinishing(false);

  };


  // ==========================================
  // REGISTER LISTENERS
  // ==========================================

  socket.on(
    "connect",
    handleConnect
  );

  socket.on(
    "disconnect",
    handleDisconnect
  );

  socket.on(
    "pk:room-state",
    handleRoomState
  );

  socket.on(
    "pk:started",
    handleStarted
  );

  socket.on(
    "pk:score-updated",
    handleScoreUpdate
  );

  socket.on(
    "pk:finished",
    handleFinished
  );

  socket.on(
    "pk:error",
    handleError
  );


  // ==========================================
  // ALREADY CONNECTED
  // ==========================================

  if (socket.connected) {

    setConnected(true);

    joinPK(battleId);

  }


  // ==========================================
  // CLEANUP
  // ==========================================

  return () => {

    socket.off(
      "connect",
      handleConnect
    );

    socket.off(
      "disconnect",
      handleDisconnect
    );

    socket.off(
      "pk:room-state",
      handleRoomState
    );

    socket.off(
      "pk:started",
      handleStarted
    );

    socket.off(
      "pk:score-updated",
      handleScoreUpdate
    );

    socket.off(
      "pk:finished",
      handleFinished
    );

    socket.off(
      "pk:error",
      handleError
    );

  };

}, [
  battleId,
  loadBattle,
]);

// ==========================================
  // SCORE
  // ==========================================

  const hostAScore =
    roomState?.hostAScore ??
    battle?.hostAScore ??
    0;

  const hostBScore =
    roomState?.hostBScore ??
    battle?.hostBScore ??
    0;


  // ==========================================
  // STARTED
  // ==========================================

  const isStarted =
    roomState?.started ??
    battle?.status === "active";


  // ==========================================
  // START TIME
  // ==========================================

  useEffect(() => {

    if (!isStarted) {

      setSecondsLeft(0);

      return;
    }

    const startedAt =
      roomState?.startedAt ||
      battle?.startedAt;

    if (!startedAt) {
      return;
    }

    const duration =
      Number(
        battle?.duration || 300
      );


    const updateTimer = () => {

      const start =
        new Date(
          startedAt
        ).getTime();

      const end =
        start +
        duration * 1000;

      const remaining =
        Math.max(
          0,
          Math.ceil(
            (end - Date.now()) /
              1000
          )
        );

      setSecondsLeft(
        remaining
      );

    };


    updateTimer();

    const timer =
      setInterval(
        updateTimer,
        1000
      );


    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    isStarted,
    roomState?.startedAt,
    battle?.startedAt,
    battle?.duration,
  ]);


  // ==========================================
  // AUTO FINISH TIMER
  // ==========================================

  useEffect(() => {

    if (
      !isStarted ||
      secondsLeft !== 0 ||
      !isHost
    ) {
      return;
    }

    if (
      battle?.status !== "active"
    ) {
      return;
    }

    finishBattle();

  }, [
    secondsLeft,
    isStarted,
    isHost,
    battle?.status,
  ]);




  // ==========================================
  // PK UI HELPERS
  // ==========================================

  const totalDuration =
    Number(battle?.duration || 300);

  const scoreTotal =
    hostAScore + hostBScore;

  const hostAPercentage =
    scoreTotal > 0
      ? Math.round((hostAScore / scoreTotal) * 100)
      : 50;

  const hostBPercentage =
    scoreTotal > 0
      ? Math.round((hostBScore / scoreTotal) * 100)
      : 50;

  const isFinalCountdown =
    isStarted &&
    secondsLeft > 0 &&
    secondsLeft <= 10;

  const leadingHost =
    hostAScore > hostBScore
      ? "A"
      : hostBScore > hostAScore
      ? "B"
      : "DRAW";


  // ==========================================
  // FORMAT TIMER
  // ==========================================

  const formattedTime = () => {

    const minutes =
      Math.floor(
        secondsLeft / 60
      );

    const seconds =
      secondsLeft % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;

  };


  // ==========================================
  // START PK
  // ==========================================

  const handleStart = () => {

    setError("");

    if (!connected) {

      setError(
        "Socket is not connected"
      );

      return;
    }

    if (!isHost) {

      setError(
        "Only a PK host can start the battle"
      );

      return;
    }

    startPKLive(
      battleId
    );

  };


  // ==========================================
  // SCORE
  // ==========================================

  const handleScore = (
    points
  ) => {

    setError("");

    const socket =
      getSocket();

    if (!socket?.connected) {

      setError(
        "Socket is not connected"
      );

      return;
    }

    if (!isStarted) {

      setError(
        "PK has not started"
      );

      return;
    }

    if (!isHost) {

      setError(
        "You are not a host of this PK"
      );

      return;
    }


    socket.emit(
      "pk:score",
      {
        battleId,
        points,
      }
    );

  };


  // ==========================================
  // FINISH PK
  // ==========================================

  function finishBattle() {
  if (finishing) {
    return;
  }

  const socket = getSocket();

  if (!socket?.connected) {
    setError("Socket is not connected");
    return;
  }

  setFinishing(true);
  setError("");

  socket.emit("pk:finish", {
    battleId,
  });
}





  // ==========================================
  // LEAVE
  // ==========================================

  const handleLeave = () => {

    leavePK(
      battleId
    );

    navigate(
      "/"
    );

  };


  // ==========================================
  // WINNER
  // ==========================================

  const winnerId =
    battle?.winner?._id ||
    battle?.winner;


  const winnerName =
    winnerId &&
    winnerId.toString() ===
      (
        hostA?._id ||
        hostA
      )?.toString()
      ? hostAName
      : winnerId
      ? hostBName
      : null;


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">
            🥊
          </div>

          <p>
            Loading PK battle...
          </p>
        </div>
      </div>
    );

  }


  // ==========================================
  // ERROR WITHOUT BATTLE
  // ==========================================

  if (!battle) {

    return (
      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="text-center">

          <div className="text-5xl mb-4">
            ❌
          </div>

          <h2 className="text-xl font-bold">
            PK unavailable
          </h2>

          <p className="text-red-500 mt-2">
            {error || "PK battle not found"}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 px-5 py-2 rounded-lg bg-gray-900 text-white"
          >
            Go Back
          </button>

        </div>

      </div>
    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">

      <div className="max-w-5xl mx-auto">


        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div>

            <h1 className="text-2xl font-bold">
              🥊 PK Battle
            </h1>

            <p className="text-sm text-gray-400">
              {connected
                ? "🟢 Live connection"
                : "🔴 Connecting..."}
            </p>

          </div>


          <button
            onClick={handleLeave}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            Leave
          </button>

        </div>


                {/* BATTLE */}

        <div className="rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden shadow-2xl">

          {/* STATUS */}

          <div className="text-center p-5 border-b border-gray-800">

            {isStarted ? (

              <div className="flex flex-col items-center">

                <div
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${
                    isFinalCountdown
                      ? "bg-red-600/30 text-red-300 animate-pulse"
                      : "bg-red-600/20 text-red-400"
                  }`}
                >

                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />

                  LIVE PK

                </div>

                <div
                  className={`text-5xl sm:text-6xl font-black mt-4 tracking-wider ${
                    isFinalCountdown
                      ? "text-red-400 animate-pulse"
                      : "text-white"
                  }`}
                >
                  {formattedTime()}
                </div>

                {isFinalCountdown && (
                  <p className="mt-2 text-red-400 text-sm font-semibold">
                    🔥 FINAL COUNTDOWN!
                  </p>
                )}

              </div>

            ) : battle.status === "completed" ? (

              <div>

                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/20 text-yellow-400">
                  🏆 PK ENDED
                </div>

                <p className="text-gray-400 text-sm mt-3">
                  Final score
                </p>

              </div>

            ) : (

              <div>

                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/20 text-blue-400">
                  ⏳ WAITING
                </div>

                <p className="text-gray-400 text-sm mt-3">
                  Waiting for the battle to begin
                </p>

              </div>

            )}

          </div>


          {/* SCOREBOARD */}

          <div className="relative px-4 sm:px-8 pt-8 pb-6">

            {/* VS */}

            <div className="absolute left-1/2 top-10 -translate-x-1/2 z-10">

              <div className="w-12 h-12 rounded-full bg-gray-950 border-2 border-gray-700 flex items-center justify-center shadow-xl">

                <span className="font-black text-gray-300 text-sm">
                  VS
                </span>

              </div>

            </div>


            <div className="grid grid-cols-2 gap-3 sm:gap-8">

              {/* HOST A */}

              <div
                className={`relative rounded-3xl p-4 sm:p-6 text-center border transition ${
                  leadingHost === "A"
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                    : "border-gray-800 bg-gray-950/40"
                }`}
              >

                {leadingHost === "A" && (
                  <div className="absolute top-3 left-3 text-xs font-bold text-blue-400">
                    🔥 LEADING
                  </div>
                )}

                <div className="relative inline-block">

                  <img
                    src={hostAImage}
                    alt={hostAName}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto border-4 ${
                      leadingHost === "A"
                        ? "border-blue-400"
                        : "border-blue-600"
                    }`}
                  />

                  {isHostA && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      YOU
                    </div>
                  )}

                </div>

                <h2 className="font-bold text-lg sm:text-xl mt-4 truncate">
                  {hostAName}
                </h2>

                <p className="text-xs text-blue-400 font-semibold mt-1">
                  HOST A
                </p>

                <div className="text-5xl sm:text-6xl font-black mt-5">
                  {hostAScore.toLocaleString()}
                </div>

              </div>


              {/* HOST B */}

              <div
                className={`relative rounded-3xl p-4 sm:p-6 text-center border transition ${
                  leadingHost === "B"
                    ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10"
                    : "border-gray-800 bg-gray-950/40"
                }`}
              >

                {leadingHost === "B" && (
                  <div className="absolute top-3 right-3 text-xs font-bold text-pink-400">
                    LEADING 🔥
                  </div>
                )}

                <div className="relative inline-block">

                  <img
                    src={hostBImage}
                    alt={hostBName}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto border-4 ${
                      leadingHost === "B"
                        ? "border-pink-400"
                        : "border-pink-600"
                    }`}
                  />

                  {isHostB && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-bold">
                      YOU
                    </div>
                  )}

                </div>

                <h2 className="font-bold text-lg sm:text-xl mt-4 truncate">
                  {hostBName}
                </h2>

                <p className="text-xs text-pink-400 font-semibold mt-1">
                  HOST B
                </p>

                <div className="text-5xl sm:text-6xl font-black mt-5">
                  {hostBScore.toLocaleString()}
                </div>

              </div>

            </div>


            {/* SCORE BAR */}

            <div className="mt-8">

              <div className="flex justify-between text-xs font-semibold mb-2">

                <span className="text-blue-400">
                  {hostAPercentage}%
                </span>

                <span className="text-gray-500">
                  SCORE
                </span>

                <span className="text-pink-400">
                  {hostBPercentage}%
                </span>

              </div>

              <div className="h-4 rounded-full overflow-hidden bg-gray-800 flex">

                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${hostAPercentage}%`,
                  }}
                />

                <div
                  className="h-full bg-pink-500 transition-all duration-500"
                  style={{
                    width: `${hostBPercentage}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* SCORE CONTROLS */}

          {isStarted && isHost && (

            <div className="p-5 sm:p-6 border-t border-gray-800 bg-gray-950/40">

              <p className="text-center text-sm text-gray-400 mb-4">

                You are{" "}

                <strong className="text-white">
                  {isHostA ? "Host A" : "Host B"}
                </strong>

              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">

                <button
                  onClick={() => handleScore(100)}
                  className="py-3 sm:py-4 rounded-xl bg-green-600 font-bold hover:bg-green-500 active:scale-95 transition"
                >
                  +100
                </button>

                <button
                  onClick={() => handleScore(500)}
                  className="py-3 sm:py-4 rounded-xl bg-green-600 font-bold hover:bg-green-500 active:scale-95 transition"
                >
                  +500
                </button>

                <button
                  onClick={() => handleScore(1000)}
                  className="py-3 sm:py-4 rounded-xl bg-green-600 font-bold hover:bg-green-500 active:scale-95 transition"
                >
                  +1,000
                </button>

              </div>

            </div>

          )}


          {/* START */}

          {!isStarted &&
            battle.status === "pending" &&
            isHost && (

              <div className="p-6 border-t border-gray-800 text-center bg-gray-950/30">

                <button
                  onClick={handleStart}
                  disabled={!connected}
                  className="px-10 py-4 rounded-2xl bg-red-600 font-bold text-lg hover:bg-red-500 active:scale-95 transition disabled:opacity-50"
                >
                  🚀 Start PK
                </button>

                <p className="text-xs text-gray-500 mt-3">
                  Both players can enter the battle before starting.
                </p>

              </div>

            )}


          {/* WAITING */}

          {!isStarted &&
            battle.status === "pending" &&
            !isHost && (

              <div className="p-6 border-t border-gray-800 text-center text-gray-400">

                <div className="text-3xl mb-2">
                  ⏳
                </div>

                <p className="font-semibold text-gray-300">
                  Waiting for a host to start the PK
                </p>

                <p className="text-xs mt-1">
                  The battle will begin when the host starts it.
                </p>

              </div>

            )}


          {/* RESULT */}

          {battle.status === "completed" && (

            <div className="p-8 border-t border-gray-800 text-center bg-gray-950/40">

              {winnerName ? (

                <>
                  <div className="text-6xl mb-4 animate-bounce">
                    🏆
                  </div>

                  <p className="text-yellow-400 text-sm font-bold uppercase tracking-wider">
                    Winner
                  </p>

                  <h2 className="text-3xl sm:text-4xl font-black mt-2">
                    {winnerName}
                  </h2>

                  <p className="text-gray-400 mt-3">
                    Congratulations on winning the PK battle!
                  </p>
                </>

              ) : (

                <>
                  <div className="text-6xl mb-4">
                    🤝
                  </div>

                  <h2 className="text-3xl font-black">
                    It's a Draw!
                  </h2>

                  <p className="text-gray-400 mt-2">
                    Both players finished with the same score.
                  </p>
                </>

              )}

            </div>

          )}

        </div>

        {/* CONNECTION / ERROR */}

        {error && (

          <div className="mt-4 p-4 rounded-xl bg-red-950 border border-red-800 text-red-300">
            ❌ {error}
          </div>

        )}


        {/* DEBUG INFO */}

        <div className="mt-5 p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-500">

          <div>
            Battle: {battleId}
          </div>

          <div>
            Your ID: {currentUserId || "Not detected"}
          </div>

          <div>
            Role:{" "}
            {isHostA
              ? "Host A"
              : isHostB
              ? "Host B"
              : "Viewer"}
          </div>

          <div>
            Room users:{" "}
            {roomState?.users?.length || 0}
          </div>

        </div>

      </div>

    </div>
  );
}
