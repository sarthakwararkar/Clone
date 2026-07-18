import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read database url from process.env or fallback to reading root .env file
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf-8');
      const dbUrlLine = envFile.split('\n').find(line => line.trim().startsWith('DATABASE_URL='));
      if (dbUrlLine) {
        databaseUrl = dbUrlLine.split('=')[1].trim();
        // Remove surrounding quotes if present
        if ((databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) || 
            (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))) {
          databaseUrl = databaseUrl.slice(1, -1);
        }
      }
    }
  } catch (err) {
    console.warn('Warning: Could not read root .env file.', err.message);
  }
}

if (!databaseUrl) {
  console.error('Error: DATABASE_URL is not set in environment or root .env file.');
  process.exit(1);
}

const sql = neon(databaseUrl);

const users = await sql`SELECT id, email, name, role, provider, created_at FROM users ORDER BY created_at DESC`;
console.log('--- Users ---');
console.table(users);
