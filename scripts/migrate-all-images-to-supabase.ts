/**
 * One-time migration: uploads ALL project images to Supabase Storage
 * and updates all source code references.
 *
 * Usage:
 *   npx tsx scripts/migrate-all-images-to-supabase.ts <SUPABASE_SERVICE_ROLE_KEY>
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://nknlxlmmliccsfsndnba.supabase.co';
const BUCKET = 'app-images';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.resolve(PROJECT_ROOT, 'public', 'images');
const PUBLIC_URL_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

// Map local directory names to clean storage folder names
// Keep original filenames (spaces, casing) — Supabase handles them fine
const FOLDER_MAP: Record<string, string> = {
  'Campaign Starter': 'campaign-starter',
  'characters': 'characters',
  'characters examples': 'characters-examples',
  'factions': 'factions',
  'Menus': 'menus',
  'Netrunning Programs Illustrations': 'programs',
  'Skills Icons': 'skills',
  // 'weapons' — already in separate weapon-images bucket, skip
};

// Source files that reference images
const SOURCE_FILES = [
  'src/lib/seed.ts',
  'src/data/programs_csv.ts',
  'src/components/characters/CharacterCard.tsx',
  'src/components/shared/WeaponTile.tsx',
  'src/components/database/ArmoryContent.tsx',
  'src/components/programs/ProgramCard.tsx',
  'src/components/layout/BottomNav.tsx',
  'src/app/hq/page.tsx',
];

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function main() {
  const serviceRoleKey = process.argv[2];
  if (!serviceRoleKey) {
    console.error('Usage: npx tsx scripts/migrate-all-images-to-supabase.ts <SUPABASE_SERVICE_ROLE_KEY>');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, serviceRoleKey);

  // 1. Create bucket (public read)
  console.log(`Creating bucket "${BUCKET}"...`);
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  });
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Failed to create bucket:', bucketError.message);
    process.exit(1);
  }
  console.log('Bucket ready.\n');

  // 2. Build upload manifest
  type UploadEntry = {
    localPath: string;
    storagePath: string;  // folder/original-filename.png
  };

  const manifest: UploadEntry[] = [];

  for (const [localDir, storageFolder] of Object.entries(FOLDER_MAP)) {
    const dirPath = path.join(IMAGES_DIR, localDir);
    if (!fs.existsSync(dirPath)) {
      console.log(`  Skipping ${localDir}/ (not found)`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext);
    });

    console.log(`  ${localDir}/: ${files.length} files → ${storageFolder}/`);

    for (const file of files) {
      manifest.push({
        localPath: path.join(dirPath, file),
        storagePath: `${storageFolder}/${file}`,
      });
    }
  }

  // Root-level images (cyberarm.png, etc.)
  const rootFiles = fs.readdirSync(IMAGES_DIR).filter(f => {
    const fullPath = path.join(IMAGES_DIR, f);
    if (!fs.statSync(fullPath).isFile()) return false;
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext);
  });

  if (rootFiles.length > 0) {
    console.log(`  (root): ${rootFiles.length} files → misc/`);
    for (const file of rootFiles) {
      manifest.push({
        localPath: path.join(IMAGES_DIR, file),
        storagePath: `misc/${file}`,
      });
    }
  }

  console.log(`\nTotal: ${manifest.length} images to upload.\n`);

  // 3. Upload all
  let uploaded = 0;
  let failed = 0;

  for (const entry of manifest) {
    const fileBuffer = fs.readFileSync(entry.localPath);
    const contentType = getContentType(entry.localPath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(entry.storagePath, fileBuffer, {
        upsert: true,
        contentType,
      });

    if (error) {
      console.error(`  FAIL: ${entry.storagePath} — ${error.message}`);
      failed++;
    } else {
      console.log(`  OK: ${entry.storagePath}`);
      uploaded++;
    }
  }

  console.log(`\nUpload: ${uploaded} OK, ${failed} failed.\n`);

  if (failed > 0) {
    console.error('Some uploads failed. Fix and re-run.');
    process.exit(1);
  }

  // 4. Update source code references
  console.log('Updating source code references...\n');

  // Simple prefix replacements: old prefix → new prefix
  const PREFIX_REPLACEMENTS: [string, string][] = [
    ['/images/Campaign Starter/', `${PUBLIC_URL_BASE}/campaign-starter/`],
    ['/images/characters/', `${PUBLIC_URL_BASE}/characters/`],
    ['/images/characters examples/', `${PUBLIC_URL_BASE}/characters-examples/`],
    ['/images/factions/', `${PUBLIC_URL_BASE}/factions/`],
    ['/images/Menus/', `${PUBLIC_URL_BASE}/menus/`],
    ['/images/Netrunning Programs Illustrations/', `${PUBLIC_URL_BASE}/programs/`],
    ['/images/Skills Icons/', `${PUBLIC_URL_BASE}/skills/`],
    // Root-level
    ['/images/cyberarm.png', `${PUBLIC_URL_BASE}/misc/cyberarm.png`],
  ];

  for (const relPath of SOURCE_FILES) {
    const filePath = path.join(PROJECT_ROOT, relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`  Skip: ${relPath} (not found)`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    let count = 0;

    for (const [oldPrefix, newPrefix] of PREFIX_REPLACEMENTS) {
      const escaped = oldPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newPrefix);
        count += matches.length;
      }
    }

    if (count > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ${relPath}: ${count} replacement(s)`);
    } else {
      console.log(`  ${relPath}: no changes`);
    }
  }

  console.log('\nDone! Next steps:');
  console.log('1. npm run build');
  console.log('2. Check app images load');
  console.log('3. npx vercel --prod');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
