// Real-time Sync Client (WebSockets on live backend + BroadcastChannel for GitHub Pages)
class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.pingInterval = null;
    this.listeners = new Map();
    this.status = "disconnected";
    
    // BroadcastChannel for instant multi-tab sync on GitHub Pages / local storage mode
    try {
      this.channel = new BroadcastChannel("taskflow_live_sync");
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type) {
          this.emit(event.data.type, event.data.data, false);
        }
      };
    } catch (e) {
      this.channel = null;
    }
  }

  getWsUrl(token) {
    const customHost = localStorage.getItem("taskflow_ws_url") || window.TASKFLOW_WS_URL;
    if (customHost) {
      const separator = customHost.includes("?") ? "&" : "?";
      return `${customHost}${separator}token=${encodeURIComponent(token)}`;
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
  }

  connect() {
    // If running in client-side / GitHub Pages mode without custom server URL:
    if (API.useLocalEngine()) {
      console.log("⚡ [Sync] Running in Browser Local Sync mode (BroadcastChannel enabled)");
      this.setStatus("connected");
      this.emit("PRESENCE_UPDATE", { connection_count: 1 });
      return;
    }

    const token = API.getToken();
    if (!token) {
      return;
    }

    const wsUrl = this.getWsUrl(token);
    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("⚡ [WS] Connected to live backend sync!");
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "PONG") return;
          this.emit(data.type, data);
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        // If WebSocket fails on static host, gracefully fallback to local client sync
        if (API.isStaticHost) {
          this.setStatus("connected");
        } else {
          this.setStatus("disconnected");
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        if (this.ws) this.ws.close();
      };
    } catch (e) {
      if (API.isStaticHost) {
        this.setStatus("connected");
      } else {
        this.scheduleReconnect();
      }
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "PING" }));
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  scheduleReconnect() {
    if (!API.getToken() || API.useLocalEngine()) return;

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  setStatus(status) {
    this.status = status;
    window.dispatchEvent(new CustomEvent("taskflow:ws_status", { detail: status }));
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  emit(type, data, broadcastToTabs = true) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach((cb) => cb(data));
    }
    window.dispatchEvent(new CustomEvent("taskflow:ws_event", { detail: { type, data } }));

    // Sync across browser tabs in client mode
    if (broadcastToTabs && this.channel) {
      try {
        this.channel.postMessage({ type, data });
      } catch (e) {}
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

const socketClient = new WebSocketClient();
