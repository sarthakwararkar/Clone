import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let databaseUrl = '';
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key === 'DATABASE_URL') {
        databaseUrl = val;
      }
    }
  });
}

if (!databaseUrl) {
  console.error('❌ Could not find DATABASE_URL in root .env file.');
  process.exit(1);
}

async function main() {
  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT id, name, slug, logo_url FROM stores ORDER BY name ASC`;
    console.log('Stores in Database:');
    result.forEach((store, i) => {
      console.log(`${i + 1}. Name: ${store.name} | Slug: ${store.slug} | Logo URL: ${store.logo_url}`);
    });
  } catch (err) {
    console.error('Error fetching logos:', err.message);
  }
}

main().catch(console.error);
