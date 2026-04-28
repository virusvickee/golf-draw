const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tmbuulzxbvmtavromgzi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYnV1bHp4YnZtdGF2cm9tZ3ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzNzQyMywiZXhwIjoyMDkyNzEzNDIzfQ.n6YXMob29JlEXHHKxR35-uDbHCytoI1AsdRNe3WVSUg'
);

async function resetAdminPassword() {
  console.log('🔐 Resetting admin password...\n');

  // Get admin user from users table
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'admin@golfdraw.com')
    .single();

  if (!user) {
    console.log('❌ Admin user not found in users table');
    return;
  }

  console.log(`Found user: ${user.email}`);
  console.log(`User ID: ${user.id}\n`);

  // Update password in Supabase Auth using admin API
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'password123' }
  );

  if (error) {
    console.error('❌ Error updating password:', error.message);
    return;
  }

  console.log('✅ Password reset successfully!');
  console.log('\nYou can now login with:');
  console.log('  Email: admin@golfdraw.com');
  console.log('  Password: password123\n');
}

resetAdminPassword();
