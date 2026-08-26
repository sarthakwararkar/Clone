const fs = require('fs');

const files = [
  'src/routes/users.ts',
  'src/routes/coupons.ts',
  'src/routes/alerts.ts',
  'src/routes/admin.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Ensure zod is imported
  if (!content.includes('import { z }')) {
    content = content.replace(/import \{ Hono \} from 'hono';/, `import { Hono } from 'hono';\nimport { z } from 'zod';`);
  }

  // Ensure ApiResponse is imported where used
  if (!content.includes('ApiResponse')) {
    content = content.replace(/import type \{ (.*?) \} from '\.\.\/types';/, `import type { $1, ApiResponse } from '../types';`);
  }

  // Replace param ID extraction with UUID validation
  const paramRegex = /const (\w+Id|id) = c\.req\.param\('(\w+)'\);/g;
  
  content = content.replace(paramRegex, (match, varName, paramName) => {
    return `const ${varName} = c.req.param('${paramName}');\n  if (!z.string().uuid().safeParse(${varName}).success) {\n    return c.json({ success: false, error: 'Invalid ID format' } as ApiResponse, 400);\n  }`;
  });

  fs.writeFileSync(file, content);
}
console.log('Added UUID validation');
