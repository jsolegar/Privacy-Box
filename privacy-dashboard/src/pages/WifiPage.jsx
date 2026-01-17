import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function WifiPage() {
  const [status, setStatus] = useState({ connected: false, ssid: null });
  const [networks, setNetworks] = useState([]);
  const [selected, setSelected] = useState(null);

  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [msg, setMsg] = useState(null); // {type:"ok"|"err", text:"..."}

  const needsPassword = useMemo(() => {
    if (!selected) return false;
    return !selected.is_saved && (selected.security && selected.security !== "--");
  }, [selected]);

  async function refreshStatus() {
    try {
      const s = await api.wifiStatus();
      setStatus(s);
    } catch {
      setStatus({ connected: false, ssid: null });
    }
  }

  async function scan() {
    setScanning(true);
    setMsg(null);
    try {
      const list = await api.wifiScan();
      const networks = Array.isArray(list) ? list : [];
      setNetworks(networks);
      const active = networks.find((n) => n.active);
      if (active) setSelected(active);
    } catch (e) {
      setMsg({ type: "err", text: `Scan failed: ${e.message}` });
    } finally {
      setScanning(false);
    }
  }

  async function connect() {
    if (!selected?.ssid) return;

    setConnecting(true);
    setMsg(null);

    try {
      let res;
      if (selected.is_saved) {
        res = await api.wifiConnectSaved(selected.ssid);
      } else {
        // xarxa nova
        if (needsPassword && !password) {
          throw new Error("Password is required for this network.");
        }
        res = await api.wifiConnectNew(selected.ssid, password || "");
      }

      setMsg({ type: "ok", text: res?.message || "Connected!" });
      setPassword("");
      await refreshStatus();
      await scan();
    } catch (e) {
      setMsg({ type: "err", text: e.message || "Failed to connect" });
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    refreshStatus();
    scan();
    const id = setInterval(refreshStatus, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="center-page">
      <div className="card center-card">
        <Link to="/" className="back-button">← Back to Dashboard</Link>

        <h2 className="card-title">Wi-Fi Setup</h2>
        <p className="muted">Scan and connect using nmcli endpoints.</p>

        {/* STATUS CARD */}
        <div
          className="card p-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
              <div style={{ fontWeight: 800 }}>
                {status.connected ? `Connected to ${status.ssid}` : "Not connected"}
              </div>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button className="button" type="button" onClick={scan} disabled={scanning}>
                {scanning ? "Scanning..." : "Scan"}
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {msg ? (
          <div
            className="card p-2"
            style={{
              marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: msg.type === "ok" ? "rgba(0,255,170,0.08)" : "rgba(255,80,80,0.10)",
              fontSize: 13,
            }}
          >
            {msg.text}
          </div>
        ) : null}

        {/* NETWORK LIST */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Available networks</div>

          <div style={{ display: "grid", gap: 8, maxHeight: 260, overflow: "auto" }}>
            {networks.length === 0 ? (
              <div style={{ opacity: 0.7, fontSize: 13 }}>No networks found.</div>
            ) : (
              networks.map((n) => {
                const isSel = selected?.ssid === n.ssid;
                const lock = n.security && n.security !== "--" ? "🔒" : "🔓";
                return (
                  <button
                    key={n.ssid}
                    type="button"
                    onClick={() => {
                      setSelected(n);
                      setMsg(null);
                      setPassword("");
                    }}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 12,
                      border: isSel
                        ? "1px solid rgba(255,255,255,0.25)"
                        : "1px solid rgba(255,255,255,0.10)",
                      background: isSel ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 900 }}>{n.ssid}</div>
                      <span style={{ opacity: 0.9 }}>{lock}</span>
                      {n.active ? <span style={{ fontSize: 12, opacity: 0.9 }}>(active)</span> : null}
                      <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
                        {n.is_saved ? "saved" : "new"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                      Signal: {n.signal}% · Security: {n.security || "--"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CONNECT */}
        <div className="form">
          <label className="label">Selected SSID</label>
          <input className="input" value={selected?.ssid ?? ""} readOnly placeholder="Select a network" />

          {needsPassword ? (
            <>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </>
          ) : null}

          <button
            className="button"
            type="button"
            onClick={connect}
            disabled={!selected?.ssid || connecting || (needsPassword && !password)}
          >
            {connecting ? "Connecting..." : selected?.is_saved ? "Connect (saved)" : "Connect"}
          </button>

        </div>
      </div>
    </div>
  );
}
