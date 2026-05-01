# BeatSync

A real-time rhythm analytics platform built with React, Python (FastAPI), PostgreSQL, and WebSockets.

**Stack:** React · FastAPI · PostgreSQL · WebSockets · REST APIs

---

## Features

- Real-time WebSocket-based rhythm game with low-latency tap detection
- Per-beat timing accuracy scoring (Perfect / Good / Miss) with ms-level precision
- Concurrent session support — multiple users can play simultaneously
- Live leaderboard ranked by best score
- Personal performance dashboard with score and accuracy trend charts
- JWT-based authentication and multi-user data isolation

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup

In pgAdmin or psql:

```sql
CREATE DATABASE beatsync;
```

---

### 2. Backend Setup

```bash
cd backend

pip install -r requirements.txt

# Copy .env.example to .env and fill in your values
# cp .env.example .env

python -m uvicorn main:app --reload --port 8001
```

API: `http://localhost:8001`  
Docs: `http://localhost:8001/docs`

---

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

App: `http://localhost:5174`

---

## How It Works

### WebSocket Game Protocol

```
Client connects: ws://localhost:8001/ws/game?token=JWT&bpm=120

Server → Client: {"type": "start", "bpm": 120, "total_beats": 16}
Server → Client: {"type": "beat", "beat": 1, "timestamp": 12345.6}
Client → Server: {"type": "tap", "beat": 1, "client_time": 12389.2}
Server → Client: {"type": "result", "beat": 1, "offset_ms": 43.6, "rating": "perfect", "points": 300, "score": 300}
...
Server → Client: {"type": "game_over", "score": 3800, "accuracy": 87.5, ...}
```

### Scoring
| Rating  | Window  | Points |
|---------|---------|--------|
| Perfect | ±50ms   | 300    |
| Good    | ±120ms  | 100    |
| Miss    | >120ms  | 0      |

---

## Project Structure

```
BeatSync/
├── backend/
│   ├── main.py          # FastAPI app + WebSocket endpoint
│   ├── game.py          # WebSocket game session logic + scoring engine
│   ├── database.py      # SQLAlchemy config
│   ├── models.py        # User, GameSession, TapEvent
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # JWT auth
│   └── routers/
│       ├── auth.py      # Register / Login / Me
│       └── leaderboard.py # Leaderboard + personal stats
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/client.js      # Axios instance with JWT interceptor
        └── pages/
            ├── Game.jsx       # Rhythm tapper with WebSocket client
            ├── Leaderboard.jsx
            └── Stats.jsx      # Score/accuracy trend charts
```
