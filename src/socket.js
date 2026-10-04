// src/socket.js
//
// Cloudflare Durable Object WebSocket compatibility layer.
// Keeps the existing Socket.IO-style API used by the app
// while using a native WebSocket underneath.

const API_BASE = import.meta.env.VITE_API_BASE;

let socket = null;

const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 2000;
const RECONNECT_DELAY_MAX = 5000;

class SocketWrapper {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.id = null;

    this.listeners = new Map();

    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.manualDisconnect = false;
    this.connecting = false;

    this.pendingMessages = [];
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(handler);

    return this;
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);

    if (!handlers) {
      return this;
    }

    if (handler) {
      handlers.delete(handler);
    } else {
      handlers.clear();
    }

    if (handlers.size === 0) {
      this.listeners.delete(event);
    }

    return this;
  }

  emitLocal(event, data) {
    const handlers = this.listeners.get(event);

    if (!handlers) {
      return;
    }

    for (const handler of [...handlers]) {
      try {
        handler(data);
      } catch (error) {
        console.error(
          `❌ Socket listener error (${event}):`,
          error
        );
      }
    }
  }

  async emit(event, data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (
        this.connecting &&
        !this.manualDisconnect
      ) {
        this.pendingMessages.push({
          event,
          data,
        });

        console.log(
          "⏳ WebSocket not ready — queued:",
          event
        );

        return true;
      }

      console.log(
        "❌ EMIT BLOCKED — WebSocket not connected:",
        event
      );

      return false;
    }

    try {
      this.ws.send(
        JSON.stringify({
          event,
          data,
        })
      );

      console.log(
        "📡 WebSocket emit:",
        event
      );

      return true;

    } catch (error) {
      console.error(
        "❌ WebSocket emit failed:",
        event,
        error
      );

      return false;
    }
  }

  async connect() {
    if (this.manualDisconnect) {
      this.manualDisconnect = false;
    }

    if (
      this.ws &&
      (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      )
    ) {
      return this;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.log(
        "⚠ No token, socket not connected"
      );

      return this;
    }

    if (this.connecting) {
      return this;
    }

    this.connecting = true;

    try {
      console.log(
        "🎫 Requesting WebSocket ticket..."
      );

      const response = await fetch(
        `${API_BASE}/api/socket-ticket`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid socket ticket response"
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `Socket ticket failed (${response.status})`
        );
      }

      if (!data?.ticket) {
        throw new Error(
          "Socket ticket missing"
        );
      }

      const wsUrl = new URL(
        "/ws",
        API_BASE.replace(/^http/, "ws")
      );

      wsUrl.searchParams.set(
        "ticket",
        data.ticket
      );

      console.log(
        "🔌 Connecting WebSocket..."
      );

      const ws = new WebSocket(
        wsUrl.toString()
      );

      this.ws = ws;

      ws.onopen = () => {
        this.connecting = false;
        this.connected = true;

        this.reconnectAttempts = 0;

        this.id =
          globalThis.crypto?.randomUUID?.() ||
          `socket-${Date.now()}`;

        console.log(
          "✅ WebSocket connected:",
          this.id
        );

        this.emitLocal(
          "connect"
        );

        // Flush messages queued while the WebSocket was connecting.
        const pendingMessages = this.pendingMessages.splice(0);

        for (const message of pendingMessages) {
          this.emit(
            message.event,
            message.data
          );
        }

        // Preserve existing application behavior.
        const user = this.getLocalUser();

        if (user?._id) {
          this.emit(
            "join",
            user._id
          );

          console.log(
            "👤 Joined room:",
            user._id
          );
        }
      };

      ws.onmessage = (event) => {
        this.handleMessage(
          event.data
        );
      };

      ws.onerror = (error) => {
        console.error(
          "❌ WebSocket error:",
          error
        );

        this.emitLocal(
          "connect_error",
          error
        );
      };

      ws.onclose = (event) => {
        const wasConnected =
          this.connected;

        this.connected = false;
        this.connecting = false;
        this.ws = null;

        console.log(
          "🔴 WebSocket disconnected:",
          event.reason ||
          `code ${event.code}`
        );

        if (wasConnected) {
          this.emitLocal(
            "disconnect",
            event.reason ||
            "WebSocket disconnected"
          );
        }

        if (
          !this.manualDisconnect &&
          this.reconnectAttempts <
            MAX_RECONNECT_ATTEMPTS
        ) {
          this.scheduleReconnect();
        } else if (
          !this.manualDisconnect
        ) {
          this.emitLocal(
            "reconnect_failed"
          );
        }
      };

    } catch (error) {
      this.connecting = false;

      console.error(
        "❌ Socket connection failed:",
        error.message
      );

      this.emitLocal(
        "connect_error",
        error
      );

      if (
        !this.manualDisconnect &&
        this.reconnectAttempts <
          MAX_RECONNECT_ATTEMPTS
      ) {
        this.scheduleReconnect();
      } else if (
        !this.manualDisconnect
      ) {
        this.emitLocal(
          "reconnect_failed"
        );
      }
    }

    return this;
  }

  handleMessage(rawMessage) {
    let message;

    try {
      message =
        typeof rawMessage === "string"
          ? JSON.parse(rawMessage)
          : rawMessage;
    } catch {
      console.error(
        "❌ Invalid WebSocket message:",
        rawMessage
      );

      return;
    }

    const event =
      message?.event;

    const data =
      message?.data;

    if (!event) {
      console.warn(
        "⚠ WebSocket message missing event:",
        message
      );

      return;
    }

    this.emitLocal(
      event,
      data
    );
  }

  getLocalUser() {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  }

  scheduleReconnect() {
    if (
      this.manualDisconnect ||
      this.reconnectTimer
    ) {
      return;
    }

    this.reconnectAttempts += 1;

    const delay = Math.min(
      RECONNECT_DELAY *
        this.reconnectAttempts,
      RECONNECT_DELAY_MAX
    );

    console.log(
      `🔄 WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    this.emitLocal(
      "reconnect_attempt",
      this.reconnectAttempts
    );

    this.reconnectTimer = setTimeout(
      async () => {
        this.reconnectTimer = null;

        await this.connect();

        if (this.connected) {
          this.emitLocal(
            "reconnect",
            this.reconnectAttempts
          );
        }
      },
      delay
    );
  }

  disconnect() {
    this.manualDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(
        this.reconnectTimer
      );

      this.reconnectTimer = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }

    this.ws = null;
    this.connected = false;
    this.connecting = false;
    this.id = null;

    console.log(
      "🔌 WebSocket manually disconnected"
    );
  }
}

export const connectSocket = () => {
  if (!socket) {
    socket = new SocketWrapper();
  }

  socket.connect();

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;

    console.log(
      "🔌 Socket manually disconnected"
    );
  }
};

export const safeEmit = (event, data) => {
  console.log(
    "📡 TRYING EMIT:",
    event
  );

  const s = getSocket();

  console.log(
    "🧩 SOCKET STATUS:",
    {
      exists: !!s,
      connected: s?.connected,
      id: s?.id,
    }
  );

  if (!s) {
    console.log(
      "❌ EMIT BLOCKED — socket is null"
    );

    return false;
  }

  if (!s.connected) {
    console.log(
      "❌ EMIT BLOCKED — socket not connected"
    );

    return false;
  }

  try {
    s.emit(
      event,
      data
    );

    console.log(
      "✅ EMIT SUCCESS:",
      event
    );

    return true;

  } catch (error) {
    console.error(
      "❌ EMIT CRASH:",
      event,
      error
    );

    return false;
  }
};

// ==========================================
// PK SOCKET HELPERS
// ==========================================

export const joinPK = (battleId) => {
  return safeEmit(
    "pk:join",
    {
      battleId,
    }
  );
};

export const leavePK = (battleId) => {
  return safeEmit(
    "pk:leave",
    {
      battleId,
    }
  );
};

export const getPKState = (battleId) => {
  return safeEmit(
    "pk:get-state",
    {
      battleId,
    }
  );
};

export const startPKLive = (battleId) => {
  return safeEmit(
    "pk:start",
    {
      battleId,
    }
  );
};
