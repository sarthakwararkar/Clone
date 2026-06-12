import { neon, neonConfig } from '@neondatabase/serverless';
import { Agent } from 'undici';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load DATABASE_URL from root .env
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

// Mask connection string password for logs
const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`Using DATABASE_URL from .env: ${maskedUrl}`);

// Setup custom agent for DNS bypass testing
const dnsAgent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      const resolver = new dns.Resolver();
      resolver.setServers(['8.8.8.8', '1.1.1.1']);
      resolver.resolve4(hostname, (err, addresses) => {
        if (err || addresses.length === 0) {
          callback(err || new Error(`No addresses found for ${hostname}`), []);
        } else {
          callback(null, [{ address: addresses[0], family: 4 }]);
        }
      });
    }
  }
});

async function runTest(useDnsBypass) {
  if (useDnsBypass) {
    console.log('\n--- Test 2: Bypassing local DNS (using Google DNS 8.8.8.8) ---');
    neonConfig.fetchFunction = (url, init) => {
      return fetch(url, { ...init, dispatcher: dnsAgent });
    };
    neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;
  } else {
    console.log('\n--- Test 1: Standard Connection (using System DNS) ---');
    neonConfig.fetchFunction = undefined;
    neonConfig.fetchEndpoint = undefined;
  }

  try {
    const sql = neon(databaseUrl);
    const nowResult = await sql`SELECT NOW()`;
    console.log('✅ Connection successful! Server time:', nowResult[0].now);

    console.log('Executing database schema update (adding banner_url column)...');
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner_url text`;
    console.log('✅ Schema update completed successfully!');

    try {
      const storesCount = await sql`SELECT count(*) FROM stores`;
      const categoriesCount = await sql`SELECT count(*) FROM categories`;
      const couponsCount = await sql`SELECT count(*) FROM coupons`;
      
      console.log('📊 Database Record Counts:');
      console.log(`- Stores: ${storesCount[0].count}`);
      console.log(`- Categories: ${categoriesCount[0].count}`);
      console.log(`- Coupons: ${couponsCount[0].count}`);
    } catch (dbErr) {
      console.error('❌ Table query failed:', dbErr.message);
    }
  } catch (connErr) {
    console.error('❌ Connection failed:', connErr.message);
    if (connErr.sourceError) {
      console.error('   Details:', connErr.sourceError.message);
    }
  }
}

async function main() {
  // Run standard test first
  await runTest(false);
  // Run DNS bypassed test second
  await runTest(true);
}

main().catch(console.error);
