import AdblockChart from "./AdblockChart";

export default function AdblockStats({ data }) {
  return (
    <div className="card p-3" style={{ height: "100%" }}>
      <h3 className="mb-3">Adblocking</h3>

      <div className="mb-3 d-flex" style={{ gap: "16px" }}>
        <div><strong>Total requests:</strong> {data.total}</div>
        <div><strong>Blocked:</strong> {data.blocked}</div>
        <div><strong>% blocked:</strong> {data.percent}%</div>
      </div>

      <AdblockChart data={data.history} />

      <h5 className="mt-4">Top blocked domains</h5>
      <ul>
        {data.topDomains.map((d) => (
          <li key={d.domain}>{d.domain} → {d.hits} hits</li>
        ))}
      </ul>

      <h5 className="mt-4">Whitelist</h5>
      <ul>
        {data.whitelist.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
