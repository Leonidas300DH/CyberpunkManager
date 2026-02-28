/**
 * One-time migration script: uploads all weapon images from public/images/weapons/
 * to Supabase Storage bucket 'weapon-images', then updates seed.ts imageUrl references.
 *
 * Usage:
 *   npx tsx scripts/migrate-images-to-supabase.ts <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Get the service_role key from: Supabase Dashboard → Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://nknlxlmmliccsfsndnba.supabase.co';
const BUCKET = 'weapon-images';
const IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'images', 'weapons');
const SEED_FILE = path.resolve(__dirname, '..', 'src', 'lib', 'seed.ts');
const PUBLIC_URL_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

async function main() {
  const serviceRoleKey = process.argv[2];
  if (!serviceRoleKey) {
    console.error('Usage: npx tsx scripts/migrate-images-to-supabase.ts <SUPABASE_SERVICE_ROLE_KEY>');
    console.error('Get it from: Supabase Dashboard → Settings → API → service_role (secret)');
    process.exit(1);
  }

  // Create client with service_role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, serviceRoleKey);

  // 1. List all PNG files
  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} images to upload.\n`);

  let uploaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const filename of files) {
    const filePath = path.join(IMAGES_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, fileBuffer, {
        upsert: true,
        contentType: 'image/png',
      });

    if (error) {
      console.error(`FAIL: ${filename} — ${error.message}`);
      failed++;
    } else {
      console.log(`  OK: ${filename}`);
      uploaded++;
    }
  }

  console.log(`\nUpload complete: ${uploaded} OK, ${failed} failed, ${skipped} skipped.`);

  if (failed > 0) {
    console.error('\nSome uploads failed. Fix issues and re-run.');
    process.exit(1);
  }

  // 2. Update seed.ts — replace /images/weapons/xxx.png with Supabase URLs
  console.log('\nUpdating seed.ts imageUrl references...');
  let seed = fs.readFileSync(SEED_FILE, 'utf-8');

  // Match imageUrl: '/images/weapons/something.png'
  const regex = /imageUrl:\s*['"]\/images\/weapons\/([^'"]+)['"]/g;
  let replacements = 0;

  seed = seed.replace(regex, (match, filename) => {
    replacements++;
    return `imageUrl: '${PUBLIC_URL_BASE}/${filename}'`;
  });

  fs.writeFileSync(SEED_FILE, seed, 'utf-8');
  console.log(`Updated ${replacements} imageUrl references in seed.ts.`);

  // 3. Also update the default image path
  const defaultBefore = `imageUrl: '/images/weapons/default.png'`;
  const defaultAfter = `imageUrl: '${PUBLIC_URL_BASE}/default.png'`;
  if (seed.includes(defaultBefore)) {
    // Already replaced by regex above
  }

  console.log('\nDone! Next steps:');
  console.log('1. npm run build — verify no errors');
  console.log('2. Check a few weapons in the app to confirm images load');
  console.log('3. npx vercel --prod — deploy');
  console.log('4. (Optional) Delete public/images/weapons/ once confirmed');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
