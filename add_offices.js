const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdoppkfbrbqzjushbdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkb3Bwa2ZicmJxemp1c2hiZGdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMwNDc1MiwiZXhwIjoyMDk0ODgwNzUyfQ.UdsAcz4-Y3GoXuCjl5A-Ns2LvneGTG6eJWE00XviPpg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const offices = [
    {
      nama: 'PT. Telkom Indonesia (WITEL SUMSEL BABEL)',
      latitude: -2.9355,
      longitude: 104.7333,
      radius: 100
    },
    {
      nama: 'Telkom Palembang Centrum (telkom rivai)',
      latitude: -2.9818,
      longitude: 104.7460,
      radius: 100
    },
    {
      nama: 'Plaza Telkom Palembang',
      latitude: -2.9800,
      longitude: 104.7500,
      radius: 100
    }
  ];

  const { data, error } = await supabase.from('offices').insert(offices);
  
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully inserted offices');
  }
}

run();
