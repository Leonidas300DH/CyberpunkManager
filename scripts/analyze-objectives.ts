import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://nknlxlmmliccsfsndnba.supabase.co', 'sb_secret_qyooV5ULfdIzK4Uahd496w_eVqQenE3');

async function main() {
  const { data } = await supabase.from('objectives').select('id, name, faction_id, reward_type, grants_street_cred');
  if (!data) return;

  const isLeader = (r: { name: string }) => r.name.toLowerCase().includes('leader') || r.name === 'Under Review';

  console.log('=== Leader cards (special, never drawn) ===');
  data.filter(isLeader).forEach(r => console.log(`  ${r.faction_id}: ${r.name} (${r.reward_type}, SC:${r.grants_street_cred})`));

  console.log('\n=== Non-leader cards per faction ===');
  const factions: Record<string, number> = {};
  data.filter(r => !isLeader(r)).forEach(r => { factions[r.faction_id] = (factions[r.faction_id] || 0) + 1; });
  Object.entries(factions).sort().forEach(([f, c]) => console.log(`  ${f}: ${c}`));

  console.log('\n=== Reward types (non-leader) ===');
  const types: Record<string, number> = {};
  data.filter(r => !isLeader(r)).forEach(r => { types[r.reward_type] = (types[r.reward_type] || 0) + 1; });
  Object.entries(types).sort().forEach(([t, c]) => console.log(`  ${t}: ${c}`));

  console.log('\n=== Street Cred (non-leader) ===');
  const sc: Record<number, number> = {};
  data.filter(r => !isLeader(r)).forEach(r => { sc[r.grants_street_cred] = (sc[r.grants_street_cred] || 0) + 1; });
  Object.entries(sc).sort().forEach(([s, c]) => console.log(`  SC ${s}: ${c}`));
}
main();
