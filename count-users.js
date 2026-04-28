const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tmbuulzxbvmtavromgzi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYnV1bHp4YnZtdGF2cm9tZ3ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzNzQyMywiZXhwIjoyMDkyNzEzNDIzfQ.n6YXMob29JlEXHHKxR35-uDbHCytoI1AsdRNe3WVSUg'
);

async function countUsers() {
  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`\n👥 Total Users: ${data.length}\n`);
  
  if (data.length > 0) {
    console.log('Users:');
    data.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.role})`);
    });
  }
}

countUsers();
