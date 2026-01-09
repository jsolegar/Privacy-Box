import TorChart from "./TorChart";

const shortFp = (fp) => (fp ? `${fp.slice(0, 6)}…${fp.slice(-4)}` : "");

export default function TorStats({ data }) {
  const up = Number(data.upload_kbs ?? 0).toFixed(2);
  const down = Number(data.download_kbs ?? 0).toFixed(2);

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
          <strong>Circuits:</strong> {data.circuits_count}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
          Live (Tor ControlPort)
        </div>
      </div>

      <TorChart data={data.history} />

      <h5 className="mt-4">Nodes</h5>
      <ul style={{ fontFamily: "monospace" }}>
        {(data.circuits ?? []).map((c) => {
          const hops = (c.path ?? []).map(shortFp);

          // Etiquetes per posició (0=Guard, 1=Middle, 2=Exit)
          const labels = ["Guard", "Middle", "Exit"];
          const pretty = hops
            .map((h, i) => `${labels[i] ?? `Hop${i + 1}`}: ${h}`)
            .join("  →  ");

          return <li key={c.id}>{pretty}</li>;
        })}
      </ul>
    </div>
  );
}
