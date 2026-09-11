import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;

export function getDb(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
  }
  return _client;
}

// ============ USER TYPES ============

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface Member {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ============ USER FUNCTIONS ============

export async function createUser(email: string, name: string, passwordHash: string): Promise<User> {
  const db = getDb();
  const id = crypto.randomUUID();
  
  await db.execute({
    sql: 'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, email, name, passwordHash, new Date().toISOString()],
  });
  
  return { id, email, name, created_at: new Date().toISOString() };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  return (result.rows[0] as User) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as User) || null;
}

// ============ SESSION FUNCTIONS ============

export async function createSession(userId: string): Promise<Session> {
  const db = getDb();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  await db.execute({
    sql: 'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
    args: [id, userId, expiresAt, new Date().toISOString()],
  });
  
  return { id, user_id: userId, expires_at: expiresAt, created_at: new Date().toISOString() };
}

export async function getSession(id: string): Promise<Session | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")',
    args: [id],
  });
  return (result.rows[0] as Session) || null;
}

export async function deleteSession(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM sessions WHERE id = ?',
    args: [id],
  });
}

// ============ ORG FUNCTIONS ============

export async function createOrg(name: string, ownerId: string): Promise<Org> {
  const db = getDb();
  const id = crypto.randomUUID();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  await db.execute({
    sql: 'INSERT INTO orgs (id, name, slug, owner_id, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, name, slug, ownerId, new Date().toISOString()],
  });
  
  // Add owner as member
  await db.execute({
    sql: 'INSERT INTO members (id, org_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [crypto.randomUUID(), id, ownerId, 'owner', new Date().toISOString()],
  });
  
  return { id, name, slug, owner_id: ownerId, created_at: new Date().toISOString() };
}

export async function getOrgsByUser(userId: string): Promise<Org[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT o.* FROM orgs o 
          INNER JOIN members m ON o.id = m.org_id 
          WHERE m.user_id = ?`,
    args: [userId],
  });
  return result.rows as Org[];
}

export async function getOrgById(id: string): Promise<Org | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM orgs WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as Org) || null;
}

// ============ MEMBER FUNCTIONS ============

export async function addMember(orgId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<Member> {
  const db = getDb();
  const id = crypto.randomUUID();
  
  await db.execute({
    sql: 'INSERT INTO members (id, org_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, orgId, userId, role, new Date().toISOString()],
  });
  
  return { id, org_id: orgId, user_id: userId, role, created_at: new Date().toISOString() };
}

export async function getMembersByOrg(orgId: string): Promise<(Member & { email: string; name: string })[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT m.*, u.email, u.name FROM members m 
          INNER JOIN users u ON m.user_id = u.id 
          WHERE m.org_id = ?`,
    args: [orgId],
  });
  return result.rows as (Member & { email: string; name: string })[];
}

export async function getMemberRole(orgId: string, userId: string): Promise<string | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT role FROM members WHERE org_id = ? AND user_id = ?',
    args: [orgId, userId],
  });
  return (result.rows[0]?.role as string) || null;
}

export async function removeMember(memberId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM members WHERE id = ?',
    args: [memberId],
  });
}

// ============ SLOT FUNCTIONS ============

export interface Slot {
  position: number;
  website_url: string | null;
  brand_name: string | null;
  bid_amount: number;
  occupant_name: string | null;
  created_at: string;
}

export async function getSlots(): Promise<Slot[]> {
  const db = getDb();
  const result = await db.execute('SELECT * FROM slots ORDER BY position');
  return result.rows as Slot[];
}

export async function getSlot(position: number): Promise<Slot | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM slots WHERE position = ?',
    args: [position],
  });
  return (result.rows[0] as Slot) || null;
}

export async function updateSlot(
  position: number,
  websiteUrl: string,
  brandName: string,
  bidAmount: number,
  occupantName: string
): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `UPDATE slots SET website_url = ?, brand_name = ?, bid_amount = ?, occupant_name = ? WHERE position = ?`,
    args: [websiteUrl, brandName, bidAmount, occupantName, position],
  });
}

// ============ SCHEMA MIGRATION ============

export async function migrateSchema(): Promise<void> {
  const db = getDb();
  
  const migrations = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(org_id, user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      tier TEXT NOT NULL CHECK(tier IN ('starter', 'pro', 'pro_plus')),
      product_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'paid' CHECK(status IN ('paid', 'refunded')),
      coupon_code TEXT,
      cashback_forbidden INTEGER NOT NULL DEFAULT 0,
      waiver INTEGER NOT NULL DEFAULT 0, -- instant-delivery consent (checkout checkbox), 1 = buyer agreed
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      license_key TEXT UNIQUE NOT NULL,
      tier TEXT NOT NULL CHECK(tier IN ('starter', 'pro', 'pro_plus')),
      seats INTEGER NOT NULL DEFAULT 1,
      themes TEXT NOT NULL DEFAULT '[]',
      updates_until TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS share_claims (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      order_id TEXT,
      post_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'rejected')),
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];
  
  for (const sql of migrations) {
    await db.execute(sql);
  }
}
