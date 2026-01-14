
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import WifiPage from "./pages/WifiPage";

export default function App() {
  return (
    <>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/wifi" element={<WifiPage />} />
        </Routes>
      </div>
    </>
  );
}
