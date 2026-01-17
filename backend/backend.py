import time
import subprocess
from pathlib import Path
from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from stem.control import Controller


CONTROL_PORT = 9051

app = FastAPI()

# Permitir llamadas desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para desarrollo
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the built React app
STATIC_DIR = Path(__file__).parent / "static"

_last = {"t": None, "r": None, "w": None}

def read_tor_stats():
    global _last
    with Controller.from_port(port=CONTROL_PORT) as c:
        c.authenticate()

        now = time.time()
        r = int(c.get_info("traffic/read"))      # bytes
        w = int(c.get_info("traffic/written"))   # bytes

        if _last["t"] is None:
            down_kbs = up_kbs = 0.0
        else:
            dt = max(0.5, now - _last["t"])
            down_kbs = (r - _last["r"]) / 1024 / dt
            up_kbs = (w - _last["w"]) / 1024 / dt

        _last = {"t": now, "r": r, "w": w}

        circuits = c.get_circuits()
        circuit_info = []
        for circ in circuits[:5]:
            circuit_info.append({
                "id": circ.id,
                "status": str(circ.status),
                "path": [nick for (nick, _) in circ.path]
            })

        return {
            "upload_kbs": round(up_kbs, 2),
            "download_kbs": round(down_kbs, 2),
            "total_sent_mb": round(w / 1024 / 1024, 2),
            "total_received_mb": round(r / 1024 / 1024, 2),
            "circuits_count": len(circuits),
            "circuits": circuit_info
        }

@app.get("/api/tor")
def tor():
    return read_tor_stats()


#
# WIFI CONFIGURATION ENDPOINTS
#

class WifiConnectRequest(BaseModel):
    ssid: str
    password: Optional[str] = None


def exec_command(cmd, timeout=20):
    """
    Execute command and capture timeout exception.
    """
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result
    except subprocess.TimeoutExpired:
        return None


@app.get("/wifi/status")
def get_status():
    """
    Check if currently connected to Wi-Fi.
    """
    result = exec_command(["nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi"])
    if result:
        for line in result.stdout.splitlines():
            if line.startswith("yes:"):
                return {"connected": True, "ssid": line.split(":")[1]}
    
    return {"connected": False, "ssid": None}


@app.get("/wifi/scan")
def scan_wifi():
    """
    Scan for nearby networks and mark if any of those is already saved.
    """
    # retrieve the already saved connections (it needs to be done separately)
    saved_conns = exec_command(["nmcli", "-t", "-f", "NAME,TYPE", "connection", "show"])
    saved_ssids = set()
    if saved_conns:
        for line in saved_conns.stdout.splitlines():
            name, net_type = line.split(":")
            if net_type == "802-11-wireless":
                saved_ssids.add(name)

    # retrieve available networks nearby list 
    scan_res = exec_command(["nmcli", "-t", "-f", "IN-USE,SSID,SIGNAL,SECURITY", "dev", "wifi", "list"])
    if not scan_res:
        raise HTTPException(status_code=500, detail="WiFi scan timed out")

    networks = []
    seen_ssids = set() # avoid duplicates, e.g. 2.4GHz and 5GHz

    for line in scan_res.stdout.splitlines():
        # colon escaping in SSID: temporarily change the nmcli escaped colon \: for %% and reconstruct it later
        parts = line.replace("\\:", "%%").split(":")
        if len(parts) < 4:
            continue
        
        ssid = parts[1].replace("%%", ":")
        if not ssid or ssid in seen_ssids:
            continue
        
        seen_ssids.add(ssid)
        networks.append({
            "active": parts[0] == "*",
            "ssid": ssid,
            "signal": int(parts[2]),
            "security": parts[3],
            "is_saved": ssid in saved_ssids
        })

    return sorted(networks, key=lambda x: x['signal'], reverse=True)


@app.post("/wifi/connect/saved")
def connect_saved(data: WifiConnectRequest):
    """
    Connect to a network that already has a stored profile.
    """
    result = exec_command(["nmcli", "connection", "up", data.ssid], timeout=20)
    if result and result.returncode == 0:
        return {"status": "success", "message": f"Switched to {data.ssid}"}
    
    error_msg = result.stderr if result else "Timeout"
    raise HTTPException(status_code=400, detail=f"Failed to connect: {error_msg}")


@app.post("/wifi/connect/new")
def connect_new(data: WifiConnectRequest):
    """
    Connect to a new network using a password.
    """
    if not data.password:
        raise HTTPException(status_code=400, detail="Password is required for new connections")
    
    result = exec_command(["nmcli", "dev", "wifi", "connect", data.ssid, "password", data.password], timeout=25)
    if result and result.returncode == 0:
        return {"status": "success", "message": f"Connected to {data.ssid}"}
    
    error_msg = result.stderr if result else "Handshake timed out"
    raise HTTPException(status_code=400, detail=f"Failed to connect: {error_msg}")


#
# FRONTEND STATIC FILE SERVING
#

# Mount static files (CSS, JS, images, etc.)
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    # Serve index.html for all non-API routes (React Router support)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # If it's an API route, let FastAPI handle it
        if full_path.startswith("api/"):
            return {"error": "API endpoint not found"}
        
        # Check if the requested file exists in static directory
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise, serve index.html for React Router
        return FileResponse(STATIC_DIR / "index.html")
