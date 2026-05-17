/**
 * G Architects — Cloudinary Bulk Upload Script
 * Uploads all images from images/uploads/ to Cloudinary
 * Run: node upload-to-cloudinary.js
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ── Cloudinary Config ──────────────────────────────
cloudinary.config({
  cloud_name: 'dh4efeksi',
  api_key:    '176773582188537',
  api_secret: 'ybglKbPCZQv9ccGixr7fg9E8554'
});

const UPLOADS_DIR  = './images1/uploads';
const CLOUD_FOLDER = 'garchitects';
const IMAGE_EXTS   = /\.(jpg|jpeg|png|gif|webp|svg|JPG|JPEG|PNG)$/;

let uploaded = 0;
let failed   = 0;

// ── Recursive folder upload ────────────────────────
async function uploadFolder(localPath, cloudPath) {
  const items = fs.readdirSync(localPath);

  for (const item of items) {
    const fullLocal = path.join(localPath, item);
    const stat      = fs.statSync(fullLocal);

    if (stat.isDirectory()) {
      // Recurse into sub-folder
      await uploadFolder(fullLocal, cloudPath ? `${cloudPath}/${item}` : item);
    } else if (IMAGE_EXTS.test(item)) {
      const nameOnly = path.parse(item).name;
      const publicId = cloudPath
        ? `${CLOUD_FOLDER}/${cloudPath}/${nameOnly}`
        : `${CLOUD_FOLDER}/${nameOnly}`;

      try {
        const result = await cloudinary.uploader.upload(fullLocal, {
          public_id:       publicId,
          use_filename:    true,
          unique_filename: false,
          overwrite:       true,
          resource_type:   'image'
        });
        uploaded++;
        console.log(`✅ [${uploaded}] ${item}`);
        console.log(`   → ${result.secure_url}`);
      } catch (err) {
        failed++;
        console.error(`❌ FAILED: ${item} — ${err.message}`);
      }
    }
  }
}

// ── Main ───────────────────────────────────────────
(async () => {
  console.log('🚀 Starting Cloudinary upload...');
  console.log(`📁 From: ${UPLOADS_DIR}`);
  console.log(`☁️  To:   ${CLOUD_FOLDER}/\n`);

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error('❌ images/uploads/ folder not found!');
    process.exit(1);
  }

  await uploadFolder(UPLOADS_DIR, '');

  console.log('\n──────────────────────────────');
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log('🎉 Done! Now run: node update-paths.js');
})();
