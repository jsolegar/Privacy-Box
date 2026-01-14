import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();
  const active = pathname === "/wifi";

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand" style={{ textDecoration: "none" }}>
          <div className="logo">P</div>
          <div>
            <h1>Pr1vacyB0x</h1>
            <p>TOR (Stem ControlPort) + Adblocking</p>
          </div>
        </Link>

        <nav className="nav">
          <Link
            to="/wifi"
            className={`navlink ${active ? "navlink-active" : ""}`}
          >
            Wi-Fi
          </Link>
        </nav>
      </div>
    </div>
  );
}
