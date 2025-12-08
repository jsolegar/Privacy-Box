import { useEffect, useState } from "react";
import TorStats from "./components/TorStats";
import AdblockStats from "./components/AdblockStats";
import { getMockTorStats, getMockAdblockStats } from "./data/mockData";

export default function App() {
  const [tor, setTor] = useState(getMockTorStats());
  const [adblock, setAdblock] = useState(getMockAdblockStats());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Actualitza dades cada 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTor(getMockTorStats());
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        width: "100vw",        // <-- afegir aquesta línia
        background: "#f3f4f6",
        padding: "10px",
        boxSizing: "border-box",
        gap: "20px"
      }}
    >

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TorStats data={tor} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdblockStats data={adblock} />
      </div>
    </div>
  );
}
