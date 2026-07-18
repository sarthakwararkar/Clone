import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read database url from .env
const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
const dbUrlLine = envFile.split('\n').find(line => line.startsWith('DATABASE_URL='));
const databaseUrl = dbUrlLine.split('=')[1].trim();

async function main() {
  const sql = neon(databaseUrl);
  const [{ count: couponsCount }] = await sql`SELECT COUNT(*)::int AS count FROM coupons`;
  const [{ count: storesCount }] = await sql`SELECT COUNT(*)::int AS count FROM stores`;
  const [{ count: usersCount }] = await sql`SELECT COUNT(*)::int AS count FROM users`;
  
  console.log('--- DB Stats ---');
  console.log('Coupons:', couponsCount);
  console.log('Stores:', storesCount);
  console.log('Users:', usersCount);
}

main().catch(console.error);
