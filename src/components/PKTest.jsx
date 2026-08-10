import React, { useEffect, useState } from "react";

import {
  connectSocket,
  getSocket,
  joinPK,
  leavePK,
  getPKState,
  startPKLive,
} from "../socket.js";


const TEST_BATTLE_ID =
  "6a793acb19827b357512017c";


export default function PKTest() {

  const [connected, setConnected] =
    useState(false);

  const [roomState, setRoomState] =
    useState(null);

  const [started, setStarted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [hostAScore, setHostAScore] =
    useState(0);

  const [hostBScore, setHostBScore] =
    useState(0);


  // ==========================================
  // SOCKET LISTENERS
  // ==========================================

  useEffect(() => {

    const socket = connectSocket();

    if (!socket) {
      setError("Socket could not connect");
      return;
    }


    // SOCKET CONNECTED
    const handleConnect = () => {

      console.log(
        "🥊 PK test socket connected"
      );

      setConnected(true);
    };


    // SOCKET DISCONNECTED
    const handleDisconnect = () => {

      setConnected(false);
    };


    // PK ROOM STATE
    const handleRoomState = (state) => {

      console.log(
        "🥊 PK room state:",
        state
      );

      setRoomState(state);

      setStarted(
        state?.started || false
      );

      setHostAScore(
        state?.hostAScore || 0
      );

      setHostBScore(
        state?.hostBScore || 0
      );
    };


    // PK STARTED
    const handleStarted = (state) => {

      console.log(
        "🚀 PK started:",
        state
      );

      setStarted(true);

      setRoomState((previous) => ({
        ...(previous || {}),
        ...(state || {}),
        started: true,
      }));
    };


    // PK SCORE UPDATED
    const handleScoreUpdate = (data) => {

      console.log(
        "🥊 PK SCORE UPDATED:",
        data
      );

      setHostAScore(
        data?.hostAScore || 0
      );

      setHostBScore(
        data?.hostBScore || 0
      );

      setRoomState((previous) => ({
        ...(previous || {}),
        hostAScore:
          data?.hostAScore || 0,
        hostBScore:
          data?.hostBScore || 0,
      }));
    };


    // PK ERROR
    const handleError = (data) => {

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
      "pk:error",
      handleError
    );


    // Socket may already be connected
    if (socket.connected) {
      setConnected(true);
    }


    // CLEANUP
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
        "pk:error",
        handleError
      );

    };

  }, []);


  // ==========================================
  // JOIN
  // ==========================================

  const handleJoin = () => {

    setError("");

    const success =
      joinPK(TEST_BATTLE_ID);

    if (!success) {
      setError(
        "Socket is not connected"
      );
    }

  };


  // ==========================================
  // GET STATE
  // ==========================================

  const handleState = () => {

    setError("");

    const success =
      getPKState(TEST_BATTLE_ID);

    if (!success) {
      setError(
        "Socket is not connected"
      );
    }

  };


  // ==========================================
  // START
  // ==========================================

  const handleStart = () => {

    setError("");

    const success =
      startPKLive(TEST_BATTLE_ID);

    if (!success) {
      setError(
        "Socket is not connected"
      );
    }

  };


  // ==========================================
  // LEAVE
  // ==========================================

  const handleLeave = () => {

    leavePK(TEST_BATTLE_ID);

    setRoomState(null);

    setStarted(false);

    setHostAScore(0);

    setHostBScore(0);

  };


  // ==========================================
  // ADD MY PK SCORE
  // ==========================================

  const handleAddScore = () => {

    setError("");

    const socket = getSocket();

    if (!socket?.connected) {

      setError(
        "Socket is not connected"
      );

      return;
    }


    socket.emit(
      "pk:score",
      {
        battleId:
          TEST_BATTLE_ID,

        points: 100,
      }
    );

  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >

      <h2>
        🥊 AfricSocial PK Socket Test
      </h2>


      <p>
        Socket:
        {" "}

        <strong>
          {connected
            ? "🟢 Connected"
            : "🔴 Disconnected"}
        </strong>
      </p>


      <p>
        Battle ID:
        <br />

        <code>
          {TEST_BATTLE_ID}
        </code>
      </p>


      {/* PK CONTROLS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >

        <button
          onClick={handleJoin}
          disabled={!connected}
        >
          Join PK
        </button>


        <button
          onClick={handleState}
          disabled={!connected}
        >
          Get State
        </button>


        <button
          onClick={handleStart}
          disabled={!connected}
        >
          Start Live PK
        </button>


        <button
          onClick={handleLeave}
          disabled={!connected}
        >
          Leave PK
        </button>

      </div>


      {/* LIVE SCORE */}

      <div
        className="mt-6 rounded-xl border p-4"
      >

        <h2 className="text-lg font-bold mb-4">
          🥊 Live PK Score
        </h2>


        <div
          className="flex justify-between text-xl font-bold mb-4"
        >

          <span>
            Host A: {hostAScore}
          </span>

          <span>
            Host B: {hostBScore}
          </span>

        </div>


        <button
          onClick={handleAddScore}
          disabled={!connected || !started}
          className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
        >
          +100 My PK Score
        </button>

      </div>


      {/* STARTED */}

      {started && (
        <p>
          🚀 <strong>PK is live!</strong>
        </p>
      )}


      {/* ERROR */}

      {error && (
        <p
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          ❌ {error}
        </p>
      )}


      {/* ROOM STATE */}

      {roomState && (
        <pre
          style={{
            background: "#f5f5f5",
            padding: "15px",
            marginTop: "20px",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            roomState,
            null,
            2
          )}
        </pre>
      )}

    </div>
  );
}