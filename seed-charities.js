const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCharities() {
  console.log('Seeding Charities...');
  
  const charities = [
    { name: 'Macmillan Cancer Support', description: 'Providing physical, financial and emotional support.', is_active: true },
    { name: 'British Heart Foundation', description: 'Funding research to beat heartbreak forever.', is_active: true },
    { name: 'Mind', description: 'Mental health support and respect.', is_active: true },
    { name: 'Prostate Cancer UK', description: 'Funding research to stop prostate cancer killing men.', is_active: true }
  ];

  try {
    const { data, error } = await supabase.from('charities').insert(charities).select();
    
    if (error) {
      console.error('❌ Failed to seed charities:', error.message);
      process.exit(1);
    }
    
    console.log(`✅ Successfully added ${data.length} charities!`);
  } catch (err) {
    console.error('❌ Unexpected Error:', err.message);
    process.exit(1);
  }
}

seedCharities();
