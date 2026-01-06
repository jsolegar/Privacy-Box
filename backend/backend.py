import time
from fastapi import FastAPI
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

