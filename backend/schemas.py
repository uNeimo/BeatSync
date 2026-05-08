from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- Game ---
class TapEventOut(BaseModel):
    beat_number: int
    offset_ms: float
    rating: str
    points: int
    class Config:
        from_attributes = True

class GameSessionOut(BaseModel):
    id: int
    bpm: int
    total_beats: int
    perfect_count: int
    good_count: int
    miss_count: int
    score: int
    accuracy: float
    avg_offset_ms: float
    completed: bool
    played_at: datetime
    class Config:
        from_attributes = True

class GameSessionWithUser(GameSessionOut):
    username: str

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: int
    accuracy: float
    perfect_count: int
    played_at: datetime

class UserStats(BaseModel):
    total_sessions: int
    best_score: int
    avg_accuracy: float
    total_perfects: int
    total_goods: int
    total_misses: int
    avg_offset_ms: float
    recent_sessions: List[GameSessionOut]
