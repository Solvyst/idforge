# idforge

**DB-safe public IDs & slugs for MongoDB and SQL databases.**

`idforge` helps you generate **human-friendly public IDs and slugs** with optional
database uniqueness checks and **race-safe retry logic**.

It works with **MongoDB, PostgreSQL, MySQL, SQLite**, and any ORM
(**Prisma, Mongoose, Kysely, Drizzle, Sequelize**) without locking you into adapters.

---

## Why idforge?

Most libraries only **generate random strings**.

Real production problems:
- Collisions under load
- Race conditions
- Slug conflicts
- ORM / DB lock-in

`idforge` solves this by separating concerns:

- 🔹 ID / slug generation
- 🔹 Optional existence checks
- 🔹 **Guaranteed safety via DB unique constraints + retry**
- 🔹 Database-agnostic API

---

## Installation

```bash
pnpm add idforge
# or
npm install idforge
```

---

## Features

* ✅ Human-safe public ID generation (no `0/O/1/I`)
* ✅ Slugify with collision handling (`john-doe`, `john-doe-2`, ...)
* ✅ Optional `exists()` uniqueness check
* ✅ **Race-safe insert-retry strategy**
* ✅ MongoDB & PostgreSQL duplicate detection helpers
* ✅ Works with any database / ORM
* ✅ TypeScript first

---

## Basic Usage

### Create a public ID generator

```ts
import { createIdGenerator } from "idforge";

const genProviderId = createIdGenerator({
  prefix: "prov_",
  length: 10
});

const id = genProviderId();
// prov_k9x7a2m3qp
```

---

## Slugify

```ts
import { slugify } from "idforge";

slugify("Dr. Anil Moharana");
// dr-anil-moharana
```

---

## Generate a unique slug (with DB check)

```ts
import { genUniqueSlug } from "idforge";

const slug = await genUniqueSlug({
  input: "John Doe",
  exists: async (value) => {
    return await UserRepo.slugExists(value);
  }
});

// Result: "john-doe" or "john-doe-2"
```

---

## What is `exists(value)`?

`exists` is a **user-provided function** that tells idforge
whether a value already exists **in your database**.

It must return:

* `true` -> value is already taken
* `false` -> value is available

> idforge does **not** know about your database.
> You decide how uniqueness is checked.

### Examples

#### MongoDB (Mongoose)

```ts
exists: async (slug) => {
  return !!(await UserModel.exists({ slug }));
}
```

#### SQL / PostgreSQL

```ts
exists: async (slug) => {
  const row = await db
    .selectFrom("users")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();

  return !!row;
}
```

---

## Generate a unique ID (exists-check mode)

⚠️ **Not race-safe**. Use only for low contention.

```ts
import { genUniqueValue } from "idforge";

const publicId = await genUniqueValue({
  generate: genProviderId,
  exists: async (v) => {
    return await ProviderRepo.existsByPublicId(v);
  }
});
```

---

## ⚠️ IMPORTANT: Production Safety

Checking `exists()` **alone is NOT safe** under concurrency.

Two requests can:

1. Generate the same ID
2. Pass `exists()`
3. Insert simultaneously -> ❌ collision

### ✅ Correct Production Pattern (RECOMMENDED)

1. Add a **UNIQUE constraint** in your database
2. Retry insert on duplicate error

---

## Race-Safe Insert with Retry (Recommended)

```ts
import {
  createWithUniqueValue,
  isPostgresDuplicate
} from "idforge";

const result = await createWithUniqueValue({
  generate: genProviderId,
  insert: async (publicId) => {
    return await db
      .insertInto("providers")
      .values({ public_id: publicId, name: "John" })
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  isDuplicateError: isPostgresDuplicate
});
```

This approach is:

* ✅ concurrency safe
* ✅ database enforced
* ✅ production proven

---

## MongoDB Example (Mongoose)

```ts
import {
  createWithUniqueValue,
  isMongoDuplicate
} from "idforge";

const doc = await createWithUniqueValue({
  generate: genProviderId,
  insert: (publicId) =>
    ProviderModel.create({ publicId, name: "John" }),
  isDuplicateError: isMongoDuplicate
});
```

---

## Prisma Example

```ts
const user = await createWithUniqueValue({
  generate: genUserId,
  insert: (publicId) =>
    prisma.user.create({
      data: { publicId, name: "Jane" }
    }),
  isDuplicateError: (e: any) => e.code === "P2002"
});
```

---

## Database Requirements

You **must** define a unique index.

### PostgreSQL

```sql
CREATE UNIQUE INDEX users_public_id_uq ON users(public_id);
```

### MongoDB

```js
db.users.createIndex({ publicId: 1 }, { unique: true });
```

---

## API Reference

### `createIdGenerator(options)`

Creates a reusable ID generator.

### `slugify(input, options)`

Converts text to a URL-safe slug.

### `genUniqueValue({ generate, exists })`

Returns a value not found by `exists()`.

### `genUniqueSlug({ input, exists })`

Slugifies and resolves collisions.

### `createWithUniqueValue({ generate, insert, isDuplicateError })`

**Race-safe** creation strategy using DB constraints.

### `isMongoDuplicate(error)`

Detects MongoDB duplicate key errors.

### `isPostgresDuplicate(error)`

Detects PostgreSQL unique constraint violations.

---

## Design Philosophy

* ❌ No magic globals
* ❌ No ORM adapters
* ❌ No database assumptions
* ✅ Small primitives
* ✅ Explicit control
* ✅ Production correctness

---

## When NOT to use idforge

* If you don't need public IDs
* If collisions don't matter
* If you rely entirely on DB auto-generated IDs

---

## License

MIT © Solvyst
