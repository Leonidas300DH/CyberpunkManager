import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://nknlxlmmliccsfsndnba.supabase.co',
  'sb_publishable_wvYE8RPLNKruSr9eUAdj2Q_H9jWWLbu'
);

async function main() {
  const { data, error } = await sb
    .from('reference_data')
    .select('data')
    .eq('key', 'catalog')
    .maybeSingle();

  if (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }

  if (!data || !data.data) {
    console.log('NO CATALOG FOUND IN SUPABASE');
    process.exit(0);
  }

  const catalog = data.data as any;
  console.log('=== CATALOG STATS ===');
  console.log('lineages:', catalog.lineages?.length);
  console.log('profiles:', catalog.profiles?.length);
  console.log('weapons:', catalog.weapons?.length);
  console.log('tierSurcharges:', JSON.stringify(catalog.tierSurcharges));

  // Find Oyabun
  const oyabunLineage = catalog.lineages?.find((l: any) => l.id === 'lineage-oyabun');
  console.log('\n=== OYABUN LINEAGE ===');
  console.log(JSON.stringify(oyabunLineage, null, 2));

  const oyabunProfiles = catalog.profiles?.filter((p: any) => p.lineageId === 'lineage-oyabun');
  console.log('\n=== OYABUN PROFILES (' + (oyabunProfiles?.length || 0) + ') ===');
  for (const p of (oyabunProfiles || [])) {
    console.log(JSON.stringify(p, null, 2));
  }
}

main();
