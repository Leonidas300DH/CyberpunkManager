import { NextRequest, NextResponse } from 'next/server';
import { writeFile, access, readdir, unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const WEAPONS_DIR = path.join(process.cwd(), 'public', 'images', 'weapons');

/** Slugify a weapon name into a safe filename */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Check if file exists */
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

/** Find all existing files for a slug (slug.png, slug-2.png, slug-3.png, etc.) */
async function findExistingFiles(slug: string): Promise<string[]> {
    try {
        const files = await readdir(WEAPONS_DIR);
        const pattern = new RegExp(`^${slug}(-\\d+)?\\.png$`);
        return files.filter(f => pattern.test(f));
    } catch {
        return [];
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const weaponName = formData.get('name') as string | null;
        const overwrite = formData.get('overwrite') === 'true';

        if (!file || !weaponName) {
            return NextResponse.json({ error: 'File and weapon name required' }, { status: 400 });
        }

        const slug = slugify(weaponName);
        const ext = '.png';
        const targetPath = path.join(WEAPONS_DIR, `${slug}${ext}`);

        // Find all existing versions (slug.png, slug-2.png, etc.)
        const existingFiles = await findExistingFiles(slug);

        // If files exist and overwrite not confirmed, ask for confirmation
        if (existingFiles.length > 0 && !overwrite) {
            return NextResponse.json({
                exists: true,
                existingFiles,
                message: `Image "${existingFiles.join(', ')}" already exists. Overwrite?`,
            });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Resize to square (cover + crop center)
        const squareBuffer = await sharp(buffer)
            .resize(512, 512, { fit: 'cover', position: 'centre' })
            .png()
            .toBuffer();

        // Delete all old versions before writing the new one
        for (const oldFile of existingFiles) {
            await unlink(path.join(WEAPONS_DIR, oldFile));
        }

        await writeFile(targetPath, squareBuffer);

        const publicUrl = `/images/weapons/${slug}${ext}`;

        return NextResponse.json({ url: publicUrl });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
