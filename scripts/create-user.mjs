/**
 * Creates or updates a user directly in the database. Run this once to
 * bootstrap your first login (there's no public signup UI on purpose —
 * this is an internal security tool).
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/create-user.mjs \
 *     --email you@company.com --password "a-strong-password" \
 *     --name "Your Name" --role admin
 *
 * Requires: npm install (pg + bcryptjs are already project dependencies)
 */
import { Pool } from "pg";
import bcrypt from "bcryptjs";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : fallback;
}

const email = arg("email");
const password = arg("password");
const name = arg("name", "Admin");
const role = arg("role", "admin");

if (!email || !password) {
  console.error("Usage: node scripts/create-user.mjs --email <email> --password <password> [--name <name>] [--role <role>]");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const passwordHash = await bcrypt.hash(password, 12);

await pool.query(
  `INSERT INTO users (email, password_hash, full_name, role)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         updated_at = now()`,
  [email.toLowerCase().trim(), passwordHash, name, role]
);

console.log(`User ready: ${email} (role: ${role})`);
await pool.end();
