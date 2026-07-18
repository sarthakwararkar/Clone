const fs = require('fs');
const readline = require('readline');

async function parse() {
  const fileStream = fs.createReadStream('base.obj');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('--- Objects and Groups in base.obj ---');
  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.startsWith('o ') || line.startsWith('g ')) {
      console.log(`Line ${lineCount}: ${line}`);
    }
  }
  console.log(`Total lines parsed: ${lineCount}`);
}

parse();
