const fs = require('fs');
const path = require('path');

const collections = ['articles', 'projects', 'services', 'reviews'];
const baseDir = path.join(__dirname, 'content');

console.log("Generating manifest files...");

for (const col of collections) {
  const dir = path.join(baseDir, col);
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    continue;
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const manifestPath = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
  console.log(`Updated ${manifestPath} with ${files.length} items.`);
}

console.log("Build complete.");
