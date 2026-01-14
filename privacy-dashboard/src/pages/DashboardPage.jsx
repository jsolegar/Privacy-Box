import { useEffect, useState } from "react";
import TorStats from "../components/TorStats";
import AdblockStats from "../components/AdblockStats";
import { getMockAdblockStats } from "../data/mockData";

export default function DashboardPage() {
  const [tor, setTor] = useState(null);
  const [torHistory, setTorHistory] = useState([]);
  const [adblock, setAdblock] = useState(getMockAdblockStats());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/tor");
        const data = await res.json();
        setTor(data);

        setTorHistory((prev) => {
          const next = [
            ...prev,
            {
              time: new Date().toLocaleTimeString().slice(3, 8), // mm:ss
              upload: data.upload_kbs ?? 0,
              download: data.download_kbs ?? 0,
            },
          ];
          return next.slice(-12);
        });
      } catch (err) {
        console.error("Error fetching TOR data:", err);
      }

      setAdblock(getMockAdblockStats());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!tor) return <p className="loading">Loading TOR data…</p>;

  return (
    <div className="grid">
      <section className="card">
        <TorStats data={{ ...tor, history: torHistory }} />
      </section>

      <section className="card">
        <AdblockStats data={adblock} />
      </section>
    </div>
  );
}
