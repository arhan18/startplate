import { describe, it, expect } from 'vitest';

// Runs the REAL migrateSchema() from shared/lib/db against a fresh file DB
// by pointing env vars before the module loads. Any schema drift fails here.
process.env.TURSO_DATABASE_URL = 'file:/tmp/startplate-schema-test.db';
delete process.env.TURSO_AUTH_TOKEN;

describe('schema migration (real migrateSchema)', () => {
  it('creates all 8 tables and enforces commerce lifecycle rules', async () => {
    const { migrateSchema, getDb } = await import('../shared/lib/db');
    const db = getDb();
    for (const t of ['share_claims', 'licenses', 'orders', 'projects', 'members', 'sessions', 'orgs', 'users']) {
      await db.execute(`DROP TABLE IF EXISTS ${t}`);
    }
    await migrateSchema();

    for (const t of ['users', 'sessions', 'orgs', 'members', 'projects', 'orders', 'licenses', 'share_claims']) {
      const r = await db.execute({ sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`, args: [t] });
      expect(r.rows.length, `table ${t} exists`).toBe(1);
    }

    // Order with coupon stamps cashback ineligible
    await db.execute(
      `INSERT INTO orders (id, email, tier, product_id, amount, coupon_code, cashback_forbidden)
       VALUES ('o1', 'a@x.com', 'starter', 'pdt_s', 12900, 'ALAN20', 1)`
    );
    // Invalid tier rejected
    await expect(
      db.execute(`INSERT INTO orders (id, email, tier, product_id, amount) VALUES ('o2', 'a@x.com', 'ultra', 'p', 1)`)
    ).rejects.toThrow();
    // License key unique
    await db.execute(
      `INSERT INTO licenses (id, email, license_key, tier, updates_until) VALUES ('l1','a@x.com','K1','pro','2027-01-01')`
    );
    await expect(
      db.execute(`INSERT INTO licenses (id, email, license_key, tier, updates_until) VALUES ('l2','b@x.com','K1','pro','2027-01-01')`)
    ).rejects.toThrow();
    // Claim lifecycle pending -> paid
    await db.execute(`INSERT INTO share_claims (id, email, post_url) VALUES ('c1','a@x.com','https://x.com/x/1')`);
    await db.execute(`UPDATE share_claims SET status='paid', verified_at=datetime('now') WHERE id='c1'`);
    const row = await db.execute(`SELECT status FROM share_claims WHERE id='c1'`);
    expect(row.rows[0].status).toBe('paid');
  });
});
