import TorChart from "./TorChart";

export default function TorStats({ data }) {
  return (
    <div className="card p-3" style={{ height: "100%" }}>
      <h3 className="mb-3">TOR Statistics</h3>

      <div className="mb-3 d-flex" style={{ gap: "16px" }}>
        <div><strong>Upload:</strong> {data.upload_kbs} KB/s</div>
        <div><strong>Download:</strong> {data.download_kbs} KB/s</div>
         <div><strong>Circuits:</strong> {data.circuits_count}</div>
      </div>

      <TorChart data={data.history} />

      <h5 className="mt-4">Nodes</h5>
       <ul>
          {(data.circuits ?? []).map((c) => (
           <li key={c.id}>{c.path.join(" → ")}</li>
          ))}
       </ul>
    </div>
  );
}
