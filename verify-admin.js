const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tmbuulzxbvmtavromgzi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYnV1bHp4YnZtdGF2cm9tZ3ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzNzQyMywiZXhwIjoyMDkyNzEzNDIzfQ.n6YXMob29JlEXHHKxR35-uDbHCytoI1AsdRNe3WVSUg'
);

async function checkAndFixAdmin() {
  console.log('🔍 Checking admin user...\n');

  // Check current role
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', 'admin@golfdraw.com')
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('Current admin user:');
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  ID: ${user.id}\n`);

  if (user.role !== 'admin') {
    console.log('⚠️  Role is not "admin", fixing...\n');
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('email', 'admin@golfdraw.com');

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return;
    }

    console.log('✅ Admin role updated successfully!\n');
  } else {
    console.log('✅ Admin role is already set correctly!\n');
  }
}

checkAndFixAdmin();
