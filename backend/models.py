from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("GameSession", back_populates="user", cascade="all, delete")


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bpm = Column(Integer, default=120)
    total_beats = Column(Integer, default=0)
    perfect_count = Column(Integer, default=0)
    good_count = Column(Integer, default=0)
    miss_count = Column(Integer, default=0)
    score = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)   # percentage 0-100
    avg_offset_ms = Column(Float, default=0.0)  # avg ms off the beat
    completed = Column(Boolean, default=False)
    played_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")
    taps = relationship("TapEvent", back_populates="session", cascade="all, delete")


class TapEvent(Base):
    __tablename__ = "tap_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    beat_number = Column(Integer, nullable=False)
    offset_ms = Column(Float, nullable=False)   # ms off the beat (negative = early, positive = late)
    rating = Column(String, nullable=False)     # "perfect", "good", "miss"
    points = Column(Integer, default=0)
    tapped_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("GameSession", back_populates="taps")
