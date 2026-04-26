import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log("🌱 Starting Golf Draw Seed Script...");

  try {
    // 1. Seed Charities
    console.log("Seeding charities...");
    let { data: charityData } = await supabase.from("charities").select("id, name");
    
    if (!charityData || charityData.length === 0) {
      const charities = [
        { name: "Cancer Research UK", description: "Pioneering research to bring forward the day when all cancers are cured.", is_featured: true },
        { name: "WaterAid", description: "Clean water, decent toilets and good hygiene for everyone, everywhere.", is_featured: true },
        { name: "RSPCA", description: "The UK's largest animal welfare charity.", is_featured: false },
        { name: "Shelter", description: "Campaigning for tenant rights and building homes.", is_featured: false },
        { name: "Macmillan Support", description: "Whatever cancer throws your way, we're right there with you.", is_featured: true }
      ];
      const { data } = await supabase.from("charities").insert(charities).select();
      charityData = data;
    }
    const charityIds = charityData!.map(c => c.id);

    // 2. Create Admin User
    console.log("Creating admin user...");
    const adminEmail = "admin@golfdraw.com";
    
    // Check if admin exists
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    let adminId = authUsers.find(u => u.email === adminEmail)?.id;

    if (!adminId) {
      const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: "password123",
        email_confirm: true,
        user_metadata: { full_name: "Admin User" }
      });
      if (adminError) throw adminError;
      adminId = adminAuth.user.id;
    }

    if (adminId) {
      await supabase.from("users").update({ role: "admin", subscription_status: "active" }).eq("id", adminId);
    }

    // 3. Create 10 Test Subscribers with Scores
    console.log("Creating 10 test subscribers and logging scores...");
    for (let i = 1; i <= 10; i++) {
      const email = `golfer${i}@golfdraw.com`;
      
      const { data: userAuth, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: "password123",
        email_confirm: true,
        user_metadata: { full_name: `Test Golfer ${i}` }
      });

      if (userError && !userError.message.includes("already registered")) {
        console.log(`Failed creating ${email}: ${userError.message}`);
        continue;
      }

      const userId = userAuth?.user?.id;
      if (!userId) continue;

      // Update user to active subscriber
      await supabase.from("users").update({
        subscription_status: "active",
        subscription_plan: i % 2 === 0 ? "yearly" : "monthly",
        charity_id: charityIds[i % charityIds.length],
        charity_contribution_percentage: 10 + (i % 5) * 10
      }).eq("id", userId);

      // Add 5 scores
      const scoresToInsert = [];
      for (let j = 0; j < 5; j++) {
        const date = new Date();
        date.setDate(date.getDate() - j);
        
        scoresToInsert.push({
          user_id: userId,
          score: Math.floor(Math.random() * 45) + 1,
          date: date.toISOString().split('T')[0]
        });
      }

      await supabase.from("scores").upsert(scoresToInsert, { onConflict: "user_id,date" });
    }

    console.log("✅ Seeding completed successfully!");
    console.log("Admin Login: admin@golfdraw.com / password123");
    console.log("Subscriber Login: golfer1@golfdraw.com / password123");
    
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
}

seed();
