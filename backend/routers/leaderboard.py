from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("/", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    # Top 10 sessions overall
    results = (
        db.query(models.GameSession, models.User.username)
        .join(models.User, models.User.id == models.GameSession.user_id)
        .filter(models.GameSession.completed == True)
        .order_by(models.GameSession.score.desc())
        .limit(limit)
        .all()
    )

    entries = []
    for rank, (session, username) in enumerate(results, start=1):
        entries.append(schemas.LeaderboardEntry(
            rank=rank,
            username=username,
            score=session.score,
            accuracy=session.accuracy,
            perfect_count=session.perfect_count,
            played_at=session.played_at,
        ))
    return entries


@router.get("/stats", response_model=schemas.UserStats)
def get_my_stats(db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    sessions = (
        db.query(models.GameSession)
        .filter(models.GameSession.user_id == current_user.id,
                models.GameSession.completed == True)
        .order_by(models.GameSession.played_at.desc())
        .all()
    )

    if not sessions:
        return schemas.UserStats(
            total_sessions=0, best_score=0, avg_accuracy=0.0,
            total_perfects=0, total_goods=0, total_misses=0,
            avg_offset_ms=0.0, recent_sessions=[]
        )

    return schemas.UserStats(
        total_sessions=len(sessions),
        best_score=max(s.score for s in sessions),
        avg_accuracy=round(sum(s.accuracy for s in sessions) / len(sessions), 2),
        total_perfects=sum(s.perfect_count for s in sessions),
        total_goods=sum(s.good_count for s in sessions),
        total_misses=sum(s.miss_count for s in sessions),
        avg_offset_ms=round(sum(s.avg_offset_ms for s in sessions) / len(sessions), 2),
        recent_sessions=sessions[:5],
    )
