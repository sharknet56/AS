import time
from typing import Dict, List

from fastapi import HTTPException, status

# Simple in-memory rate limiter for login.

# key -> list of timestamps (seconds since epoch)
_login_attempts: Dict[str, List[float]] = {}

# Configuration: max failed attempts in a sliding window
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60


def _prune_old_attempts(attempts: List[float], now: float) -> List[float]:
    """Remove attempts outside the time window."""
    return [ts for ts in attempts if now - ts < WINDOW_SECONDS]


def check_login_not_blocked(key: str) -> None:
    """Raise 429 if this key has too many recent failed attempts."""
    now = time.time()
    attempts = _login_attempts.get(key, [])
    attempts = _prune_old_attempts(attempts, now)
    _login_attempts[key] = attempts

    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )


def register_failed_login(key: str) -> None:
    """Record a failed login attempt and enforce the limit."""
    now = time.time()
    attempts = _login_attempts.get(key, [])
    attempts = _prune_old_attempts(attempts, now)

    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )

    attempts.append(now)
    _login_attempts[key] = attempts
