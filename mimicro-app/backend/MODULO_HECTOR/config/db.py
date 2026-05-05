import os
import asyncpg

_pool = None

async def init_db():
    global _pool
    _pool = await asyncpg.create_pool(os.environ["DATABASE_URL"], min_size=2, max_size=10)

async def get_pool():
    return _pool

async def fetchone(query: str, *args):
    async with _pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def fetchall(query: str, *args):
    async with _pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def execute(query: str, *args):
    async with _pool.acquire() as conn:
        return await conn.execute(query, *args)

async def fetchval(query: str, *args):
    async with _pool.acquire() as conn:
        return await conn.fetchval(query, *args)
