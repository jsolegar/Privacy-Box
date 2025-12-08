import { useEffect, useState } from "react";
import TorStats from "./components/TorStats";
import AdblockStats from "./components/AdblockStats";
import { getMockTorStats, getMockAdblockStats } from "./data/mockData";

export default function App() {
  const [tor, setTor] = useState(getMockTorStats());
  const [adblock, setAdblock] = useState(getMockAdblockStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setTor(getMockTorStats());
      setAdblock(getMockAdblockStats());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT HALF: TOR */}
      <div style={{ flex: 1, paddingRight: "20px" }}>
        <TorStats data={tor} />
      </div>

      {/* RIGHT HALF: ADBLOCK */}
      <div style={{ flex: 1, paddingLeft: "20px" }}>
        <AdblockStats data={adblock} />
      </div>
    </div>
  );
}
