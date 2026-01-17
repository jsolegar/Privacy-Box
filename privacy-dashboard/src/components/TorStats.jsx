// TorStats.jsx
import TorChart from "./TorChart";

const shortFp = (fp) => (fp ? `${fp.slice(0, 6)}…${fp.slice(-4)}` : "");
const torMetricsUrl = (fp) =>
  fp ? `https://metrics.torproject.org/rs.html#search/${fp}` : "#";

const cc = (c) => (c ? String(c).toUpperCase() : "??");

// Converteix "FR" -> 🇫🇷 (si no es pot, bandera blanca)
const flag = (countryCode) => {
  const code = cc(countryCode);
  if (!code || code.length !== 2 || code.includes("?")) return "🏳️";
  const A = 65;
  return String.fromCodePoint(
    0x1f1e6 + (code.charCodeAt(0) - A),
    0x1f1e6 + (code.charCodeAt(1) - A)
  );
};

function StatBox({ label, value, sub }) {
  return (
    <div
      className="card p-3"
      style={{
        minWidth: 170,
        flex: "1 1 170px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, opacity: 0.6 }}>{sub}</div> : null}
    </div>
  );
}

export default function TorStats({ data }) {
  const up = Number(data?.upload_kbs ?? 0).toFixed(2);
  const down = Number(data?.download_kbs ?? 0).toFixed(2);

  const sent = Number(data?.total_sent_mb ?? 0).toFixed(2);
  const recv = Number(data?.total_received_mb ?? 0).toFixed(2);

  // “Exit IP” útil per demo (agafem la del primer circuit que tingui hop 3)
  const firstWithExit = (data?.circuits ?? []).find((c) => (c.path ?? []).length >= 3);
  const exitHop = firstWithExit?.path?.[2];
  const exitIp = exitHop?.ip;
  const exitCountry = exitHop?.country;

  const labels = ["Guard", "Middle", "Exit"];

  return (
    <div className="card p-3" style={{ height: "100%" }}>
      <div className="d-flex align-items-center" style={{ gap: 12, flexWrap: "wrap" }}>
        <h3 className="mb-0">TOR Statistics</h3>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
          Live (Tor ControlPort)
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-3 d-flex" style={{ gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Upload" value={`${up} KB/s`} />
        <StatBox label="Download" value={`${down} KB/s`} />
        <StatBox label="Circuits" value={data?.circuits_count ?? 0} />
        <StatBox label="Sent total" value={`${sent} MB`} />
        <StatBox label="Received total" value={`${recv} MB`} />
        <StatBox
          label="Exit IP (current)"
          value={exitIp ? `${exitIp}` : "—"}
          sub={exitCountry ? `${flag(exitCountry)} ${cc(exitCountry)}` : "click a circuit to see more"}
        />
      </div>

      {/* Chart */}
      <div className="mt-3">
        <TorChart data={data?.history ?? []} />
      </div>

      {/* Circuits list */}
      <h5 className="mt-4 mb-2">Circuits</h5>

      <div style={{ display: "grid", gap: 10 }}>
        {(data?.circuits ?? []).map((c) => {
          const path = c.path ?? [];
          const summary = path
            .map((h, i) => {
              const country = typeof h === "string" ? null : h?.country;
              const nick = typeof h === "string" ? "" : h?.nick;
              const label = labels[i] ?? `Hop${i + 1}`;
              return `${label}:${country ? cc(country) : (nick || "??")}`;
            })
            .join(" → ");

          return (
            <details
              key={c.id}
              className="card p-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <summary style={{ cursor: "pointer", fontFamily: "monospace" }}>
                <span style={{ opacity: 0.85 }}>Circuit #{c.id}</span>{" "}
                <span style={{ opacity: 0.6 }}>({c.status})</span>
                <span style={{ marginLeft: 10, opacity: 0.75 }}>{summary}</span>
              </summary>

              <div style={{ marginTop: 10, fontFamily: "monospace", fontSize: 13 }}>
                {path.length === 0 ? (
                  <div style={{ opacity: 0.7 }}>No path data</div>
                ) : (
                  path.map((hop, i) => {
                    const fp = typeof hop === "string" ? hop : hop?.fp;
                    const nick = typeof hop === "string" ? "" : hop?.nick;
                    const ip = typeof hop === "string" ? null : hop?.ip;
                    const country = typeof hop === "string" ? null : hop?.country;

                    const label = labels[i] ?? `Hop${i + 1}`;

                    return (
                      <div
                        key={`${c.id}-${i}`}
                        style={{
                          padding: "8px 0",
                          borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <strong>{label}:</strong>

                        {fp ? (
                          <a
                            href={torMetricsUrl(fp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fp + (nick ? ` (${nick})` : "")}
                            style={{ textDecoration: "none" }}
                          >
                            {shortFp(fp)}
                          </a>
                        ) : (
                          <span style={{ opacity: 0.7 }}>n/a</span>
                        )}

                        {nick ? <span style={{ opacity: 0.75 }}>({nick})</span> : null}

                        {country ? (
                          <span style={{ opacity: 0.9 }}>
                            {flag(country)} {cc(country)}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.6 }}>🏳️ ??</span>
                        )}

                        {ip ? (
                          <span style={{ opacity: 0.9 }}>{ip}</span>
                        ) : (
                          <span style={{ opacity: 0.6 }}>no-ip</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
