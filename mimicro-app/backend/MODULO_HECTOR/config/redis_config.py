import os
import redis.asyncio as aioredis

_redis = None

async def init_redis():
    global _redis
    _redis = aioredis.from_url(os.environ["REDIS_URL"], decode_responses=True)

def get_redis():
    return _redis
