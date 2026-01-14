import { Link } from "react-router-dom";
import { useState } from "react";

export default function WifiPage() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="center-page">
      <div className="card center-card">

        {/* 🔙 BOTÓ TORNAR */}
        <Link to="/" className="back-button">
          ← Back to Dashboard
        </Link>

        <h2 className="card-title">Wi-Fi Setup</h2>
        <p className="muted">
          Configure Pr1vacyB0x's Wi-Fi connection.
        </p>

        <div className="form">
          <label className="label">SSID</label>
          <input
            className="input"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="Network Name"
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button
            className="button"
            type="button"
            onClick={() => alert("Connect (backend pending)")}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
