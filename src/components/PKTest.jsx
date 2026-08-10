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
  getPKState,
  startPKLive,
} from "../socket.js";

import {
  API_BASE,
  fetchWithToken,
} from "../api/api.js";


// ==========================================
// HELPERS
// ==========================================

const getBattleIdFromUrl = () => {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get("battleId");
};


const formatTime = (seconds) => {

  const safeSeconds =
    Math.max(0, Math.floor(seconds || 0));

  const minutes =
    Math.floor(safeSeconds / 60);

  const remainingSeconds =
    safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};


// ==========================================
// PK PAGE
// ==========================================

export default function PKTest() {

  const battleId =
    useMemo(
      () => getBattleIdFromUrl(),
      []
    );


  // ==========================================
  // STATE
  // ==========================================

  const [connected, setConnected] =
    useState(false);

  const [battle, setBattle] =
    useState(null);

  const [roomState, setRoomState] =
    useState(null);

  const [started, setStarted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [remaining, setRemaining] =
    useState(0);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [hostAScore, setHostAScore] =
    useState(0);

  const [hostBScore, setHostBScore] =
    useState(0);

  const [winner, setWinner] =
    useState(null);


  // ==========================================
  // CURRENT USER
  // ==========================================

  const getCurrentUserId = () => {

    const socket =
      getSocket();

    return socket?.auth?.token
      ? null
      : null;
  };


  // ==========================================
  // LOAD REAL PK
  // ==========================================

  const loadBattle = useCallback(
    async () => {

      if (!battleId) {

        setError(
          "No PK battle ID was provided."
        );

        setLoading(false);

        return;
      }

      try {

        setLoading(true);
        setError("");

        const response =
          await fetchWithToken(
            `${API_BASE}/pk/${battleId}`
          );

        if (!response.ok) {

          throw new Error(
            "PK battle could not be loaded"
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

        setHostAScore(
          data.battle.hostAScore || 0
        );

        setHostBScore(
          data.battle.hostBScore || 0
        );

        if (
          data.battle.status ===
          "completed"
        ) {

          setFinished(true);

          setWinner(
            data.battle.winner || null
          );
        }

        if (
          data.battle.status ===
          "active"
        ) {

          setStarted(true);
        }

      } catch (err) {

        console.error(
          "❌ Load PK error:",
          err
        );

        setError(
          err.message ||
          "Failed to load PK"
        );

      } finally {

        setLoading(false);
      }

    },
    [battleId]
  );


  // ==========================================
  // SOCKET
  // ==========================================

  useEffect(() => {

    if (!battleId) {
      return;
    }

    const socket =
      connectSocket();

    if (!socket) {

      setError(
        "Socket could not connect"
      );

      return;
    }


    // ------------------------------------------
    // CONNECT
    // ------------------------------------------

    const handleConnect = () => {

      console.log(
        "🟢 Real PK socket connected"
      );

      setConnected(true);

      // Join the normal authenticated
      // user room using the JWT identity.
      socket.emit("join");

    };


    // ------------------------------------------
    // DISCONNECT
    // ------------------------------------------

    const handleDisconnect = () => {

      console.log(
        "🔴 PK socket disconnected"
      );

      setConnected(false);
    };


    // ------------------------------------------
    // ROOM STATE
    // ------------------------------------------

    const handleRoomState = (
      state
    ) => {

      console.log(
        "🥊 PK room state:",
        state
      );

      if (!state) {
        return;
      }

      setRoomState(state);

      setStarted(
        Boolean(state.started)
      );

      setHostAScore(
        Number(
          state.hostAScore || 0
        )
      );

      setHostBScore(
        Number(
          state.hostBScore || 0
        )
      );

    };


    // ------------------------------------------
    // PK STARTED
    // ------------------------------------------

    const handleStarted = (
      data
    ) => {

      console.log(
        "🚀 PK started:",
        data
      );

      setStarted(true);

      setFinished(false);

      setRoomState(
        (previous) => ({
          ...(previous || {}),
          ...(data || {}),
          started: true,
        })
      );

      if (data?.hostAScore !== undefined) {

        setHostAScore(
          Number(data.hostAScore)
        );
      }

      if (data?.hostBScore !== undefined) {

        setHostBScore(
          Number(data.hostBScore)
        );
      }

      if (data?.startedAt) {

        setBattle(
          (previous) => ({
            ...(previous || {}),
            ...(data || {}),
            status: "active",
          })
        );
      }
    };


    // ------------------------------------------
    // SCORE UPDATED
    // ------------------------------------------

    const handleScoreUpdate = (
      data
    ) => {

      console.log(
        "🥊 PK score updated:",
        data
      );

      setHostAScore(
        Number(
          data?.hostAScore || 0
        )
      );

      setHostBScore(
        Number(
          data?.hostBScore || 0
        )
      );

      setRoomState(
        (previous) => ({
          ...(previous || {}),
          hostAScore:
            Number(
              data?.hostAScore || 0
            ),
          hostBScore:
            Number(
              data?.hostBScore || 0
            ),
        })
      );
    };


    // ------------------------------------------
    // PK FINISHED
    // ------------------------------------------

    const handleFinished = (
      data
    ) => {

      console.log(
        "🏆 PK finished:",
        data
      );

      setFinished(true);

      setStarted(false);

      setRemaining(0);

      setWinner(
        data?.winner ||
        null
      );

      if (data?.hostAScore !== undefined) {

        setHostAScore(
          Number(data.hostAScore)
        );
      }

      if (data?.hostBScore !== undefined) {

        setHostBScore(
          Number(data.hostBScore)
        );
      }

      setBattle(
        (previous) => ({
          ...(previous || {}),
          ...(data || {}),
          status: "completed",
        })
      );
    };


    // ------------------------------------------
    // ERROR
    // ------------------------------------------

    const handleError = (
      data
    ) => {

      console.error(
        "❌ PK error:",
        data
      );

      setError(
        data?.message ||
        "PK socket error"
      );
    };


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


    if (socket.connected) {

      setConnected(true);

      socket.emit("join");
    }


    // ------------------------------------------
    // LOAD BATTLE
    // ------------------------------------------

    loadBattle();


    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------

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
  // JOIN PK
  // ==========================================

  const handleJoin = () => {

    if (!battleId) {

      setError(
        "Battle ID is missing"
      );

      return;
    }

    setError("");

    const success =
      joinPK(battleId);

    if (!success) {

      setError(
        "Socket is not connected"
      );

      return;
    }

    console.log(
      `🥊 Joined PK ${battleId}`
    );
  };


  // ==========================================
  // GET STATE
  // ==========================================

  const handleState = () => {

    if (!battleId) {
      return;
    }

    setError("");

    const success =
      getPKState(battleId);

    if (!success) {

      setError(
        "Socket is not connected"
      );
    }
  };


  // ==========================================
  // START PK
  // ==========================================

  const handleStart = async () => {

    if (!battleId) {
      return;
    }

    setError("");

    setActionLoading(true);

    try {

      // First use the REST endpoint to
      // update MongoDB.
      const response =
        await fetchWithToken(
          `${API_BASE}/pk/${battleId}/start`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to start PK"
        );
      }

      // Then synchronize the live
      // Redis/Socket.IO room.
      const success =
        startPKLive(battleId);

      if (!success) {

        throw new Error(
          "Socket is not connected"
        );
      }

    } catch (err) {

      console.error(
        "❌ Start PK error:",
        err
      );

      setError(
        err.message ||
        "Failed to start PK"
      );

    } finally {

      setActionLoading(false);
    }
  };


  // ==========================================
  // LEAVE
  // ==========================================

  const handleLeave = () => {

    if (!battleId) {
      return;
    }

    leavePK(
      battleId
    );

    setRoomState(null);

    console.log(
      `🚪 Left PK ${battleId}`
    );
  };


  // ==========================================
  // ADD SCORE
  // ==========================================

  const handleAddScore = () => {

    if (!battleId) {
      return;
    }

    setError("");

    const socket =
      getSocket();

    if (!socket?.connected) {

      setError(
        "Socket is not connected"
      );

      return;
    }

    if (!started || finished) {

      setError(
        "PK is not active"
      );

      return;
    }

    socket.emit(
      "pk:score",
      {
        battleId,
        points: 100,
      }
    );
  };


  // ==========================================
  // COUNTDOWN
  // ==========================================

  useEffect(() => {

    if (
      !started ||
      finished ||
      !battle?.startedAt
    ) {
      return;
    }

    const duration =
      Number(
        battle.duration || 300
      );

    const startedTime =
      new Date(
        battle.startedAt
      ).getTime();

    const updateTimer = () => {

      const now =
        Date.now();

      const elapsed =
        Math.floor(
          (now - startedTime) / 1000
        );

      const left =
        Math.max(
          0,
          duration - elapsed
        );

      setRemaining(left);

      if (left <= 0) {

        setStarted(false);

        console.log(
          "⏰ PK timer reached zero"
        );
      }
    };

    updateTimer();

    const timer =
      setInterval(
        updateTimer,
        1000
      );

    return () => {
      clearInterval(timer);
    };

  }, [
    started,
    finished,
    battle?.startedAt,
    battle?.duration,
  ]);


  // ==========================================
  // SCORE PERCENTAGE
  // ==========================================

  const totalScore =
    hostAScore +
    hostBScore;

  const hostAPercentage =
    totalScore > 0
      ? (hostAScore / totalScore) * 100
      : 50;

  const hostBPercentage =
    totalScore > 0
      ? (hostBScore / totalScore) * 100
      : 50;


  // ==========================================
  // DETERMINE WINNER
  // ==========================================

  const calculatedWinner =
    hostAScore > hostBScore
      ? battle?.hostA
      : hostBScore > hostAScore
        ? battle?.hostB
        : null;


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center p-6">

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
  // NO BATTLE ID
  // ==========================================

  if (!battleId) {

    return (
      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="max-w-md text-center">

          <div className="text-5xl mb-4">
            🥊
          </div>

          <h2 className="text-2xl font-bold">
            PK Battle
          </h2>

          <p className="mt-3 text-gray-500">
            No battle ID was provided.
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Open this page using:
          </p>

          <code className="block mt-2 p-3 bg-gray-100 rounded-lg text-sm break-all">
            /pk?battleId=YOUR_BATTLE_ID
          </code>

        </div>

      </div>
    );
  }


  // ==========================================
  // BATTLE NOT FOUND
  // ==========================================

  if (!battle) {

    return (
      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="text-center">

          <div className="text-5xl mb-4">
            ❌
          </div>

          <h2 className="text-xl font-bold">
            PK battle not found
          </h2>

          {error && (
            <p className="text-red-500 mt-3">
              {error}
            </p>
          )}

        </div>

      </div>
    );
  }


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">

      <div className="max-w-2xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-4">

          <div>

            <h1 className="text-2xl font-bold">
              🥊 Live PK Battle
            </h1>

            <p className="text-sm text-gray-500">
              Battle ID: {battleId}
            </p>

          </div>

          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              connected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {connected
              ? "🟢 Live"
              : "🔴 Offline"}
          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-700">

            ❌ {error}

          </div>

        )}


        {/* PLAYERS */}

        <div className="grid grid-cols-2 gap-3">

          {/* HOST A */}

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center shadow">

            <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 overflow-hidden">

              {battle.hostA?.profilePic ? (

                <img
                  src={battle.hostA.profilePic}
                  alt={
                    battle.hostA.name ||
                    "Host A"
                  }
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full flex items-center justify-center text-3xl">
                  👤
                </div>
              )}

            </div>

            <h2 className="mt-3 font-bold truncate">

              {battle.hostA?.name ||
               battle.hostA?.username ||
               "Host A"}

            </h2>

            <div className="text-4xl font-black mt-2">
              {hostAScore}
            </div>

          </div>


          {/* HOST B */}

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center shadow">

            <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 overflow-hidden">

              {battle.hostB?.profilePic ? (

                <img
                  src={battle.hostB.profilePic}
                  alt={
                    battle.hostB.name ||
                    "Host B"
                  }
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full flex items-center justify-center text-3xl">
                  👤
                </div>
              )}

            </div>

            <h2 className="mt-3 font-bold truncate">

              {battle.hostB?.name ||
               battle.hostB?.username ||
               "Host B"}

            </h2>

            <div className="text-4xl font-black mt-2">
              {hostBScore}
            </div>

          </div>

        </div>


        {/* SCORE BAR */}

        <div className="mt-4">

          <div className="h-5 rounded-full overflow-hidden flex bg-gray-300">

            <div
              className="transition-all duration-500"
              style={{
                width: `${hostAPercentage}%`,
                background:
                  "linear-gradient(90deg,#f97316,#ef4444)",
              }}
            />

            <div
              className="transition-all duration-500"
              style={{
                width: `${hostBPercentage}%`,
                background:
                  "linear-gradient(90deg,#3b82f6,#6366f1)",
              }}
            />

          </div>

        </div>


        {/* TIMER */}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 mt-4 text-center">

          <p className="text-sm text-gray-500">
            {finished
              ? "PK FINISHED"
              : started
                ? "TIME REMAINING"
                : battle.status === "pending"
                  ? "WAITING TO START"
                  : "PK ENDED"}
          </p>

          <div className="text-5xl font-black mt-2">

            {finished
              ? "00:00"
              : formatTime(remaining)}

          </div>

        </div>


        {/* ACTIONS */}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 mt-4">

          <div className="grid grid-cols-2 gap-2">

            <button
              onClick={handleJoin}
              disabled={!connected}
              className="px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              🥊 Join PK
            </button>

            <button
              onClick={handleState}
              disabled={!connected}
              className="px-4 py-3 rounded-xl bg-gray-700 text-white font-semibold disabled:opacity-50"
            >
              🔄 Sync
            </button>

            <button
              onClick={handleStart}
              disabled={
                !connected ||
                actionLoading ||
                finished ||
                battle.status !== "pending"
              }
              className="px-4 py-3 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {actionLoading
                ? "Starting..."
                : "🚀 Start PK"}
            </button>

            <button
              onClick={handleLeave}
              disabled={!connected}
              className="px-4 py-3 rounded-xl bg-gray-200 text-gray-900 font-semibold disabled:opacity-50"
            >
              🚪 Leave
            </button>

          </div>

        </div>


        {/* SCORE ACTION */}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 mt-4 text-center">

          <h2 className="text-lg font-bold">
            🥊 Live PK Score
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Your authenticated account determines
            which side receives the points.
          </p>

          <button
            onClick={handleAddScore}
            disabled={
              !connected ||
              !started ||
              finished
            }
            className="mt-4 px-8 py-4 rounded-2xl bg-green-600 text-white font-bold text-lg disabled:opacity-50"
          >
            +100 PK Points
          </button>

        </div>


        {/* STATUS */}

        <div className="text-center mt-4">

          {started && !finished && (

            <p className="text-green-600 font-bold">
              🔴 PK IS LIVE
            </p>

          )}

          {!started &&
            !finished &&
            battle.status === "pending" && (

            <p className="text-yellow-600 font-semibold">
              ⏳ Waiting for PK to start
            </p>

          )}

        </div>


        {/* WINNER */}

        {finished && (

          <div className="mt-5 bg-white dark:bg-gray-900 rounded-2xl shadow p-6 text-center">

            <div className="text-5xl">
              🏆
            </div>

            <h2 className="text-2xl font-black mt-2">
              PK Finished
            </h2>

            {hostAScore === hostBScore ? (

              <p className="mt-2 text-xl font-bold">
                🤝 It's a Draw!
              </p>

            ) : (

              <p className="mt-2 text-xl font-bold">

                Winner:{" "}

                {(
                  winner?.name ||
                  winner?.username ||
                  calculatedWinner?.name ||
                  calculatedWinner?.username ||
                  "Winner"
                )}

              </p>

            )}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">

                <div className="text-sm text-gray-500">
                  {battle.hostA?.name || "Host A"}
                </div>

                <div className="text-2xl font-black">
                  {hostAScore}
                </div>

              </div>

              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">

                <div className="text-sm text-gray-500">
                  {battle.hostB?.name || "Host B"}
                </div>

                <div className="text-2xl font-black">
                  {hostBScore}
                </div>

              </div>

            </div>

          </div>

        )}


        {/* DEBUG ROOM STATE */}

        {roomState && (

          <details className="mt-5">

            <summary className="cursor-pointer text-sm text-gray-500">
              Developer PK State
            </summary>

            <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-xl overflow-auto text-xs">
              {JSON.stringify(
                roomState,
                null,
                2
              )}
            </pre>

          </details>

        )}

      </div>

    </div>
  );
}