const fs = require('fs');
const readline = require('readline');

async function analyze() {
  const fileStream = fs.createReadStream('base.obj');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let count = 0;

  for await (const line of rl) {
    if (line.startsWith('v ')) {
      const parts = line.split(/\s+/).slice(1).map(Number);
      if (parts.length >= 3) {
        const [x, y, z] = parts;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
        count++;
      }
    }
  }

  console.log(`Parsed ${count} vertices.`);
  console.log(`X range: [${minX}, ${maxX}] | Center X: ${(minX + maxX)/2}`);
  console.log(`Y range: [${minY}, ${maxY}] | Center Y: ${(minY + maxY)/2}`);
  console.log(`Z range: [${minZ}, ${maxZ}] | Center Z: ${(minZ + maxZ)/2}`);
}

analyze();
