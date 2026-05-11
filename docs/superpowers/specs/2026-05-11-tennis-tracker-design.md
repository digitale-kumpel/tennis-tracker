# Tennis Tracker App - Design Spec

## Overview

Personal tennis tracking app for Manuel Schoebel (VfL Grafenwald, LK 22.4). Tracks matches, training sessions, daily routines, body metrics, and goals. Mobile-first, single user.

## Stack

- **Framework:** Next.js (standalone output)
- **API:** REST endpoints under `/api/*` (no Server Actions)
- **ORM:** Prisma
- **Database:** PostgreSQL (CNPG cluster on kumpel.cloud)
- **UI:** shadcn/ui + Tailwind CSS
- **Auth:** Simple JWT (single hardcoded user: manuel / moebius666)
- **Deployment:** K8s on kumpel.cloud, ArgoCD, SOPS secrets
- **Domain:** tennis.kumpel.cloud

## Data Model

### Profile

Single record, upserted on first login.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK, always 1 |
| name | String | |
| birthYear | Int | |
| height | Int | cm |
| weight | Float | kg |
| targetWeight | Float? | kg |
| club | String | |
| team | String | |
| dtbId | String? | |
| dgrNumber | String? | |
| currentLk | Float | |
| notes | String? | Freitext (Beschwerden, Empfindlichkeiten) |

### LkEntry

LK history over time.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| date | DateTime | |
| lk | Float | |
| profileId | Int | FK -> Profile |

### Match

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| date | DateTime | |
| opponent | String? | |
| type | Enum | SINGLES, DOUBLES, TEAM |
| result | String | z.B. "6:3 4:6 6:2" |
| won | Boolean | |
| surface | Enum | CLAY, HARD, INDOOR, GRASS |
| tournamentName | String? | |
| partner | String? | Doppel-Partner |
| notes | String? | Was lief gut/schlecht |

### TrainingSession

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| date | DateTime | |
| type | Enum | TRAINER, TEAM, FREE, MATCH_PRACTICE |
| durationMinutes | Int | |
| focus | String[] | Tags: Aufschlag, Return, Netzspiel, Grundlinie, etc. |
| notes | String? | |

### Routine

Template for a routine (e.g. Mobility Morgens, Theraband Abends).

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| name | String | |
| description | String? | |
| durationMinutes | Int | |
| timeOfDay | Enum | MORNING, EVENING, ANY |
| exercises | Exercise[] | Relation |

### Exercise

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| routineId | Int | FK -> Routine |
| sortOrder | Int | |
| name | String | |
| targetArea | String | z.B. "Huefte", "Schulter" |
| duration | String | z.B. "30 Sek pro Seite" |
| reps | String? | z.B. "12 pro Seite" |
| instructions | String | Vollstaendige Anleitung (Markdown) |
| referenceUrls | String[] | Links zu Bildern/Anleitungen |

### RoutineLog

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| date | DateTime | Nur Datum, keine Uhrzeit |
| routineId | Int | FK -> Routine |
| completed | Boolean | |
| notes | String? | |

### Goal

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| title | String | |
| description | String? | |
| category | Enum | LK, FITNESS, TOURNAMENT, WEIGHT, OTHER |
| targetDate | DateTime? | |
| completed | Boolean | default false |
| completedDate | DateTime? | |

### BodyLog

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK |
| date | DateTime | |
| weight | Float | kg |
| notes | String? | |

## API Endpoints

All endpoints except `/api/auth/login` require `Authorization: Bearer <token>` header.

### Auth
- `POST /api/auth/login` — Body: `{ username, password }` -> `{ token }`

### Profile
- `GET /api/profile` — Returns profile with lkHistory
- `PUT /api/profile` — Update profile fields
- `POST /api/profile/lk` — Add LK entry `{ date, lk }`

### Matches
- `GET /api/matches` — List (query: `?type=&surface=&limit=&offset=`)
- `POST /api/matches` — Create
- `PUT /api/matches/:id` — Update
- `DELETE /api/matches/:id` — Delete
- `GET /api/matches/stats` — Win/loss, by surface, by type

### Training
- `GET /api/training` — List (query: `?type=&limit=&offset=`)
- `POST /api/training` — Create
- `PUT /api/training/:id` — Update
- `DELETE /api/training/:id` — Delete

### Routines
- `GET /api/routines` — List all routines with exercises
- `POST /api/routines` — Create routine with exercises
- `PUT /api/routines/:id` — Update routine
- `GET /api/routines/:id` — Single routine with exercises and instructions
- `GET /api/routines/today` — Today's routine status (which done, which pending)
- `POST /api/routines/:id/log` — Log completion `{ date, completed, notes? }`
- `GET /api/routines/:id/log` — History (query: `?from=&to=`)

### Goals
- `GET /api/goals` — List (query: `?category=&completed=`)
- `POST /api/goals` — Create
- `PUT /api/goals/:id` — Update
- `DELETE /api/goals/:id` — Delete

### Body Log
- `GET /api/body-log` — List (query: `?from=&to=`)
- `POST /api/body-log` — Add entry

## Screens

Mobile-first layout with bottom navigation (5 tabs).

### 1. Dashboard (Home)
- Greeting + current date
- Current LK badge
- Today's routines: checkboxes to mark done, streak counter
- Last match result
- Next training (Di/Do schedule)
- Quick-add buttons: Match, Training, Gewicht
- Weight trend (mini chart, last 30 days)

### 2. Matches
- List view, newest first, grouped by month
- Each card: Date, Opponent, Result, Won/Lost badge, Surface
- Stats section at top: Win%, matches this month, by surface
- FAB to add new match
- Detail/edit view on tap

### 3. Training
- Calendar/list view of sessions
- Each card: Date, Type badge, Duration, Focus tags
- Weekly summary (hours trained)
- FAB to add session

### 4. Routinen
- List of routines (Mobility Morgens, Theraband Abends)
- Today's status: done/pending per routine
- Tap routine -> full exercise list with expandable instructions
- Each exercise: name, target area, duration/reps, step-by-step instructions, reference links
- "Routine starten" button -> guided mode (exercise by exercise with timer)
- Streak tracking per routine

### 5. Profil
- Personal data (editable)
- LK chart over time
- Weight chart over time
- Goals list with completion status
- Links (tennis.de Profil, nuLiga, etc.)

## Auth Flow

1. User opens app -> if no token in localStorage, show login screen
2. POST /api/auth/login with { username: "manuel", password: "moebius666" }
3. Backend validates against hardcoded credentials, returns JWT (24h expiry)
4. Frontend stores token in localStorage, sends as Bearer on all API calls
5. JWT secret stored in K8s SOPS secret

## Seed Data

On first run / `prisma db seed`, populate:

1. **Profile:** Manuel's data from projekt-log.md
2. **LK History:** 3 entries (Mar, Apr, May 2026)
3. **Mobility Routine:** 8 exercises with full instructions from mobility-routine-morgens.md
4. **Theraband Routine:** 5 exercises with full instructions from theraband-routine-abends.md
5. **Goals:** Initial goals from projekt-log.md milestones

## Deployment

- **Namespace:** tennis-tracker
- **Image:** ghcr.io/digitale-kumpel/tennis-tracker:nextjs-v0.0.1
- **Replicas:** 1
- **Port:** 3000
- **Domain:** tennis.kumpel.cloud (staging: tennis-tracker.kumpel.cloud)
- **Database:** New PostgreSQL DB on existing CNPG cluster
- **Secrets (SOPS):** JWT_SECRET, DATABASE_URL
- **ConfigMap:** NEXT_PUBLIC_APP_URL
- **No CI/CD pipeline** — manual docker build + push from local
- **ArgoCD:** Single app pointing to kubernetes/production/

## Project Structure

```
tennis-tracker/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── login/page.tsx
│   │   ├── matches/
│   │   │   ├── page.tsx          # List
│   │   │   └── [id]/page.tsx     # Detail
│   │   ├── training/
│   │   │   └── page.tsx
│   │   ├── routinen/
│   │   │   ├── page.tsx          # Overview
│   │   │   └── [id]/page.tsx     # Routine detail + guided mode
│   │   └── profil/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx
│   │   │   └── page-header.tsx
│   │   ├── dashboard/
│   │   ├── matches/
│   │   ├── training/
│   │   ├── routinen/
│   │   └── profil/
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # JWT helpers
│   │   └── api.ts                # Frontend fetch wrapper with auth
│   └── app/api/
│       ├── auth/login/route.ts
│       ├── profile/route.ts
│       ├── profile/lk/route.ts
│       ├── matches/route.ts
│       ├── matches/[id]/route.ts
│       ├── matches/stats/route.ts
│       ├── training/route.ts
│       ├── training/[id]/route.ts
│       ├── routines/route.ts
│       ├── routines/today/route.ts
│       ├── routines/[id]/route.ts
│       ├── routines/[id]/log/route.ts
│       ├── goals/route.ts
│       ├── goals/[id]/route.ts
│       ├── body-log/route.ts
│       └── middleware.ts
├── kubernetes/
│   ├── production/
│   │   ├── kustomization.yaml
│   │   └── nextjs/
│   └── staging/
│       ├── kustomization.yaml
│       └── nextjs/
├── Dockerfile
├── docker-compose.yml            # Local dev with PostgreSQL
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Non-Goals (for now)

- No multi-user / registration
- No push notifications
- No offline support / PWA
- No GitHub Actions pipeline (manual deploy)
- No social features
- No calendar integration
