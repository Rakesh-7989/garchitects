const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'content/projects');

if (!fs.existsSync(DIR)) {
  console.log('content/projects not found');
  process.exit(1);
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace old WEBSITE KOUSIK paths
  content = content.replace(/https:\/\/res\.cloudinary\.com\/dh4efeksi\/image\/upload\/garchitects\/WEBSITE KOUSIK\//g, '/images1/uploads/WEBSITE/');
  
  // Replace old Upcoming paths
  content = content.replace(/https:\/\/res\.cloudinary\.com\/dh4efeksi\/image\/upload\/garchitects\/Upcoming\//g, '/images1/uploads/WEBSITE/Upcoming/');

  // Replace old nandigama layout paths
  content = content.replace(/https:\/\/res\.cloudinary\.com\/dh4efeksi\/image\/upload\/garchitects\/nandigama layout\//g, '/images1/uploads/WEBSITE/Layouts/Nadhigama Villas/');
  content = content.replace(/https:\/\/res\.cloudinary\.com\/dh4efeksi\/image\/upload\/garchitects\/nandigama\//g, '/images1/uploads/WEBSITE/Layouts/Nadhigama Villas/');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
    updatedCount++;
  }
});

console.log(`\nSuccessfully updated ${updatedCount} project files to use images1 folders!`);
console.log('Now you can run: node upload-to-cloudinary.js && node update-paths.js');
