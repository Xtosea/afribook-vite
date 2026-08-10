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

      try {

        setError("");

        const response =
          await fetchWithToken(
            `${API_BASE}/pk/${battleId}`
          );

        if (!response.ok) {

          throw new Error(
            "Failed to load PK battle"
          );
        }

        const data =
          await response.json();

        if (!data.success || !data.battle) {

          throw new Error(
            data.message ||
            "PK battle not found"
          );
        }

        setBattle(
          data.battle
        );

      } catch (error) {

        console.error(
          "Load PK error:",
          error
        );

        setError(
          error.message ||
          "Failed to load PK"
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

        <div className="rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden">


          {/* STATUS */}

          <div className="text-center p-5 border-b border-gray-800">

            {isStarted ? (

              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 text-red-400">

                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

                  LIVE

                </div>

                <div className="text-4xl font-black mt-3">
                  {formattedTime()}
                </div>

              </>

            ) : battle.status === "completed" ? (

              <div className="text-yellow-400 font-bold">
                PK ENDED
              </div>

            ) : (

              <div className="text-blue-400 font-bold">
                WAITING TO START
              </div>

            )}

          </div>


          {/* HOSTS */}

          <div className="grid grid-cols-2">


            {/* HOST A */}

            <div className="p-6 text-center border-r border-gray-800">

              <img
                src={hostAImage}
                alt={hostAName}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-blue-500"
              />

              <h2 className="font-bold text-lg mt-3">
                {hostAName}
              </h2>

              <p className="text-xs text-gray-400">
                HOST A
              </p>

              <div className="text-5xl font-black mt-5">
                {hostAScore}
              </div>

            </div>


            {/* HOST B */}

            <div className="p-6 text-center">

              <img
                src={hostBImage}
                alt={hostBName}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-pink-500"
              />

              <h2 className="font-bold text-lg mt-3">
                {hostBName}
              </h2>

              <p className="text-xs text-gray-400">
                HOST B
              </p>

              <div className="text-5xl font-black mt-5">
                {hostBScore}
              </div>

            </div>

          </div>


          {/* SCORE CONTROLS */}

          {isStarted && isHost && (

            <div className="p-6 border-t border-gray-800">

              <p className="text-center text-sm text-gray-400 mb-4">
                You are{" "}
                <strong>
                  {isHostA
                    ? "Host A"
                    : "Host B"}
                </strong>
              </p>


              <div className="grid grid-cols-3 gap-3">

                <button
                  onClick={() =>
                    handleScore(100)
                  }
                  className="py-3 rounded-xl bg-green-600 font-bold hover:bg-green-500"
                >
                  +100
                </button>

                <button
                  onClick={() =>
                    handleScore(500)
                  }
                  className="py-3 rounded-xl bg-green-600 font-bold hover:bg-green-500"
                >
                  +500
                </button>

                <button
                  onClick={() =>
                    handleScore(1000)
                  }
                  className="py-3 rounded-xl bg-green-600 font-bold hover:bg-green-500"
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

              <div className="p-6 border-t border-gray-800 text-center">

                <button
                  onClick={handleStart}
                  disabled={!connected}
                  className="px-8 py-3 rounded-xl bg-red-600 font-bold hover:bg-red-500 disabled:opacity-50"
                >
                  🚀 Start PK
                </button>

              </div>

            )}


          {/* WAITING */}

          {!isStarted &&
            battle.status === "pending" &&
            !isHost && (

              <div className="p-6 border-t border-gray-800 text-center text-gray-400">
                Waiting for a host to start the PK...
              </div>

            )}


          {/* RESULT */}

          {battle.status === "completed" && (

            <div className="p-6 border-t border-gray-800 text-center">

              <div className="text-3xl mb-2">
                🏆
              </div>

              <h2 className="text-xl font-bold">
                {winnerName
                  ? `${winnerName} wins!`
                  : "It's a draw!"}
              </h2>

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
