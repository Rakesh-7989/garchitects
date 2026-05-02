// netlify/functions/update-manifests.js
// Triggered by Netlify's deploy-succeeded event.
// Reads the content directories and regenerates manifest.json files.
// This ensures the CMS-loader always has an up-to-date file list.

const fs = require('fs');
const path = require('path');

exports.handler = async function (event, context) {
  const collections = ['articles', 'projects', 'services', 'reviews'];
  const baseDir = path.join(__dirname, '..', '..', 'content');

  for (const col of collections) {
    const dir = path.join(baseDir, col);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .sort();

    const manifestPath = path.join(dir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
  }

  return { statusCode: 200, body: 'Manifests updated.' };
};
