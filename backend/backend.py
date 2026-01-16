# backend.py
import time
from threading import Lock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from stem.control import Controller

CONTROL_PORT = 9051

app = FastAPI()

# Permitir llamadas desde el frontend (desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_lock = Lock()
_controller = None

_last = {"t": None, "r": None, "w": None}
_cached = {"t": 0.0, "data": None}  # cache corta para evitar martillar el ControlPort


def _safe_int(val, default=0) -> int:
    try:
        return int(val)
    except Exception:
        return default


def _get_controller() -> Controller:
    """
    Devuelve un Controller autenticado y reutilizable.
    Si se rompe la conexión, se recrea en la siguiente llamada.
    """
    global _controller
    if _controller is not None:
        return _controller

    c = Controller.from_port(port=CONTROL_PORT)
    c.authenticate()  # CookieAuthentication o HashedControlPassword según torrc
    _controller = c
    return _controller


def _reset_controller():
    global _controller
    try:
        if _controller is not None:
            _controller.close()
    except Exception:
        pass
    _controller = None


def read_tor_stats():
    """
    Lee stats de Tor (traffic + circuits). Cachea 0.5s para reducir carga.
    """
    global _last, _cached

    now = time.time()
    if _cached["data"] is not None and (now - _cached["t"]) < 0.5:
        return _cached["data"]

    with _lock:
        try:
            c = _get_controller()

            r = _safe_int(c.get_info("traffic/read"), 0)        # bytes
            w = _safe_int(c.get_info("traffic/written"), 0)     # bytes

            if _last["t"] is None:
                down_kbs = up_kbs = 0.0
            else:
                dt = max(0.5, now - _last["t"])
                down_kbs = max(0, r - _last["r"]) / 1024 / dt
                up_kbs = max(0, w - _last["w"]) / 1024 / dt

            _last = {"t": now, "r": r, "w": w}

            circuits = c.get_circuits()
            circuit_info = []
            for circ in circuits[:5]:
                # circ.path: List[Tuple[fingerprint, nickname]]
                circuit_info.append(
                    {
                        "id": circ.id,
                        "status": str(circ.status),
                        "path": [{"fp": fp, "nick": nick} for (fp, nick) in circ.path],
                    }
                )

            data = {
                "upload_kbs": round(up_kbs, 2),
                "download_kbs": round(down_kbs, 2),
                "total_sent_mb": round(w / 1024 / 1024, 2),
                "total_received_mb": round(r / 1024 / 1024, 2),
                "circuits_count": len(circuits),
                "circuits": circuit_info,
            }

            _cached = {"t": now, "data": data}
            return data

        except Exception as e:
            # Si Tor cae o el ControlPort se queda colgado, forzamos reconexión
            _reset_controller()
            raise e


@app.get("/api/tor")
def tor():
    try:
        return read_tor_stats()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Tor control unavailable: {type(e).__name__}",
        )


@app.get("/api/tor/health")
def tor_health():
    """
    Útil para UI: indica si Tor está bootstrapped.
    """
    try:
        c = _get_controller()
        phase = c.get_info("status/bootstrap-phase", default="")
        version = c.get_info("version", default="")

        progress = 0
        try:
            if "PROGRESS=" in phase:
                progress = int(phase.split("PROGRESS=")[1].split(" ")[0])
        except Exception:
            progress = 0

        return {
            "ok": progress == 100,
            "progress": progress,
            "phase": phase,
            "version": version,
        }
    except Exception as e:
        _reset_controller()
        raise HTTPException(
            status_code=503,
            detail=f"Tor control unavailable: {type(e).__name__}",
        )
