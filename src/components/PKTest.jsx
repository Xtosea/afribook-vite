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
  "6a791eec85b8c80b42e55454";


export default function PKTest() {

  const [connected, setConnected] =
    useState(false);

  const [roomState, setRoomState] =
    useState(null);

  const [started, setStarted] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const socket = connectSocket();

    if (!socket) {
      setError("Socket could not connect");
      return;
    }


    const handleConnect = () => {
      console.log(
        "🥊 PK test socket connected"
      );

      setConnected(true);
    };


    const handleDisconnect = () => {
      setConnected(false);
    };


    const handleRoomState = (state) => {

      console.log(
        "🥊 PK room state:",
        state
      );

      setRoomState(state);
    };


    const handleStarted = (state) => {

      console.log(
        "🚀 PK started:",
        state
      );

      setStarted(true);
    };


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
      "pk:error",
      handleError
    );


    if (socket.connected) {
      setConnected(true);
    }


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
        "pk:error",
        handleError
      );

    };

  }, []);


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


  const handleLeave = () => {

    leavePK(TEST_BATTLE_ID);

    setRoomState(null);
    setStarted(false);

  };


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


      {started && (
        <p>
          🚀 <strong>PK is live!</strong>
        </p>
      )}


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