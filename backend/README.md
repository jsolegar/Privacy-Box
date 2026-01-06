# Privacy-Box Dashboard (Frontend + Backend TOR real con Stem)

Este proyecto tiene dos partes:
- **Backend (Python + Stem + FastAPI):** lee métricas reales del Tor daemon usando el ControlPort y expone una API JSON.
- **Frontend (React + Vite):** muestra un dashboard y consulta la API del backend cada 3s.

> Nota: El backend monitoriza **el Tor daemon del sistema**, no el Tor interno de Tor Browser. Para ver tráfico real en el dashboard, debes generar tráfico a través del Tor daemon (SOCKS 9050).

---

## Requisitos

### Sistema
- Linux (Ubuntu/Debian recomendado)

### Backend
- Python 3.10+ (funciona con 3.12 también)
- Tor instalado como servicio (`tor.service`)

### Frontend
- Node.js 18+ y npm

---

# 1) Backend (TOR real con Stem)

## 1.1 Instalar Tor
```bash
sudo apt update
sudo apt install -y tor
sudo systemctl enable --now tor
```
1.2 Configurar ControlPort (para Stem)

Editar el fichero:

sudo nano /etc/tor/torrc


Añadir (o asegurar que existe) lo siguiente:

ControlPort 9051
CookieAuthentication 1
CookieAuthFileGroupReadable 1
SocksPort 9050


Reiniciar Tor:

sudo systemctl restart tor


Comprobar que escucha en los puertos:

ss -lntp | grep 9051
ss -lntp | grep 9050

1.3 Permisos para leer la cookie (autenticación)

Stem autentica contra Tor usando la cookie control.authcookie, que normalmente es accesible para el grupo debian-tor.

Añade tu usuario al grupo:

sudo usermod -aG debian-tor $USER


⚠️ Importante: hay que cerrar sesión o reiniciar para que aplique:

sudo reboot


Tras volver, comprobar:

groups | grep debian-tor

1.4 Crear y usar entorno virtual (venv)

Desde la carpeta del backend:

cd ~/TMA/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install stem fastapi uvicorn

1.5 Ejecutar backend

Con el venv activado:

cd ~/TMA/backend
source venv/bin/activate
python -m uvicorn backend:app --host 0.0.0.0 --port 8000


API disponible en:

http://localhost:8000/api/tor

Probar rápido:

curl -s http://localhost:8000/api/tor
