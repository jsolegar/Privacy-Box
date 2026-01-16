// TorStats.jsx
import TorChart from "./TorChart";

const shortFp = (fp) => (fp ? `${fp.slice(0, 6)}…${fp.slice(-4)}` : "");
const torMetricsUrl = (fp) =>
  fp ? `https://metrics.torproject.org/rs.html#search/${fp}` : "#";

export default function TorStats({ data }) {
  const up = Number(data?.upload_kbs ?? 0).toFixed(2);
  const down = Number(data?.download_kbs ?? 0).toFixed(2);

  const labels = ["Guard", "Middle", "Exit"];

  return (
    <div className="card p-3" style={{ height: "100%" }}>
      <h3 className="mb-3">TOR Statistics</h3>

      <div className="mb-3 d-flex" style={{ gap: "16px", flexWrap: "wrap" }}>
        <div>
          <strong>Upload:</strong> {up} KB/s
        </div>
        <div>
          <strong>Download:</strong> {down} KB/s
        </div>
        <div>
          <strong>Circuits:</strong> {data?.circuits_count ?? 0}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
          Live (Tor ControlPort)
        </div>
      </div>

      <TorChart data={data?.history ?? []} />

      <h5 className="mt-4">Nodes</h5>
      <ul style={{ fontFamily: "monospace" }}>
        {(data?.circuits ?? []).map((c) => (
          <li key={c.id} style={{ marginBottom: 6 }}>
            {(c.path ?? []).map((hop, i) => {
              // Suporta tant el format nou {fp,nick} com l'antic string
              const fp = typeof hop === "string" ? hop : hop?.fp;
              const nick = typeof hop === "string" ? "" : hop?.nick;

              const label = labels[i] ?? `Hop${i + 1}`;
              const isLast = i >= (c.path?.length ?? 0) - 1;

              return (
                <span key={`${c.id}-${i}`}>
                  <strong>{label}:</strong>{" "}
                  {fp ? (
                    <a
                      href={torMetricsUrl(fp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={fp + (nick ? ` (${nick})` : "")}
                      style={{ textDecoration: "none" }}
                    >
                      {shortFp(fp)}
                      {nick ? <span style={{ opacity: 0.7 }}> ({nick})</span> : null}
                    </a>
                  ) : (
                    "n/a"
                  )}
                  {!isLast ? "  →  " : ""}
                </span>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
