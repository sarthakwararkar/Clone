import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_FJn9ufigo6vB@ep-polished-rice-aoltq72i-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

const users = await sql`SELECT id, email, name, role, provider, created_at FROM users ORDER BY created_at DESC`;
console.log('--- Users ---');
console.table(users);
