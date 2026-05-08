"""
WebSocket game session manager.
Each connected client gets a GameSession record.
The server sends beat events; client sends tap events back.
Server scores each tap and streams results back in real-time.
"""
import json
import asyncio
from datetime import datetime
from typing import Dict
from fastapi import WebSocket
from sqlalchemy.orm import Session
import models

# Timing windows (milliseconds)
PERFECT_WINDOW = 50   # ±50ms
GOOD_WINDOW = 120     # ±120ms

PERFECT_POINTS = 300
GOOD_POINTS = 100
MISS_POINTS = 0

BEATS_PER_GAME = 16


def ms_between_beats(bpm: int) -> float:
    return 60_000 / bpm


def score_tap(offset_ms: float) -> tuple[str, int]:
    """Return (rating, points) for a tap offset."""
    abs_offset = abs(offset_ms)
    if abs_offset <= PERFECT_WINDOW:
        return "perfect", PERFECT_POINTS
    elif abs_offset <= GOOD_WINDOW:
        return "good", GOOD_POINTS
    else:
        return "miss", MISS_POINTS


async def run_game_session(
    websocket: WebSocket,
    user: models.User,
    db: Session,
    bpm: int = 120,
):
    """
    Drive a full game session over a WebSocket connection.
    Protocol:
      server -> client: {"type": "beat", "beat": N, "timestamp": ms}
      client -> server: {"type": "tap", "beat": N, "client_time": ms}
      server -> client: {"type": "result", "beat": N, "offset_ms": float, "rating": str, "points": int, "score": int}
      server -> client: {"type": "game_over", "score": int, "accuracy": float, ...}
    """
    beat_interval = ms_between_beats(bpm)

    # Create DB session record
    game_session = models.GameSession(
        user_id=user.id,
        bpm=bpm,
        total_beats=BEATS_PER_GAME,
    )
    db.add(game_session)
    db.commit()
    db.refresh(game_session)

    await websocket.send_json({"type": "start", "bpm": bpm, "total_beats": BEATS_PER_GAME, "session_id": game_session.id})

    total_score = 0
    tap_results = []
    beat_timestamps: Dict[int, float] = {}

    # Small countdown
    await asyncio.sleep(1.0)

    async def send_beats():
        for beat_num in range(1, BEATS_PER_GAME + 1):
            beat_time = asyncio.get_event_loop().time() * 1000
            beat_timestamps[beat_num] = beat_time
            await websocket.send_json({"type": "beat", "beat": beat_num, "timestamp": beat_time})
            await asyncio.sleep(beat_interval / 1000)
        # After last beat, wait one interval for final taps
        await asyncio.sleep(beat_interval / 1000)

    async def receive_taps():
        nonlocal total_score
        tapped_beats = set()
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=0.05)
                if data.get("type") == "tap":
                    beat_num = data.get("beat")
                    offset_ms = data.get("offset_ms", 999)  # client calculates offset

                    if beat_num in beat_timestamps and beat_num not in tapped_beats:
                        tapped_beats.add(beat_num)
                        rating, points = score_tap(offset_ms)
                        total_score += points

                        tap_event = models.TapEvent(
                            session_id=game_session.id,
                            beat_number=beat_num,
                            offset_ms=offset_ms,
                            rating=rating,
                            points=points,
                        )
                        db.add(tap_event)
                        tap_results.append({"beat": beat_num, "offset_ms": offset_ms, "rating": rating, "points": points})

                        await websocket.send_json({
                            "type": "result",
                            "beat": beat_num,
                            "offset_ms": round(offset_ms, 1),
                            "rating": rating,
                            "points": points,
                            "score": total_score,
                        })
            except asyncio.TimeoutError:
                pass
            except Exception:
                break

    beat_task = asyncio.create_task(send_beats())
    tap_task = asyncio.create_task(receive_taps())

    await beat_task
    tap_task.cancel()
    try:
        await tap_task
    except asyncio.CancelledError:
        pass

    db.commit()

    # Finalize session
    perfect = sum(1 for t in tap_results if t["rating"] == "perfect")
    good = sum(1 for t in tap_results if t["rating"] == "good")
    miss = BEATS_PER_GAME - len(tap_results)
    hit_count = perfect + good
    accuracy = round((hit_count / BEATS_PER_GAME) * 100, 2) if BEATS_PER_GAME > 0 else 0
    offsets = [t["offset_ms"] for t in tap_results]
    avg_offset = round(sum(offsets) / len(offsets), 2) if offsets else 0.0

    game_session.perfect_count = perfect
    game_session.good_count = good
    game_session.miss_count = miss
    game_session.score = total_score
    game_session.accuracy = accuracy
    game_session.avg_offset_ms = avg_offset
    game_session.completed = True
    db.commit()

    await websocket.send_json({
        "type": "game_over",
        "session_id": game_session.id,
        "score": total_score,
        "accuracy": accuracy,
        "perfect": perfect,
        "good": good,
        "miss": miss,
        "avg_offset_ms": avg_offset,
    })
