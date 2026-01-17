// api.js
async function jsonOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  tor: async () => {
    const res = await fetch("/api/tor");
    return jsonOrThrow(res);
  },

  wifiStatus: async () => {
    const res = await fetch("/wifi/status");
    return jsonOrThrow(res);
  },

  wifiScan: async () => {
    const res = await fetch("/wifi/scan");
    return jsonOrThrow(res);
  },

  wifiConnectSaved: async (ssid) => {
    const res = await fetch("/wifi/connect/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssid }),
    });
    return jsonOrThrow(res);
  },

  wifiConnectNew: async (ssid, password) => {
    const res = await fetch("/wifi/connect/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssid, password }),
    });
    return jsonOrThrow(res);
  },
};
