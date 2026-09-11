# Skill: Add a Database Table

**Trigger:** "Add a table for X" or "Create a new database model for Y"

## Description

Add a new database table to the Turso (libSQL) database. Tables are defined in migrations and accessed through helper functions in `shared/lib/db.ts`.

## Steps

1. **Add the table definition** to `migrations/schema.sql`
2. **Add the TypeScript interface** to `shared/lib/db.ts`
3. **Add CRUD helper functions** to `shared/lib/db.ts`
4. **Run the migration** — table auto-creates on first access via `migrateSchema()`
5. **Test** with `npm run dev`

## Files to Create/Modify

- `migrations/schema.sql` — Table definition
- `shared/lib/db.ts` — Interface + helper functions

## Table Definition

```sql
-- Add to migrations/schema.sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'archived')),
  metadata TEXT, -- JSON string for flexible data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
```

## TypeScript Interface

```typescript
// Add to shared/lib/db.ts
export interface Product {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  price: number;
  status: 'active' | 'inactive' | 'archived';
  metadata: string | null;
  created_at: string;
  updated_at: string;
}
```

## CRUD Helper Functions

```typescript
// Add to shared/lib/db.ts

// CREATE
export async function createProduct(orgId: string, name: string, price: number): Promise<Product> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.execute({
    sql: `INSERT INTO products (id, org_id, name, price, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, orgId, name, price, now, now],
  });
  
  return { id, org_id: orgId, name, price, status: 'active', created_at: now, updated_at: now };
}

// READ
export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM products WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as Product) || null;
}

// READ (list by org)
export async function getProductsByOrg(orgId: string): Promise<Product[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM products WHERE org_id = ? ORDER BY created_at DESC',
    args: [orgId],
  });
  return result.rows as Product[];
}

// UPDATE
export async function updateProduct(id: string, updates: Partial<Pick<Product, 'name' | 'price' | 'status'>>): Promise<void> {
  const db = getDb();
  const fields: string[] = [];
  const args: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      args.push(value);
    }
  }
  
  fields.push('updated_at = ?');
  args.push(new Date().toISOString());
  args.push(id);
  
  await db.execute({
    sql: `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
    args,
  });
}

// DELETE
export async function deleteProduct(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM products WHERE id = ?',
    args: [id],
  });
}
```

## Notes

- Turso uses libSQL (SQLite-compatible) — use SQLite syntax, not PostgreSQL
- All IDs are `TEXT` (UUIDs generated via `crypto.randomUUID()`)
- Timestamps are ISO strings (`datetime('now')`)
- Use `CHECK` constraints for enums (e.g., `status`)
- Foreign keys use `ON DELETE CASCADE` for parent-child relationships
- For JSON data, store as TEXT and parse/stringify in code
- Run `migrateSchema()` on app startup to auto-create tables
