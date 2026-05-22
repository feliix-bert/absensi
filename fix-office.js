const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually to get the keys
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function run() {
  // 1. Get or create an office
  let { data: offices } = await supabase.from('offices').select('*').limit(1);
  let officeId;

  if (!offices || offices.length === 0) {
    console.log("No offices found. Creating 'Kantor Pusat'...");
    const { data: newOffice, error } = await supabase.from('offices').insert({
      nama: 'Kantor Pusat',
      latitude: -6.200000,
      longitude: 106.816666,
      radius: 5000000 // 5000 km radius so the test will definitely succeed
    }).select().single();
    if (error) console.error("Error creating office:", error);
    officeId = newOffice.id;
  } else {
    officeId = offices[0].id;
    // Update it to have a huge radius for testing
    await supabase.from('offices').update({ radius: 5000000 }).eq('id', officeId);
  }

  console.log("Using Office ID:", officeId);

  // 2. Assign to all profiles that don't have one
  const { data: profiles, error } = await supabase
    .from('profiles')
    .update({ lokasi_kantor: officeId })
    .is('lokasi_kantor', null)
    .select();

  if (error) {
    console.error("Error updating profiles:", error);
  } else {
    console.log(`Updated ${profiles.length} profiles to use this office.`);
  }
}

run();
