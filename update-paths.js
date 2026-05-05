/**
 * G Architects — Update image paths to Cloudinary URLs
 * Run AFTER upload-to-cloudinary.js completes
 * Run: node update-paths.js
 */

const fs   = require('fs');
const path = require('path');

const CLOUD_NAME = 'dh4efeksi';
const BASE_URL   = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/garchitects`;
const OLD_PATH   = '/images/uploads/';

let totalFixed = 0;

// Fix all .md files in content/
function fixMarkdownFiles() {
  const contentDir = './content';
  if (!fs.existsSync(contentDir)) return;

  const files = getAllFiles(contentDir, '.md');
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(OLD_PATH)) {
      const updated = content.split(OLD_PATH).join(BASE_URL + '/');
      fs.writeFileSync(file, updated, 'utf8');
      totalFixed++;
      console.log(`✅ Fixed: ${path.basename(file)}`);
    }
  });
}

// Fix index.html
function fixHtml() {
  const htmlFile = './index.html';
  if (!fs.existsSync(htmlFile)) return;

  let content = fs.readFileSync(htmlFile, 'utf8');
  if (content.includes(OLD_PATH)) {
    const updated = content.split(OLD_PATH).join(BASE_URL + '/');
    fs.writeFileSync(htmlFile, updated, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed: index.html`);
  }
}

// Get all files recursively
function getAllFiles(dirPath, ext) {
  const results = [];
  fs.readdirSync(dirPath).forEach(item => {
    const full = path.join(dirPath, item);
    if (fs.statSync(full).isDirectory()) {
      results.push(...getAllFiles(full, ext));
    } else if (full.endsWith(ext)) {
      results.push(full);
    }
  });
  return results;
}

// Main
console.log('🔄 Updating image paths to Cloudinary URLs...\n');
fixMarkdownFiles();
fixHtml();
console.log(`\n✅ Total files fixed: ${totalFixed}`);
console.log('🚀 Now run: git add . && git commit -m "Cloudinary image paths" && git push origin main --force');
