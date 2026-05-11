# Tennis Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first tennis tracking app for a single user to log matches, training, routines, body metrics and goals.

**Architecture:** Next.js app with REST API routes (`/api/*`), Prisma ORM with PostgreSQL, JWT auth with hardcoded credentials. Mobile-first UI with shadcn/ui and Tailwind. Deployed to kumpel.cloud K8s cluster.

**Tech Stack:** Next.js 15, Prisma, PostgreSQL, shadcn/ui, Tailwind CSS, jose (JWT), recharts (charts), Docker, K8s/ArgoCD

**Working Directory:** `/Users/manuelschoebel/Workspace/private/tennis-tracker`

---

### Task 1: Project Scaffolding + Docker Compose

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `docker-compose.yml`, `.env`, `.env.example`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/manuelschoebel/Workspace/private/tennis-tracker
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```

Accept overwriting existing files if prompted.

- [ ] **Step 2: Create docker-compose.yml for local PostgreSQL**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: tennis
      POSTGRES_PASSWORD: tennis
      POSTGRES_DB: tennis_tracker
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 3: Create .env and .env.example**

```bash
# .env
DATABASE_URL="postgresql://tennis:tennis@localhost:5432/tennis_tracker"
JWT_SECRET="dev-secret-change-in-production"
```

```bash
# .env.example
DATABASE_URL="postgresql://tennis:tennis@localhost:5432/tennis_tracker"
JWT_SECRET="change-me"
```

- [ ] **Step 4: Update .gitignore**

Append to the generated .gitignore:

```
.env
```

- [ ] **Step 5: Start database and verify**

```bash
docker compose up -d
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with docker-compose PostgreSQL"
```

---

### Task 2: Prisma Schema + Seed Data

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`
- Modify: `package.json` (add prisma seed config)

- [ ] **Step 1: Install Prisma**

```bash
npm install prisma @prisma/client
npm install -D tsx
npx prisma init
```

- [ ] **Step 2: Write prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Profile {
  id           Int       @id @default(1)
  name         String
  birthYear    Int
  height       Int
  weight       Float
  targetWeight Float?
  club         String
  team         String
  dtbId        String?
  dgrNumber    String?
  currentLk    Float
  notes        String?
  lkEntries    LkEntry[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model LkEntry {
  id        Int      @id @default(autoincrement())
  date      DateTime
  lk        Float
  profileId Int
  profile   Profile  @relation(fields: [profileId], references: [id])
}

enum MatchType {
  SINGLES
  DOUBLES
  TEAM
}

enum Surface {
  CLAY
  HARD
  INDOOR
  GRASS
}

model Match {
  id             Int       @id @default(autoincrement())
  date           DateTime
  opponent       String?
  type           MatchType
  result         String
  won            Boolean
  surface        Surface
  tournamentName String?
  partner        String?
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

enum TrainingType {
  TRAINER
  TEAM
  FREE
  MATCH_PRACTICE
}

model TrainingSession {
  id              Int          @id @default(autoincrement())
  date            DateTime
  type            TrainingType
  durationMinutes Int
  focus           String[]
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum TimeOfDay {
  MORNING
  EVENING
  ANY
}

model Routine {
  id              Int          @id @default(autoincrement())
  name            String
  description     String?
  durationMinutes Int
  timeOfDay       TimeOfDay
  exercises       Exercise[]
  logs            RoutineLog[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model Exercise {
  id            Int      @id @default(autoincrement())
  routineId     Int
  routine       Routine  @relation(fields: [routineId], references: [id], onDelete: Cascade)
  sortOrder     Int
  name          String
  targetArea    String
  duration      String
  reps          String?
  instructions  String
  referenceUrls String[]
}

model RoutineLog {
  id        Int      @id @default(autoincrement())
  date      DateTime @db.Date
  routineId Int
  routine   Routine  @relation(fields: [routineId], references: [id], onDelete: Cascade)
  completed Boolean
  notes     String?
  createdAt DateTime @default(now())

  @@unique([date, routineId])
}

enum GoalCategory {
  LK
  FITNESS
  TOURNAMENT
  WEIGHT
  OTHER
}

model Goal {
  id            Int          @id @default(autoincrement())
  title         String
  description   String?
  category      GoalCategory
  targetDate    DateTime?
  completed     Boolean      @default(false)
  completedDate DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model BodyLog {
  id        Int      @id @default(autoincrement())
  date      DateTime @db.Date
  weight    Float
  notes     String?
  createdAt DateTime @default(now())

  @@unique([date])
}
```

- [ ] **Step 3: Write prisma/seed.ts**

```typescript
import { PrismaClient, TimeOfDay, GoalCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Profile
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Manuel Schoebel",
      birthYear: 1984,
      height: 183,
      weight: 83,
      targetWeight: 78,
      club: "VfL Grafenwald 28/68 e.V.",
      team: "Herren 30",
      dtbId: "18453629",
      dgrNumber: "111544551",
      currentLk: 22.4,
      notes:
        "Rechtes Handgelenk empfindlich bei viel Spielen. Rechte Schulter gelegentlich. Wadenkraempfe bei langen Einsaetzen. Migraene-Risiko bei nuechternem Training - VOR dem Training essen!",
    },
  });

  // LK History
  const lkEntries = [
    { date: new Date("2026-03-04"), lk: 24.6 },
    { date: new Date("2026-04-01"), lk: 22.8 },
    { date: new Date("2026-05-06"), lk: 22.4 },
  ];
  for (const entry of lkEntries) {
    await prisma.lkEntry.create({
      data: { ...entry, profileId: 1 },
    });
  }

  // Mobility Routine
  await prisma.routine.create({
    data: {
      name: "Mobility Morgens",
      description:
        "10-Min Mobility Routine direkt nach dem Aufstehen. Barfuss, kein Equipment noetig.",
      durationMinutes: 10,
      timeOfDay: TimeOfDay.MORNING,
      exercises: {
        create: [
          {
            sortOrder: 1,
            name: "Cat-Cow",
            targetArea: "Wirbelsaeule",
            duration: "45 Sek",
            reps: "8 Wiederholungen",
            instructions: `**Ziel:** Wirbelsaeule mobilisieren, Ruecken lockern nach der Nacht.

1. Geh in den Vierfuesslerstand: Haende direkt unter den Schultern, Knie unter der Huefte. Ruecken gerade (Tischposition).
2. **Cow (Einatmen):** Lass den Bauch Richtung Boden sinken, heb das Steissbein an und schau nach oben/vorne. Die Wirbelsaeule macht ein leichtes Hohlkreuz.
3. **Cat (Ausatmen):** Drueck den Ruecken rund nach oben (wie eine Katze die sich buckelt). Kinn zur Brust, Steissbein nach unten. Bauchnabel Richtung Wirbelsaeule ziehen.
4. Fliessend zwischen beiden Positionen wechseln, immer mit der Atmung.`,
            referenceUrls: [
              "https://health.clevelandclinic.org/cat-cow-stretch",
              "https://www.acefitness.org/resources/everyone/exercise-library/15/cat-cow/",
            ],
          },
          {
            sortOrder: 2,
            name: "BWS-Rotation im Vierfuesslerstand",
            targetArea: "Brustwirbelsaeule",
            duration: "60 Sek",
            reps: "6x pro Seite",
            instructions: `**Ziel:** Brustwirbelsaeule mobilisieren - entscheidend fuer Rotation bei Aufschlag und Vorhand.

1. Bleib im Vierfuesslerstand. Linke Hand bleibt am Boden.
2. Leg die rechte Hand hinter deinen Kopf (Finger am Hinterkopf, Ellbogen zeigt zur Seite).
3. **Phase 1 (Schliessen):** Dreh den rechten Ellbogen nach unten Richtung linkes Knie/linke Hand. Der Oberkoerper rotiert nach innen.
4. **Phase 2 (Oeffnen):** Jetzt den Ellbogen weit nach oben/rechts oeffnen, Richtung Decke drehen. Blick folgt dem Ellbogen. Oeffne die Brust so weit wie moeglich.
5. Wichtig: Die Hueften bleiben stabil! Nur der Oberkoerper dreht. Das Becken bewegt sich nicht mit.`,
            referenceUrls: [
              "https://www.functionalmovement.com/exercises/30/quadruped_t-spine_rotation",
              "https://deansomerset.com/breaking-down-the-quadruped-thoracic-rotation/",
            ],
          },
          {
            sortOrder: 3,
            name: "90/90 Hip Stretch",
            targetArea: "Huefte",
            duration: "2 Min",
            reps: "30 Sek pro Seite, 2 Durchgaenge",
            instructions: `**Ziel:** Hueftmobilitaet in beide Richtungen - Aussenrotation und Innenrotation.

1. Setz dich auf den Boden.
2. **Vorderes Bein:** Rechtes Bein vor dir, Knie 90 Grad gebeugt, Oberschenkel zeigt nach vorne, Unterschenkel liegt quer vor dir. Die Aussenseite des rechten Oberschenkels und Knies liegt am Boden. *(Aussenrotation rechte Huefte)*
3. **Hinteres Bein:** Linkes Bein seitlich/hinter dir, ebenfalls 90 Grad im Knie. Die Innenseite des linken Oberschenkels und Knies liegt am Boden. *(Innenrotation linke Huefte)*
4. Sitz aufrecht. Dann lehn dich sanft nach vorne ueber das vordere (rechte) Bein. Du spuerst die Dehnung tief in der rechten Gesaessmuskulatur.
5. 30 Sek halten.
6. **Seite wechseln:** Beide Beine umklappen (wie Scheibenwischer), sodass das linke Bein jetzt vorne ist.`,
            referenceUrls: [
              "https://health.clevelandclinic.org/90-90-stretch",
              "https://www.healthline.com/health/fitness/90-90-stretch",
            ],
          },
          {
            sortOrder: 4,
            name: "Kniender Hueftbeuger-Stretch",
            targetArea: "Hueftbeuger",
            duration: "60 Sek",
            reps: "30 Sek pro Seite",
            instructions: `**Ziel:** Hueftbeuger dehnen - die verkuerzen massiv durchs Sitzen.

1. Geh in eine Ausfallschritt-Position: Rechter Fuss vorne (flach am Boden), linkes Knie hinten am Boden.
2. Oberkoerper aufrecht, Bauch leicht anspannen.
3. Schieb die Huefte langsam nach vorne, bis du eine deutliche Dehnung an der Vorderseite der linken Huefte/Oberschenkel spuerst.
4. **Bonus:** Streck den linken Arm nach oben und neig dich leicht nach rechts. Das verstaerkt die Dehnung enorm.
5. Nicht ins Hohlkreuz fallen - Becken leicht nach hinten kippen (posterior tilt).`,
            referenceUrls: [
              "https://www.acefitness.org/resources/everyone/exercise-library/142/kneeling-hip-flexor-stretch/",
              "https://www.hingehealth.com/resources/articles/kneeling-hip-flexor-stretch/",
            ],
          },
          {
            sortOrder: 5,
            name: "World's Greatest Stretch",
            targetArea: "Huefte + BWS + Leiste",
            duration: "2 Min",
            reps: "4x pro Seite",
            instructions: `**Ziel:** Huefte, BWS, Leiste, hintere Oberschenkel - alles in einer Uebung.

1. Mach einen grossen Ausfallschritt nach vorne mit dem rechten Bein. Linkes Knie darf am Boden aufsetzen.
2. Rechter Fuss steht flach, Knie ueber dem Knoechel (90 Grad).
3. Setz die linke Hand flach auf den Boden, innen neben dem rechten Fuss.
4. **Rotation:** Dreh den rechten Arm auf und streck ihn Richtung Decke. Blick folgt der Hand nach oben. Oeffne die Brust. Halte 2-3 Sek.
5. Bring die rechte Hand zurueck. Jetzt den rechten Ellbogen Richtung Boden neben dem rechten Fuss senken (so tief wie moeglich). Halte 2-3 Sek.
6. Das ist 1 Wiederholung (Aufdrehen + Ellbogen runter).`,
            referenceUrls: [
              "https://www.mensjournal.com/health-fitness/how-do-worlds-greatest-stretch",
              "https://www.onepeloton.com/blog/worlds-greatest-stretch",
            ],
          },
          {
            sortOrder: 6,
            name: "Sleeper Stretch",
            targetArea: "Schulter",
            duration: "60 Sek",
            reps: "30 Sek pro Seite",
            instructions: `**Ziel:** Innenrotation der Schulter verbessern. Schuetzt beim Aufschlag.

1. Leg dich auf die rechte Seite (die Schulter die du dehnen willst ist unten).
2. Rechter Arm liegt vor dir auf dem Boden, 90 Grad vom Koerper weg (auf Schulterhoehe). Ellbogen 90 Grad gebeugt, Unterarm zeigt nach oben.
3. Mit der linken Hand den rechten Unterarm sanft und langsam Richtung Boden druecken.
4. Du spuerst die Dehnung hinten in der rechten Schulter. Stopp bei leichter Dehnung - nie in den Schmerz!
5. Wichtig: Nicht auf die Schulter rollen. Schulterblatt bleibt stabil.`,
            referenceUrls: [
              "https://www.healthline.com/health/sleeper-stretch",
              "https://thebarbellphysio.com/the-sleeper-stretch-technique-and-tips-for-shoulder-health/",
            ],
          },
          {
            sortOrder: 7,
            name: "Handgelenk-Circles + Dehnung",
            targetArea: "Handgelenk",
            duration: "60 Sek",
            reps: "10x pro Richtung + 15 Sek pro Position",
            instructions: `**Ziel:** Handgelenk mobilisieren und Unterarm-Muskulatur dehnen.

**Teil 1 - Kreisen:**
1. Haende locker zu Faeusten ballen oder Finger ineinander verschraenken.
2. Langsam und kontrolliert 10x im Uhrzeigersinn kreisen, dann 10x gegen den Uhrzeigersinn.

**Teil 2 - Beuger dehnen:**
1. Rechten Arm ausstrecken, Handflaehe zeigt nach oben/vorne.
2. Mit der linken Hand die Finger sanft Richtung Koerper ziehen.
3. 15 Sek halten, dann andere Seite.

**Teil 3 - Strecker dehnen:**
1. Rechten Arm ausstrecken, Handflaehe zeigt nach unten.
2. Mit der linken Hand die Finger/Handruecken sanft nach unten und zum Koerper ziehen.
3. 15 Sek halten, dann andere Seite.`,
            referenceUrls: [
              "https://health.clevelandclinic.org/wrist-pain-exercises",
              "https://www.hingehealth.com/resources/articles/wrist-stretches/",
            ],
          },
          {
            sortOrder: 8,
            name: "Stehende Wadendehnung",
            targetArea: "Waden",
            duration: "80 Sek",
            reps: "20 Sek pro Version, pro Seite",
            instructions: `**Ziel:** Obere und tiefe Wadenmuskulatur dehnen. Gegen Krampfneigung.

**Version 1 - Gastrocnemius (obere Wade):**
1. Stell dich vor eine Wand, Haende auf Schulterhoehe an die Wand.
2. Rechtes Bein einen grossen Schritt nach hinten, Knie gestreckt, Ferse fest am Boden.
3. Linkes Bein vorne, leicht gebeugt. Lehn dich Richtung Wand.
4. 20 Sek halten.

**Version 2 - Soleus (tiefe Wade):**
1. Gleiche Position, aber hinteren Fuss etwas naeher zur Wand.
2. Hinteres Knie leicht beugen, Ferse bleibt am Boden!
3. Du spuerst die Dehnung tiefer, naeher an der Achillessehne.
4. 20 Sek halten.`,
            referenceUrls: [
              "https://www.rehabhero.ca/exercise/wall-calf-stretch",
              "https://www.acefitness.org/resources/everyone/exercise-library/152/standing-dorsi-flexion-calf-stretch/",
            ],
          },
        ],
      },
    },
  });

  // Theraband Routine
  await prisma.routine.create({
    data: {
      name: "Theraband Abends",
      description:
        "5-Min Theraband-Routine fuer Schulter + Handgelenk. Abends vorm TV oder am Schreibtisch.",
      durationMinutes: 5,
      timeOfDay: TimeOfDay.EVENING,
      exercises: {
        create: [
          {
            sortOrder: 1,
            name: "Aussenrotation im Stehen",
            targetArea: "Rotatorenmanschette",
            duration: "60 Sek",
            reps: "12 pro Seite",
            instructions: `**Ziel:** Staerkt die aeusseren Rotatoren der Schulter. DIE wichtigste Uebung fuer Tennis-Schultern.

1. Befestige das Theraband an einem Tuergriff auf Bauchnabelhoehe.
2. Stell dich seitlich dazu, sodass die rechte Hand weiter vom Anker entfernt ist.
3. Rechter Ellbogen am Koerper, 90 Grad gebeugt. Optional: Handtuch zwischen Ellbogen und Rippen.
4. **Bewegung:** Unterarm langsam nach aussen drehen (weg vom Bauch). Ellbogen bleibt fest am Koerper!
5. Langsam zurueck (2 Sek raus, 3 Sek zurueck - Rueckbewegung ist wichtiger!).`,
            referenceUrls: [
              "https://www.strengthlog.com/band-external-shoulder-rotation/",
              "https://www.peak-physio.com.au/exercise/shoulder-external-rotation-theraband/",
            ],
          },
          {
            sortOrder: 2,
            name: "Innenrotation im Stehen",
            targetArea: "Rotatorenmanschette",
            duration: "60 Sek",
            reps: "12 pro Seite",
            instructions: `**Ziel:** Staerkt die inneren Rotatoren. Gegenspieler zur Aussenrotation.

1. Gleiche Aufstellung, aber andersherum: Rechte Hand ist naeher am Anker.
2. Rechter Ellbogen am Koerper, 90 Grad gebeugt.
3. **Bewegung:** Unterarm nach innen drehen (zum Bauch hin).
4. Langsam zurueck.`,
            referenceUrls: [
              "https://www.stoneclinic.com/video/Shoulder-Theraband-External-and-Internal-Rotation",
              "https://www.orthoindy.com/wp-content/uploads/Rotator-Cuff-Strengthening-With-a-Theraband.pdf",
            ],
          },
          {
            sortOrder: 3,
            name: "Face Pulls",
            targetArea: "Hintere Schulter + Haltung",
            duration: "60 Sek",
            reps: "12 Wiederholungen",
            instructions: `**Ziel:** Staerkt hintere Schulter, Rhomboiden und oberen Ruecken. Korrigiert Schreibtisch-Haltung.

1. Theraband auf Kinnhoehe befestigen.
2. Steh aufrecht, Fuesse schulterbreit. Greif das Band mit beiden Haenden, Handruecken nach oben.
3. **Bewegung:** Zieh das Band zum Gesicht, Haende auseinander und nach aussen drehen. Am Ende zeigen Daumen nach hinten, Haende neben den Ohren.
4. Schulterblaetter zusammenziehen!
5. Kurz halten (1-2 Sek), dann langsam zurueck.
6. Koerper bleibt stabil, kein Schwungholen.`,
            referenceUrls: [
              "https://www.gymreapers.com/blogs/news/face-pulls-with-bands",
              "https://www.endomondo.com/exercise/resistance-band-face-pull",
            ],
          },
          {
            sortOrder: 4,
            name: "Handgelenk-Beugung mit Theraband",
            targetArea: "Unterarm-Beuger",
            duration: "45 Sek",
            reps: "15 pro Hand",
            instructions: `**Ziel:** Staerkt Handgelenk-Beuger. Wichtig fuer Griffkraft.

1. Sitz auf einem Stuhl. Rechter Unterarm liegt auf dem Oberschenkel, Handgelenk haengt ueber das Knie, Handflaehe zeigt nach oben.
2. Theraband unter dem Fuss fixieren, anderes Ende in der rechten Hand.
3. **Bewegung:** Handgelenk nach oben beugen (Faust Richtung Decke) gegen den Widerstand.
4. Langsam zurueck (3 Sek ablassen).`,
            referenceUrls: [
              "https://vantagetennisfl.com/tennis-wrist-exercises/",
            ],
          },
          {
            sortOrder: 5,
            name: "Handgelenk-Streckung mit Theraband",
            targetArea: "Unterarm-Strecker",
            duration: "45 Sek",
            reps: "15 pro Hand",
            instructions: `**Ziel:** Staerkt Handgelenk-Strecker. Schuetzt gegen Tennisarm.

1. Gleiche Position, aber Handflaehe zeigt jetzt nach unten.
2. Theraband unter dem Fuss fixieren, in der Hand halten.
3. **Bewegung:** Handruecken nach oben ziehen (Handgelenk strecken) gegen den Widerstand.
4. Langsam zurueck (3 Sek ablassen).`,
            referenceUrls: [
              "https://www.tennisfitness.com/blog/tennis-forearm-exercises",
            ],
          },
        ],
      },
    },
  });

  // Goals
  const goals = [
    { title: "LK 20-21 erreichen", category: GoalCategory.LK, description: "Kurzfristig 2026" },
    { title: "LK 18-19 erreichen", category: GoalCategory.LK, description: "Mittelfristig 1-2 Jahre" },
    { title: "Zielgewicht 78kg", category: GoalCategory.WEIGHT, description: "Von 83kg auf 78kg" },
    { title: "Erstes Turnier spielen", category: GoalCategory.TOURNAMENT },
    { title: "Verletzungsfrei durch die Saison", category: GoalCategory.FITNESS },
    { title: "Festen Doppel-Partner finden", category: GoalCategory.OTHER },
  ];
  for (const goal of goals) {
    await prisma.goal.create({ data: goal });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 4: Add prisma seed config to package.json**

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 5: Run migration and seed**

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

- [ ] **Step 6: Create src/lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema, migrations, and seed data"
```

---

### Task 3: Auth (JWT Login + Middleware)

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/middleware.ts`

- [ ] **Step 1: Install jose**

```bash
npm install jose
```

- [ ] **Step 2: Create src/lib/auth.ts**

```typescript
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const VALID_USER = "manuel";
const VALID_PASS = "moebius666";

export function validateCredentials(username: string, password: string): boolean {
  return username === VALID_USER && password === VALID_PASS;
}

export async function createToken(): Promise<string> {
  return new SignJWT({ sub: "manuel" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Create src/app/api/auth/login/route.ts**

```typescript
import { NextResponse } from "next/server";
import { validateCredentials, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createToken();
  return NextResponse.json({ token });
}
```

- [ ] **Step 4: Create src/middleware.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  // Skip auth for login endpoint
  if (request.nextUrl.pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // Only protect /api/* routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: "/api/:path*",
};
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add JWT auth with login endpoint and middleware"
```

---

### Task 4: API Routes — Profile, Matches, Training

**Files:**
- Create: `src/app/api/profile/route.ts`, `src/app/api/profile/lk/route.ts`, `src/app/api/matches/route.ts`, `src/app/api/matches/[id]/route.ts`, `src/app/api/matches/stats/route.ts`, `src/app/api/training/route.ts`, `src/app/api/training/[id]/route.ts`

- [ ] **Step 1: Create src/app/api/profile/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.profile.findUnique({
    where: { id: 1 },
    include: { lkEntries: { orderBy: { date: "desc" } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const profile = await prisma.profile.update({
    where: { id: 1 },
    data: body,
    include: { lkEntries: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(profile);
}
```

- [ ] **Step 2: Create src/app/api/profile/lk/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const entry = await prisma.lkEntry.create({
    data: {
      date: new Date(body.date),
      lk: body.lk,
      profileId: 1,
    },
  });
  // Also update currentLk on profile
  await prisma.profile.update({
    where: { id: 1 },
    data: { currentLk: body.lk },
  });
  return NextResponse.json(entry, { status: 201 });
}
```

- [ ] **Step 3: Create src/app/api/matches/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const surface = searchParams.get("surface");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (surface) where.surface = surface;

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.match.count({ where }),
  ]);

  return NextResponse.json({ matches, total });
}

export async function POST(request: Request) {
  const body = await request.json();
  const match = await prisma.match.create({
    data: {
      ...body,
      date: new Date(body.date),
    },
  });
  return NextResponse.json(match, { status: 201 });
}
```

- [ ] **Step 4: Create src/app/api/matches/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.date) body.date = new Date(body.date);
  const match = await prisma.match.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(match);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.match.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Create src/app/api/matches/stats/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match.findMany();
  const total = matches.length;
  const wins = matches.filter((m) => m.won).length;
  const losses = total - wins;

  const bySurface: Record<string, { total: number; wins: number }> = {};
  const byType: Record<string, { total: number; wins: number }> = {};

  for (const m of matches) {
    if (!bySurface[m.surface]) bySurface[m.surface] = { total: 0, wins: 0 };
    bySurface[m.surface].total++;
    if (m.won) bySurface[m.surface].wins++;

    if (!byType[m.type]) byType[m.type] = { total: 0, wins: 0 };
    byType[m.type].total++;
    if (m.won) byType[m.type].wins++;
  }

  return NextResponse.json({
    total,
    wins,
    losses,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    bySurface,
    byType,
  });
}
```

- [ ] **Step 6: Create src/app/api/training/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [sessions, total] = await Promise.all([
    prisma.trainingSession.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.trainingSession.count({ where }),
  ]);

  return NextResponse.json({ sessions, total });
}

export async function POST(request: Request) {
  const body = await request.json();
  const session = await prisma.trainingSession.create({
    data: {
      ...body,
      date: new Date(body.date),
    },
  });
  return NextResponse.json(session, { status: 201 });
}
```

- [ ] **Step 7: Create src/app/api/training/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.date) body.date = new Date(body.date);
  const session = await prisma.trainingSession.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(session);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.trainingSession.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add API routes for profile, matches, and training"
```

---

### Task 5: API Routes — Routines, Goals, Body Log

**Files:**
- Create: `src/app/api/routines/route.ts`, `src/app/api/routines/today/route.ts`, `src/app/api/routines/[id]/route.ts`, `src/app/api/routines/[id]/log/route.ts`, `src/app/api/goals/route.ts`, `src/app/api/goals/[id]/route.ts`, `src/app/api/body-log/route.ts`

- [ ] **Step 1: Create src/app/api/routines/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const routines = await prisma.routine.findMany({
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(routines);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { exercises, ...routineData } = body;
  const routine = await prisma.routine.create({
    data: {
      ...routineData,
      exercises: exercises ? { create: exercises } : undefined,
    },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(routine, { status: 201 });
}
```

- [ ] **Step 2: Create src/app/api/routines/today/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routines = await prisma.routine.findMany({
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
      logs: {
        where: { date: today },
      },
    },
  });

  // Calculate streaks
  const result = await Promise.all(
    routines.map(async (routine) => {
      const logs = await prisma.routineLog.findMany({
        where: { routineId: routine.id, completed: true },
        orderBy: { date: "desc" },
        take: 60,
      });

      let streak = 0;
      const checkDate = new Date(today);
      for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (logDate.getTime() === checkDate.getTime() - 86400000) {
          // Allow checking yesterday if today not yet logged
          streak++;
          checkDate.setDate(checkDate.getDate() - 2);
        } else {
          break;
        }
      }

      return {
        ...routine,
        completedToday: routine.logs.length > 0 && routine.logs[0].completed,
        streak,
      };
    })
  );

  return NextResponse.json(result);
}
```

- [ ] **Step 3: Create src/app/api/routines/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await prisma.routine.findUnique({
    where: { id: parseInt(id) },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(routine);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { exercises, ...routineData } = body;
  const routine = await prisma.routine.update({
    where: { id: parseInt(id) },
    data: routineData,
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(routine);
}
```

- [ ] **Step 4: Create src/app/api/routines/[id]/log/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { routineId: parseInt(id) };
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const logs = await prisma.routineLog.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  const log = await prisma.routineLog.upsert({
    where: {
      date_routineId: { date, routineId: parseInt(id) },
    },
    update: { completed: body.completed, notes: body.notes },
    create: {
      date,
      routineId: parseInt(id),
      completed: body.completed,
      notes: body.notes,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
```

- [ ] **Step 5: Create src/app/api/goals/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const completed = searchParams.get("completed");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (completed !== null) where.completed = completed === "true";

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.targetDate) body.targetDate = new Date(body.targetDate);
  const goal = await prisma.goal.create({ data: body });
  return NextResponse.json(goal, { status: 201 });
}
```

- [ ] **Step 6: Create src/app/api/goals/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.targetDate) body.targetDate = new Date(body.targetDate);
  if (body.completed && !body.completedDate) body.completedDate = new Date();
  const goal = await prisma.goal.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(goal);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.goal.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 7: Create src/app/api/body-log/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const logs = await prisma.bodyLog.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  const log = await prisma.bodyLog.upsert({
    where: { date },
    update: { weight: body.weight, notes: body.notes },
    create: { date, weight: body.weight, notes: body.notes },
  });
  return NextResponse.json(log, { status: 201 });
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add API routes for routines, goals, and body log"
```

---

### Task 6: Frontend — shadcn/ui Setup + Layout + API Client

**Files:**
- Create: `src/lib/api.ts`, `src/components/layout/bottom-nav.tsx`, `src/components/layout/page-header.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd /Users/manuelschoebel/Workspace/private/tennis-tracker
npx shadcn@latest init -d
```

- [ ] **Step 2: Add shadcn components we need**

```bash
npx shadcn@latest add button card input label badge dialog sheet tabs checkbox separator
```

- [ ] **Step 3: Create src/lib/api.ts**

```typescript
const API_BASE = "";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => fetchApi<T>(path),
  post: <T>(path: string, body: unknown) =>
    fetchApi<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    fetchApi<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => fetchApi<T>(path, { method: "DELETE" }),
};
```

- [ ] **Step 4: Create src/components/layout/bottom-nav.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Swords, Dumbbell, ListChecks, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: Swords },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/routinen", label: "Routinen", icon: ListChecks },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex max-w-md justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create src/components/layout/page-header.tsx**

```tsx
interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-40">
      <h1 className="text-lg font-semibold">{title}</h1>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Install lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 7: Update src/app/layout.tsx**

```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tennis Tracker",
  description: "Personal tennis tracking app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add shadcn/ui, API client, bottom nav, and layout components"
```

---

### Task 7: Frontend — Login Screen

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create src/app/login/page.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<{ token: string }>("/api/auth/login", {
        username,
        password,
      });
      setToken(data.token);
      router.push("/");
    } catch {
      setError("Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Tennis Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzer</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add login page"
```

---

### Task 8: Frontend — Auth-Protected App Shell

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Move: Dashboard and other pages will live under `(app)` route group

- [ ] **Step 1: Create src/app/(app)/layout.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div className="mx-auto max-w-md min-h-screen pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/(app)/page.tsx (Dashboard placeholder)**

```tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus } from "lucide-react";

interface RoutineToday {
  id: number;
  name: string;
  durationMinutes: number;
  completedToday: boolean;
  streak: number;
}

interface Profile {
  name: string;
  currentLk: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routines, setRoutines] = useState<RoutineToday[]>([]);

  useEffect(() => {
    api.get<Profile>("/api/profile").then(setProfile);
    api.get<RoutineToday[]>("/api/routines/today").then(setRoutines);
  }, []);

  async function toggleRoutine(routineId: number, completed: boolean) {
    await api.post(`/api/routines/${routineId}/log`, {
      date: new Date().toISOString(),
      completed,
    });
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, completedToday: completed } : r))
    );
  }

  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <PageHeader title="Tennis Tracker" />
      <div className="space-y-4 p-4">
        <div>
          <p className="text-muted-foreground text-sm">{today}</p>
          {profile && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-medium">Hallo {profile.name.split(" ")[0]}</span>
              <Badge variant="secondary">LK {profile.currentLk}</Badge>
            </div>
          )}
        </div>

        {/* Routinen heute */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-3">Routinen heute</h3>
            <div className="space-y-3">
              {routines.map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={r.completedToday}
                      onCheckedChange={(checked) =>
                        toggleRoutine(r.id, checked === true)
                      }
                    />
                    <Link href={`/routinen/${r.id}`} className="text-sm">
                      {r.name}
                    </Link>
                  </div>
                  {r.streak > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {r.streak} Tage Streak
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link href="/matches?add=true">
            <Button variant="outline" className="w-full text-xs h-auto py-3">
              <Plus className="h-4 w-4 mr-1" />
              Match
            </Button>
          </Link>
          <Link href="/training?add=true">
            <Button variant="outline" className="w-full text-xs h-auto py-3">
              <Plus className="h-4 w-4 mr-1" />
              Training
            </Button>
          </Link>
          <Link href="/profil?addWeight=true">
            <Button variant="outline" className="w-full text-xs h-auto py-3">
              <Plus className="h-4 w-4 mr-1" />
              Gewicht
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Remove the old src/app/page.tsx (the default Next.js page)**

Delete `src/app/page.tsx` since the dashboard now lives at `src/app/(app)/page.tsx`.

- [ ] **Step 4: Verify app starts**

```bash
npm run dev
```

Open http://localhost:3000 — should redirect to /login. Login with manuel/moebius666 — should show dashboard.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add auth-protected app shell with dashboard"
```

---

### Task 9: Frontend — Matches Page

**Files:**
- Create: `src/app/(app)/matches/page.tsx`

- [ ] **Step 1: Create src/app/(app)/matches/page.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Match {
  id: number;
  date: string;
  opponent: string | null;
  type: string;
  result: string;
  won: boolean;
  surface: string;
  partner: string | null;
  notes: string | null;
}

interface Stats {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
}

const surfaceLabels: Record<string, string> = {
  CLAY: "Sand",
  HARD: "Hart",
  INDOOR: "Halle",
  GRASS: "Rasen",
};

const typeLabels: Record<string, string> = {
  SINGLES: "Einzel",
  DOUBLES: "Doppel",
  TEAM: "Mannschaft",
};

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [open, setOpen] = useState(searchParams.get("add") === "true");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    type: "SINGLES",
    result: "",
    won: true,
    surface: "CLAY",
    partner: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [matchData, statsData] = await Promise.all([
      api.get<{ matches: Match[] }>("/api/matches"),
      api.get<Stats>("/api/matches/stats"),
    ]);
    setMatches(matchData.matches);
    setStats(statsData);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/matches", {
      ...form,
      opponent: form.opponent || null,
      partner: form.partner || null,
      notes: form.notes || null,
    });
    setOpen(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      opponent: "",
      type: "SINGLES",
      result: "",
      won: true,
      surface: "CLAY",
      partner: "",
      notes: "",
    });
    loadData();
  }

  return (
    <>
      <PageHeader title="Matches">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Neu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Match eintragen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Typ</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLES">Einzel</SelectItem>
                      <SelectItem value="DOUBLES">Doppel</SelectItem>
                      <SelectItem value="TEAM">Mannschaft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Belag</Label>
                  <Select value={form.surface} onValueChange={(v) => setForm({ ...form, surface: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLAY">Sand</SelectItem>
                      <SelectItem value="HARD">Hart</SelectItem>
                      <SelectItem value="INDOOR">Halle</SelectItem>
                      <SelectItem value="GRASS">Rasen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Gegner</Label>
                <Input
                  value={form.opponent}
                  onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                  placeholder="Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Ergebnis</Label>
                  <Input
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value })}
                    placeholder="6:3 4:6 6:2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ergebnis</Label>
                  <Select
                    value={form.won ? "won" : "lost"}
                    onValueChange={(v) => setForm({ ...form, won: v === "won" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="won">Gewonnen</SelectItem>
                      <SelectItem value="lost">Verloren</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.type === "DOUBLES" && (
                <div className="space-y-1">
                  <Label>Doppel-Partner</Label>
                  <Input
                    value={form.partner}
                    onChange={(e) => setForm({ ...form, partner: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label>Notizen</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Was lief gut/schlecht?"
                />
              </div>
              <Button type="submit" className="w-full">Speichern</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-4 space-y-4">
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <Card>
              <CardContent className="pt-3 pb-2">
                <div className="text-2xl font-bold">{stats.winRate}%</div>
                <div className="text-xs text-muted-foreground">Siegquote</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2">
                <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                <div className="text-xs text-muted-foreground">Siege</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2">
                <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                <div className="text-xs text-muted-foreground">Niederlagen</div>
              </CardContent>
            </Card>
          </div>
        )}

        {matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Noch keine Matches eingetragen</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <Card key={m.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.won ? "default" : "destructive"}>
                          {m.won ? "W" : "L"}
                        </Badge>
                        <span className="font-medium">{m.result}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {m.opponent || "Unbekannt"} · {typeLabels[m.type]} · {surfaceLabels[m.surface]}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.date).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  {m.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{m.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add shadcn select component**

```bash
npx shadcn@latest add select
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add matches page with stats and add dialog"
```

---

### Task 10: Frontend — Training Page

**Files:**
- Create: `src/app/(app)/training/page.tsx`

- [ ] **Step 1: Create src/app/(app)/training/page.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface TrainingSession {
  id: number;
  date: string;
  type: string;
  durationMinutes: number;
  focus: string[];
  notes: string | null;
}

const typeLabels: Record<string, string> = {
  TRAINER: "Trainer",
  TEAM: "Mannschaft",
  FREE: "Freies Spiel",
  MATCH_PRACTICE: "Matchpraxis",
};

const focusOptions = [
  "Aufschlag",
  "Return",
  "Vorhand",
  "Rueckhand",
  "Volley",
  "Netzspiel",
  "Grundlinie",
  "Beinarbeit",
  "Taktik",
  "Doppel",
];

export default function TrainingPage() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [open, setOpen] = useState(searchParams.get("add") === "true");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "TRAINER",
    durationMinutes: 60,
    focus: [] as string[],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await api.get<{ sessions: TrainingSession[] }>("/api/training");
    setSessions(data.sessions);
  }

  function toggleFocus(tag: string) {
    setForm((f) => ({
      ...f,
      focus: f.focus.includes(tag) ? f.focus.filter((t) => t !== tag) : [...f.focus, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/training", {
      ...form,
      notes: form.notes || null,
    });
    setOpen(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      type: "TRAINER",
      durationMinutes: 60,
      focus: [],
      notes: "",
    });
    loadData();
  }

  const weekMinutes = sessions
    .filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <>
      <PageHeader title="Training">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Neu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Training eintragen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Dauer (Min)</Label>
                  <Input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="TEAM">Mannschaft</SelectItem>
                    <SelectItem value="FREE">Freies Spiel</SelectItem>
                    <SelectItem value="MATCH_PRACTICE">Matchpraxis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Schwerpunkt</Label>
                <div className="flex flex-wrap gap-1">
                  {focusOptions.map((tag) => (
                    <Badge
                      key={tag}
                      variant={form.focus.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFocus(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notizen</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Speichern</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-4 space-y-4">
        {weekMinutes > 0 && (
          <Card>
            <CardContent className="py-3 text-center">
              <div className="text-2xl font-bold">
                {Math.floor(weekMinutes / 60)}h {weekMinutes % 60}min
              </div>
              <div className="text-xs text-muted-foreground">Diese Woche</div>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Noch keine Trainings eingetragen</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{typeLabels[s.type]}</Badge>
                        <span className="text-sm">{s.durationMinutes} Min</span>
                      </div>
                      {s.focus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.focus.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  {s.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{s.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add training page with weekly summary and add dialog"
```

---

### Task 11: Frontend — Routinen Page + Detail

**Files:**
- Create: `src/app/(app)/routinen/page.tsx`, `src/app/(app)/routinen/[id]/page.tsx`

- [ ] **Step 1: Create src/app/(app)/routinen/page.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface RoutineToday {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  timeOfDay: string;
  completedToday: boolean;
  streak: number;
  exercises: { id: number }[];
}

const timeLabels: Record<string, string> = {
  MORNING: "Morgens",
  EVENING: "Abends",
  ANY: "Jederzeit",
};

export default function RoutinenPage() {
  const [routines, setRoutines] = useState<RoutineToday[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await api.get<RoutineToday[]>("/api/routines/today");
    setRoutines(data);
  }

  async function toggleRoutine(routineId: number, completed: boolean) {
    await api.post(`/api/routines/${routineId}/log`, {
      date: new Date().toISOString(),
      completed,
    });
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, completedToday: completed } : r))
    );
  }

  return (
    <>
      <PageHeader title="Routinen" />
      <div className="p-4 space-y-3">
        {routines.map((r) => (
          <Card key={r.id}>
            <CardContent className="py-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={r.completedToday}
                  onCheckedChange={(checked) => toggleRoutine(r.id, checked === true)}
                />
                <Link href={`/routinen/${r.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {timeLabels[r.timeOfDay]}
                        </Badge>
                        <span>{r.durationMinutes} Min</span>
                        <span>{r.exercises.length} Uebungen</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.streak > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {r.streak}d Streak
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create src/app/(app)/routinen/[id]/page.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  targetArea: string;
  duration: string;
  reps: string | null;
  instructions: string;
  referenceUrls: string[];
  sortOrder: number;
}

interface Routine {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  exercises: Exercise[];
}

export default function RoutineDetailPage() {
  const params = useParams();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  useEffect(() => {
    api.get<Routine>(`/api/routines/${params.id}`).then(setRoutine);
  }, [params.id]);

  if (!routine) return null;

  return (
    <>
      <PageHeader title={routine.name} />
      <div className="p-4 space-y-3">
        {routine.description && (
          <p className="text-sm text-muted-foreground">{routine.description}</p>
        )}
        <div className="text-sm text-muted-foreground">
          {routine.durationMinutes} Min · {routine.exercises.length} Uebungen
        </div>

        <Separator />

        {routine.exercises.map((ex, idx) => {
          const isExpanded = expandedExercise === ex.id;
          return (
            <Card key={ex.id}>
              <CardContent className="py-3">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <span className="font-medium">{ex.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {ex.targetArea}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {ex.duration}
                          {ex.reps && ` · ${ex.reps}`}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm whitespace-pre-line">{ex.instructions}</div>
                    {ex.referenceUrls.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {ex.referenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Anleitung mit Bildern {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Button
          className="w-full"
          onClick={async () => {
            await api.post(`/api/routines/${routine.id}/log`, {
              date: new Date().toISOString(),
              completed: true,
            });
            alert("Routine als erledigt markiert!");
          }}
        >
          Routine abgeschlossen
        </Button>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add routinen overview and detail page with exercise instructions"
```

---

### Task 12: Frontend — Profil Page

**Files:**
- Create: `src/app/(app)/profil/page.tsx`

- [ ] **Step 1: Install recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Create src/app/(app)/profil/page.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Plus, ExternalLink } from "lucide-react";

interface LkEntry {
  id: number;
  date: string;
  lk: number;
}

interface Profile {
  name: string;
  birthYear: number;
  height: number;
  weight: number;
  targetWeight: number | null;
  club: string;
  team: string;
  dtbId: string | null;
  dgrNumber: string | null;
  currentLk: number;
  notes: string | null;
  lkEntries: LkEntry[];
}

interface Goal {
  id: number;
  title: string;
  description: string | null;
  category: string;
  completed: boolean;
}

interface BodyLogEntry {
  date: string;
  weight: number;
}

const links = [
  { label: "Tennis.de Profil", url: "https://www.tennis.de/spielen/spielerprofil.html#id=NU2777182" },
  { label: "VfL Grafenwald LK (nuLiga)", url: "https://tvn.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubRankinglistLK?federation=TVN&club=5059" },
  { label: "VfL Grafenwald Mannschaften", url: "https://tvn.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubTeams?club=35624" },
  { label: "Turniersuche tennis.de", url: "https://spieler.tennis.de/turniere" },
];

export default function ProfilPage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bodyLog, setBodyLog] = useState<BodyLogEntry[]>([]);
  const [weightOpen, setWeightOpen] = useState(searchParams.get("addWeight") === "true");
  const [weightForm, setWeightForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
  });

  useEffect(() => {
    api.get<Profile>("/api/profile").then(setProfile);
    api.get<Goal[]>("/api/goals").then(setGoals);
    api.get<BodyLogEntry[]>("/api/body-log").then(setBodyLog);
  }, []);

  async function addWeight(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/body-log", {
      date: weightForm.date,
      weight: parseFloat(weightForm.weight),
    });
    setWeightOpen(false);
    setWeightForm({ date: new Date().toISOString().split("T")[0], weight: "" });
    api.get<BodyLogEntry[]>("/api/body-log").then(setBodyLog);
  }

  async function toggleGoal(goalId: number, completed: boolean) {
    await api.put(`/api/goals/${goalId}`, { completed });
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, completed } : g))
    );
  }

  if (!profile) return null;

  const lkChartData = [...profile.lkEntries]
    .reverse()
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString("de-DE", { month: "short" }),
      lk: e.lk,
    }));

  const weightChartData = [...bodyLog]
    .reverse()
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" }),
      weight: e.weight,
    }));

  return (
    <>
      <PageHeader title="Profil" />
      <div className="p-4 space-y-4">
        {/* Profile Info */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{profile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {profile.club} · {profile.team}
                </div>
              </div>
              <Badge className="text-lg px-3">LK {profile.currentLk}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
              <div>
                <div className="font-medium">{profile.height} cm</div>
                <div className="text-xs text-muted-foreground">Groesse</div>
              </div>
              <div>
                <div className="font-medium">{profile.weight} kg</div>
                <div className="text-xs text-muted-foreground">Gewicht</div>
              </div>
              <div>
                <div className="font-medium">{profile.targetWeight || "-"} kg</div>
                <div className="text-xs text-muted-foreground">Ziel</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LK Chart */}
        {lkChartData.length > 1 && (
          <Card>
            <CardContent className="py-3">
              <h3 className="font-medium mb-2">LK-Verlauf</h3>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={lkChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis reversed domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="lk" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Weight */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Gewicht</h3>
              <Dialog open={weightOpen} onOpenChange={setWeightOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" /> Eintrag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gewicht eintragen</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={addWeight} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Datum</Label>
                        <Input
                          type="date"
                          value={weightForm.date}
                          onChange={(e) =>
                            setWeightForm({ ...weightForm, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Gewicht (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={weightForm.weight}
                          onChange={(e) =>
                            setWeightForm({ ...weightForm, weight: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Speichern</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {weightChartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={weightChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Eintraege</p>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardContent className="py-3">
            <h3 className="font-medium mb-2">Ziele</h3>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={g.completed}
                    onCheckedChange={(checked) => toggleGoal(g.id, checked === true)}
                  />
                  <span className={`text-sm ${g.completed ? "line-through text-muted-foreground" : ""}`}>
                    {g.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardContent className="py-3">
            <h3 className="font-medium mb-2">Links</h3>
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add profil page with LK chart, weight tracking, goals, and links"
```

---

### Task 13: Dockerfile + K8s Manifests

**Files:**
- Create: `Dockerfile`, `kubernetes/production/kustomization.yaml`, `kubernetes/production/nextjs/kustomization.yaml`, `kubernetes/production/nextjs/deployment.yml`, `kubernetes/production/nextjs/service.yml`, `kubernetes/production/nextjs/ingress.yml`, `kubernetes/production/nextjs/configmap.yml`, `kubernetes/production/nextjs/secrets.yaml`, `kubernetes/production/nextjs/secrets-generator.yaml`, `kubernetes/staging/kustomization.yaml`, `kubernetes/staging/nextjs/` (same structure)
- Modify: `next.config.ts`

- [ ] **Step 1: Update next.config.ts for standalone output**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

- [ ] **Step 3: Create kubernetes/production/kustomization.yaml**

```yaml
resources:
  - nextjs/
```

- [ ] **Step 4: Create kubernetes/production/nextjs/kustomization.yaml**

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - configmap.yml
  - deployment.yml
  - ingress.yml
  - service.yml
generators:
  - secrets-generator.yaml
```

- [ ] **Step 5: Create kubernetes/production/nextjs/deployment.yml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tennis-tracker-nextjs
  namespace: tennis-tracker
  labels:
    app: tennis-tracker-nextjs
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tennis-tracker-nextjs
  template:
    metadata:
      labels:
        app: tennis-tracker-nextjs
    spec:
      containers:
        - name: tennis-tracker-nextjs
          image: ghcr.io/digitale-kumpel/tennis-tracker:nextjs-v0.0.1
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "50m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          envFrom:
            - configMapRef:
                name: nextjs-config
            - secretRef:
                name: nextjs-secrets
```

- [ ] **Step 6: Create kubernetes/production/nextjs/service.yml**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: tennis-tracker-service
  namespace: tennis-tracker
spec:
  selector:
    app: tennis-tracker-nextjs
  ports:
    - port: 3000
      targetPort: 3000
```

- [ ] **Step 7: Create kubernetes/production/nextjs/ingress.yml**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tennis-tracker-ingress
  namespace: tennis-tracker
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-production
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
spec:
  tls:
    - hosts:
        - tennis.kumpel.cloud
      secretName: tennis-tracker-tls
  rules:
    - host: tennis.kumpel.cloud
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: tennis-tracker-service
                port:
                  number: 3000
```

- [ ] **Step 8: Create kubernetes/production/nextjs/configmap.yml**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nextjs-config
  namespace: tennis-tracker
data:
  NEXT_PUBLIC_APP_URL: "https://tennis.kumpel.cloud"
  NEXT_TELEMETRY_DISABLED: "1"
```

- [ ] **Step 9: Create kubernetes/production/nextjs/secrets-generator.yaml**

```yaml
apiVersion: viaduct.ai/v1
kind: ksops
metadata:
  name: nextjs-secrets
files:
  - ./secrets.yaml
```

- [ ] **Step 10: Create kubernetes/production/nextjs/secrets.yaml placeholder**

This file needs to be SOPS-encrypted. For now create the unencrypted version:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nextjs-secrets
  namespace: tennis-tracker
type: Opaque
stringData:
  DATABASE_URL: "postgresql://tennis_tracker:CHANGE_ME@pgpool.cnpg.svc.cluster.local:5432/tennis_tracker"
  JWT_SECRET: "CHANGE_ME_GENERATE_RANDOM_STRING"
```

Then encrypt with SOPS:
```bash
cd /Users/manuelschoebel/Workspace/private/tennis-tracker
sops --encrypt --in-place kubernetes/production/nextjs/secrets.yaml
```

- [ ] **Step 11: Create staging directory (copy from production, change domain)**

```bash
cp -r kubernetes/production kubernetes/staging
```

Update `kubernetes/staging/nextjs/ingress.yml` host to `tennis-tracker.kumpel.cloud`.
Update `kubernetes/staging/nextjs/configmap.yml` URL to `https://tennis-tracker.kumpel.cloud`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add Dockerfile and K8s manifests for kumpel.cloud deployment"
```

---

### Task 14: Verify Full Stack Locally

- [ ] **Step 1: Start database**

```bash
cd /Users/manuelschoebel/Workspace/private/tennis-tracker
docker compose up -d
```

- [ ] **Step 2: Run migrations and seed**

```bash
npx prisma migrate dev
npx prisma db seed
```

- [ ] **Step 3: Start dev server**

```bash
npm run dev
```

- [ ] **Step 4: Test full flow**

1. Open http://localhost:3000 → should redirect to /login
2. Login with manuel / moebius666 → should show dashboard with routines
3. Check routines → click through to exercise instructions
4. Mark a routine as done
5. Add a match
6. Add a training session
7. Go to profil → see LK chart, add weight entry
8. Check goals

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify full stack working locally"
```
