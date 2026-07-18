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
  const users = await sql`SELECT id, email, name, role, provider, created_at FROM users`;
  console.log('--- Users ---');
  console.table(users);
}

main().catch(console.error);
