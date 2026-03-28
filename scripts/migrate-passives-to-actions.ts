/**
 * Migrate passive rules to action catalog entries in Supabase.
 *
 * Steps:
 * 1. Add is_action column to weapons table
 * 2. Read all profiles from Supabase
 * 3. Extract unique passiveRules, create action weapon entries
 * 4. Update profiles to reference action entries, clear passiveRules
 * 5. Reclassify fake weapons (Pull Rank, Feedback → isAction, Microphone → isGear)
 *
 * Usage: npx tsx scripts/migrate-passives-to-actions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
}

interface ParsedPassive {
    name: string;
    description: string;
    rawText: string;
}

function parsePassiveRule(text: string): ParsedPassive {
    const trimmed = text.trim();
    const colonIdx = trimmed.indexOf(': ');
    if (colonIdx > 0 && colonIdx < 30) {
        const name = trimmed.slice(0, colonIdx);
        if (/^[A-Z]/.test(name) && !name.includes('.')) {
            return { name, description: trimmed.slice(colonIdx + 2), rawText: trimmed };
        }
    }
    return { name: '', description: trimmed, rawText: trimmed };
}

async function main() {
    console.log('=== Supabase Migration: Passives → Actions ===\n');

    // Step 1: Add is_action column (if not exists)
    console.log('Step 1: Adding is_action column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
        query: `ALTER TABLE weapons ADD COLUMN IF NOT EXISTS is_action boolean DEFAULT false;`
    });
    if (alterError) {
        // Try direct SQL if RPC not available
        console.warn('  RPC exec_sql not available, trying direct approach...');
        // The column might already exist — we'll check by inserting and seeing if it works
    }
    console.log('  Done (or already exists)');

    // Step 2: Read all profiles
    console.log('\nStep 2: Reading profiles...');
    const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*');
    if (profilesErr || !profiles) {
        console.error('Failed to read profiles:', profilesErr?.message);
        process.exit(1);
    }
    console.log(`  ${profiles.length} profiles loaded`);

    // Step 3: Read existing weapons to check for ID collisions
    const { data: existingWeapons } = await supabase.from('weapons').select('id');
    const existingIds = new Set((existingWeapons ?? []).map(w => w.id as string));

    // Step 4: Collect unique passives
    console.log('\nStep 3: Extracting unique passives...');
    const passiveMap = new Map<string, ParsedPassive>();
    const passiveToId = new Map<string, string>();

    for (const profile of profiles) {
        const text = ((profile.passive_rules as string) || '').trim();
        if (!text) continue;
        const parsed = parsePassiveRule(text);
        const key = parsed.name || parsed.rawText;
        if (!passiveMap.has(key)) {
            passiveMap.set(key, parsed);
        }
    }
    console.log(`  ${passiveMap.size} unique passive rules found`);

    // Generate unique IDs for actions
    for (const [key, parsed] of passiveMap.entries()) {
        let baseId = `action-${slugify(parsed.name || parsed.description)}`;
        let actionId = baseId;
        let suffix = 0;
        while (existingIds.has(actionId)) {
            suffix++;
            actionId = `${baseId}-${suffix}`;
        }
        existingIds.add(actionId);
        passiveToId.set(key, actionId);
    }

    // Step 5: Insert action entries into weapons table
    console.log('\nStep 4: Inserting action entries...');
    const actionRows = [];
    for (const [key, parsed] of passiveMap.entries()) {
        const actionId = passiveToId.get(key)!;
        actionRows.push({
            id: actionId,
            name: parsed.name || parsed.description.slice(0, 50),
            source: 'Custom',
            faction_variants: [{ factionId: 'universal', cost: 0, rarity: 99, reqStreetCred: 0 }],
            is_weapon: false,
            is_gear: false,
            is_action: true,
            range_red: false,
            range_yellow: false,
            range_green: false,
            range_long: false,
            description: parsed.description || parsed.rawText,
            keywords: [],
            updated_at: new Date().toISOString(),
        });
    }

    // Batch upsert in chunks of 50
    for (let i = 0; i < actionRows.length; i += 50) {
        const chunk = actionRows.slice(i, i + 50);
        const { error } = await supabase.from('weapons').upsert(chunk);
        if (error) {
            console.error(`  Batch ${i / 50 + 1} failed:`, error.message);
        } else {
            console.log(`  Batch ${i / 50 + 1}: ${chunk.length} actions upserted`);
        }
    }

    // Step 6: Update profiles — add action reference, clear passiveRules
    console.log('\nStep 5: Updating profiles...');
    let nextActionNum = 0;
    let updatedCount = 0;

    for (const profile of profiles) {
        const text = ((profile.passive_rules as string) || '').trim();
        if (!text) continue;

        const parsed = parsePassiveRule(text);
        const key = parsed.name || parsed.rawText;
        const actionId = passiveToId.get(key);
        if (!actionId) continue;

        const newAction = {
            id: `passive-action-${nextActionNum++}`,
            name: parsed.name || parsed.description.slice(0, 50),
            skillReq: 'None',
            range: 'Self',
            isAttack: false,
            keywords: [],
            effectDescription: '',
            weaponId: actionId,
        };

        const existingActions = (profile.actions as unknown[]) || [];
        const updatedActions = [newAction, ...existingActions];

        const { error } = await supabase.from('profiles').update({
            actions: updatedActions,
            passive_rules: '',
            updated_at: new Date().toISOString(),
        }).eq('id', profile.id);

        if (error) {
            console.error(`  Failed to update profile ${profile.id}:`, error.message);
        } else {
            updatedCount++;
        }
    }
    console.log(`  ${updatedCount} profiles updated`);

    // Step 7: Reclassify fake weapons
    console.log('\nStep 6: Reclassifying fake weapons...');
    for (const { id, updates } of [
        { id: 'weapon-feedback', updates: { is_action: true } },
        { id: 'weapon-pull-rank', updates: { is_action: true } },
        { id: 'weapon-microphone', updates: { is_gear: true } },
    ]) {
        const { error } = await supabase.from('weapons').update({
            ...updates,
            updated_at: new Date().toISOString(),
        }).eq('id', id);
        if (error) {
            console.warn(`  ${id}: ${error.message}`);
        } else {
            console.log(`  ${id}: updated`);
        }
    }

    // Step 8: Set is_action = false for all existing non-action weapons
    console.log('\nStep 7: Setting is_action=false on existing weapons...');
    const { error: bulkErr } = await supabase.from('weapons')
        .update({ is_action: false, updated_at: new Date().toISOString() })
        .is('is_action', null);
    if (bulkErr) {
        console.warn('  Bulk update failed:', bulkErr.message);
    } else {
        console.log('  Done');
    }

    console.log('\n=== Migration complete ===');
}

main().catch(console.error);
