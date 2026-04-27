import time
from collections import defaultdict

from fastapi import HTTPException, Request, status

_requests: dict[str, list[float]] = defaultdict(list)

MAX_REQUESTS = 10
WINDOW_SECONDS = 60


async def rate_limit_por_ip(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    agora = time.time()
    _requests[ip] = [t for t in _requests[ip] if agora - t < WINDOW_SECONDS]

    if len(_requests[ip]) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas requisições. Tente novamente em alguns segundos.",
        )
    _requests[ip].append(agora)
