import "dotenv/config";
import { PrismaClient, TimeOfDay, GoalCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
