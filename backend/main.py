from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database import engine, get_db
import models
from routers import auth, leaderboard
from game import run_game_session
import os
from dotenv import load_dotenv

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BeatSync API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leaderboard.router)


def get_user_from_token(token: str, db: Session) -> models.User | None:
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM", "HS256")])
        user_id = payload.get("user_id")
        if user_id is None:
            return None
        return db.query(models.User).filter(models.User.id == user_id).first()
    except JWTError:
        return None


@app.websocket("/ws/game")
async def game_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    bpm: int = Query(default=120),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    try:
        await run_game_session(websocket, user, db, bpm=bpm)
    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


@app.get("/")
def root():
    return {"message": "BeatSync API is running"}
