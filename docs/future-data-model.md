# Future data model (blueprint — NOT active)

> **This file is a design record, not live code.** The app currently persists
> everything in the browser (`localStorage`, via `lib/storage.ts`). There is no
> database, no Prisma client, and no `prisma/` directory in the build.
>
> The schema below was recovered from the archived branch
> `archive/trae-1RaD7T-prisma` and is kept here so the design work isn't lost.
> Copy it to `prisma/schema.prisma` when you're actually ready to migrate.

## Why it hasn't been activated

Moving to Postgres is the single biggest architectural change available to this
project, and it is not a drop-in:

1. It needs a real Postgres instance (Neon / Supabase / Vercel Postgres) plus
   `DATABASE_URL`, in every environment including preview builds.
2. Every read/write currently going through `lib/storage.ts`, `lib/history.ts`,
   `lib/memory-bank.ts`, `lib/brand-voice.ts` and `lib/usage.ts` has to move
   behind API routes or server actions.
3. Signed-in users have existing local data. A migration path is needed or they
   lose their history and brand-voice profile on first login.
4. NextAuth v5 needs the Prisma adapter wired up, and the auth tables below
   (`Account`, `Session`, `VerificationToken`) must match what NextAuth expects.

Until there's a reason to pay that cost — typically "users are complaining that
their data disappears on another device" or "billing state needs to be
authoritative" — localStorage stays. It's cheaper and it works.

## The recovered schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  history       HistoryRecord[]
  brandVoice    BrandVoiceProfile?
  memories      MemoryItem[]
  usage         UsageRecord[]
  versions      DocumentVersion[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model HistoryRecord {
  id        String   @id @default(cuid())
  userId    String
  title     String
  mode      String
  result    String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model BrandVoiceProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  industry        String   @default("")
  tone            String   @default("neutral")
  audience        String   @default("")
  commonPhrases   String   @default("[]") // JSON array as string
  avgSentenceLength Float  @default(15)
  avgParagraphLength Float @default(4)
  vocabularyStyle String   @default("[]") // JSON array as string
  learningSamples Int      @default(0)
  styleFingerprint String? @db.Text // JSON object as string
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model MemoryItem {
  id        String   @id @default(cuid())
  userId    String
  content   String   @db.Text
  type      String   @default("idea")
  keywords  String   @default("[]") // JSON array as string
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model UsageRecord {
  id          String   @id @default(cuid())
  userId      String
  date        String   // Format: YYYY-MM-DD
  used        Int      @default(0)
  claudeUsed  Int      @default(0)
  deepseekUsed Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
}

model DocumentVersion {
  id          String   @id @default(cuid())
  userId      String
  documentId  String
  content     String   @db.Text
  title       String   @default("Untitled")
  version     Int
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([documentId, version])
  @@index([userId])
  @@index([documentId])
}
```

## Notes on the model as recovered

- `UsageRecord` mirrors what `lib/usage.ts` already tracks per day
  (`claudeUsed` / `deepseekUsed`), so the client logic can move over largely
  unchanged — it just changes where it reads and writes.
- `BrandVoiceProfile.commonPhrases`, `vocabularyStyle` and `styleFingerprint`
  are stored as JSON-in-string. Postgres has `Json` columns; using them would
  be cleaner than string-encoded JSON.
- `DocumentVersion` is what powers version history. Note `lib/use-version-history.ts`
  (same archived branch) calls `/api/user/versions`, which does **not** exist in
  `main` — so version history only becomes real once this schema is live.
- No payments table. Subscription state currently lives with Creem; if billing
  becomes authoritative server-side, that's a model to add at migration time.
