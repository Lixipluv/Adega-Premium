"""Adega Premium API — FastAPI catalog, media, analytics, QR services."""
from __future__ import annotations

import io
import json
import os
import uuid
from contextlib import asynccontextmanager
from typing import Any, Optional

import asyncpg
import qrcode
import redis.asyncio as redis_lib
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://adega:adega_secret@postgres:5432/adega")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me-in-production")
PUBLIC_DOMAIN = os.getenv("PUBLIC_DOMAIN", "localhost:3000")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

CACHE_TTL = 300  # 5 min

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
    app.state.redis = redis_lib.from_url(REDIS_URL, decode_responses=True)
    yield
    await app.state.pool.close()
    await app.state.redis.close()


app = FastAPI(title="Adega Premium API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


# ---------- Models ----------

class Wine(BaseModel):
    id: int
    name: str
    winery: str
    region: Optional[str] = None
    country: str
    grape_variety: str
    vintage_year: Optional[int] = None
    price_brl: float
    alcohol_pct: Optional[float] = None
    tasting_notes: Optional[str] = None
    pairing_suggestions: Optional[str] = None
    score_average: float = 0
    stock_available: bool = True
    image_url: Optional[str] = None
    category: str = "tinto"
    sweetness_level: str = "seco"
    body: str = "medio"
    on_promotion: bool = False
    knowledge_level: str = "intermediario"
    badges: list[str] = Field(default_factory=list)
    food_pairings: list[str] = Field(default_factory=list)


class WineCreate(BaseModel):
    name: str
    winery: str
    region: Optional[str] = None
    country: str
    grape_variety: str
    vintage_year: Optional[int] = None
    price_brl: float = Field(ge=0)
    alcohol_pct: Optional[float] = None
    tasting_notes: Optional[str] = None
    pairing_suggestions: Optional[str] = None
    score_average: float = 0
    stock_available: bool = True
    image_url: Optional[str] = None
    category: str = "tinto"
    sweetness_level: str = "seco"
    body: str = "medio"
    on_promotion: bool = False
    knowledge_level: str = "intermediario"
    badges: list[str] = Field(default_factory=list)
    food_pairings: list[str] = Field(default_factory=list)


class EventIn(BaseModel):
    session_id: Optional[str] = None
    wine_id: int
    event_type: str  # view | qr_scan | detail_open


# ---------- Helpers ----------

def require_admin(authorization: Optional[str] = Header(None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    if authorization.removeprefix("Bearer ").strip() != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")


async def cache_get(key: str) -> Optional[Any]:
    raw = await app.state.redis.get(key)
    return json.loads(raw) if raw else None


async def cache_set(key: str, value: Any, ttl: int = CACHE_TTL) -> None:
    await app.state.redis.set(key, json.dumps(value, default=str), ex=ttl)


def _col(row: asyncpg.Record, key: str, default: Any = None) -> Any:
    return row[key] if key in row.keys() else default


def wine_row(row: asyncpg.Record) -> dict:
    badges = _col(row, "badges") or []
    food_pairings = _col(row, "food_pairings") or []
    return {
        "id": row["id"],
        "name": row["name"],
        "winery": row["winery"],
        "region": row["region"],
        "country": row["country"],
        "grape_variety": row["grape_variety"],
        "vintage_year": row["vintage_year"],
        "price_brl": float(row["price_brl"]),
        "alcohol_pct": float(row["alcohol_pct"]) if row["alcohol_pct"] is not None else None,
        "tasting_notes": row["tasting_notes"],
        "pairing_suggestions": row["pairing_suggestions"],
        "score_average": float(row["score_average"] or 0),
        "stock_available": row["stock_available"],
        "image_url": row["image_url"],
        "category": row["category"],
        "sweetness_level": _col(row, "sweetness_level") or "seco",
        "body": _col(row, "body") or "medio",
        "on_promotion": bool(_col(row, "on_promotion")),
        "knowledge_level": _col(row, "knowledge_level") or "intermediario",
        "badges": list(badges),
        "food_pairings": list(food_pairings),
    }


# ---------- Catalog ----------

@app.get("/wines")
@limiter.limit("60/minute")
async def list_wines(
    request: Request,
    region: Optional[str] = None,
    country: Optional[str] = None,
    grape: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    food: Optional[str] = None,
    body: Optional[str] = None,
    sweetness: Optional[str] = None,
    knowledge_level: Optional[str] = None,
    on_promotion: Optional[bool] = None,
    promo: Optional[bool] = None,
    occasion: Optional[str] = None,
    sort: str = "newest",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    cache_key = (
        f"wines:{region}:{country}:{grape}:{category}:{min_price}:{max_price}:{tag}:{q}:"
        f"{food}:{body}:{sweetness}:{knowledge_level}:{on_promotion}:{promo}:{occasion}:{sort}:{page}:{page_size}"
    )
    cached = await cache_get(cache_key)
    if cached:
        return cached

    if promo is not None:
        on_promotion = promo

    where = ["1=1"]
    params: list[Any] = []

    def add(clause: str, value: Any) -> None:
        params.append(value)
        where.append(clause.replace("?", f"${len(params)}"))

    if region:
        add("region = ?", region)
    if country:
        add("country = ?", country)
    if grape:
        add("grape_variety ILIKE ?", f"%{grape}%")
    if category:
        add("category = ?", category)
    if min_price is not None:
        add("price_brl >= ?", min_price)
    if max_price is not None:
        add("price_brl <= ?", max_price)
    if q:
        params.append(q)
        where.append(f"search_vector @@ plainto_tsquery('simple', unaccent(${len(params)}))")
    if food:
        params.append(food)
        where.append(
            f"(${len(params)} = ANY(food_pairings) OR pairing_suggestions ILIKE '%' || ${len(params)} || '%')"
        )
    if body:
        add("body = ?", body)
    if sweetness:
        add("sweetness_level = ?", sweetness)
    if knowledge_level:
        add("knowledge_level = ?", knowledge_level)
    if on_promotion is not None:
        add("on_promotion = ?", on_promotion)
    if occasion:
        params.append(occasion)
        where.append(f"${len(params)} = ANY(badges)")

    join = ""
    if tag:
        params.append(tag)
        join = (
            f" JOIN wine_tags wt ON wt.wine_id = wines.id "
            f"JOIN tags t ON t.id = wt.tag_id AND t.slug = ${len(params)}"
        )

    order = {
        "price_asc": "wines.price_brl ASC",
        "price_desc": "wines.price_brl DESC",
        "score": "wines.score_average DESC",
        "newest": "wines.created_at DESC",
        "name": "wines.name ASC",
    }.get(sort, "wines.created_at DESC")

    select_from = "wines"
    if sort == "bestseller":
        select_from = (
            "wines LEFT JOIN ("
            "SELECT wine_id, COUNT(*) AS view_count FROM events "
            "WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY wine_id"
            ") ev ON ev.wine_id = wines.id"
        )
        order = "COALESCE(ev.view_count, 0) DESC, wines.score_average DESC"

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    sql = (
        f"SELECT wines.* FROM {select_from}{join} WHERE {' AND '.join(where)} "
        f"ORDER BY {order} LIMIT ${len(params) - 1} OFFSET ${len(params)}"
    )

    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)
        count_sql = f"SELECT count(*) FROM {select_from}{join} WHERE {' AND '.join(where)}"
        total = await conn.fetchval(count_sql, *params[:-2])

    result = {
        "items": [wine_row(r) for r in rows],
        "page": page,
        "page_size": page_size,
        "total": total,
    }
    await cache_set(cache_key, result)
    return result


@app.get("/wines/{wine_id}")
@limiter.limit("60/minute")
async def get_wine(request: Request, wine_id: int):
    async with app.state.pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM wines WHERE id = $1", wine_id)
    if not row:
        raise HTTPException(404, "Wine not found")
    return wine_row(row)


@app.get("/wines/{wine_id}/related")
@limiter.limit("60/minute")
async def related_wines(request: Request, wine_id: int):
    async with app.state.pool.acquire() as conn:
        base = await conn.fetchrow("SELECT region, grape_variety FROM wines WHERE id = $1", wine_id)
        if not base:
            raise HTTPException(404, "Wine not found")
        rows = await conn.fetch(
            """
            SELECT * FROM wines
            WHERE id != $1 AND (region = $2 OR grape_variety = $3)
            ORDER BY score_average DESC NULLS LAST
            LIMIT 4
            """,
            wine_id, base["region"], base["grape_variety"],
        )
    return [wine_row(r) for r in rows]


@app.get("/regions")
@limiter.limit("60/minute")
async def list_regions(request: Request):
    cached = await cache_get("regions:all")
    if cached:
        return cached
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, country, description, image_url FROM regions ORDER BY country, name")
    result = [dict(r) for r in rows]
    await cache_set("regions:all", result)
    return result


@app.get("/tags")
@limiter.limit("60/minute")
async def list_tags(request: Request):
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, slug, label FROM tags ORDER BY label")
    return [dict(r) for r in rows]


# ---------- Admin CRUD ----------

@app.post("/wines", dependencies=[Depends(require_admin)])
async def create_wine(payload: WineCreate):
    async with app.state.pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO wines (name, winery, region, country, grape_variety, vintage_year,
                price_brl, alcohol_pct, tasting_notes, pairing_suggestions, score_average,
                stock_available, image_url, category, sweetness_level, body, on_promotion,
                knowledge_level, badges, food_pairings)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
            RETURNING *
            """,
            payload.name, payload.winery, payload.region, payload.country, payload.grape_variety,
            payload.vintage_year, payload.price_brl, payload.alcohol_pct, payload.tasting_notes,
            payload.pairing_suggestions, payload.score_average, payload.stock_available,
            payload.image_url, payload.category, payload.sweetness_level, payload.body,
            payload.on_promotion, payload.knowledge_level, payload.badges, payload.food_pairings,
        )
    await app.state.redis.flushdb()
    return wine_row(row)


@app.put("/wines/{wine_id}", dependencies=[Depends(require_admin)])
async def update_wine(wine_id: int, payload: WineCreate):
    async with app.state.pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE wines SET name=$1, winery=$2, region=$3, country=$4, grape_variety=$5,
                vintage_year=$6, price_brl=$7, alcohol_pct=$8, tasting_notes=$9,
                pairing_suggestions=$10, score_average=$11, stock_available=$12,
                image_url=$13, category=$14, sweetness_level=$15, body=$16, on_promotion=$17,
                knowledge_level=$18, badges=$19, food_pairings=$20
            WHERE id=$21 RETURNING *
            """,
            payload.name, payload.winery, payload.region, payload.country, payload.grape_variety,
            payload.vintage_year, payload.price_brl, payload.alcohol_pct, payload.tasting_notes,
            payload.pairing_suggestions, payload.score_average, payload.stock_available,
            payload.image_url, payload.category, payload.sweetness_level, payload.body,
            payload.on_promotion, payload.knowledge_level, payload.badges, payload.food_pairings,
            wine_id,
        )
    if not row:
        raise HTTPException(404, "Wine not found")
    await app.state.redis.flushdb()
    return wine_row(row)


@app.delete("/wines/{wine_id}", dependencies=[Depends(require_admin)])
async def delete_wine(wine_id: int):
    async with app.state.pool.acquire() as conn:
        result = await conn.execute("DELETE FROM wines WHERE id = $1", wine_id)
    await app.state.redis.flushdb()
    return {"deleted": result.split()[-1] == "1"}


# ---------- Media ----------

@app.post("/media/upload", dependencies=[Depends(require_admin)])
async def upload_media(file: UploadFile = File(...)):
    endpoint = os.getenv("R2_ENDPOINT", "")
    bucket = os.getenv("R2_BUCKET", "adega-media")
    if not endpoint:
        # Local fallback: stash in /app/uploads and serve via API
        uploads = "/app/uploads"
        os.makedirs(uploads, exist_ok=True)
        fname = f"{uuid.uuid4().hex}-{file.filename}"
        path = os.path.join(uploads, fname)
        with open(path, "wb") as f:
            f.write(await file.read())
        return {"url": f"/uploads/{fname}"}

    import boto3
    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
    )
    key = f"{uuid.uuid4().hex}-{file.filename}"
    s3.upload_fileobj(file.file, bucket, key, ExtraArgs={"ContentType": file.content_type})
    return {"url": f"{endpoint}/{bucket}/{key}"}


# ---------- Analytics ----------

@app.post("/events")
async def log_event(event: EventIn):
    if event.event_type not in {"view", "qr_scan", "detail_open"}:
        raise HTTPException(400, "Invalid event_type")
    async with app.state.pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO events (session_id, wine_id, event_type) VALUES ($1, $2, $3)",
            event.session_id, event.wine_id, event.event_type,
        )
    return {"ok": True}


@app.get("/analytics/top")
async def top_wines():
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT w.*, COUNT(e.id) AS views
            FROM wines w
            LEFT JOIN events e ON e.wine_id = w.id AND e.created_at > NOW() - INTERVAL '30 days'
            GROUP BY w.id
            ORDER BY views DESC, w.score_average DESC
            LIMIT 10
            """
        )
    return [{**wine_row(r), "views": r["views"]} for r in rows]


# ---------- QR code ----------

@app.get("/wines/{wine_id}/qr")
async def wine_qr(wine_id: int):
    async with app.state.pool.acquire() as conn:
        exists = await conn.fetchval("SELECT 1 FROM wines WHERE id = $1", wine_id)
    if not exists:
        raise HTTPException(404, "Wine not found")
    url = f"https://{PUBLIC_DOMAIN}/wine/{wine_id}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@app.get("/health")
async def health():
    return {"status": "ok"}
