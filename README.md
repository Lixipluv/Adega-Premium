# Adega Premium — Wine Catalog Kiosk

Production-ready online wine catalog designed to run on a kiosk display (touchscreen) in wine shops and restaurants.

- **Frontend**: Next.js 14 (App Router, PWA, kiosk fullscreen, idle redirect)
- **Backend**: FastAPI (catalog, media, analytics, QR codes)
- **DB**: PostgreSQL 16 with `tsvector` full-text search
- **Cache**: Redis 7 (TTL caching on hot endpoints)
- **Storage**: Cloudflare R2 / S3-compatible (with local fallback)

## Run

```bash
docker compose up --build
```

- Kiosk frontend: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- API docs: http://localhost:8000/docs

Default admin bearer token (override via `ADMIN_TOKEN` in `docker-compose.yml`):

```
change-me-in-production
```

## Routes

### Kiosk (cliente)
- `/` — Splash de boas-vindas
- `/inicio` — Menu com 8 categorias (Tintos, Brancos, Rosés, Espumantes, Promoções, Mais vendidos, Harmonização, Preço)
- `/explorar` — Listagem com filtros via query string
- `/escolher` — Questionário guiado (4 perguntas → 3 recomendações)
- `/filtro` — Busca inteligente por texto + filtros avançados
- `/wine/[id]` — Ficha completa do vinho (QR code, harmonização, selos)

### Admin
- `/admin` — Produtos (CRUD)
- `/admin/categorias`, `/admin/pedidos`, `/admin/usuarios`, `/admin/config`, `/admin/relatorios` (export PDF)

### API
- `GET /wines` — list with filters (category, price, food, body, sweetness, promo, occasion, knowledge_level)
- `GET /wines/{id}` — detail
- `GET /wines/{id}/related` — related wines
- `GET /wines/{id}/qr` — PNG QR code
- `GET /regions`, `GET /tags`
- `POST /events`, `GET /analytics/top` (sort=bestseller)
- `POST /wines`, `PUT /wines/{id}`, `DELETE /wines/{id}` (admin)
- `POST /media/upload` (admin)

## Kiosk behavior
- Touch targets 48px+, tipografia premium (Cormorant Garamond + Montserrat)
- Idle timeout (2 min) returns to homepage
- PWA manifest, service worker para cache offline

## Design tokens
- Gold `#D4AF37` · Burgundy `#6B0F1A` · Charcoal `#1A1A1A` · Cream `#F5F0E6`

## Notes
- Schema, trigger, and 20 seed wines load from `init.sql`.
- Extended fields: sweetness, body, promotion, badges, food pairings (`migrations/002_extended_wines.sql`).
- Public endpoints rate-limited to 60 req/min per IP.
- Redis cache TTL 5 min; flushed on admin writes.
