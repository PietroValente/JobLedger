# JobLedger

Ship fast, iterate on quality. JobLedger started as a way to track job applications — it became a ground for building backend systems the right way: layered architecture, production-grade auth, Dockerized from day one.

---

## Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Runtime         | Node.js + TypeScript (ESM)       |
| Framework       | Fastify                          |
| ORM             | Prisma v7                        |
| Database        | PostgreSQL                       |
| Auth            | JWT + Argon2 + HTTP-only cookies |
| Validation      | Zod + fastify-type-provider-zod  |
| Infrastructure  | Docker + Docker Compose          |
| Package manager | pnpm                             |

---

## Running locally

```bash
git clone https://github.com/your-username/jobledger
cd jobledger
pnpm install
cp .env.example .env
docker compose up --build
pnpm prisma migrate dev
```

```env
DATABASE_URL=
JWT_SECRET=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

---

## Planned improvements

- Refresh token rotation on every use
- Redis session cache layer
- Rate limiting per endpoint
- RBAC / permission scopes
- Structured logging + OpenTelemetry tracing
- CI/CD + production Docker build
