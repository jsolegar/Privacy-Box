import time
from pathlib import Path
from fastapi import FastAPI
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
