import { createClient } from '@supabase/supabase-js';
import { EXTRACTED_DATA } from './extracted_data';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(
  'https://nknlxlmmliccsfsndnba.supabase.co',
  SERVICE_ROLE_KEY
);

async function main() {
  console.log(`Updating ${EXTRACTED_DATA.length} objective cards in Supabase...\n`);

  let ok = 0;
  let errors = 0;
  let notFound = 0;

  for (const card of EXTRACTED_DATA) {
    const { error } = await supabase
      .from('objectives')
      .update({
        description: card.description,
        reward_type: card.reward_type,
        reward_text: card.reward_text,
        grants_street_cred: card.grants_street_cred,
        grants_eb: card.grants_eb,
        grants_luck: card.grants_luck,
        grants_cybergear_to: card.grants_cybergear_to,
        cybergear_effect: card.cybergear_effect,
      })
      .eq('id', card.id);

    if (error) {
      console.error(`ERROR ${card.id}:`, error.message);
      errors++;
    } else {
      ok++;
    }
  }

  console.log(`\nDone: ${ok} updated, ${errors} errors, ${notFound} not found`);

  // Verify
  const { data: verify } = await supabase
    .from('objectives')
    .select('id, faction_id, description');

  const total = verify?.length ?? 0;
  const placeholders = verify?.filter((v: any) => v.description === 'PLACEHOLDER').length ?? 0;

  console.log(`\nDB verification:`);
  console.log(`  Total rows: ${total}`);
  console.log(`  Complete: ${total - placeholders}`);
  console.log(`  Still PLACEHOLDER: ${placeholders}`);

  const factions: Record<string, { total: number; placeholder: number }> = {};
  verify?.forEach((v: any) => {
    if (!factions[v.faction_id]) factions[v.faction_id] = { total: 0, placeholder: 0 };
    factions[v.faction_id].total++;
    if (v.description === 'PLACEHOLDER') factions[v.faction_id].placeholder++;
  });
  console.log(`\nPer-faction:`);
  Object.entries(factions).sort().forEach(([f, c]) => {
    const status = c.placeholder === 0 ? '✅' : `⚠️ ${c.placeholder} PLACEHOLDER`;
    console.log(`  ${f}: ${c.total} (${status})`);
  });
}

main();
