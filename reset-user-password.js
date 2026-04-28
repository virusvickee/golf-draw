const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tmbuulzxbvmtavromgzi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYnV1bHp4YnZtdGF2cm9tZ3ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzNzQyMywiZXhwIjoyMDkyNzEzNDIzfQ.n6YXMob29JlEXHHKxR35-uDbHCytoI1AsdRNe3WVSUg'
);

async function resetUserPassword() {
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'golfer1@golfdraw.com')
    .single();

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'password123' }
  );

  console.log('✅ User password reset!\n');
  console.log('Email: golfer1@golfdraw.com');
  console.log('Password: password123\n');
}

resetUserPassword();
