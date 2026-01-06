import { useEffect, useState } from "react";
import TorStats from "./components/TorStats";
import AdblockStats from "./components/AdblockStats";
import { getMockAdblockStats } from "./data/mockData";

export default function App() {
  const [tor, setTor] = useState(null);
  const [torHistory, setTorHistory] = useState([]); // ✅ DENTRO del componente
  const [adblock, setAdblock] = useState(getMockAdblockStats());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Actualitza dades cada 3s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/tor");
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

  // Detecta canvi de mida
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!tor) return <p style={{ padding: 20 }}>Loading TOR data…</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        width: "100vw",
        background: "#f3f4f6",
        padding: "10px",
        boxSizing: "border-box",
        gap: "20px",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TorStats data={{ ...tor, history: torHistory }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdblockStats data={adblock} />
      </div>
    </div>
  );
}
